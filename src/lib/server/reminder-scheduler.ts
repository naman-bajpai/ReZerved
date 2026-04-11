/**
 * Reminder Scheduler
 *
 * Schedules 24h and 2h reminder notifications for confirmed bookings.
 * Safe to call multiple times for the same booking — the booking_reminders
 * table enforces UNIQUE(booking_id, reminder_type) so duplicate jobs are
 * never enqueued.
 *
 * Required env vars (set in .env.local):
 *   REDIS_URL            — Redis connection string (default: redis://localhost:6379)
 *   TWILIO_ACCOUNT_SID   — for SMS channel
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER
 *   META_PAGE_ACCESS_TOKEN — for Instagram channel
 */

import supabase from './supabase';
import { enqueueNotification } from './queue';
import { buildReminderMessage } from './notification-service';

// ── Configurable offsets ──────────────────────────────────────────────────────

/** Hours before starts_at to fire each reminder. */
const REMINDER_OFFSETS_HOURS = [24, 2] as const;
type ReminderType = '24h' | '2h';
const OFFSET_TO_TYPE: Record<number, ReminderType> = { 24: '24h', 2: '2h' };

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Enqueue reminder notifications for a confirmed booking.
 * Idempotent: skips reminders that are already recorded in booking_reminders.
 * Non-fatal: logs clearly if Redis is unavailable instead of throwing.
 */
export async function scheduleBookingReminders(bookingId: string): Promise<void> {
  const { data: booking, error: bookErr } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      starts_at,
      source_channel,
      business_id,
      client_id,
      services ( name ),
      clients ( phone, instagram_id ),
      businesses ( name )
    `)
    .eq('id', bookingId)
    .single();

  if (bookErr || !booking) {
    console.error('[reminder-scheduler] booking not found:', bookingId, bookErr?.message);
    return;
  }

  if (booking.status !== 'confirmed') {
    console.warn('[reminder-scheduler] booking not confirmed, skipping:', bookingId);
    return;
  }

  // Supabase returns joined rows as arrays; cast through unknown for safety
  const client = booking.clients as unknown as { phone: string | null; instagram_id: string | null } | null;
  const service = booking.services as unknown as { name: string } | null;
  const business = booking.businesses as unknown as { name: string } | null;

  // Determine the outbound channel and recipient address
  const { channel, to, meta } = resolveChannel(booking.source_channel, client);

  if (!channel || !to) {
    console.info(
      '[reminder-scheduler] no reachable channel for booking',
      bookingId,
      '(source_channel:',
      booking.source_channel,
      ') — skipping'
    );
    return;
  }

  const startsAt = new Date(booking.starts_at);
  const now = Date.now();

  for (const hours of REMINDER_OFFSETS_HOURS) {
    const reminderType = OFFSET_TO_TYPE[hours];
    const scheduledFor = new Date(startsAt.getTime() - hours * 60 * 60 * 1000);

    if (scheduledFor.getTime() <= now) {
      console.info(
        `[reminder-scheduler] ${reminderType} window already passed for booking ${bookingId}, skipping`
      );
      continue;
    }

    // Idempotency: skip if already scheduled (or previously failed)
    const { data: existing } = await supabase
      .from('booking_reminders')
      .select('id, status')
      .eq('booking_id', bookingId)
      .eq('reminder_type', reminderType)
      .maybeSingle();

    if (existing) {
      console.info(
        `[reminder-scheduler] ${reminderType} reminder already exists for booking ${bookingId} (status: ${existing.status})`
      );
      continue;
    }

    const message = buildReminderMessage(
      business?.name ?? 'your salon',
      service?.name ?? 'appointment',
      booking.starts_at,
      hours
    );

    const delayMs = scheduledFor.getTime() - now;

    // Enqueue — catch Redis errors so a missing queue never crashes a booking
    let jobId: string | null = null;
    let enqueueStatus: 'scheduled' | 'failed' = 'scheduled';

    try {
      jobId = await enqueueNotification(
        channel,
        to,
        message,
        { ...meta, bookingId, reminderType },
        delayMs
      );
    } catch (err: any) {
      enqueueStatus = 'failed';
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[reminder-scheduler] Redis unavailable — ${reminderType} reminder for booking ${bookingId} NOT enqueued.\n` +
          '  Set REDIS_URL in .env.local and start the worker to enable background reminders.'
        );
      } else {
        console.error('[reminder-scheduler] failed to enqueue reminder:', err?.message ?? err);
      }
    }

    // Record the attempt; ON CONFLICT DO NOTHING via unique constraint
    const { error: insertErr } = await supabase
      .from('booking_reminders')
      .insert({
        booking_id: bookingId,
        reminder_type: reminderType,
        status: enqueueStatus,
        scheduled_for: scheduledFor.toISOString(),
        bullmq_job_id: jobId,
      });

    if (insertErr && insertErr.code !== '23505') {
      // 23505 = unique_violation — another process beat us to it, safe to ignore
      console.error('[reminder-scheduler] failed to record reminder row:', insertErr.message);
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveChannel(
  sourceChannel: string | null,
  client: { phone: string | null; instagram_id: string | null } | null
): { channel: string | null; to: string | null; meta: Record<string, unknown> } {
  // Prefer the channel the client originally used; fall back to whatever is on record
  if (sourceChannel === 'sms' && client?.phone) {
    return { channel: 'sms', to: client.phone, meta: {} };
  }
  if (sourceChannel === 'instagram' && client?.instagram_id) {
    return {
      channel: 'instagram',
      to: client.instagram_id,
      meta: { pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN },
    };
  }
  // Web / fallback — use any available channel
  if (client?.phone) {
    return { channel: 'sms', to: client.phone, meta: {} };
  }
  if (client?.instagram_id) {
    return {
      channel: 'instagram',
      to: client.instagram_id,
      meta: { pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN },
    };
  }
  return { channel: null, to: null, meta: {} };
}
