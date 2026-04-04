import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const GET = withBusiness(async (req, _profile, business) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const limit = Number(searchParams.get('limit') || 50);
  const offset = Number(searchParams.get('offset') || 0);

  let query = supabase
    .from('clients')
    .select('*')
    .eq('business_id', business.business_id)
    .order('avg_spend', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ clients: data, count: data.length });
});
