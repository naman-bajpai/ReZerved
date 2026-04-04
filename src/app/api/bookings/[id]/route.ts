import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import { confirmBooking, cancelBooking, markNoShow } from '@/lib/server/booking-engine';

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
    let booking;
    if (status === 'confirmed') booking = await confirmBooking(id, business.business_id);
    else if (status === 'cancelled') booking = await cancelBooking(id, business.business_id, reason || '');
    else booking = await markNoShow(id, business.business_id);

    return NextResponse.json({ booking });
  } catch (err: any) {
    if (err.message?.includes('Invalid transition')) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
