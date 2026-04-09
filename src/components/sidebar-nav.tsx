'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, CalendarDays, Users, Sparkles, Clock,
  BarChart3, Link2, Shield, LogOut, MessageSquare, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMe } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

const NAV = [
  { href: '/dashboard',      label: 'Overview',       icon: LayoutDashboard,  group: 'main' },
  { href: '/conversations',  label: 'Conversations',  icon: MessageSquare,    group: 'main' },
  { href: '/bookings',       label: 'Bookings',       icon: CalendarDays,     group: 'main' },
  { href: '/clients',        label: 'Clients',        icon: Users,            group: 'main' },
  { href: '/analytics',      label: 'Analytics',      icon: BarChart3,        group: 'main' },
  { href: '/services',       label: 'Services',       icon: Sparkles,         group: 'business' },
  { href: '/availability',   label: 'Availability',   icon: Clock,            group: 'business' },
  { href: '/booking-link',   label: 'Booking Link',   icon: Link2,            group: 'business' },
  { href: '/settings',       label: 'Settings',       icon: Settings,         group: 'settings' },
];

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="snl" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b"/>
          <stop offset="1" stopColor="#fb7185"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#snl)"/>
      <rect x="8" y="12" width="16" height="12" rx="2.5" fill="white" fillOpacity="0.95"/>
      <rect x="8" y="10" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.65"/>
      <rect x="12" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <rect x="17" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <path d="M12 18.5l2.5 2.5 5.5-6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type NavItemProps = {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  badge?: string;
};

function NavItem({ href, label, icon: Icon, active, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
        active
          ? 'text-[#fbbf24]'
          : 'text-[#71717a] hover:text-[#d4d4d8] hover:bg-[rgba(255,255,255,0.04)]'
      )}
    >
      {active && (
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(105deg, rgba(245,158,11,0.11) 0%, rgba(245,158,11,0.04) 60%, transparent 100%)',
            border: '1px solid rgba(245,158,11,0.16)',
          }}
        />
      )}

      {active && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[18px] w-[3px] rounded-r-full"
          style={{
            background: 'linear-gradient(180deg, #fbbf24, #f97316)',
            boxShadow: '0 0 8px rgba(251,191,36,0.7), 2px 0 16px rgba(245,158,11,0.25)',
          }}
        />
      )}

      <Icon
        className={cn(
          'relative w-[16px] h-[16px] flex-shrink-0 transition-all duration-200',
          active ? 'text-[#fbbf24]' : 'text-[#52525b] group-hover:text-[#a1a1aa]'
        )}
        strokeWidth={active ? 2.2 : 1.8}
        style={active ? { filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.45))' } : {}}
      />
      <span className="relative flex-1 leading-none tracking-[-0.01em]">{label}</span>
      {badge && (
        <span
          className="relative flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: 'rgba(251,113,133,0.15)',
            color: '#fb7185',
            border: '1px solid rgba(251,113,133,0.22)',
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function NavSection({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      {label && (
        <p
          className="px-3 pb-2 pt-1 text-[10px] uppercase tracking-[0.14em] font-semibold"
          style={{ color: '#3f3f46' }}
        >
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

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
        if (!cancelled) setIsAdmin(me.profile?.is_admin ?? false);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push('/') },
    });
  }

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() || 'U';

  const mainNav   = NAV.filter(n => n.group === 'main');
  const bizNav    = NAV.filter(n => n.group === 'business');
  const settNav   = NAV.filter(n => n.group === 'settings');

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col overflow-hidden"
      style={{
        width: 256,
        background: 'linear-gradient(168deg, #0f0d0b 0%, #09090b 55%, #09090b 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Ambient glow behind brand */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: 180,
          background: 'radial-gradient(ellipse at 50% -20%, rgba(245,158,11,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Brand */}
      <div className="relative px-4 pt-5 pb-4">
        <div className="flex items-center gap-3 px-2">
          <div style={{ filter: 'drop-shadow(0 2px 8px rgba(245,158,11,0.35))' }}>
            <Logo />
          </div>
          <div>
            <h1
              className="text-[14px] font-bold leading-none tracking-[-0.02em]"
              style={{ color: '#f4f4f5', fontFamily: 'var(--font-display)' }}
            >
              Rezerve
            </h1>
            <p
              className="text-[9px] uppercase tracking-[0.18em] mt-1 leading-none font-semibold"
              style={{ color: '#f59e0b' }}
            >
              Revenue Optimizer
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* AI status pill */}
      <div className="relative px-4 pt-3 pb-1">
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(52,211,153,0.03) 100%)',
            border: '1px solid rgba(52,211,153,0.14)',
            boxShadow: '0 0 0 1px rgba(52,211,153,0.06) inset',
          }}
        >
          <div className="relative flex-shrink-0">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#34d399',
                boxShadow: '0 0 6px rgba(52,211,153,0.8)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          </div>
          <p className="text-[11px] font-medium" style={{ color: '#34d399' }}>AI Booking Agent active</p>
          <div className="ml-auto flex-shrink-0">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#34d399', opacity: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        <NavSection>
          {mainNav.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname === item.href} />
          ))}
        </NavSection>

        <NavSection label="Business">
          {bizNav.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={pathname === href} />
          ))}
        </NavSection>

        <NavSection label="Account">
          {settNav.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={pathname === href} />
          ))}
          {isAdmin && (
            <NavItem href="/admin" label="Admin" icon={Shield} active={pathname === '/admin'} />
          )}
        </NavSection>
      </nav>

      {/* Bottom — User card */}
      <div className="px-3 pb-4">
        <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #f59e0b22, #fb718522)',
              color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.25)',
              boxShadow: '0 0 8px rgba(245,158,11,0.1)',
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium truncate leading-none" style={{ color: '#e4e4e7' }}>
              {session?.user?.name || 'My Account'}
            </p>
            <p className="text-[10px] truncate mt-0.5 leading-none" style={{ color: '#52525b' }}>
              {session?.user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:bg-[rgba(255,255,255,0.07)]"
            style={{ color: '#3f3f46' }}
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );
}
