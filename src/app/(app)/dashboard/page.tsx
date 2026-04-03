'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarCheck,
  UserX,
  CalendarDays,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { getAnalytics, getBookings, type Analytics, type Booking } from '@/lib/api';

/* ── Animated counter (21st.dev style – builduilabs/animated-counter) ── */
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 30, stiffness: 120 });
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString()}${suffix}`;
      }
    });
    return unsubscribe;
  }, [spring, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ── KPI Card ── */
type KPIProps = {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  sub: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
};

function KPICard({ title, value, prefix, suffix, sub, icon: Icon, trend = 'neutral', trendLabel }: KPIProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight">
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">{sub}</p>
            {trendLabel && (
              <Badge
                variant="secondary"
                className={
                  trend === 'up'
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                    : trend === 'down'
                    ? 'text-rose-600 bg-rose-50 border-rose-100'
                    : ''
                }
              >
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : trend === 'down' ? (
                  <TrendingDown className="w-3 h-3 mr-1" />
                ) : null}
                {trendLabel}
              </Badge>
            )}
          </div>
        </CardContent>
        {/* subtle gradient accent */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </Card>
    </motion.div>
  );
}

/* ── Busiest Days bar chart ── */
function BusiestDayBar({ day, count, max, index }: { day: string; count: number; max: number; index: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
    >
      <span className="text-xs font-medium text-muted-foreground w-7 shrink-0">{day}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: index * 0.07 + 0.2, duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs tabular-nums text-foreground font-semibold w-5 text-right">{count}</span>
    </motion.div>
  );
}

/* ── Loading skeleton ── */
function LoadingState() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics('30d'), getBookings({ status: 'confirmed' })])
      .then(([a, b]) => {
        setAnalytics(a);
        setUpcomingBookings(b.bookings.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const noShowPct = parseFloat(analytics?.bookings.noShowRate || '0');
  const maxDay = analytics?.busiestDays?.[0]?.count ?? 1;

  return (
    <div className="space-y-8 max-w-[1200px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Last 30 days overview</p>
          </div>
          <Badge variant="outline" className="gap-1.5 py-1 px-3 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={Number(analytics?.revenue.total || 0)}
          prefix="$"
          sub={`${analytics?.revenue.confirmedCount || 0} confirmed bookings`}
          icon={DollarSign}
          trend="up"
          trendLabel="+12%"
        />
        <KPICard
          title="Avg Per Booking"
          value={Number(analytics?.revenue.avgPerBooking || 0)}
          prefix="$"
          sub="per confirmed booking"
          icon={ArrowUpRight}
          trend="up"
          trendLabel="+5%"
        />
        <KPICard
          title="No-Show Rate"
          value={noShowPct}
          suffix="%"
          sub="of completed bookings"
          icon={UserX}
          trend={noShowPct > 10 ? 'down' : 'up'}
          trendLabel={noShowPct > 10 ? 'High' : 'Good'}
        />
        <KPICard
          title="Total Bookings"
          value={analytics?.bookings.total || 0}
          sub={`${analytics?.bookings.breakdown?.confirmed || 0} confirmed`}
          icon={CalendarDays}
          trend="neutral"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Upcoming Bookings</CardTitle>
              <CalendarCheck className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming bookings</p>
            ) : (
              <div className="space-y-1">
                {upcomingBookings.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="flex items-center justify-between py-2.5 rounded-lg px-2 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {(b.clients?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{b.clients?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.services?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-primary">
                        {new Date(b.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-0.5 justify-end">
                        <Clock className="w-3 h-3" />
                        {new Date(b.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Busiest Days */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Busiest Days</CardTitle>
              <BarChart3Icon className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            {(analytics?.busiestDays || []).slice(0, 7).map((d, i) => (
              <BusiestDayBar key={d.day} day={d.day} count={d.count} max={maxDay} index={i} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Top Clients</CardTitle>
            <Badge variant="secondary" className="text-xs">{(analytics?.topClients || []).length} clients</Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg Spend</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Booked</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(analytics?.topClients || []).slice(0, 8).map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {(c.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{c.name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="secondary" className="font-semibold text-primary bg-primary/10 border-primary/20">
                      ${Number(c.avg_spend || 0).toFixed(0)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {c.last_booked_at
                      ? new Date(c.last_booked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Never'}
                  </TableCell>
                  <TableCell className="py-3">
                    {c.typical_frequency_days ? (
                      <Badge variant="outline" className="text-xs">
                        Every {c.typical_frequency_days}d
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function BarChart3Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
