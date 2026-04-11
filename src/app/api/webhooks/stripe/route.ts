import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/server/supabase';
import { scheduleBookingReminders } from '@/lib/server/reminder-scheduler';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe');

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
  : null;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('[stripe webhook] signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          stripe_checkout_session_id: session.id,
        })
        .eq('id', bookingId)
        .eq('status', 'pending');

      if (error) {
        console.error('[stripe webhook] failed to confirm booking:', error.message);
      } else {
        scheduleBookingReminders(bookingId).catch((err) =>
          console.error('[stripe webhook] reminder scheduling failed:', err)
        );
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;
    if (bookingId) {
      await supabase
        .from('bookings')
        .update({ status: 'expired' })
        .eq('id', bookingId)
        .eq('status', 'pending');
    }
  }

  return NextResponse.json({ received: true });
}
