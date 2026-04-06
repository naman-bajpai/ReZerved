import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/server/supabase';
import { getGuestSession } from '@/lib/server/guest-auth';
import { checkAvailability } from '@/lib/server/booking-engine';

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

  const { searchParams } = new URL(req.url);
  const service_id = searchParams.get('service_id');
  const date_from = searchParams.get('date_from');
  const date_to = searchParams.get('date_to');

  if (!service_id || !date_from || !date_to) {
    return NextResponse.json({ error: 'Required: service_id, date_from, date_to' }, { status: 400 });
  }

  try {
    const slots = await checkAvailability(business.id, service_id, date_from, date_to);
    return NextResponse.json({ slots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
