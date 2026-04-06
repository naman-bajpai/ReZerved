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
    .select('*, services (name, price, duration_mins)')
    .eq('business_id', business.id)
    .eq('guest_email', session.email)
    .order('starts_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookings: bookings || [] });
}
