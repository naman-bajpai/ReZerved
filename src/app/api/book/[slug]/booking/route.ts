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
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name, timezone')
    .eq('slug', slug)
    .maybeSingle();

  if (bizErr || !business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await getGuestSession(req, business.id);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { service_id, starts_at, add_on_ids = [] } = body;

  if (!service_id || !starts_at) {
    return NextResponse.json({ error: 'service_id and starts_at are required' }, { status: 400 });
  }

  // Fetch service
  const { data: service, error: svcErr } = await supabase
    .from('services')
    .select('*')
    .eq('id', service_id)
    .eq('business_id', business.id)
    .eq('is_active', true)
    .maybeSingle();

  if (svcErr || !service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  const startsAt = new Date(starts_at);
  const endsAt = new Date(startsAt.getTime() + service.duration_mins * 60 * 1000);

  let totalPrice = Number(service.price) || 0;
  const selectedAddOns: any[] = [];

  if (add_on_ids.length > 0 && service.add_ons) {
    const addOnList = Array.isArray(service.add_ons) ? service.add_ons : [];
    (add_on_ids as string[]).forEach((id) => {
      const addOn = addOnList.find((a: any) => a.name === id || a.id === id);
      if (addOn) {
        totalPrice += Number(addOn.price) || 0;
        selectedAddOns.push(addOn);
        endsAt.setMinutes(endsAt.getMinutes() + (addOn.duration_mins || 0));
      }
    });
  }

  // Upsert guest into clients table
  let clientId: string | null = null;
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('business_id', business.id)
    .eq('email', session.email)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
    await supabase
      .from('clients')
      .update({ name: session.name })
      .eq('id', clientId);
  } else {
    const { data: newClient } = await supabase
      .from('clients')
      .insert({ business_id: business.id, name: session.name, email: session.email, phone: '' })
      .select('id')
      .single();
    clientId = newClient?.id ?? null;
  }

  // Create booking in pending+unpaid state
  const { data: booking, error: bookErr } = await supabase
    .from('bookings')
    .insert({
      business_id: business.id,
      client_id: clientId,
      service_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'pending',
      payment_status: 'unpaid',
      add_ons: selectedAddOns,
      total_price: totalPrice,
      source_channel: 'web',
      guest_email: session.email,
      guest_name: session.name,
    })
    .select()
    .single();

  if (bookErr) {
    if (bookErr.code === '23505') {
      return NextResponse.json({ error: 'That time slot was just booked. Please choose another.' }, { status: 409 });
    }
    return NextResponse.json({ error: bookErr.message }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // If no Stripe, skip payment and confirm directly (dev mode)
  if (!stripe) {
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', payment_status: 'paid' })
      .eq('id', booking.id);

    scheduleBookingReminders(booking.id).catch((err) =>
      console.error('[booking route] reminder scheduling failed:', err)
    );

    return NextResponse.json({
      booking_id: booking.id,
      checkout_url: `${appUrl}/book/${slug}/success?booking_id=${booking.id}`,
    });
  }

  // Create Stripe Checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: session.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(totalPrice * 100),
          product_data: {
            name: service.name,
            description: `${service.duration_mins} min appointment with ${business.name}`,
          },
        },
        quantity: 1,
      },
      ...selectedAddOns.map((a: any) => ({
        price_data: {
          currency: 'usd',
          unit_amount: Math.round((Number(a.price) || 0) * 100),
          product_data: { name: a.name },
        },
        quantity: 1,
      })),
    ],
    metadata: {
      booking_id: booking.id,
      business_id: business.id,
      slug,
    },
    success_url: `${appUrl}/book/${slug}/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/book/${slug}?cancelled=1`,
  });

  // Store Stripe session ID on booking
  await supabase
    .from('bookings')
    .update({ stripe_checkout_session_id: checkoutSession.id })
    .eq('id', booking.id);

  return NextResponse.json({
    booking_id: booking.id,
    checkout_url: checkoutSession.url,
  });
}
