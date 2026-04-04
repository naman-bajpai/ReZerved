import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const PATCH = withBusiness(async (req, _profile, business) => {
  const body = await req.json().catch(() => ({}));
  const { external_booking_url } = body;

  if (external_booking_url !== null && external_booking_url !== undefined) {
    if (typeof external_booking_url !== 'string') {
      return NextResponse.json({ error: 'external_booking_url must be a string or null' }, { status: 400 });
    }
    const trimmed = external_booking_url.trim();
    if (trimmed.length > 2048) {
      return NextResponse.json({ error: 'URL too long' }, { status: 400 });
    }
    if (trimmed.length > 0) {
      try { new URL(trimmed); } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
      }
    }
  }

  const url =
    external_booking_url === null || external_booking_url === undefined
      ? null
      : String(external_booking_url).trim() || null;

  const { data, error } = await supabase
    .from('businesses')
    .update({ external_booking_url: url })
    .eq('id', business.id)
    .select('id, external_booking_url')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ business: data });
});
