import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import supabase from '@/lib/server/supabase';
import * as bookingEngine from '@/lib/server/booking-engine';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory conversation history keyed by sessionId
const sessions = new Map<string, OpenAI.Chat.ChatCompletionMessageParam[]>();
// Track guest client ids per session
const sessionClients = new Map<string, string>();

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check available time slots for a given service and date range.',
      parameters: {
        type: 'object',
        properties: {
          service_id: { type: 'string', description: 'The service ID to check availability for' },
          date_from: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
          date_to: { type: 'string', description: 'End date in YYYY-MM-DD format' },
        },
        required: ['service_id', 'date_from', 'date_to'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_booking',
      description: 'Create a booking for the client. Only call this after the client has confirmed a specific time slot.',
      parameters: {
        type: 'object',
        properties: {
          service_id: { type: 'string' },
          starts_at: { type: 'string', description: 'ISO datetime string for the booking start' },
          client_name: { type: 'string', description: "Client's name" },
          client_phone: { type: 'string', description: "Client's phone number (optional)" },
        },
        required: ['service_id', 'starts_at', 'client_name'],
      },
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    const sid = sessionId || 'default';

    // Fetch first active business + services
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .limit(1)
      .single();

    if (!business) {
      return NextResponse.json({ reply: "Sorry, no business is set up yet. Please check back later." });
    }

    const { data: services } = await supabase
      .from('services')
      .select('id, name, price, duration_mins')
      .eq('business_id', business.id)
      .eq('is_active', true);

    const servicesList = (services || [])
      .map((s: any) => `- ${s.name} (id: ${s.id}): $${s.price}, ${s.duration_mins} min`)
      .join('\n') || '- No services listed yet';

    const systemPrompt = `You are a friendly booking assistant for ${business.name}.
Help the user book an appointment.

Services available:
${servicesList}

Rules:
- Keep replies short (2-3 sentences max)
- Always call check_availability before suggesting specific times — never invent slots
- Ask for the client's name before creating a booking
- After creating a booking, confirm the details clearly
- Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    const history = sessions.get(sid) || [];
    history.push({ role: 'user', content: message });

    let response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, ...history.slice(-12)],
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 300,
    });

    let assistantMessage = response.choices[0].message;
    let iterations = 0;

    // Agentic loop — handle tool calls
    while (assistantMessage.tool_calls?.length && iterations < 3) {
      iterations++;
      history.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        const tc = toolCall as { function: { name: string; arguments: string } };
        const fnName = tc.function.name;
        const args = JSON.parse(tc.function.arguments);
        let result: any;

        try {
          if (fnName === 'check_availability') {
            const slots = await bookingEngine.checkAvailability(
              business.id,
              args.service_id,
              args.date_from,
              args.date_to
            );
            result = { slots, count: slots.length };
          } else if (fnName === 'create_booking') {
            // Find or create guest client
            let clientId = sessionClients.get(sid);
            if (!clientId) {
              const { data: existing } = await supabase
                .from('clients')
                .select('id')
                .eq('business_id', business.id)
                .ilike('name', args.client_name.trim())
                .limit(1)
                .single();

              if (existing) {
                clientId = existing.id;
              } else {
                const { data: newClient, error: clientErr } = await supabase
                  .from('clients')
                  .insert({
                    business_id: business.id,
                    name: args.client_name.trim(),
                    phone: args.client_phone || null,
                  })
                  .select('id')
                  .single();

                if (clientErr || !newClient) throw new Error('Failed to create client record');
                clientId = newClient.id;
              }
              sessionClients.set(sid, clientId);
            }

            const booking = await bookingEngine.createBooking(
              business.id,
              clientId,
              args.service_id,
              args.starts_at,
              [],
              'web_chat'
            );
            result = {
              success: true,
              bookingId: booking.id,
              serviceName: booking.serviceName,
              startsAt: booking.starts_at,
              totalPrice: booking.total_price,
            };
          } else {
            result = { error: 'Unknown function' };
          }
        } catch (err: any) {
          result = { error: err.message };
        }

        history.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }, ...history.slice(-14)],
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 300,
      });

      assistantMessage = response.choices[0].message;
    }

    const reply = assistantMessage.content || "Sorry, I couldn't process that.";
    history.push({ role: 'assistant', content: reply });
    sessions.set(sid, history);

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('[/api/chat]', err);
    return NextResponse.json({ reply: 'Something went wrong. Please try again.' });
  }
}
