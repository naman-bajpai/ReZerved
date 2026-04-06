'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { getMe } from '@/lib/api';

function PremiumLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#09090b' }}
    >
      {/* Ambient blobs */}
      <div className="fixed top-1/3 left-1/3 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)' }} />
      <div className="fixed bottom-1/3 right-1/3 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(251,113,133,0.03) 0%, transparent 70%)' }} />

      <div className="flex flex-col items-center gap-6">
        <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="loadgl" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b"/>
              <stop offset="1" stopColor="#fb7185"/>
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="10" fill="url(#loadgl)"/>
          <rect x="8" y="12" width="16" height="12" rx="2.5" fill="white" fillOpacity="0.95"/>
          <rect x="8" y="10" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.65"/>
          <rect x="12" y="8" width="3" height="5" rx="1.5" fill="white"/>
          <rect x="17" y="8" width="3" height="5" rx="1.5" fill="white"/>
          <path d="M12 18.5l2.5 2.5 5.5-6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          <div
            className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }}
          />
        </div>
      </div>
    </div>
  );
}

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

    return () => { cancelled = true; };
  }, [isPending, userId, pathname, router]);

  if (isPending || !userId || allowed !== pathname) {
    return <PremiumLoader />;
  }

  return <>{children}</>;
}
