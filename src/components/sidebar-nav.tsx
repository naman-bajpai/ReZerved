'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  Clock,
  BarChart3,
  Link2,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMe } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/services', label: 'Services', icon: Sparkles },
  { href: '/availability', label: 'Availability', icon: Clock },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/booking-link', label: 'Booking Link', icon: Link2 },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (!cancelled) setIsAdmin(me.profile.is_admin);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push('/'),
      },
    });
  }

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <aside className="w-[260px] border-r border-[--sidebar-border] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,247,237,0.88)_45%,rgba(253,242,248,0.84)_100%)] backdrop-blur-sm flex flex-col fixed h-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.10),transparent_28%)] pointer-events-none" />

      {/* Brand */}
      <div className="relative px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[linear-gradient(135deg,#f97316_0%,#ec4899_100%)] flex items-center justify-center shadow-lg shadow-orange-500/15">
            <span className="text-sm font-bold text-white font-[family-name:var(--font-display)]">B</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold leading-none text-[--sidebar-foreground] tracking-tight font-[family-name:var(--font-display)]">
              BookedUp
            </h1>
            <p className="text-[10px] text-[--sidebar-foreground]/45 mt-1 leading-none tracking-wide uppercase">
              Revenue Optimizer
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-[--sidebar-border]" />

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 relative',
                active
                  ? 'bg-white/75 text-[--sidebar-accent-foreground] shadow-[0_10px_24px_-18px_rgba(236,72,153,0.4)]'
                  : 'text-[--sidebar-foreground]/62 hover:text-[--sidebar-foreground] hover:bg-white/55'
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-[linear-gradient(180deg,#f97316,#ec4899)]" />
              )}
              <Icon
                className={cn(
                  'w-[18px] h-[18px] shrink-0 transition-colors duration-200',
                  active ? 'text-[--sidebar-primary]' : 'text-[--sidebar-foreground]/40 group-hover:text-[--sidebar-foreground]/72'
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />
              {label}
              {active && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[--sidebar-foreground]/30" strokeWidth={2} />
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="mx-3 my-2 h-px bg-[--sidebar-border]" />
            <Link
              href="/admin"
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 relative',
                pathname === '/admin'
                  ? 'bg-white/75 text-[--sidebar-accent-foreground] shadow-[0_10px_24px_-18px_rgba(236,72,153,0.4)]'
                  : 'text-[--sidebar-foreground]/62 hover:text-[--sidebar-foreground] hover:bg-white/55'
              )}
            >
              {pathname === '/admin' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-[linear-gradient(180deg,#f97316,#ec4899)]" />
              )}
              <Shield
                className={cn(
                  'w-[18px] h-[18px] shrink-0',
                  pathname === '/admin' ? 'text-[--sidebar-primary]' : 'text-[--sidebar-foreground]/40'
                )}
                strokeWidth={pathname === '/admin' ? 2.2 : 1.8}
              />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="relative px-3 pb-4 space-y-3">
        <div className="mx-2 h-px bg-[--sidebar-border]" />

        {/* User card */}
        <div className="flex items-center gap-3 rounded-xl bg-white/55 px-3 py-2 ring-1 ring-white/70">
          <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(236,72,153,0.16))] flex items-center justify-center shrink-0 ring-1 ring-orange-200/70">
            <span className="text-[11px] font-bold text-[--sidebar-primary]">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-[--sidebar-foreground]/80 truncate leading-none">
              {session?.user?.name || 'Account'}
            </p>
            <p className="text-[10px] text-[--sidebar-foreground]/35 truncate mt-0.5 leading-none">
              {session?.user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-md hover:bg-white/75 transition-colors text-[--sidebar-foreground]/35 hover:text-[--sidebar-foreground]/60"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );
}
