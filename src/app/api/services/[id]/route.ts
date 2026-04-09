import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const PATCH = withBusiness(async (req, _profile, business, ctx) => {
  const id = ctx?.params?.id;
  if (!id) return NextResponse.json({ error: 'Missing service id' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { name, duration_mins, price, is_active } = body;

  const updates: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 });
    }
    updates.name = name.trim();
  }

  if (duration_mins !== undefined) {
    const d = Number(duration_mins);
    if (!Number.isFinite(d) || d <= 0) {
      return NextResponse.json({ error: 'duration_mins must be a positive number' }, { status: 400 });
    }
    updates.duration_mins = d;
  }

  if (price !== undefined) {
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) {
      return NextResponse.json({ error: 'price must be zero or a positive number' }, { status: 400 });
    }
    updates.price = p;
  }

  if (is_active !== undefined) {
    updates.is_active = Boolean(is_active);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .eq('business_id', business.business_id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
