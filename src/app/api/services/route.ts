import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const GET = withBusiness(async (_req, _profile, business) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', business.business_id)
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ services: data });
});

export const POST = withBusiness(async (req, _profile, business) => {
  const body = await req.json().catch(() => ({}));
  const { name, duration_mins, price, add_ons } = body;

  if (!name || !duration_mins) {
    return NextResponse.json({ error: 'name and duration_mins are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('services')
    .insert({ business_id: business.business_id, name, duration_mins, price, add_ons: add_ons || [], is_active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ service: data }, { status: 201 });
});
