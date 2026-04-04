import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const PATCH = withBusiness(async (req, _profile, business, ctx) => {
  const id = ctx?.params?.id;
  if (!id) return NextResponse.json({ error: 'Missing service id' }, { status: 400 });

  const updates = await req.json().catch(() => ({}));

  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .eq('business_id', business.business_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ service: data });
});

export const DELETE = withBusiness(async (_req, _profile, business, ctx) => {
  const id = ctx?.params?.id;
  if (!id) return NextResponse.json({ error: 'Missing service id' }, { status: 400 });

  await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', id)
    .eq('business_id', business.business_id);

  return NextResponse.json({ success: true });
});
