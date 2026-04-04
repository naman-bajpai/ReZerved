'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  Clock,
  BarChart3,
  Zap,
  Link2,
  Shield,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { getMe } from '@/lib/api';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/services', label: 'Services', icon: Sparkles },
  { href: '/availability', label: 'Availability', icon: Clock },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/booking-link', label: 'Booking link', icon: Link2 },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { logout, user } = useAuth0();
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

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col px-3 py-5 fixed h-full">
      <div className="px-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-none text-foreground truncate">BookedUp</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none truncate">
              {user?.email || 'AI Revenue Optimizer'}
            </p>
          </div>
        </div>
      </div>

      <Separator className="mb-4" />

      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-primary' : '')} strokeWidth={active ? 2.5 : 2} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 mt-1',
              pathname === '/admin'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <Shield className="w-4 h-4 shrink-0" strokeWidth={pathname === '/admin' ? 2.5 : 2} />
            Admin
          </Link>
        )}
      </nav>

      <Separator className="mb-4" />

      <div className="px-3 space-y-2">
        <div className="rounded-lg bg-accent/60 p-3">
          <p className="text-xs font-semibold text-accent-foreground">AI Assistant</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            Connect your booking link so the bot can send clients to your calendar.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => logout({ logoutParams: { returnTo: typeof window !== 'undefined' ? window.location.origin : '/' } })}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
