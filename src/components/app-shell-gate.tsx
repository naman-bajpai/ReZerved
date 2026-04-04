'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';
import { isAuth0Configured } from '@/lib/auth0-config';

/**
 * Protects (app) routes: login required, then onboarding if no business linked.
 */
export function AppShellGate({ children }: { children: React.ReactNode }) {
  if (!isAuth0Configured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Auth0 is not configured for the browser</p>
          <p className="mb-3">
            Add these to <code className="text-foreground">frontend/.env.local</code> (names must start with{' '}
            <code className="text-foreground">NEXT_PUBLIC_</code>) and restart <code className="text-foreground">npm run dev</code>:
          </p>
          <ul className="text-left text-xs space-y-1 font-mono bg-muted/50 rounded-lg p-3 mb-3">
            <li>NEXT_PUBLIC_AUTH0_DOMAIN=…</li>
            <li>NEXT_PUBLIC_AUTH0_CLIENT_ID=…</li>
            <li>NEXT_PUBLIC_AUTH0_AUDIENCE=… (optional)</li>
          </ul>
          <p className="text-xs">
            Server-only variables like <code className="text-foreground">AUTH0_DOMAIN</code> are not visible to this app — use{' '}
            <code className="text-foreground">NEXT_PUBLIC_AUTH0_DOMAIN</code> instead.
          </p>
        </div>
      </div>
    );
  }

  return <AppShellGateInner>{children}</AppShellGateInner>;
}

function AppShellGateInner({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: pathname || '/dashboard' },
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        if (!me.profile.business_id && pathname !== '/onboarding') {
          router.replace('/onboarding');
        } else if (me.profile.business_id && pathname === '/onboarding') {
          router.replace('/dashboard');
        }
      } catch {
        /* network / 401 — still show shell so user can retry */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, pathname, router, loginWithRedirect]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
