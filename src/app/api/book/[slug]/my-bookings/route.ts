import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/server/supabase';
import { getGuestSession } from '@/lib/server/guest-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (bizErr || !business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await getGuestSession(req, business.id);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, status, payment_status, starts_at, ends_at, total_price, service_id')
    .eq('business_id', business.id)
    .eq('guest_email', session.email)
    .order('starts_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ bookings: [] });
  }

  // Fetch service details separately to avoid FK join dependency
  const serviceIds = Array.from(new Set(bookings.map((b) => b.service_id).filter(Boolean)));
  const { data: services } = serviceIds.length
    ? await supabase.from('services').select('id, name, duration_mins').in('id', serviceIds)
    : { data: [] };

  const serviceMap = Object.fromEntries((services || []).map((s) => [s.id, s]));

  const enriched = bookings.map((b) => ({
    ...b,
    services: b.service_id ? serviceMap[b.service_id] ?? null : null,
  }));

  return NextResponse.json({ bookings: enriched });
}
