import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const GET = withAdmin(async (_req: NextRequest, _profile) => {
  const { data: rows, error } = await supabase
    .from('profiles')
    .select('id, user_id, email, name, picture_url, is_admin, business_id, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: rows || [], count: rows?.length ?? 0 });
});
