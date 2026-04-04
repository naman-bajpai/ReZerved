'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  DollarSign,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserX,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { getAnalytics, getBookings, type Analytics, type Booking } from '@/lib/api';

function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 28, stiffness: 120 });
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
  }, [prefix, spring, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDayLabel(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimeLabel(date: string) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isSameDay(date: string, target: Date) {
  const value = new Date(date);
  return (
    value.getFullYear() === target.getFullYear() &&
    value.getMonth() === target.getMonth() &&
    value.getDate() === target.getDate()
  );
}

type KPIProps = {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  detail: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  delay?: number;
};

function KPICard({
  title,
  value,
  prefix,
  suffix,
  detail,
  icon: Icon,
  trend = 'neutral',
  trendLabel,
  delay = 0,
}: KPIProps) {
  const trendClass =
    trend === 'up'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/70'
      : trend === 'down'
      ? 'bg-rose-50 text-rose-700 ring-rose-200/70'
      : 'bg-secondary text-secondary-foreground ring-border';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="border-orange-100/80 bg-white/90 shadow-[0_18px_44px_-32px_rgba(236,72,153,0.2)] backdrop-blur-sm">
        <CardContent className="relative p-5">
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-orange-200 via-rose-200 to-violet-200" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 via-rose-50 to-violet-100 text-orange-600 ring-1 ring-orange-200/70">
              <Icon className="h-5 w-5" strokeWidth={1.9} />
            </div>
            {trendLabel ? (
              <Badge className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${trendClass}`}>
                {trend === 'up' ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : trend === 'down' ? (
                  <TrendingDown className="mr-1 h-3 w-3" />
                ) : null}
                {trendLabel}
              </Badge>
            ) : null}
          </div>
          <p className="font-[family-name:var(--font-display)] text-[32px] font-semibold leading-none tracking-tight text-foreground">
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
          </p>
          <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 pb-8">
      <Card className="border-orange-100/80 bg-white/80">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full max-w-lg" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-orange-100/80 bg-white/80">
            <CardContent className="p-5">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <Card className="border-orange-100/80 bg-white/80">
          <CardContent className="p-5">
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card className="border-orange-100/80 bg-white/80">
            <CardContent className="p-5">
              <Skeleton className="h-44 w-full" />
            </CardContent>
          </Card>
          <Card className="border-orange-100/80 bg-white/80">
            <CardContent className="p-5">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-orange-100/80 bg-white/90 shadow-[0_18px_44px_-32px_rgba(236,72,153,0.18)]">
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-100">
          <Activity className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Dashboard data is not available yet.</p>
          <p className="text-sm text-muted-foreground">
            Once bookings and analytics start flowing in, this page will populate automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics('30d'), getBookings({ status: 'confirmed' })])
      .then(([analyticsResult, bookingsResult]) => {
        setAnalytics(analyticsResult);
        setUpcomingBookings(bookingsResult.bookings.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!analytics) return <EmptyState />;

  const totalRevenue = Number(analytics.revenue.total || 0);
  const avgPerBooking = Number(analytics.revenue.avgPerBooking || 0);
  const totalBookings = analytics.bookings.total || 0;
  const confirmedCount = analytics.revenue.confirmedCount || 0;
  const noShowPct = Number.parseFloat(analytics.bookings.noShowRate || '0');
  const confirmedShare = totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0;
  const todayBookings = upcomingBookings.filter((booking) => isSameDay(booking.starts_at, new Date())).length;
  const nextBooking = upcomingBookings[0];
  const topDay = analytics.busiestDays[0];
  const topClient = analytics.topClients[0];
  const maxDayCount = Math.max(...analytics.busiestDays.map((day) => day.count), 1);

  return (
    <div className="space-y-6 pb-8">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]"
      >
        <Card className="relative overflow-hidden border-none bg-[linear-gradient(135deg,#fff7ed_0%,#fff1f2_52%,#f5f3ff_100%)] shadow-[0_28px_80px_-42px_rgba(236,72,153,0.35)] ring-1 ring-orange-100/80">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-orange-300/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-rose-300/20 blur-3xl" />
            <div className="absolute bottom-0 right-20 h-32 w-32 rounded-full bg-violet-300/20 blur-3xl" />
          </div>
          <CardHeader className="relative gap-4 p-6 pb-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200/70 backdrop-blur">
                Live snapshot
              </Badge>
              <Badge className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground ring-1 ring-white/70 backdrop-blur">
                Last 30 days
              </Badge>
            </div>
            <div className="space-y-3">
              <CardTitle className="max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-foreground sm:text-5xl">
                Keep today booked and next week visible.
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-foreground/70 sm:text-[15px]">
                Revenue, schedule health, and client momentum in one fast read. Styled to match the
                landing page without bringing the marketing noise into the workspace.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="relative p-6 pt-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/75 p-4 ring-1 ring-white/80 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Revenue
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{confirmedCount} confirmed bookings</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-white/80 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Today
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
                  {todayBookings}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {nextBooking
                    ? `Next at ${formatTimeLabel(nextBooking.starts_at)}`
                    : 'No confirmed bookings queued'}
                </p>
              </div>
              <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(249,115,22,0.12),rgba(236,72,153,0.12),rgba(124,58,237,0.12))] p-4 text-foreground ring-1 ring-rose-100/80 shadow-[0_22px_50px_-36px_rgba(236,72,153,0.18)]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Best signal
                  </p>
                  <Activity className="h-4 w-4 text-rose-500" strokeWidth={1.8} />
                </div>
                <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-none">
                  {topDay ? topDay.day : 'No trend yet'}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {topDay
                    ? `${topDay.count} bookings on your busiest day in this window`
                    : 'Waiting for enough traffic to establish a rhythm'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/bookings"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#f97316_0%,#ec4899_100%)] px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                Open bookings
                <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
              </Link>
              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2.5 text-sm font-medium text-foreground ring-1 ring-orange-100/90 transition-colors hover:bg-white"
              >
                View analytics
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.9} />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100/80 bg-white/80 shadow-[0_24px_64px_-42px_rgba(249,115,22,0.45)] backdrop-blur-sm">
          <CardHeader className="border-b border-orange-100/70 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg text-foreground">Today&apos;s board</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Quick schedule status for the current queue.
                </CardDescription>
              </div>
              <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                {confirmedShare}% confirmed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(249,115,22,0.10),rgba(236,72,153,0.10),rgba(124,58,237,0.10))] p-4 ring-1 ring-orange-100/80">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Next client
                  </p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {nextBooking?.clients?.name || 'No one booked yet'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {nextBooking
                      ? `${nextBooking.services?.name || 'Service'} at ${formatTimeLabel(nextBooking.starts_at)}`
                      : 'Your next confirmed appointment will show here.'}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-orange-600 ring-1 ring-orange-100">
                  <CalendarDays className="h-5 w-5" strokeWidth={1.9} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingBookings.slice(0, 3).map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + index * 0.05, duration: 0.3 }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-orange-100/70 bg-orange-50/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {booking.clients?.name || 'Unknown client'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {booking.services?.name || 'Service'} · {formatDayLabel(booking.starts_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatTimeLabel(booking.starts_at)}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(booking.total_price)}</p>
                  </div>
                </motion.div>
              ))}
              {upcomingBookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-6 text-sm text-muted-foreground">
                  No confirmed bookings are scheduled right now.
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  No-show rate
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{noShowPct.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {noShowPct > 10 ? 'Worth tightening reminders this week.' : 'Healthy range for recent bookings.'}
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Top client
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {topClient?.name || 'No repeat client yet'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {topClient ? `${formatCurrency(topClient.avg_spend)} avg spend` : 'Client value builds here.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total revenue"
          value={totalRevenue}
          prefix="$"
          detail={`${confirmedCount} bookings turned into revenue`}
          icon={DollarSign}
          trend="up"
          trendLabel="Strong month"
          delay={0.04}
        />
        <KPICard
          title="Average ticket"
          value={avgPerBooking}
          prefix="$"
          detail="Average value per confirmed booking"
          icon={ArrowUpRight}
          trend="up"
          trendLabel="Higher spend"
          delay={0.08}
        />
        <KPICard
          title="No-show rate"
          value={Math.round(noShowPct)}
          suffix="%"
          detail="Share of bookings marked as no-show"
          icon={UserX}
          trend={noShowPct > 10 ? 'down' : 'up'}
          trendLabel={noShowPct > 10 ? 'Needs attention' : 'Under control'}
          delay={0.12}
        />
        <KPICard
          title="Total bookings"
          value={totalBookings}
          detail={`${confirmedShare}% of all bookings were confirmed`}
          icon={Users}
          trend="neutral"
          trendLabel="30d volume"
          delay={0.16}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="border-orange-100/80 bg-white/85 shadow-[0_20px_60px_-36px_rgba(236,72,153,0.28)]">
            <CardHeader className="border-b border-orange-100/70 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg text-foreground">Upcoming bookings</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    A clean queue for what is next on the calendar.
                  </CardDescription>
                </div>
                <Badge className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200/70">
                  {upcomingBookings.length} queued
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {upcomingBookings.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-orange-600 ring-1 ring-orange-100">
                    <CalendarDays className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">No upcoming bookings</p>
                    <p className="text-sm text-muted-foreground">
                      When confirmed appointments land, they will appear here first.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.24 + index * 0.05, duration: 0.32 }}
                      className="flex flex-col gap-4 rounded-3xl border border-orange-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,247,237,0.9))] p-4 shadow-[0_10px_28px_-22px_rgba(249,115,22,0.42)] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#ec4899_100%)] font-[family-name:var(--font-display)] text-base font-semibold text-white shadow-[0_18px_34px_-24px_rgba(236,72,153,0.3)]">
                          {(booking.clients?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {booking.clients?.name || 'Unknown client'}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{booking.services?.name || 'Service'}</span>
                            <span className="h-1 w-1 rounded-full bg-orange-300" />
                            <span>{booking.services?.duration_mins || 0} min</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                        <div className="rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-orange-100/80">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Date
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">{formatDayLabel(booking.starts_at)}</p>
                        </div>
                        <div className="rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-orange-100/80">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Time
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                            <Clock className="h-3.5 w-3.5 text-orange-500" strokeWidth={1.8} />
                            {formatTimeLabel(booking.starts_at)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(249,115,22,0.12),rgba(236,72,153,0.12),rgba(124,58,237,0.12))] px-3 py-2 text-foreground ring-1 ring-rose-100/80 shadow-[0_14px_28px_-22px_rgba(236,72,153,0.16)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Value
                          </p>
                          <p className="mt-1 text-sm font-semibold">{formatCurrency(booking.total_price)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border-orange-100/80 bg-white/85 shadow-[0_20px_60px_-36px_rgba(249,115,22,0.32)]">
              <CardHeader className="border-b border-orange-100/70 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg text-foreground">Busiest days</CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      Demand pattern across the current reporting window.
                    </CardDescription>
                  </div>
                  <Sparkles className="h-4 w-4 text-orange-500" strokeWidth={1.8} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {analytics.busiestDays.slice(0, 7).map((day, index) => {
                  const width = `${Math.max((day.count / maxDayCount) * 100, 8)}%`;
                  return (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.28 + index * 0.05, duration: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-foreground">{day.day}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{day.count} bookings</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-orange-100/70">
                        <motion.div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#f97316_0%,#ec4899_55%,#7c3aed_100%)]"
                          initial={{ width: 0 }}
                          animate={{ width }}
                          transition={{ delay: 0.34 + index * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border-orange-100/80 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(253,242,248,0.95),rgba(245,243,255,0.95))] text-foreground shadow-[0_28px_80px_-44px_rgba(236,72,153,0.22)]">
              <CardHeader className="border-b border-rose-100/70 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg text-foreground">Client momentum</CardTitle>
                    <CardDescription className="mt-1 text-sm text-muted-foreground">
                      Who is driving repeat revenue right now.
                    </CardDescription>
                  </div>
                  <Users className="h-4 w-4 text-rose-500" strokeWidth={1.8} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {analytics.topClients.slice(0, 4).map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 + index * 0.05, duration: 0.3 }}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-white/80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{client.name || 'Unknown client'}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {client.typical_frequency_days
                          ? `Returns every ${client.typical_frequency_days} days`
                          : 'Frequency still forming'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-rose-600">{formatCurrency(client.avg_spend)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {client.last_booked_at ? formatDayLabel(client.last_booked_at) : 'Not booked yet'}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {analytics.topClients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-rose-100/80 bg-white/60 px-4 py-6 text-sm text-muted-foreground">
                    Top client insights will appear once repeat customer data builds up.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-orange-100/80 bg-white/85 shadow-[0_18px_52px_-36px_rgba(124,58,237,0.24)]">
          <CardHeader className="border-b border-orange-100/70 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-foreground">Top clients</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Best repeat customers by spend and recency.
                </CardDescription>
              </div>
              <Badge className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200/70">
                {analytics.topClients.length} tracked
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-orange-100/70 hover:bg-transparent">
                  <TableHead className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Client
                  </TableHead>
                  <TableHead className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Avg spend
                  </TableHead>
                  <TableHead className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:table-cell">
                    Last booked
                  </TableHead>
                  <TableHead className="hidden px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:table-cell">
                    Frequency
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topClients.slice(0, 8).map((client) => (
                  <TableRow key={client.id} className="border-orange-100/60 hover:bg-orange-50/50">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(236,72,153,0.16),rgba(124,58,237,0.16))] font-[family-name:var(--font-display)] text-sm font-semibold text-foreground ring-1 ring-orange-100/80">
                          {(client.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{client.name || 'Unknown client'}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {client.phone || 'No phone on file'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
                        {formatCurrency(client.avg_spend)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden px-4 py-4 text-sm text-muted-foreground md:table-cell">
                      {client.last_booked_at ? formatDayLabel(client.last_booked_at) : 'Never'}
                    </TableCell>
                    <TableCell className="hidden px-6 py-4 text-right sm:table-cell">
                      {client.typical_frequency_days ? (
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                          Every {client.typical_frequency_days}d
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not enough history</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {analytics.topClients.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No client insights are available yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
