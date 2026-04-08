import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/server/supabase';
import { getGuestSession } from '@/lib/server/guest-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const { slug, id } = params;

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await getGuestSession(req, business.id);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, status, payment_status, starts_at, ends_at, total_price, services (name, duration_mins)')
    .eq('id', id)
    .eq('business_id', business.id)
    .eq('guest_email', session.email)
    .maybeSingle();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ booking });
}
