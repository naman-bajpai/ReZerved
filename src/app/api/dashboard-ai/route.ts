import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory session history keyed by business_id
const sessions = new Map<string, OpenAI.Chat.ChatCompletionMessageParam[]>();

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_bookings',
      description: 'Fetch bookings for a given date or date range. Use this to look up bookings before cancelling or confirming.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'A specific date in YYYY-MM-DD format' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'no_show', 'expired'], description: 'Filter by status (optional)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_bookings',
      description: 'Cancel one or multiple bookings by their IDs.',
      parameters: {
        type: 'object',
        properties: {
          booking_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of booking IDs to cancel',
          },
        },
        required: ['booking_ids'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'confirm_bookings',
      description: 'Confirm one or multiple pending bookings by their IDs.',
      parameters: {
        type: 'object',
        properties: {
          booking_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of booking IDs to confirm',
          },
        },
        required: ['booking_ids'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_availability',
      description: 'Get the current weekly availability schedule.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_availability',
      description: 'Update the weekly availability schedule. Each day entry must include day_of_week (0=Sunday … 6=Saturday), start_time (HH:MM), end_time (HH:MM), and is_active.',
      parameters: {
        type: 'object',
        properties: {
          schedule: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day_of_week: { type: 'number', description: '0=Sunday, 1=Monday … 6=Saturday' },
                start_time: { type: 'string', description: 'e.g. 09:00' },
                end_time: { type: 'string', description: 'e.g. 17:00' },
                is_active: { type: 'boolean' },
              },
              required: ['day_of_week', 'start_time', 'end_time', 'is_active'],
            },
          },
        },
        required: ['schedule'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_services',
      description: 'List all services for this business.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_service',
      description: 'Update a service (name, price, duration, active status).',
      parameters: {
        type: 'object',
        properties: {
          service_id: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          duration_mins: { type: 'number' },
          is_active: { type: 'boolean' },
        },
        required: ['service_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_analytics_summary',
      description: 'Get a quick summary of recent bookings and revenue.',
      parameters: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['7d', '30d', '90d'], description: 'Time period for analytics' },
        },
      },
    },
  },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export const POST = withBusiness(async (req, _profile, business) => {
  try {
    const { message, sessionId } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    const businessId = business.business_id || business.id;
    const sid = sessionId || businessId;

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const systemPrompt = `You are a smart dashboard assistant for ${business.name}. You help the creator manage their business directly through natural language.

You can:
- Look up, cancel, or confirm bookings for any date
- Update weekly availability/hours
- View and update services
- Summarize analytics

Today is ${today}. Today's date is ${todayStr()}. Tomorrow is ${tomorrowStr()}.

Rules:
- Be concise and direct (2-4 sentences max per reply)
- Before cancelling bookings, always call get_bookings first to see what exists, then cancel
- When the user says "today" use date ${todayStr()}, "tomorrow" use ${tomorrowStr()}
- Always confirm what actions you performed (e.g. "Cancelled 3 bookings for today")
- For bulk operations (like "cancel all bookings today"), fetch them first then cancel them all
- When updating availability, first get the current schedule, then apply the changes the user requested, preserving days they didn't mention
- Format times in 12-hour format in your replies (e.g. 9:00 AM)
- Keep responses friendly but professional`;

    const history = sessions.get(sid) || [];
    history.push({ role: 'user', content: message });

    let response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, ...history.slice(-16)],
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.4,
      max_tokens: 400,
    });

    let assistantMessage = response.choices[0].message;
    let iterations = 0;

    while (assistantMessage.tool_calls?.length && iterations < 5) {
      iterations++;
      history.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        const tc = toolCall as { id: string; function: { name: string; arguments: string } };
        const fnName = tc.function.name;
        const args = JSON.parse(tc.function.arguments || '{}');
        let result: unknown;

        try {
          if (fnName === 'get_bookings') {
            const { date, status } = args as { date?: string; status?: string };
            let query = supabase
              .from('bookings')
              .select('id, starts_at, ends_at, status, client_id, service_id')
              .eq('business_id', businessId)
              .order('starts_at', { ascending: true });

            if (status) query = query.eq('status', status);
            if (date) {
              query = query
                .gte('starts_at', `${date}T00:00:00`)
                .lte('starts_at', `${date}T23:59:59`);
            }

            const { data: bookings, error } = await query.limit(100);
            if (error) throw new Error(error.message);

            if (!bookings?.length) {
              result = { bookings: [], count: 0 };
            } else {
            const serviceIds = Array.from(new Set(bookings.map((b) => b.service_id).filter(Boolean)));
            const clientIds = Array.from(new Set(bookings.map((b) => b.client_id).filter(Boolean)));

              const [{ data: services }, { data: clients }] = await Promise.all([
                serviceIds.length
                  ? supabase.from('services').select('id, name').in('id', serviceIds)
                  : Promise.resolve({ data: [] }),
                clientIds.length
                  ? supabase.from('clients').select('id, name').in('id', clientIds)
                  : Promise.resolve({ data: [] }),
              ]);

              const sMap = Object.fromEntries((services || []).map((s) => [s.id, s]));
              const cMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));

              result = {
                bookings: bookings.map((b) => ({
                  id: b.id,
                  starts_at: b.starts_at,
                  status: b.status,
                  client_name: b.client_id ? cMap[b.client_id]?.name : 'Unknown',
                  service_name: b.service_id ? sMap[b.service_id]?.name : 'Unknown',
                })),
                count: bookings.length,
              };
            }
          } else if (fnName === 'cancel_bookings') {
            const { booking_ids } = args as { booking_ids: string[] };
            const results: { id: string; success: boolean; error?: string }[] = [];

            for (const id of booking_ids) {
              const { data: current } = await supabase
                .from('bookings')
                .select('id, status')
                .eq('id', id)
                .eq('business_id', businessId)
                .single();

              if (!current) {
                results.push({ id, success: false, error: 'Not found' });
                continue;
              }

              const cancellable = ['pending', 'confirmed'];
              if (!cancellable.includes(current.status)) {
                results.push({ id, success: false, error: `Cannot cancel: status is ${current.status}` });
                continue;
              }

              const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', id)
                .eq('business_id', businessId);

              results.push({ id, success: !error, error: error?.message });
            }

            result = {
              cancelled: results.filter((r) => r.success).length,
              failed: results.filter((r) => !r.success).length,
              details: results,
            };
          } else if (fnName === 'confirm_bookings') {
            const { booking_ids } = args as { booking_ids: string[] };
            const results: { id: string; success: boolean; error?: string }[] = [];

            for (const id of booking_ids) {
              const { data: current } = await supabase
                .from('bookings')
                .select('id, status')
                .eq('id', id)
                .eq('business_id', businessId)
                .single();

              if (!current || current.status !== 'pending') {
                results.push({ id, success: false, error: current ? `Status is ${current.status}` : 'Not found' });
                continue;
              }

              const { error } = await supabase
                .from('bookings')
                .update({ status: 'confirmed' })
                .eq('id', id)
                .eq('business_id', businessId);

              results.push({ id, success: !error, error: error?.message });
            }

            result = {
              confirmed: results.filter((r) => r.success).length,
              failed: results.filter((r) => !r.success).length,
              details: results,
            };
          } else if (fnName === 'get_availability') {
            const { data: rows, error } = await supabase
              .from('availability')
              .select('*')
              .eq('business_id', businessId)
              .order('day_of_week');

            if (error) throw new Error(error.message);
            result = {
              schedule: (rows || []).map((r) => ({
                ...r,
                day_name: DAY_NAMES[r.day_of_week],
              })),
            };
          } else if (fnName === 'update_availability') {
            const { schedule } = args as {
              schedule: { day_of_week: number; start_time: string; end_time: string; is_active: boolean }[];
            };

            const { error: delErr } = await supabase
              .from('availability')
              .delete()
              .eq('business_id', businessId);

            if (delErr) throw new Error(delErr.message);

            const rows = schedule.map((s) => ({
              business_id: businessId,
              day_of_week: Number(s.day_of_week),
              start_time: s.start_time,
              end_time: s.end_time,
              is_active: Boolean(s.is_active),
            }));

            const { data, error } = await supabase.from('availability').insert(rows).select();
            if (error) throw new Error(error.message);

            result = {
              updated: true,
              schedule: (data || []).map((r) => ({ ...r, day_name: DAY_NAMES[r.day_of_week] })),
            };
          } else if (fnName === 'get_services') {
            const { data: services, error } = await supabase
              .from('services')
              .select('id, name, price, duration_mins, is_active')
              .eq('business_id', businessId);

            if (error) throw new Error(error.message);
            result = { services: services || [] };
          } else if (fnName === 'update_service') {
            const { service_id, ...updates } = args as {
              service_id: string;
              name?: string;
              price?: number;
              duration_mins?: number;
              is_active?: boolean;
            };

            const { data, error } = await supabase
              .from('services')
              .update(updates)
              .eq('id', service_id)
              .eq('business_id', businessId)
              .select()
              .single();

            if (error) throw new Error(error.message);
            result = { updated: true, service: data };
          } else if (fnName === 'get_analytics_summary') {
            const { period = '30d' } = args as { period?: string };
            const days = parseInt(period) || 30;
            const from = new Date();
            from.setDate(from.getDate() - days);

            const { data: bookings } = await supabase
              .from('bookings')
              .select('status, total_price, starts_at')
              .eq('business_id', businessId)
              .gte('starts_at', from.toISOString());

            const all = bookings || [];
            const confirmed = all.filter((b) => b.status === 'confirmed');
            const revenue = confirmed.reduce((s, b) => s + (Number(b.total_price) || 0), 0);

            result = {
              period,
              total_bookings: all.length,
              confirmed: confirmed.length,
              cancelled: all.filter((b) => b.status === 'cancelled').length,
              revenue_total: revenue,
              avg_per_booking: confirmed.length ? (revenue / confirmed.length).toFixed(2) : '0',
            };
          } else {
            result = { error: 'Unknown function' };
          }
        } catch (err: unknown) {
          result = { error: err instanceof Error ? err.message : 'Tool error' };
        }

        history.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }

      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }, ...history.slice(-18)],
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.4,
        max_tokens: 400,
      });

      assistantMessage = response.choices[0].message;
    }

    const reply = assistantMessage.content || "Done.";
    history.push({ role: 'assistant', content: reply });
    // Keep last 30 messages to avoid unbounded memory growth
    if (history.length > 30) history.splice(0, history.length - 30);
    sessions.set(sid, history);

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error('[/api/dashboard-ai]', err);
    return NextResponse.json({ reply: 'Something went wrong. Please try again.' });
  }
});
