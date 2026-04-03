'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  Clock,
  BarChart3,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/bookings',     label: 'Bookings',     icon: CalendarDays },
  { href: '/clients',      label: 'Clients',      icon: Users },
  { href: '/services',     label: 'Services',     icon: Sparkles },
  { href: '/availability', label: 'Availability', icon: Clock },
  { href: '/analytics',    label: 'Analytics',    icon: BarChart3 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col px-3 py-5 fixed h-full">
      {/* Logo */}
      <div className="px-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none text-foreground">BookedUp</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">AI Revenue Optimizer</p>
          </div>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
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
              <Icon
                className={cn('w-4 h-4 shrink-0', active ? 'text-primary' : '')}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="mb-4" />

      {/* Footer */}
      <div className="px-3">
        <div className="rounded-lg bg-accent/60 p-3">
          <p className="text-xs font-semibold text-accent-foreground">AI Assistant</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            Optimize your revenue with smart scheduling insights.
          </p>
        </div>
      </div>
    </aside>
  );
}
