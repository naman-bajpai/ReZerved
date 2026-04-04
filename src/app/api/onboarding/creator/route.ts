import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, syncProfile } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(authHeader.slice(7));
    const profile = await syncProfile(payload);

    if (profile.business_id) {
      return NextResponse.json({ error: 'Profile already linked to a business' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body.business_name === 'string' ? body.business_name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'business_name is required' }, { status: 400 });
    }

    const tz = typeof body.timezone === 'string' && body.timezone.trim()
      ? body.timezone.trim()
      : 'America/New_York';

    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .insert({ name, owner_name: profile.name || null, timezone: tz })
      .select('id, name, timezone, external_booking_url')
      .single();

    if (bizErr) throw bizErr;

    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .update({ business_id: biz.id, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
      .select()
      .single();

    if (profErr) throw profErr;

    return NextResponse.json(
      { profile: { id: prof.id, business_id: prof.business_id, is_admin: prof.is_admin }, business: biz },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/onboarding/creator error:', err);
    return NextResponse.json({ error: err.message || 'Onboarding failed' }, { status: 500 });
  }
}
