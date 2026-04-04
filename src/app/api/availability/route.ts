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

  const updates = schedule.map((s: any) => ({
    business_id: business.business_id,
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
    is_active: s.is_active ?? true,
  }));

  const { data, error } = await supabase
    .from('availability')
    .upsert(updates, { onConflict: 'business_id,day_of_week' })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schedule: data });
});
