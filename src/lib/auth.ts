/**
 * Better Auth server instance.
 * Handles email/password and social login (Google, Facebook).
 * Syncs new users into our `profiles` table via databaseHooks.
 */

import { betterAuth } from 'better-auth';
import { dash } from '@better-auth/infra';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Prefer IPv4 — many networks break IPv6 (EHOSTUNREACH to AWS 2600:... hosts).
  // @ts-expect-error pg passes this to net.connect; not in older @types/pg PoolConfig
  family: 4,  
});

export const auth = betterAuth({
  database: pool,

  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET!,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    ...(process.env.FACEBOOK_CLIENT_ID
      ? {
          facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
          },
        }
      : {}),
  },

  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
    },
  },
  account: {
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  plugins: [dash()],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Sync newly created Better Auth user into our profiles table
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          const adminEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          const isAdmin = adminEmails.includes(user.email.toLowerCase());

          await supabase.from('profiles').insert({
            user_id: user.id,
            email: user.email,
            name: user.name || null,
            picture_url: user.image || null,
            is_admin: isAdmin,
          });
        },
      },
    },
  },
});
