import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';
import { checkAvailability } from '@/lib/server/booking-engine';

export const GET = withBusiness(async (req, _profile, business) => {
  const { searchParams } = new URL(req.url);
  const service_id = searchParams.get('service_id');
  const date_from = searchParams.get('date_from');
  const date_to = searchParams.get('date_to');

  if (!service_id || !date_from || !date_to) {
    return NextResponse.json({ error: 'Required: service_id, date_from, date_to' }, { status: 400 });
  }

  try {
    const slots = await checkAvailability(business.business_id, service_id, date_from, date_to);
    return NextResponse.json({ slots, count: slots.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});

export const PUT = withBusiness(async (req, _profile, business) => {
  const body = await req.json().catch(() => ({}));
  const { schedule } = body;

  if (!Array.isArray(schedule)) {
    return NextResponse.json({ error: 'schedule must be an array' }, { status: 400 });
  }

  const businessId = business.business_id || business.id;

  // Validate each entry has required fields
  for (const s of schedule) {
    if (s.day_of_week === undefined || s.day_of_week === null) {
      return NextResponse.json({ error: 'Each schedule entry must have day_of_week' }, { status: 400 });
    }
    if (!s.start_time || !s.end_time) {
      return NextResponse.json({ error: 'Each active schedule entry must have start_time and end_time' }, { status: 400 });
    }
  }

  // Delete the existing schedule for this business, then re-insert fresh rows.
  // This avoids any dependency on a unique constraint and prevents duplicate
  // rows accumulating when the upsert conflict target is not enforced by the DB.
  const { error: delErr } = await supabase
    .from('availability')
    .delete()
    .eq('business_id', businessId);

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  const rows = schedule.map((s: any) => ({
    business_id: businessId,
    day_of_week: Number(s.day_of_week),
    start_time: s.start_time,
    end_time: s.end_time,
    is_active: Boolean(s.is_active),
  }));

  const { data, error } = await supabase
    .from('availability')
    .insert(rows)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schedule: data });
});
