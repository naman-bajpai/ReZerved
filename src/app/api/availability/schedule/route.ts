import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const GET = withBusiness(async (_req, _profile, business) => {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('business_id', business.business_id)
    .order('day_of_week');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schedule: data });
});
