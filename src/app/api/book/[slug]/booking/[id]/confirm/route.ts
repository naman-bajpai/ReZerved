import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe');
import supabase from '@/lib/server/supabase';
import { getGuestSession } from '@/lib/server/guest-auth';
import { scheduleBookingReminders } from '@/lib/server/reminder-scheduler';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
  : null;

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const { slug, id: bookingId } = params;

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await getGuestSession(req, business.id);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { session_id } = body;

  // Fetch the booking, verifying ownership
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, status, payment_status, stripe_checkout_session_id')
    .eq('id', bookingId)
    .eq('business_id', business.id)
    .eq('guest_email', session.email)
    .maybeSingle();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Already confirmed — nothing to do
  if (booking.status === 'confirmed') {
    return NextResponse.json({ confirmed: true });
  }

  // Only confirm pending bookings
  if (booking.status !== 'pending') {
    return NextResponse.json({ error: `Cannot confirm a booking with status: ${booking.status}` }, { status: 409 });
  }

  // Resolve which Stripe session ID to check
  const stripeSessionId = session_id || booking.stripe_checkout_session_id;

  if (stripe && stripeSessionId) {
    // Verify payment with Stripe before confirming
    let stripeSession: any;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
    } catch (err: any) {
      return NextResponse.json({ error: `Stripe error: ${err.message}` }, { status: 502 });
    }

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: `Payment not completed (status: ${stripeSession.payment_status})` },
        { status: 402 }
      );
    }
  }

  // Mark booking as confirmed
  const { error: updateErr } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      ...(stripeSessionId ? { stripe_checkout_session_id: stripeSessionId } : {}),
    })
    .eq('id', bookingId)
    .eq('business_id', business.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  scheduleBookingReminders(bookingId).catch((err) =>
    console.error('[confirm route] reminder scheduling failed:', err)
  );

  return NextResponse.json({ confirmed: true });
}
