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
