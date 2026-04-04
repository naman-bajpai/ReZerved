import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const GET = withBusiness(async (req, _profile, business, ctx) => {
  const id = ctx?.params?.id;
  if (!id) return NextResponse.json({ error: 'Missing client id' }, { status: 400 });

  const [clientRes, bookingsRes] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).eq('business_id', business.business_id).single(),
    supabase
      .from('bookings')
      .select('*, services (name, price)')
      .eq('client_id', id)
      .eq('business_id', business.business_id)
      .order('starts_at', { ascending: false })
      .limit(20),
  ]);

  if (clientRes.error) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  return NextResponse.json({ client: clientRes.data, bookings: bookingsRes.data || [] });
});

export const PATCH = withBusiness(async (req, _profile, business, ctx) => {
  const id = ctx?.params?.id;
  if (!id) return NextResponse.json({ error: 'Missing client id' }, { status: 400 });

  const { name, notes, phone } = await req.json().catch(() => ({}));

  const { data, error } = await supabase
    .from('clients')
    .update({ name, notes, phone })
    .eq('id', id)
    .eq('business_id', business.business_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ client: data });
});
