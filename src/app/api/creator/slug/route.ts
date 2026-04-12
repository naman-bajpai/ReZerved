import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';
import { slugify, ensureUniqueSlug } from '@/lib/server/guest-auth';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

/** PATCH — update the slug for the business with validation. */
export const PATCH = withBusiness(async (req, _profile, business) => {
  const body = await req.json().catch(() => ({}));
  const slug: string = (body.slug ?? '').trim();

  if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  if (slug.length < 3) return NextResponse.json({ error: 'Slug must be at least 3 characters' }, { status: 400 });
  if (slug.length > 60) return NextResponse.json({ error: 'Slug must be 60 characters or fewer' }, { status: 400 });
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: 'Slug may only contain lowercase letters, numbers, and hyphens (no leading/trailing hyphens)' },
      { status: 400 },
    );
  }

  // Uniqueness check — exclude current business
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .neq('id', business.id)
    .maybeSingle();

  if (existing) return NextResponse.json({ error: 'That slug is already taken' }, { status: 409 });

  const { error } = await supabase
    .from('businesses')
    .update({ slug })
    .eq('id', business.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ slug });
});

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
