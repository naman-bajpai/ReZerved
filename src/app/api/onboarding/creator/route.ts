import { NextRequest, NextResponse } from 'next/server';
import { getSession, getProfile } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';
import { slugify, ensureUniqueSlug } from '@/lib/server/guest-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 401 });
    }

    if (profile.business_id) {
      const { data: existingBiz } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', profile.business_id)
        .maybeSingle();

      if (existingBiz) {
        return NextResponse.json({ error: 'Profile already linked to a business' }, { status: 400 });
      }

      console.log('Orphaned business_id detected, clearing:', profile.business_id);
      await supabase
        .from('profiles')
        .update({ business_id: null, updated_at: new Date().toISOString() })
        .eq('user_id', profile.user_id);
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body.business_name === 'string' ? body.business_name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'business_name is required' }, { status: 400 });
    }

    const tz =
      typeof body.timezone === 'string' && body.timezone.trim()
        ? body.timezone.trim()
        : 'America/New_York';

    const slug = await ensureUniqueSlug(slugify(name));

    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .insert({ name, owner_name: profile.name || null, timezone: tz, slug })
      .select('id, name, timezone, external_booking_url, slug')
      .single();

    if (bizErr) throw bizErr;

    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .update({ business_id: biz.id, updated_at: new Date().toISOString() })
      .eq('user_id', profile.user_id)
      .select()
      .single();

    if (profErr) {
      console.error('profiles update error:', profErr);
      throw profErr;
    }
    console.log('profiles updated:', prof);

    return NextResponse.json(
      { profile: { id: prof.id, business_id: prof.business_id, is_admin: prof.is_admin }, business: biz },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('POST /api/onboarding/creator error:', err);
    const message = err instanceof Error ? err.message : 'Onboarding failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
