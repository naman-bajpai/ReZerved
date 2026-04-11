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
    .select('*')
    .eq('business_id', business.business_id)
    .order('starts_at', { ascending: true })
    .range(offset, offset + limit - 1);

  const dateFrom = searchParams.get('date_from');
  const dateTo   = searchParams.get('date_to');

  if (status) query = query.eq('status', status);
  if (date) {
    query = query
      .gte('starts_at', `${date}T00:00:00`)
      .lte('starts_at', `${date}T23:59:59`);
  } else if (dateFrom && dateTo) {
    query = query
      .gte('starts_at', `${dateFrom}T00:00:00`)
      .lte('starts_at', `${dateTo}T23:59:59`);
  }

  const { data: bookings, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ bookings: [], count: 0 });
  }

  // Fetch related records separately to avoid FK join dependency
  const serviceIds = Array.from(new Set(bookings.map((b) => b.service_id).filter(Boolean)));
  const clientIds = Array.from(new Set(bookings.map((b) => b.client_id).filter(Boolean)));

  const [{ data: services }, { data: clients }] = await Promise.all([
    serviceIds.length
      ? supabase.from('services').select('id, name, price, duration_mins').in('id', serviceIds)
      : Promise.resolve({ data: [] }),
    clientIds.length
      ? supabase.from('clients').select('id, name, phone, instagram_id, avg_spend').in('id', clientIds)
      : Promise.resolve({ data: [] }),
  ]);

  const serviceMap = Object.fromEntries((services || []).map((s) => [s.id, s]));
  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));

  const enriched = bookings.map((b) => ({
    ...b,
    services: b.service_id ? serviceMap[b.service_id] ?? null : null,
    clients: b.client_id ? clientMap[b.client_id] ?? null : null,
  }));

  return NextResponse.json({ bookings: enriched, count: enriched.length });
});
