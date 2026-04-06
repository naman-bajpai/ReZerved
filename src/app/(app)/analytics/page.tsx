'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  DollarSign,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getAnalytics, type Analytics } from '@/lib/api';

function fmtCurrency(v: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(v || 0));
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2.5 rounded-xl text-[12px]"
      style={{ background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
    >
      <p className="font-semibold mb-1.5" style={{ color: 'rgba(244,244,245,0.6)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.name === 'revenue' ? fmtCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}14`, border: `1px solid ${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
        </div>
      </div>
      <div className="text-[28px] font-bold tracking-tight leading-none mb-1.5" style={{ color: '#f4f4f5' }}>
        {value}
      </div>
      <p className="text-[12px] font-medium mb-0.5" style={{ color: 'rgba(244,244,245,0.45)' }}>{title}</p>
      <p className="text-[11px]" style={{ color: 'rgba(244,244,245,0.25)' }}>{sub}</p>
    </div>
  );
}

/* ─── Section wrapper ───────────────────────────────────────── */
function Section({ title, subtitle, icon: Icon, color, children }: {
  title: string; subtitle?: string; icon?: React.ElementType;
  color?: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
    >
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color || '#f59e0b'}12` }}>
              <Icon className="w-3.5 h-3.5" style={{ color: color || '#f59e0b' }} strokeWidth={2} />
            </div>
          )}
          <div>
            <p className="text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>{title}</p>
            {subtitle && <p className="text-[11px]" style={{ color: 'rgba(244,244,245,0.35)' }}>{subtitle}</p>}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── Period selector ───────────────────────────────────────── */
function PeriodSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {[['7d', '7D'], ['30d', '30D'], ['90d', '90D']].map(([val, label]) => (
        <button key={val} onClick={() => onChange(val)}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
          style={value === val ? {
            background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)'
          } : { color: 'rgba(244,244,245,0.4)' }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAnalytics(period as '7d' | '30d' | '90d')
      .then(setAnalytics)
      .catch((err) => {
        setAnalytics(null);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      })
      .finally(() => setLoading(false));
  }, [period]);

  const totalRevenue = Number(analytics?.revenue.total || 0);
  const avgBooking = Number(analytics?.revenue.avgPerBooking || 0);
  const noShowRate = parseFloat(analytics?.bookings.noShowRate || '0');
  const totalBookings = analytics?.bookings.total || 0;
  const confirmedCount = analytics?.revenue.confirmedCount || 0;

  const revenueByWeekday = useMemo(() => {
    const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const base = order.map((day) => ({ day, count: 0 }));
    for (const day of analytics?.busiestDays || []) {
      const idx = order.indexOf(day.day);
      if (idx >= 0) base[idx] = { day: day.day, count: day.count };
    }
    return base.map((d) => ({
      day: d.day,
      bookings: d.count,
      revenue: Math.round(d.count * avgBooking),
    }));
  }, [analytics?.busiestDays, avgBooking]);

  const statusData = useMemo(() => {
    const colors: Record<string, string> = {
      confirmed: '#34d399',
      pending: '#fbbf24',
      cancelled: '#f87171',
      no_show: '#a78bfa',
      expired: '#94a3b8',
    };
    return Object.entries(analytics?.bookings.breakdown || {})
      .map(([name, value]) => ({ name, value, color: colors[name] || '#f59e0b' }))
      .filter((x) => x.value > 0);
  }, [analytics?.bookings.breakdown]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-lg skeleton" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="h-72 rounded-2xl skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}
        >
          <AlertCircle className="w-5 h-5" style={{ color: '#f87171' }} />
        </div>
        <p className="text-[15px] font-semibold mb-1" style={{ color: '#f4f4f5' }}>
          Failed to load analytics
        </p>
        <p className="text-[13px]" style={{ color: 'rgba(244,244,245,0.4)' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
            Analytics
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.4)' }}>
            Deep dive into your business performance
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Revenue" value={fmtCurrency(totalRevenue)} sub={`${confirmedCount} confirmed bookings`} icon={DollarSign} color="#f59e0b" />
        <KPICard title="Avg Booking Value" value={fmtCurrency(avgBooking)} sub="Confirmed + no-show bookings" icon={TrendingUp} color="#34d399" />
        <KPICard title="Total Bookings" value={totalBookings.toLocaleString()} sub={`Created in ${analytics?.period || period}`} icon={CalendarDays} color="#a78bfa" />
        <KPICard title="No-Show Rate" value={`${noShowRate.toFixed(1)}%`} sub={`${analytics?.bookings.breakdown.no_show || 0} no-shows`} icon={Users} color="#fb7185" />
      </div>

      <Section title="Revenue by Weekday" subtitle="Estimated from bookings and average booking value" icon={BarChart3} color="#f59e0b">
        <div className="p-5 h-64">
          {revenueByWeekday.some((x) => x.bookings > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByWeekday} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#f59e0b', stroke: '#09090b', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[13px]" style={{ color: 'rgba(244,244,245,0.35)' }}>
              No revenue data for this period
            </div>
          )}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Bookings by Weekday" subtitle="Confirmed + no-show volume by day" icon={Activity} color="#34d399">
          <div className="p-5 h-52">
            {revenueByWeekday.some((x) => x.bookings > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByWeekday} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="bookings" fill="#34d399" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[13px]" style={{ color: 'rgba(244,244,245,0.35)' }}>
                No booking volume data for this period
              </div>
            )}
          </div>
        </Section>

        <Section title="Status Breakdown" subtitle="Distribution of booking outcomes" icon={Target} color="#a78bfa">
          <div className="p-5 flex items-center gap-6">
            {statusData.length ? (
              <>
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} opacity={0.85} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {statusData.map((status) => (
                    <div key={status.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: status.color }} />
                          <span className="text-[12px] font-medium capitalize" style={{ color: 'rgba(244,244,245,0.7)' }}>
                            {status.name.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[12px] font-bold font-mono-nums" style={{ color: status.color }}>
                          {status.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full py-12 text-center text-[13px]" style={{ color: 'rgba(244,244,245,0.35)' }}>
                No status data for this period
              </div>
            )}
          </div>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Section title="Upcoming Bookings" subtitle="Next 7 days" icon={CalendarDays} color="#fb7185">
            <div className="p-5 h-48">
              {(analytics?.upcoming?.length || 0) > 0 ? (
                <div className="h-full overflow-y-auto space-y-2 pr-1">
                  {analytics?.upcoming?.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-[12px] font-semibold truncate" style={{ color: '#f4f4f5' }}>
                        {booking.clients?.name || 'Client'}
                      </p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>
                        {booking.services?.name} · {new Date(booking.starts_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px]" style={{ color: 'rgba(244,244,245,0.35)' }}>
                  No upcoming bookings
                </div>
              )}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-7">
          <Section title="Top Clients" subtitle="Highest average spend" icon={Users} color="#a78bfa">
            <div className="p-5">
              {analytics?.topClients?.length ? (
                <div className="space-y-2">
                  {analytics.topClients.slice(0, 6).map((client) => (
                    <div key={client.id} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold truncate" style={{ color: '#f4f4f5' }}>
                          {client.name}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>
                          {client.typical_frequency_days ? `Every ${client.typical_frequency_days}d` : 'Frequency unavailable'}
                        </p>
                      </div>
                      <span className="text-[12px] font-bold font-mono-nums" style={{ color: '#f59e0b' }}>
                        {fmtCurrency(client.avg_spend || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center text-[13px]" style={{ color: 'rgba(244,244,245,0.35)' }}>
                  No client data for this period
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
