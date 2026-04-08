/**
 * Booking Engine — ported from backend/src/services/bookingEngine.js
 */

import supabase from './supabase';
import { enqueueSlotFiller } from './queue';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled', 'expired'],
  confirmed: ['cancelled', 'no_show'],
  expired: [],
  cancelled: [],
  no_show: [],
};

export async function checkAvailability(
  businessId: string,
  serviceId: string,
  dateFrom: string,
  dateTo: string
) {
  const { data: service, error: svcErr } = await supabase
    .from('services')
    .select('duration_mins, name')
    .eq('id', serviceId)
    .eq('business_id', businessId)
    .single();

  if (svcErr || !service) throw new Error(`Service not found: ${serviceId}`);

  const { data: schedule, error: schedErr } = await supabase
    .from('availability')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true);

  if (schedErr) throw new Error('Failed to fetch availability schedule');

  // Widen the window by one day on each side to avoid any UTC/local-time
  // mismatch — the overlap check handles precision.
  const windowStart = new Date(dateFrom + 'T00:00:00Z');
  windowStart.setUTCDate(windowStart.getUTCDate() - 1);
  const windowEnd = new Date(dateTo + 'T00:00:00Z');
  windowEnd.setUTCDate(windowEnd.getUTCDate() + 2);

  const { data: existingBookings, error: bookErr } = await supabase
    .from('bookings')
    .select('starts_at, ends_at, status')
    .eq('business_id', businessId)
    .in('status', ['pending', 'confirmed'])
    .gte('starts_at', windowStart.toISOString())
    .lte('starts_at', windowEnd.toISOString());

  if (bookErr) throw new Error('Failed to fetch existing bookings');

  const scheduleMap: Record<number, { start: string; end: string }> = {};
  (schedule || []).forEach((s: any) => {
    scheduleMap[s.day_of_week] = { start: s.start_time, end: s.end_time };
  });

  const slots: Array<{ startsAt: string; endsAt: string; label: string }> = [];
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  to.setHours(23, 59, 59);

  const current = new Date(from);
  const durationMs = service.duration_mins * 60 * 1000;

  while (current <= to) {
    const dayOfWeek = current.getDay();
    const daySchedule = scheduleMap[dayOfWeek];

    if (daySchedule) {
      const [startH, startM] = daySchedule.start.split(':').map(Number);
      const [endH, endM] = daySchedule.end.split(':').map(Number);

      const dayStart = new Date(current);
      dayStart.setHours(startH, startM, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(endH, endM, 0, 0);

      let slotStart = new Date(dayStart);
      while (slotStart.getTime() + durationMs <= dayEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + durationMs);

        const hasConflict = (existingBookings || []).some((b: any) => {
          const bStart = new Date(b.starts_at);
          // Guard against null ends_at — fall back to 4-hour block
          const bEnd = b.ends_at ? new Date(b.ends_at) : new Date(bStart.getTime() + 4 * 60 * 60 * 1000);
          return slotStart < bEnd && slotEnd > bStart;
        });

        if (!hasConflict && slotStart > new Date()) {
          slots.push({
            startsAt: slotStart.toISOString(),
            endsAt: slotEnd.toISOString(),
            label: formatSlotLabel(slotStart),
          });
        }

        slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000);
      }
    }

    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return slots.slice(0, 50);
}

export async function createBooking(
  businessId: string,
  clientId: string,
  serviceId: string,
  startsAt: string,
  addOnIds: string[] = [],
  channel = 'sms'
) {
  const { data: service, error: svcErr } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('business_id', businessId)
    .single();

  if (svcErr || !service) throw new Error(`Service not found: ${serviceId}`);

  const startsAtDate = new Date(startsAt);
  const endsAtDate = new Date(startsAtDate.getTime() + service.duration_mins * 60 * 1000);

  let totalPrice = Number(service.price) || 0;
  const selectedAddOns: any[] = [];

  if (addOnIds.length > 0 && service.add_ons) {
    const addOnList = Array.isArray(service.add_ons) ? service.add_ons : [];
    addOnIds.forEach((id) => {
      const addOn = addOnList.find((a: any) => a.name === id || a.id === id);
      if (addOn) {
        totalPrice += Number(addOn.price) || 0;
        selectedAddOns.push(addOn);
        endsAtDate.setMinutes(endsAtDate.getMinutes() + (addOn.duration_mins || 0));
      }
    });
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      business_id: businessId,
      client_id: clientId,
      service_id: serviceId,
      starts_at: startsAtDate.toISOString(),
      ends_at: endsAtDate.toISOString(),
      status: 'pending',
      add_ons: selectedAddOns,
      total_price: totalPrice,
      source_channel: channel,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('SLOT_TAKEN: That time slot was just booked by someone else.');
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  return { ...booking, serviceName: service.name };
}

export async function confirmBooking(bookingId: string, businessId: string) {
  return transitionBooking(bookingId, businessId, 'confirmed');
}

export async function cancelBooking(bookingId: string, businessId: string, reason = '') {
  const booking = await transitionBooking(bookingId, businessId, 'cancelled');

  try {
    await enqueueSlotFiller(businessId, bookingId, booking.starts_at, booking.ends_at);
  } catch {
    // Non-fatal — slot filler is best-effort
  }

  return booking;
}

export async function markNoShow(bookingId: string, businessId: string) {
  const booking = await transitionBooking(bookingId, businessId, 'no_show');

  if (booking.client_id) {
    await supabase
      .from('clients')
      .update({ notes: `[No-show ${new Date().toLocaleDateString()}]` })
      .eq('id', booking.client_id);
  }

  return booking;
}

export async function expirePendingBookings() {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: expired, error } = await supabase
    .from('bookings')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('created_at', cutoff)
    .select();

  if (error) return [];

  for (const booking of expired || []) {
    await enqueueSlotFiller(booking.business_id, booking.id, booking.starts_at, booking.ends_at).catch(() => {});
  }

  return expired || [];
}

export async function getClientHistory(clientId: string, businessId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services (name, price)')
    .eq('client_id', clientId)
    .eq('business_id', businessId)
    .order('starts_at', { ascending: false })
    .limit(10);

  if (error) throw new Error(`Failed to fetch client history: ${error.message}`);
  return data || [];
}

export async function updateClientStats(clientId: string, businessId: string) {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('starts_at, total_price')
    .eq('client_id', clientId)
    .eq('business_id', businessId)
    .eq('status', 'confirmed')
    .order('starts_at', { ascending: true });

  if (!bookings || bookings.length === 0) return;

  const totalSpend = bookings.reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);
  const avgSpend = totalSpend / bookings.length;

  let typicalFrequency = null;
  if (bookings.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < bookings.length; i++) {
      const gap = (new Date(bookings[i].starts_at).getTime() - new Date(bookings[i - 1].starts_at).getTime()) / (1000 * 60 * 60 * 24);
      gaps.push(gap);
    }
    typicalFrequency = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  }

  await supabase
    .from('clients')
    .update({
      avg_spend: avgSpend.toFixed(2),
      last_booked_at: bookings[bookings.length - 1].starts_at,
      ...(typicalFrequency ? { typical_frequency_days: typicalFrequency } : {}),
    })
    .eq('id', clientId);
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function transitionBooking(bookingId: string, businessId: string, newStatus: string) {
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('business_id', businessId)
    .single();

  if (fetchErr || !booking) throw new Error(`Booking not found: ${bookingId}`);

  const allowed = VALID_TRANSITIONS[booking.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid transition: ${booking.status} → ${newStatus}`);
  }

  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update booking status: ${error.message}`);
  return updated;
}

function formatSlotLabel(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
