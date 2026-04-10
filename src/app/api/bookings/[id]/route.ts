import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const PATCH = withBusiness(async (req, _profile, business, ctx) => {
  const id = ctx?.params?.id;
  if (!id) return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { status, reason } = body;

  const validStatuses = ['confirmed', 'cancelled', 'no_show'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
  }

  try {
    const businessId = business.business_id || business.id;

    const { data: current, error: currentErr } = await supabase
      .from('bookings')
      .select('id, status, client_id')
      .eq('id', id)
      .eq('business_id', businessId)
      .single();

    if (currentErr || !current) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['cancelled', 'no_show'],
      cancelled: [],
      expired: [],
      no_show: [],
    };
    const allowed = allowedTransitions[current.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: `Invalid transition: ${current.status} → ${status}` }, { status: 409 });
    }

    const { data: booking, error: updateErr } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .eq('business_id', businessId)
      .select('*')
      .single();

    if (updateErr || !booking) {
      throw new Error(updateErr?.message || 'Failed to update booking status');
    }

    // Best-effort note for no-shows; don't fail status update if note write fails.
    if (status === 'no_show' && current.client_id) {
      await supabase
        .from('clients')
        .update({ notes: `[No-show ${new Date().toLocaleDateString()}]` })
        .eq('id', current.client_id)
        .eq('business_id', businessId);
    }

    return NextResponse.json({ booking });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update booking status' }, { status: 500 });
  }
});
