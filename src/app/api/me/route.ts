import { NextRequest, NextResponse } from 'next/server';
import { getSession, getProfile } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await getProfile(session.user.id);
    if (!profile) {
      // Profile row missing (databaseHook may have failed on signup) — create it now.
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const isAdmin = session.user.email
        ? adminEmails.includes(session.user.email.toLowerCase())
        : false;
      const { data: created } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: session.user.id,
            email: session.user.email ?? null,
            name: session.user.name ?? null,
            picture_url: (session.user as any).image ?? null,
            is_admin: isAdmin,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();
      profile = created;
    }
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 500 });
    }

    let business = null;
    if (profile.business_id) {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, timezone, external_booking_url, instagram_page_id, owner_name')
        .eq('id', profile.business_id)
        .maybeSingle();
      business = data;

      if (!business) {
        console.warn('[/api/me] Orphaned business_id detected, clearing:', profile.business_id);
        await supabase
          .from('profiles')
          .update({ business_id: null, updated_at: new Date().toISOString() })
          .eq('id', profile.id);
        profile = { ...profile, business_id: null };
      }
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture_url: profile.picture_url,
        is_admin: profile.is_admin,
        business_id: profile.business_id,
        created_at: profile.created_at,
      },
      business,
    });
  } catch (err) {
    console.error('GET /api/me error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
