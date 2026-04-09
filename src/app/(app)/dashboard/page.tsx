'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { getAnalytics, getBookings, type Analytics, type Booking } from '@/lib/api';
import { PageTransition } from '@/components/page-transition';

function fmtCurrency(v: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(v || 0));
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   label: 'Pending' },
  confirmed: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',   label: 'Confirmed' },
  cancelled: { color: '#fb7185', bg: 'rgba(251,113,133,0.08)',  label: 'Cancelled' },
  no_show:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)',  label: 'No Show' },
  expired:   { color: '#71717a', bg: 'rgba(113,113,122,0.08)', label: 'Expired' },
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-5 h-5 rounded-full border-2 border-[rgba(245,158,11,0.15)] border-t-[#f59e0b] animate-spin" />
    </div>
  );
}

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  iconBg,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden group transition-all duration-200 hover:translate-y-[-1px]"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderTop: `1.5px solid ${color}`,
        boxShadow: `0 0 0 0 ${color}00`,
      }}
    >
      {/* Subtle gradient fill emanating from top */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${color}08 0%, transparent 100%)`,
        }}
      />

      <div className="relative mb-4 flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: iconBg, boxShadow: `0 0 12px ${color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 transition-opacity" style={{ color }} />
      </div>

      <div className="relative">
        <div
          className="text-[27px] font-bold tracking-[-0.03em] leading-none mb-1.5"
          style={{ color: '#f4f4f5' }}
        >
          {value}
        </div>
        <p className="text-[12px] font-semibold mb-1" style={{ color: '#d4d4d8' }}>
          {title}
        </p>
        <p className="text-[11px]" style={{ color: '#52525b' }}>
          {sub}
        </p>
      </div>
    </div>
  );
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden h-full ${className}`}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  badge,
  badgeDot,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  badge?: string;
  badgeDot?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} strokeWidth={2} />
        </div>
        <p className="text-[13px] font-semibold" style={{ color: '#e4e4e7' }}>
          {title}
        </p>
      </div>
      {badge && (
        <span
          className="text-[11px] px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#71717a' }}
        >
          {badge}
        </span>
      )}
      {badgeDot && (
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.7)' }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [a, b] = await Promise.all([getAnalytics('30d'), getBookings()]);
      const sorted = [...(b.bookings || [])].sort(
        (x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
      );
      setAnalytics(a);
      setRecentBookings(sorted.slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activityItems = useMemo(() => {
    return recentBookings.slice(0, 6).map((booking) => {
      const status = STATUS_CONFIG[booking.status] ? booking.status : 'pending';
      const label =
        booking.status === 'confirmed'
          ? 'Booking confirmed'
          : booking.status === 'pending'
            ? 'New booking created'
            : booking.status === 'cancelled'
              ? 'Booking cancelled'
              : booking.status === 'no_show'
                ? 'Marked as no-show'
                : 'Booking updated';
      return {
        id: booking.id,
        text: label,
        name: booking.clients?.name || 'Client',
        time: timeAgo(booking.created_at),
        status,
      };
    });
  }, [recentBookings]);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.14)' }}
        >
          <AlertCircle className="w-5 h-5" style={{ color: '#fb7185' }} />
        </div>
        <p className="text-[15px] font-semibold mb-1" style={{ color: '#f4f4f5' }}>
          Failed to load dashboard
        </p>
        <p className="text-[13px] mb-5" style={{ color: '#71717a' }}>
          {error}
        </p>
        <button
          onClick={loadData}
          className="text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
          style={{
            background: 'rgba(245,158,11,0.08)',
            color: '#f59e0b',
            border: '1px solid rgba(245,158,11,0.18)',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const totalRevenue = Number(analytics?.revenue.total || 0);
  const avgBooking = Number(analytics?.revenue.avgPerBooking || 0);
  const totalBookings = analytics?.bookings.total || 0;
  const noShowRate = parseFloat(analytics?.bookings.noShowRate || '0');
  const confirmedCount = analytics?.revenue.confirmedCount || 0;
  const noShowCount = analytics?.bookings.breakdown?.no_show || 0;
  const upcoming = analytics?.upcoming?.slice(0, 6) || [];
  const maxDayCount = Math.max(...(analytics?.busiestDays || []).map((d) => d.count), 1);

  return (
    <PageTransition>
      <div className="space-y-7 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="text-[26px] font-bold tracking-[-0.03em]"
                style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}
              >
                {greeting}
              </h1>
              <span className="text-[24px] select-none">👋</span>
            </div>
            <p className="text-[13px]" style={{ color: '#52525b' }}>
              30-day performance overview
            </p>
          </div>

          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
            style={{
              background: 'rgba(52,211,153,0.05)',
              border: '1px solid rgba(52,211,153,0.12)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#34d399',
                boxShadow: '0 0 6px rgba(52,211,153,0.8)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span className="text-[12px] font-semibold" style={{ color: '#34d399' }}>
              Live
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Total Revenue"
            value={fmtCurrency(totalRevenue)}
            sub={`${confirmedCount} confirmed bookings`}
            icon={DollarSign}
            color="#f59e0b"
            iconBg="rgba(245,158,11,0.08)"
          />
          <KPICard
            title="Avg Booking Value"
            value={fmtCurrency(avgBooking)}
            sub="Confirmed + no-show bookings"
            icon={TrendingUp}
            color="#34d399"
            iconBg="rgba(52,211,153,0.08)"
          />
          <KPICard
            title="Total Bookings"
            value={totalBookings.toLocaleString()}
            sub="Created this period"
            icon={CalendarDays}
            color="#a78bfa"
            iconBg="rgba(167,139,250,0.08)"
          />
          <KPICard
            title="No-Show Rate"
            value={`${noShowRate.toFixed(1)}%`}
            sub={`${noShowCount} no-shows in period`}
            icon={Users}
            color="#fb7185"
            iconBg="rgba(251,113,133,0.08)"
          />
        </div>

        {/* Middle row */}
        <div className="grid gap-4 lg:grid-cols-12">

          {/* Upcoming Bookings */}
          <div className="lg:col-span-7">
            <SectionCard>
              <SectionHeader
                icon={CalendarDays}
                iconColor="#34d399"
                iconBg="rgba(52,211,153,0.07)"
                title="Upcoming Bookings"
                badge={`${upcoming.length} scheduled`}
              />
              <div className="p-3">
                {upcoming.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <CalendarDays className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.12)' }} strokeWidth={1.5} />
                    </div>
                    <p className="text-[13px]" style={{ color: '#52525b' }}>
                      No upcoming bookings
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {upcoming.map((booking) => {
                      const status = STATUS_CONFIG[booking.status] ? booking.status : 'confirmed';
                      const sc = STATUS_CONFIG[status];
                      return (
                        <div
                          key={booking.id}
                          className="group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-150 hover:bg-[rgba(255,255,255,0.03)]"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: sc.color, boxShadow: `0 0 5px ${sc.color}80` }}
                            />
                            <div
                              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold"
                              style={{
                                background: `${sc.color}12`,
                                color: sc.color,
                                border: `1px solid ${sc.color}20`,
                              }}
                            >
                              {(booking.clients?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[13px] font-medium" style={{ color: '#e4e4e7' }}>
                                {booking.clients?.name || 'Client'}
                              </p>
                              <p className="text-[11px] mt-0.5" style={{ color: '#52525b' }}>
                                {booking.services?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[12px] font-medium" style={{ color: '#d4d4d8' }}>
                                {fmtDate(booking.starts_at)}
                              </p>
                              <p className="text-[11px] mt-0.5 flex items-center justify-end gap-1" style={{ color: '#52525b' }}>
                                <Clock className="w-3 h-3" />
                                {fmtTime(booking.starts_at)}
                              </p>
                            </div>
                            <span
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: sc.bg, color: sc.color }}
                            >
                              {sc.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-5">
            <SectionCard>
              <SectionHeader
                icon={Activity}
                iconColor="#f59e0b"
                iconBg="rgba(245,158,11,0.07)"
                title="Recent Activity"
                badgeDot
              />
              <div className="p-3 space-y-0.5">
                {activityItems.length ? (
                  activityItems.map((item) => {
                    const sc = STATUS_CONFIG[item.status];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-all duration-150"
                      >
                        <div
                          className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center"
                          style={{ background: sc.bg }}
                        >
                          <CheckCircle2 className="w-3 h-3" style={{ color: sc.color }} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium truncate" style={{ color: '#d4d4d8' }}>
                            {item.text}
                          </p>
                          <p className="text-[11px] truncate mt-0.5" style={{ color: '#52525b' }}>
                            {item.name}
                          </p>
                        </div>
                        <span className="text-[10px] flex-shrink-0 tabular-nums" style={{ color: '#3f3f46' }}>
                          {item.time}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[12px] px-3 py-10 text-center" style={{ color: '#52525b' }}>
                    No recent activity yet
                  </p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid gap-4 lg:grid-cols-12">

          {/* Busiest Days */}
          <div className="lg:col-span-4">
            <SectionCard>
              <SectionHeader
                icon={BarChart3}
                iconColor="#a78bfa"
                iconBg="rgba(167,139,250,0.07)"
                title="Busiest Days"
              />
              <div className="px-5 py-4 space-y-3.5">
                {(analytics?.busiestDays || []).slice(0, 7).map((day) => {
                  const w = Math.max((day.count / maxDayCount) * 100, 4);
                  return (
                    <div key={day.day} className="flex items-center gap-3">
                      <span
                        className="text-[11px] font-semibold uppercase w-8 flex-shrink-0"
                        style={{ color: '#52525b' }}
                      >
                        {day.day}
                      </span>
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${w}%`,
                            background: 'linear-gradient(90deg, #a78bfa, #c4b5fd)',
                            boxShadow: '0 0 6px rgba(167,139,250,0.3)',
                          }}
                        />
                      </div>
                      <span
                        className="text-[12px] font-semibold tabular-nums w-4 text-right flex-shrink-0"
                        style={{ color: '#71717a' }}
                      >
                        {day.count}
                      </span>
                    </div>
                  );
                })}
                {!analytics?.busiestDays?.length && (
                  <p className="text-[13px] text-center py-8" style={{ color: '#52525b' }}>
                    No data yet
                  </p>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Top Clients */}
          <div className="lg:col-span-8">
            <SectionCard>
              <SectionHeader
                icon={Users}
                iconColor="#fb7185"
                iconBg="rgba(251,113,133,0.07)"
                title="Top Clients"
                badge="By revenue"
              />
              {analytics?.topClients?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {['Client', 'Avg Spend', 'Last Booked', 'Frequency'].map((h) => (
                          <th
                            key={h}
                            className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                            style={{ color: '#3f3f46' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topClients.slice(0, 6).map((client, i) => (
                        <tr
                          key={client.id}
                          className="transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                                style={{
                                  background: i === 0
                                    ? 'rgba(245,158,11,0.15)'
                                    : 'rgba(255,255,255,0.05)',
                                  color: i === 0 ? '#f59e0b' : '#71717a',
                                  border: i === 0 ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.06)',
                                }}
                              >
                                {(client.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[13px] font-medium" style={{ color: '#e4e4e7' }}>
                                {client.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[13px] font-bold tabular-nums" style={{ color: '#f59e0b' }}>
                              {fmtCurrency(client.avg_spend || 0)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            <span className="text-[12px]" style={{ color: '#52525b' }}>
                              {client.last_booked_at
                                ? new Date(client.last_booked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            {client.typical_frequency_days ? (
                              <span
                                className="text-[11px] font-semibold px-2 py-1 rounded-full"
                                style={{ background: 'rgba(167,139,250,0.08)', color: '#a78bfa' }}
                              >
                                Every {client.typical_frequency_days}d
                              </span>
                            ) : (
                              <span style={{ color: '#3f3f46' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Users className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.1)' }} strokeWidth={1.5} />
                  </div>
                  <p className="text-[13px]" style={{ color: '#52525b' }}>
                    No client data yet
                  </p>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
