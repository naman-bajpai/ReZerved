import { NextRequest } from 'next/server';
import supabase from './supabase';

export interface GuestSession {
  id: string;
  token: string;
  email: string;
  name: string;
  business_id: string;
  expires_at: string;
}

/** Extract + validate guest session token from Authorization header. */
export async function getGuestSession(
  req: NextRequest,
  businessId: string
): Promise<GuestSession | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;

  const { data, error } = await supabase
    .from('guest_sessions')
    .select('*')
    .eq('token', token)
    .eq('business_id', businessId)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  return data as GuestSession;
}

/** Generate a random 6-digit OTP code. */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Create a slugified version of a business name. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

/** Ensure a slug is unique in businesses table, appending a number if needed. */
export async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base;
  let attempt = 0;

  while (true) {
    const q = supabase
      .from('businesses')
      .select('id')
      .eq('slug', candidate);

    if (excludeId) q.neq('id', excludeId);

    const { data } = await q.maybeSingle();
    if (!data) return candidate; // unique

    attempt++;
    candidate = `${base}-${attempt}`;
  }
}
