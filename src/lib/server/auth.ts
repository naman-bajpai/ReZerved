/**
 * Server-side auth helpers for Next.js API routes.
 * Validates Auth0 Bearer JWTs and syncs profiles to Supabase.
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import supabase from './supabase';

// Lazily initialised JWKS set
let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!JWKS) {
    const domain = process.env.AUTH0_DOMAIN;
    if (!domain) throw new Error('AUTH0_DOMAIN is not set');
    JWKS = createRemoteJWKSet(
      new URL(`https://${domain}/.well-known/jwks.json`)
    );
  }
  return JWKS;
}

export interface JWTPayload {
  sub: string;
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  [key: string]: unknown;
}

export interface Profile {
  id: string;
  auth0_sub: string;
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

// ─── JWT Verification ─────────────────────────────────────────────────────────

export async function verifyToken(token: string): Promise<JWTPayload> {
  const domain = process.env.AUTH0_DOMAIN;
  const audience = process.env.AUTH0_AUDIENCE;
  if (!domain || !audience) throw new Error('AUTH0_DOMAIN and AUTH0_AUDIENCE are required');

  const { payload } = await jwtVerify(token, getJWKS(), {
    audience,
    issuer: `https://${domain}/`,
  });

  return payload as unknown as JWTPayload;
}

// ─── Profile Sync ─────────────────────────────────────────────────────────────

export async function syncProfile(jwtPayload: JWTPayload): Promise<Profile> {
  const { sub, email = null, name = null, nickname = null, picture = null } = jwtPayload;
  const resolvedName = name || nickname || null;
  const pictureUrl = picture || null;

  const adminSubs = (process.env.ADMIN_AUTH0_SUBS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const grantAdmin =
    adminSubs.includes(sub) || (email ? adminEmails.includes(String(email).toLowerCase()) : false);

  const { data: existing, error: findErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth0_sub', sub)
    .maybeSingle();

  if (findErr) throw findErr;

  if (existing) {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (email && email !== existing.email) updates.email = email;
    if (resolvedName && resolvedName !== existing.name) updates.name = resolvedName;
    if (pictureUrl && pictureUrl !== existing.picture_url) updates.picture_url = pictureUrl;
    if (grantAdmin && !existing.is_admin) updates.is_admin = true;

    const { data: updated, error: upErr } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    if (upErr) throw upErr;
    return updated as Profile;
  }

  const { data: created, error: insErr } = await supabase
    .from('profiles')
    .insert({ auth0_sub: sub, email, name: resolvedName, picture_url: pictureUrl, is_admin: grantAdmin })
    .select()
    .single();

  if (insErr) throw insErr;
  return created as Profile;
}

// ─── Middleware Helpers ───────────────────────────────────────────────────────

/**
 * Extract and validate Bearer token from the request, returning the synced profile.
 * Also supports legacy X-Business-ID header for dev environments.
 */
export async function authenticate(
  req: NextRequest
): Promise<{ profile: Profile | null; legacy: boolean; legacyBusinessId: string | null }> {
  const legacyHeader = req.headers.get('x-business-id');
  if (process.env.ALLOW_LEGACY_BUSINESS_HEADER === 'true' && legacyHeader) {
    return { profile: null, legacy: true, legacyBusinessId: legacyHeader };
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header', 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  const profile = await syncProfile(payload);
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
    throw new AuthError('Complete creator onboarding to access the dashboard', 403, 'NEEDS_ONBOARDING');
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, timezone, external_booking_url')
    .eq('id', profile.business_id)
    .single();

  if (error || !business) throw new AuthError('Business not found', 403);
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

/** Wrap a handler with JWT auth + profile sync. */
export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest, ctx?: { params?: Record<string, string> }) => {
    try {
      const { profile, legacy, legacyBusinessId } = await authenticate(req);
      if (legacy) {
        // Legacy dev path: profile is null but we need to pass something
        return handler(req, null as unknown as Profile, ctx);
      }
      return handler(req, profile!, ctx);
    } catch (err) {
      return authErrResponse(err);
    }
  };
}

/** Wrap a handler with JWT auth + profile sync + business lookup. */
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
