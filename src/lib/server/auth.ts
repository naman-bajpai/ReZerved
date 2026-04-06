/**
 * Server-side auth helpers for Next.js API routes.
 * Uses Better Auth sessions (cookie-based) instead of Auth0 JWTs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import supabase from './supabase';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  picture_url: string | null;
  is_admin: boolean;
  business_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  timezone: string;
  external_booking_url: string | null;
  business_id: string; // alias for id, kept for compat
}

// ─── Session & Profile Lookup ─────────────────────────────────────────────────

/**
 * Get the current Better Auth session from request headers.
 * Returns null if no valid session exists.
 */
export async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

/**
 * Fetch the profile row for a given Better Auth user ID.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  // Sync admin status if ADMIN_EMAILS changed since profile was created
  if (data) {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const shouldBeAdmin = data.email
      ? adminEmails.includes(String(data.email).toLowerCase())
      : false;

    if (shouldBeAdmin && !data.is_admin) {
      const { data: updated } = await supabase
        .from('profiles')
        .update({ is_admin: true, updated_at: new Date().toISOString() })
        .eq('id', data.id)
        .select()
        .single();
      return updated as Profile;
    }
  }

  return data as Profile | null;
}

// ─── Middleware Helpers ───────────────────────────────────────────────────────

/**
 * Extract and validate session from the request, returning the profile.
 * Also supports legacy X-Business-ID header for dev environments.
 */
export async function authenticate(
  req: NextRequest
): Promise<{ profile: Profile | null; legacy: boolean; legacyBusinessId: string | null }> {
  const legacyHeader = req.headers.get('x-business-id');
  if (process.env.ALLOW_LEGACY_BUSINESS_HEADER === 'true' && legacyHeader) {
    return { profile: null, legacy: true, legacyBusinessId: legacyHeader };
  }

  const session = await getSession(req);
  if (!session) throw new AuthError('Unauthorized', 401);

  const profile = await getProfile(session.user.id);
  if (!profile) throw new AuthError('Profile not found', 401);

  return { profile, legacy: false, legacyBusinessId: null };
}

/**
 * Load the business for a given profile or legacy business ID.
 */
export async function loadBusiness(
  profile: Profile | null,
  legacyBusinessId: string | null
): Promise<Business> {
  if (legacyBusinessId) {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('id, name, timezone, external_booking_url')
      .eq('id', legacyBusinessId)
      .single();

    if (error || !business) throw new AuthError('Invalid business ID', 401);
    return { ...business, business_id: business.id } as Business;
  }

  if (!profile) throw new AuthError('Unauthorized', 401);
  if (!profile.business_id) {
    console.warn('[loadBusiness] profile has no business_id', { profileId: profile.id, userId: profile.user_id });
    throw new AuthError('Complete creator onboarding to access the dashboard', 403, 'NEEDS_ONBOARDING');
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, timezone, external_booking_url')
    .eq('id', profile.business_id)
    .single();

  if (error || !business) {
    console.error('[loadBusiness] business not found', { businessId: profile.business_id, error: error?.message });
    throw new AuthError('Business not found', 403);
  }
  return { ...business, business_id: business.id } as Business;
}

// ─── Route Wrappers ───────────────────────────────────────────────────────────

type AuthedHandler = (
  req: NextRequest,
  profile: Profile,
  ctx?: { params?: Record<string, string> }
) => Promise<NextResponse>;

type BusinessHandler = (
  req: NextRequest,
  profile: Profile,
  business: Business,
  ctx?: { params?: Record<string, string> }
) => Promise<NextResponse>;

/** Wrap a handler with session auth + profile lookup. */
export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest, ctx?: { params?: Record<string, string> }) => {
    try {
      const { profile, legacy: isLegacy } = await authenticate(req);
      if (isLegacy) return handler(req, null as unknown as Profile, ctx);
      return handler(req, profile!, ctx);
    } catch (err) {
      return authErrResponse(err);
    }
  };
}

/** Wrap a handler with session auth + profile + business lookup. */
export function withBusiness(handler: BusinessHandler) {
  return async (req: NextRequest, ctx?: { params?: Record<string, string> }) => {
    try {
      const { profile, legacy, legacyBusinessId } = await authenticate(req);
      const business = await loadBusiness(profile, legacyBusinessId);
      return handler(req, profile!, business, ctx);
    } catch (err) {
      return authErrResponse(err);
    }
  };
}

/** Wrap a handler requiring admin role. */
export function withAdmin(handler: AuthedHandler) {
  return async (req: NextRequest, ctx?: { params?: Record<string, string> }) => {
    try {
      const { profile } = await authenticate(req);
      if (!profile?.is_admin) {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      }
      return handler(req, profile!, ctx);
    } catch (err) {
      return authErrResponse(err);
    }
  };
}

// ─── Error Helpers ────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number = 401,
    public code?: string
  ) {
    super(message);
  }
}

function authErrResponse(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json(
      { error: err.message, ...(err.code ? { code: err.code } : {}) },
      { status: err.status }
    );
  }
  console.error('Auth error:', err);
  return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
}
