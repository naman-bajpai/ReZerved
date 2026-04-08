import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/server/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, slug, timezone')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: services, error: svcError } = await supabase
    .from('services')
    .select('id, name, duration_mins, price, add_ons')
    .eq('business_id', business.id)
    .neq('is_active', false)
    .order('name');

  if (svcError) {
    console.error('[book/slug] services query error:', svcError.message, { businessId: business.id });
    return NextResponse.json({ error: svcError.message }, { status: 500 });
  }

  return NextResponse.json({ business, services: services ?? [] });
}
