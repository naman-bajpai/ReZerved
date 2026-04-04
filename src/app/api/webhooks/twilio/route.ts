/**
 * POST /api/webhooks/twilio
 * Validates Twilio signature, stores inbound SMS, enqueues AI processing.
 * Must respond within 5 seconds — heavy processing happens async.
 */

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import supabase from '@/lib/server/supabase';
import { isConfirmationMessage } from '@/lib/server/ai-agent';
import { confirmBooking, updateClientStats } from '@/lib/server/booking-engine';
import { sendMessage, buildUpsellMessage } from '@/lib/server/notification-service';
import { enqueueMessage } from './queue-helper';

export async function GET(req: NextRequest) {
  // Twilio GET for webhook verification (not typically used, but handle gracefully)
  return new NextResponse('<Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(req: NextRequest) {
  // Parse URL-encoded body (Twilio sends application/x-www-form-urlencoded)
  const text = await req.text();
  const params = Object.fromEntries(new URLSearchParams(text));

  // Validate Twilio signature in production
  const twilioSignature = req.headers.get('x-twilio-signature') || '';
  const url = `${process.env.BASE_URL}/api/webhooks/twilio`;
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    twilioSignature,
    url,
    params
  );

  if (!isValid && process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Respond immediately with empty TwiML to prevent Twilio retries
  const twimlResponse = new NextResponse('<Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  });

  // Process async (fire-and-forget — Next.js will keep the request alive)
  processInboundSMS(params).catch((err) =>
    console.error('Failed to process inbound SMS:', err)
  );

  return twimlResponse;
}

async function processInboundSMS(params: Record<string, string>) {
  const { From: fromPhone, To: toPhone, Body: messageBody, MessageSid } = params;

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('phone', toPhone)
    .single();

  if (bizErr || !business) {
    console.error('Business not found for phone:', toPhone);
    return;
  }

  const client = await upsertClient(business.id, fromPhone, null);
  const conversation = await upsertConversation(business.id, client.id, 'sms', fromPhone);

  const { data: message } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      role: 'user',
      content: messageBody,
      metadata: { MessageSid, From: fromPhone, To: toPhone },
    })
    .select()
    .single();

  if (isConfirmationMessage(messageBody)) {
    await handleConfirmation(business.id, client.id, conversation, 'sms', fromPhone);
    return;
  }

  if (/^\s*add\s*$/i.test(messageBody.trim())) {
    await handleUpsellAcceptance(business.id, client.id, conversation, 'sms', fromPhone);
    return;
  }

  await enqueueMessage(conversation.id, message?.id, 'sms');
}

async function handleConfirmation(
  businessId: string,
  clientId: string,
  conversation: any,
  channel: string,
  to: string
) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services (name, add_ons)')
    .eq('business_id', businessId)
    .eq('client_id', clientId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!booking) {
    await enqueueMessage(conversation.id, null, channel);
    return;
  }

  await confirmBooking(booking.id, businessId);

  await supabase
    .from('conversations')
    .update({ status: 'booking_confirmed' })
    .eq('id', conversation.id);

  const service = booking.services;
  const addOns = Array.isArray(service?.add_ons) ? service.add_ons : [];
  const confirmText = `Confirmed! See you ${formatDateTime(booking.starts_at)} for your ${service?.name || 'appointment'}. We can't wait! 💅`;

  await sendMessage(channel, to, confirmText);
  await supabase.from('messages').insert({ conversation_id: conversation.id, role: 'assistant', content: confirmText });

  if (addOns.length > 0) {
    setTimeout(async () => {
      const upsellMsg = buildUpsellMessage(addOns, booking.starts_at);
      if (upsellMsg) {
        await sendMessage(channel, to, upsellMsg);
        await supabase.from('messages').insert({ conversation_id: conversation.id, role: 'assistant', content: upsellMsg });
      }
    }, 2000);
  }

  await updateClientStats(clientId, businessId);
}

async function handleUpsellAcceptance(
  businessId: string,
  clientId: string,
  conversation: any,
  channel: string,
  to: string
) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services (name, add_ons)')
    .eq('business_id', businessId)
    .eq('client_id', clientId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!booking) return;

  const addOns = booking.services?.add_ons || [];
  if (addOns.length === 0) return;

  const addOn = addOns[0];
  const newEndsAt = new Date(new Date(booking.ends_at).getTime() + addOn.duration_mins * 60 * 1000);
  const newPrice = Number(booking.total_price) + Number(addOn.price);

  await supabase
    .from('bookings')
    .update({ add_ons: [addOn], ends_at: newEndsAt.toISOString(), total_price: newPrice })
    .eq('id', booking.id);

  const msg = `Perfect! Added ${addOn.name} to your appointment. See you then! ✨`;
  await sendMessage(channel, to, msg);
  await supabase.from('messages').insert({ conversation_id: conversation.id, role: 'assistant', content: msg });
}

export async function upsertClient(businessId: string, phone: string | null, instagramId: string | null) {
  const lookup = phone ? { business_id: businessId, phone } : { business_id: businessId, instagram_id: instagramId };
  const { data: existing } = await supabase.from('clients').select('*').match(lookup).single();
  if (existing) return existing;

  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({ business_id: businessId, phone, instagram_id: instagramId })
    .select()
    .single();

  if (error) throw new Error(`Failed to upsert client: ${error.message}`);
  return newClient;
}

export async function upsertConversation(
  businessId: string,
  clientId: string,
  channel: string,
  externalThreadId: string
) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('business_id', businessId)
    .eq('client_id', clientId)
    .eq('channel', channel)
    .eq('status', 'open')
    .gte('updated_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', existing.id);
    return existing;
  }

  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({ business_id: businessId, client_id: clientId, channel, external_thread_id: externalThreadId, status: 'open' })
    .select()
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return newConv;
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}
