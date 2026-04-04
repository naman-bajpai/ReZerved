/**
 * Notification Service — ported from backend/src/services/notificationService.js
 */

import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(
  to: string,
  message: string,
  fromNumber = process.env.TWILIO_PHONE_NUMBER
) {
  const result = await twilioClient.messages.create({ body: message, from: fromNumber!, to });
  return { success: true, sid: result.sid };
}

export async function sendInstagramDM(
  recipientId: string,
  message: string,
  pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN
) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
        messaging_type: 'RESPONSE',
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Instagram send failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return { success: true, messageId: data.message_id };
}

export async function sendMessage(
  channel: string,
  to: string,
  message: string,
  meta: { fromNumber?: string; pageAccessToken?: string } = {}
) {
  if (channel === 'sms') return sendSMS(to, message, meta.fromNumber);
  if (channel === 'instagram') return sendInstagramDM(to, message, meta.pageAccessToken);
  throw new Error(`Unknown channel: ${channel}`);
}

export function buildConfirmationMessage(serviceName: string, startsAt: string, addOns: any[] = []) {
  const dateStr = new Date(startsAt).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
  const addOnText = addOns.length > 0 ? ` + ${addOns.map((a) => a.name).join(', ')}` : '';
  return `You're booked for ${serviceName}${addOnText} on ${dateStr}! Reply YES to confirm your spot. 🗓️`;
}

export function buildUpsellMessage(addOns: any[], startsAt: string) {
  if (!addOns || addOns.length === 0) return null;
  const addOn = addOns[0];
  const dateStr = new Date(startsAt).toLocaleString('en-US', {
    weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  });
  return `You're all set for ${dateStr}! ✨ Want to add ${addOn.name} (+$${addOn.price}, ${addOn.duration_mins} mins extra)? Reply ADD to include it.`;
}

export function buildReminderMessage(
  businessName: string,
  serviceName: string,
  startsAt: string,
  hoursBefore: number
) {
  const dateStr = new Date(startsAt).toLocaleString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
  const timeLabel = hoursBefore >= 24 ? 'tomorrow' : 'in 2 hours';
  return `Reminder: You have ${serviceName} at ${businessName} ${timeLabel} (${dateStr}). See you soon! 💅`;
}

export function buildSlotFillerMessage(firstName: string, startsAt: string, serviceName: string) {
  const date = new Date(startsAt);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  const timeLabel = isToday
    ? 'today'
    : isTomorrow
    ? 'tomorrow'
    : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `Hey ${firstName}! I had a ${timeStr} slot open up ${timeLabel} if you want it 👀 — ${serviceName}?`;
}

export function buildRetentionMessage(firstName: string, serviceName: string) {
  return `Hey ${firstName}! It's been a while — you're probably due for your next ${serviceName}! Want me to get you booked in this week? 💅`;
}
