-- Shareable booking link feature
-- Run this in your Supabase SQL editor.

-- ─── 1. Add slug to businesses ────────────────────────────────────────────────
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- ─── 2. Guest OTPs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guest_otps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  business_id UUID NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + interval '10 minutes',
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guest_otps_email_business ON guest_otps (email, business_id);

-- ─── 3. Guest sessions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guest_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
  email       TEXT NOT NULL,
  name        TEXT NOT NULL,
  business_id UUID NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guest_sessions_token ON guest_sessions (token);
CREATE INDEX IF NOT EXISTS guest_sessions_email_business ON guest_sessions (email, business_id);

-- ─── 4. Add guest + stripe fields to bookings ─────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_name  TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT UNIQUE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';
-- payment_status: 'unpaid' | 'paid' | 'refunded'

-- ─── 5. Add email to clients ──────────────────────────────────────────────────
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;

-- ─── 6. Index for slug lookup ─────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS businesses_slug_idx ON businesses (slug) WHERE slug IS NOT NULL;
