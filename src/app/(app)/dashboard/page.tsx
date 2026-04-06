'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getAnalytics, getBookings, type Analytics, type Booking } from '@/lib/api';

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </div>
            {trend && (
              <Badge
                variant="secondary"
                className={
                  trend.positive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }
              >
                {trend.positive ? <TrendingUp className="mr-1 h-3 w-3" /> : null}
                {trend.value}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-sm font-medium text-foreground mt-1">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-8 w-24 mt-3" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your business overview</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <BarChart3 className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold">No data yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Once you start receiving bookings, your analytics and insights will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your business overview</p>
      </div>
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Unable to load dashboard</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
          <button
            onClick={onRetry}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, bookingsData] = await Promise.all([
        getAnalytics('30d'),
        getBookings({ status: 'confirmed' }),
      ]);
      setAnalytics(analyticsData);
      setBookings(bookingsData.bookings.slice(0, 5));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!analytics) return <EmptyState />;

  const totalRevenue = Number(analytics.revenue.total || 0);
  const avgBooking = Number(analytics.revenue.avgPerBooking || 0);
  const totalBookings = analytics.bookings.total || 0;
  const confirmedCount = analytics.revenue.confirmedCount || 0;
  const noShowRate = parseFloat(analytics.bookings.noShowRate || '0');
  const maxDayCount = Math.max(...(analytics.busiestDays || []).map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Performance overview — last 30 days</p>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${confirmedCount} confirmed bookings`}
          icon={DollarSign}
          trend={{ value: '+12%', positive: true }}
          delay={0}
        />
        <StatCard
          title="Avg per Booking"
          value={formatCurrency(avgBooking)}
          subtitle="Average ticket size"
          icon={ArrowUpRight}
          trend={{ value: '+5%', positive: true }}
          delay={0.05}
        />
        <StatCard
          title="No-Show Rate"
          value={`${noShowRate.toFixed(1)}%`}
          subtitle="Of completed bookings"
          icon={Users}
          trend={{ value: noShowRate > 10 ? 'High' : 'Good', positive: noShowRate <= 10 }}
          delay={0.1}
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          subtitle={`${analytics.bookings.breakdown?.confirmed || 0} confirmed`}
          icon={CalendarDays}
          delay={0.15}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Upcoming Bookings */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Upcoming Bookings</CardTitle>
                <span className="text-xs text-muted-foreground">{bookings.length} scheduled</span>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">No upcoming bookings</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {bookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                          {(booking.clients?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{booking.clients?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{booking.services?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(booking.starts_at)}</p>
                        <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(booking.starts_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Busiest Days */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Busiest Days</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-4">
              {(analytics.busiestDays || []).slice(0, 7).map((day, i) => {
                const width = Math.max((day.count / maxDayCount) * 100, 8);
                return (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs font-medium text-muted-foreground w-8 uppercase">
                      {day.day}
                    </span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ delay: 0.35 + i * 0.04, duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-6 text-right">
                      {day.count}
                    </span>
                  </motion.div>
                );
              })}
              {(!analytics.busiestDays || analytics.busiestDays.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">No booking patterns yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Clients */}
      {analytics.topClients && analytics.topClients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Top Clients</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <Users className="mr-1 h-3 w-3" />
                  {analytics.topClients.length}
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-0 px-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Client
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Avg Spend
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                        Last Booked
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        Frequency
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topClients.slice(0, 6).map((client, i) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 + i * 0.03 }}
                        className="border-b last:border-0 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {(client.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm">{client.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-primary">
                            {formatCurrency(client.avg_spend || 0)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">
                          {client.last_booked_at
                            ? new Date(client.last_booked_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          {client.typical_frequency_days ? (
                            <Badge variant="secondary" className="text-xs">
                              Every {client.typical_frequency_days}d
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
