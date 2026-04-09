import { NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const PATCH = withBusiness(async (req, _profile, business) => {
  const body = await req.json().catch(() => ({}));
  const { business_name, timezone } = body;

  const updates: Record<string, string> = {};

  if (business_name !== undefined) {
    if (typeof business_name !== 'string' || business_name.trim().length < 2) {
      return NextResponse.json({ error: 'Business name must be at least 2 characters' }, { status: 400 });
    }
    updates.name = business_name.trim();
  }

  if (timezone !== undefined) {
    if (typeof timezone !== 'string' || !timezone.trim()) {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
    }
    updates.timezone = timezone.trim();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', business.id)
    .select('id, name, timezone')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ business: data });
});
