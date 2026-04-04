import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, syncProfile } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(authHeader.slice(7));
    const profile = await syncProfile(payload);

    if (!profile.is_admin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const { data: rows, error } = await supabase
      .from('profiles')
      .select('id, auth0_sub, email, name, picture_url, is_admin, business_id, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ users: rows || [], count: rows?.length ?? 0 });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
