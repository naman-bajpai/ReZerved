'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';

/**
 * Protects (app) routes: login required, then onboarding if no business linked.
 */
export function AppShellGate({ children }: { children: React.ReactNode }) {
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
