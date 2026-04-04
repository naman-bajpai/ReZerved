import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const GET = withBusiness(async (req, _profile, business) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const date = searchParams.get('date');
  const limit = Number(searchParams.get('limit') || 50);
  const offset = Number(searchParams.get('offset') || 0);

  let query = supabase
    .from('bookings')
    .select('*, clients (id, name, phone, instagram_id, avg_spend), services (id, name, price, duration_mins)')
    .eq('business_id', business.business_id)
    .order('starts_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (date) {
    query = query
      .gte('starts_at', `${date}T00:00:00`)
      .lte('starts_at', `${date}T23:59:59`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });

  return NextResponse.json({ bookings: data, count: data.length });
});
