'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { getMe } from '@/lib/api';

/**
 * Protects (app) routes: login required, then onboarding if no business linked.
 */
export function AppShellGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname || '/dashboard')}`);
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
          // business already set — hard redirect so fresh data is loaded
          window.location.href = '/dashboard';
        } else {
          if (!cancelled) setReady(true);
        }
      } catch (err: any) {
        if (cancelled) return;
        // 401 means session expired — send to login
        if (err?.status === 401) {
          router.replace(`/login?returnTo=${encodeURIComponent(pathname || '/dashboard')}`);
        } else {
          // Other errors (network etc.) — still render so user isn't stuck
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isPending, session, pathname, router]);

  if (isPending || !session) {
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
