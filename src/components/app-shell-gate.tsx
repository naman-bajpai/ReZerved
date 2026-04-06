'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { getMe } from '@/lib/api';

export function AppShellGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState<string | null>(null);

  const userId = session?.user?.id;

  useEffect(() => {
    if (isPending || !userId) {
      setAllowed(null);
      return;
    }

    let cancelled = false;
    setAllowed(null);

    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;

        const onboarded = !!me.business;
        const isOnboarding = pathname === '/onboarding';

        if (!onboarded && !isOnboarding) {
          router.replace('/onboarding');
          return;
        }

        if (onboarded && isOnboarding) {
          router.replace('/dashboard');
          return;
        }

        setAllowed(pathname);
      } catch {
        if (cancelled) return;
        setAllowed(pathname);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isPending, userId, pathname, router]);

  if (isPending || !userId || allowed !== pathname) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
