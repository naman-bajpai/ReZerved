import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/server/supabase';
import { getGuestSession } from '@/lib/server/guest-auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const { slug, id } = params;

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

  // Verify ownership
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, status, starts_at, guest_email')
    .eq('id', id)
    .eq('business_id', business.id)
    .eq('guest_email', session.email)
    .maybeSingle();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    return NextResponse.json({ error: 'This booking cannot be cancelled' }, { status: 400 });
  }

  // Must be at least 2 hours in the future
  const hoursUntil = (new Date(booking.starts_at).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 2) {
    return NextResponse.json({ error: 'Cancellations must be made at least 2 hours in advance' }, { status: 400 });
  }

  const { error: updateErr } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ cancelled: true });
}
