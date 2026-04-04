import { NextRequest, NextResponse } from 'next/server';
import { getSession, getProfile } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 401 });
    }

    let business = null;
    if (profile.business_id) {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, timezone, external_booking_url, instagram_page_id, owner_name')
        .eq('id', profile.business_id)
        .maybeSingle();
      business = data;
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
