import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';
import { slugify, ensureUniqueSlug } from '@/lib/server/guest-auth';

/** POST — generate a slug for the business if it doesn't have one yet. */
export const POST = withBusiness(async (_req, _profile, business) => {
  // Already has a slug
  const { data: biz } = await supabase
    .from('businesses')
    .select('slug, name')
    .eq('id', business.id)
    .single();

  if (biz?.slug) {
    return NextResponse.json({ slug: biz.slug });
  }

  const slug = await ensureUniqueSlug(slugify(biz?.name || business.id), business.id);

  const { error } = await supabase
    .from('businesses')
    .update({ slug })
    .eq('id', business.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ slug });
});
