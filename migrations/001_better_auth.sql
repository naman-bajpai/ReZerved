-- Better Auth tables
-- Run this in your Supabase SQL editor (or psql) before starting the app.
-- Note: supabase/migrations/002_auth_profiles.sql already creates profiles
-- with user_id referencing "user"(id), so no ALTER needed here.

-- ─── Better Auth: user ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user" (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  image       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Better Auth: session ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session (
  id          TEXT PRIMARY KEY,
  expires_at  TIMESTAMPTZ NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address  TEXT,
  user_agent  TEXT,
  user_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- ─── Better Auth: account ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS account (
  id                      TEXT PRIMARY KEY,
  account_id              TEXT NOT NULL,
  provider_id             TEXT NOT NULL,
  user_id                 TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token            TEXT,
  refresh_token           TEXT,
  id_token                TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  scope                   TEXT,
  password                TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Better Auth: verification ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verification (
  id          TEXT PRIMARY KEY,
  identifier  TEXT NOT NULL,
  value       TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ
);
