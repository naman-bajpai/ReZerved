/**
 * GET  /api/webhooks/instagram — Meta webhook verification challenge
 * POST /api/webhooks/instagram — Inbound Instagram DM events
 */

import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/server/supabase';
import { isConfirmationMessage } from '@/lib/server/ai-agent';
import { confirmBooking, updateClientStats } from '@/lib/server/booking-engine';
import { sendMessage, buildUpsellMessage } from '@/lib/server/notification-service';
import { upsertClient, upsertConversation } from '../twilio/route';
import { enqueueMessage } from '../twilio/queue-helper';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  // Respond immediately to prevent Meta retries
  const body = await req.json().catch(() => ({}));

  // Process async
  processWebhookBody(body).catch((err) =>
    console.error('Error processing Instagram webhook:', err)
  );

  return new NextResponse('EVENT_RECEIVED', { status: 200 });
}

async function processWebhookBody(body: any) {
  if (body.object !== 'instagram' && body.object !== 'page') return;

  for (const entry of body.entry || []) {
    for (const messagingEvent of entry.messaging || []) {
      await processMessagingEvent(entry, messagingEvent).catch(console.error);
    }
  }
}

async function processMessagingEvent(entry: any, event: any) {
  const pageId = entry.id;
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id;

  if (event.message?.is_echo) return;

  const messageText = event.message?.text;
  if (!messageText) return;

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('instagram_page_id', pageId)
    .single();

  if (bizErr || !business) {
    console.error('Business not found for Instagram page:', pageId);
    return;
  }

  const client = await upsertClient(business.id, null, senderId);

  if (!client.name) {
    const name = await fetchInstagramUserName(senderId);
    if (name) await supabase.from('clients').update({ name }).eq('id', client.id);
  }

  const conversation = await upsertConversation(business.id, client.id, 'instagram', senderId);

  const { data: message } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      role: 'user',
      content: messageText,
      metadata: { senderId, recipientId, messageId: event.message?.mid },
    })
    .select()
    .single();

  if (isConfirmationMessage(messageText)) {
    await handleInstagramConfirmation(business.id, client.id, conversation, 'instagram', senderId);
    return;
  }

  await enqueueMessage(conversation.id, message?.id, 'instagram');
}

async function handleInstagramConfirmation(
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

async function fetchInstagramUserName(igUserId: string): Promise<string | null> {
  try {
    const token = process.env.META_PAGE_ACCESS_TOKEN;
    if (!token) return null;
    const res = await fetch(`https://graph.facebook.com/v19.0/${igUserId}?fields=name&access_token=${token}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.name || null;
  } catch {
    return null;
  }
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}
