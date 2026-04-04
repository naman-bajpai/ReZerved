/**
 * AI Agent — ported from backend/src/services/aiAgent.js
 */

import OpenAI from 'openai';
import supabase from './supabase';
import * as bookingEngine from './booking-engine';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rate limiting: max 1 AI call per 10s per conversation
const lastCallTime = new Map<string, number>();
const RATE_LIMIT_MS = 10_000;

const FUNCTIONS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check available time slots for a given service and date range.',
      parameters: {
        type: 'object',
        properties: {
          service_id: { type: 'string' },
          date_from: { type: 'string', format: 'date' },
          date_to: { type: 'string', format: 'date' },
        },
        required: ['service_id', 'date_from', 'date_to'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_booking',
      description: 'Create a pending booking after the customer agrees to a specific time.',
      parameters: {
        type: 'object',
        properties: {
          client_id: { type: 'string' },
          service_id: { type: 'string' },
          starts_at: { type: 'string' },
          add_on_ids: { type: 'array', items: { type: 'string' } },
        },
        required: ['client_id', 'service_id', 'starts_at'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_booking',
      description: 'Cancel an existing booking for this client.',
      parameters: {
        type: 'object',
        properties: {
          booking_id: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['booking_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_client_history',
      description: "Retrieve a client's past bookings to personalize responses.",
      parameters: {
        type: 'object',
        properties: { client_id: { type: 'string' } },
        required: ['client_id'],
      },
    },
  },
];

export async function processMessage(
  conversationId: string,
  businessId: string,
  clientId: string,
  channel: string
) {
  const now = Date.now();
  const lastCall = lastCallTime.get(conversationId) || 0;
  if (now - lastCall < RATE_LIMIT_MS) {
    return { reply: null, intent: 'rate_limited', bookingCreated: null };
  }
  lastCallTime.set(conversationId, now);

  const [business, client, services, history] = await Promise.all([
    fetchBusiness(businessId),
    fetchClient(clientId),
    fetchServices(businessId),
    fetchConversationHistory(conversationId),
  ]);

  if (!business) throw new Error(`Business not found: ${businessId}`);

  const systemPrompt = buildSystemPrompt(business, client, services);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  let response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools: FUNCTIONS,
    tool_choice: 'auto',
    temperature: 0.7,
    max_tokens: 300,
  });

  let assistantMessage = response.choices[0].message;
  let bookingCreated: any = null;
  let intent = 'unknown';
  let iterations = 0;

  while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && iterations < 3) {
    iterations++;
    messages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.type !== 'function') continue;
      const fnName = (toolCall as any).function.name as string;
      const args = JSON.parse((toolCall as any).function.arguments);

      let result: any;
      try {
        result = await executeFunctionCall(fnName, args, businessId, clientId, channel);
        if (fnName === 'create_booking') bookingCreated = result;
      } catch (err: any) {
        result = { error: err.message };
      }

      messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) });
    }

    response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: FUNCTIONS,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 300,
    });

    assistantMessage = response.choices[0].message;
  }

  const reply = assistantMessage.content;
  intent = classifyIntent(history, bookingCreated);

  await saveMessage(conversationId, 'assistant', reply || '');
  await supabase
    .from('conversations')
    .update({ intent, updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return { reply, intent, bookingCreated };
}

async function executeFunctionCall(
  fnName: string,
  args: any,
  businessId: string,
  clientId: string,
  channel: string
) {
  switch (fnName) {
    case 'check_availability': {
      const slots = await bookingEngine.checkAvailability(businessId, args.service_id, args.date_from, args.date_to);
      return { slots, count: slots.length };
    }
    case 'create_booking': {
      const booking = await bookingEngine.createBooking(
        businessId, args.client_id || clientId, args.service_id, args.starts_at, args.add_on_ids || [], channel
      );
      return { success: true, bookingId: booking.id, serviceName: booking.serviceName, startsAt: booking.starts_at, totalPrice: booking.total_price };
    }
    case 'cancel_booking': {
      const booking = await bookingEngine.cancelBooking(args.booking_id, businessId, args.reason || '');
      return { success: true, bookingId: (booking as any).id };
    }
    case 'get_client_history': {
      const history = await bookingEngine.getClientHistory(args.client_id || clientId, businessId);
      return { history: history.slice(0, 5) };
    }
    default:
      throw new Error(`Unknown function: ${fnName}`);
  }
}

function buildSystemPrompt(business: any, client: any, services: any[]) {
  const servicesList = services
    .map((s) => {
      const addOns = Array.isArray(s.add_ons) && s.add_ons.length > 0
        ? ` (Add-ons: ${s.add_ons.map((a: any) => `${a.name} +$${a.price}`).join(', ')})`
        : '';
      return `- ${s.name}: $${s.price}, ${s.duration_mins} min${addOns}`;
    })
    .join('\n');

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: business.timezone });
  const clientContext = client
    ? `\nClient name: ${client.name || 'Unknown'}${client.notes ? `\nClient notes: ${client.notes}` : ''}`
    : '';

  return `You are a helpful booking assistant for ${business.name}, a beauty studio.
Your job is to respond to client messages and help them book appointments.

Owner name: ${business.owner_name || 'the owner'}
Timezone: ${business.timezone}
Services offered:
${servicesList}

Tone: ${business.ai_persona || 'friendly, professional, brief'}

Rules:
- Never mention you are an AI unless directly asked
- Always call check_availability before suggesting specific times
- Only suggest times that are actually available in the returned slots
- Keep replies under 3 sentences — be concise
- If unsure about anything, offer to have the owner follow up
- After creating a booking, ALWAYS end with: "Reply YES to confirm your spot!"
- Out of scope requests: politely decline and stay focused on bookings${clientContext}

Today is ${currentDate}. Current time: ${currentTime}.`;
}

async function fetchBusiness(businessId: string) {
  const { data } = await supabase.from('businesses').select('*').eq('id', businessId).single();
  return data;
}

async function fetchClient(clientId: string) {
  if (!clientId) return null;
  const { data } = await supabase.from('clients').select('*').eq('id', clientId).single();
  return data;
}

async function fetchServices(businessId: string) {
  const { data } = await supabase.from('services').select('*').eq('business_id', businessId).eq('is_active', true);
  return data || [];
}

async function fetchConversationHistory(conversationId: string) {
  const { data } = await supabase
    .from('messages')
    .select('role, content, sent_at')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })
    .limit(20);
  return data || [];
}

async function saveMessage(conversationId: string, role: string, content: string) {
  await supabase.from('messages').insert({ conversation_id: conversationId, role, content });
}

function classifyIntent(history: any[], bookingCreated: any) {
  if (bookingCreated) return 'booking_request';
  const lastUserMessage = [...history].reverse().find((m) => m.role === 'user');
  if (!lastUserMessage) return 'unknown';
  const text = lastUserMessage.content.toLowerCase();
  if (/yes|confirm|yep|sure|sounds good|book it|that works/i.test(text)) return 'booking_confirm';
  if (/cancel|reschedule|can't make it|need to move/i.test(text)) return 'cancellation';
  if (/how much|price|cost|rate|charge/i.test(text)) return 'pricing_inquiry';
  if (/book|appointment|schedule|available|free|slot|time/i.test(text)) return 'booking_request';
  return 'general_question';
}

export function isConfirmationMessage(text: string) {
  return /^\s*(yes|confirm|yep|sure|ok|okay|sounds good|book it|that works|✅|👍)\s*$/i.test(text.trim());
}
