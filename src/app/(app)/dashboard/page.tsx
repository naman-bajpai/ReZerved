'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
  DollarSign, CalendarDays, TrendingUp, Users, ArrowUpRight,
  Sparkles, Clock, CheckCircle2, AlertCircle, MessageSquare,
  Activity, BarChart3, Zap, ChevronRight,
} from 'lucide-react';
import { getAnalytics, getBookings, type Analytics, type Booking } from '@/lib/api';

/* ─── Helpers ──────────────────────────────────────────────── */
function fmtCurrency(v: number | string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0));
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* ─── Animated number counter ──────────────────────────────── */
function AnimNumber({ to, prefix = '', suffix = '', format = false }: {
  to: number; prefix?: string; suffix?: string; format?: boolean;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setTimeout(() => mv.set(to), 200);
    } else {
      mv.set(to);
    }
  }, [to, mv]);

  useEffect(() => spring.on('change', v => setDisplay(Math.round(v))), [spring]);

  const formatted = format ? display.toLocaleString() : display;
  return <span className="font-mono-nums">{prefix}{formatted}{suffix}</span>;
}

/* ─── Sparkline ──────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 80, H = 28;
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const area = `0,${H} ${pts} ${W},${H}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sf-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sf-${color.slice(1)})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Last point dot */}
      {(() => {
        const lastPt = pts.split(' ').pop()!;
        const [lx, ly] = lastPt.split(',').map(Number);
        return <circle cx={lx} cy={ly} r="2.5" fill={color}/>;
      })()}
    </svg>
  );
}

/* ─── KPI Card ───────────────────────────────────────────────── */
const SPARK_REV  = [62, 74, 68, 89, 85, 102, 97, 118, 114, 128, 122, 145];
const SPARK_BOOK = [8, 12, 9, 15, 13, 17, 15, 19, 18, 22, 21, 24];
const SPARK_CXNV = [72, 75, 71, 78, 80, 77, 82, 85, 83, 88, 87, 92];
const SPARK_NOSH = [18, 16, 14, 15, 12, 11, 10, 9, 8, 7, 5, 4];

function KPICard({ title, value, sub, prefix = '', suffix = '', trend, trendPositive, sparkData, sparkColor, icon: Icon, delay = 0, format = false }: {
  title: string; value: number; sub: string;
  prefix?: string; suffix?: string;
  trend: string; trendPositive: boolean;
  sparkData: number[]; sparkColor: string;
  icon: React.ElementType; delay?: number; format?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.3)',
      }}
      whileHover={{ y: -2, borderColor: 'rgba(245,158,11,0.18)', transition: { duration: 0.2 } }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 30% 30%, ${sparkColor}05 0%, transparent 70%)` }} />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${sparkColor}14`, border: `1px solid ${sparkColor}22` }}>
            <Icon className="w-4 h-4" style={{ color: sparkColor }} strokeWidth={2} />
          </div>
          <Sparkline data={sparkData} color={sparkColor} />
        </div>

        <div className="text-[26px] font-bold tracking-tight leading-none mb-1.5" style={{ color: '#f4f4f5' }}>
          <AnimNumber to={value} prefix={prefix} suffix={suffix} format={format} />
        </div>
        <p className="text-[12px] font-medium mb-2" style={{ color: 'rgba(244,244,245,0.5)' }}>{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{
            background: trendPositive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            color: trendPositive ? '#34d399' : '#f87171',
          }}>
            <ArrowUpRight className={`inline w-3 h-3 mr-0.5 ${!trendPositive ? 'rotate-180' : ''}`} />
            {trend}
          </span>
          <span className="text-[11px]" style={{ color: 'rgba(244,244,245,0.3)' }}>{sub}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Live activity feed ───────────────────────────────────── */
const MOCK_ACTIVITY = [
  { id: '1', type: 'booking',  text: 'New booking confirmed',  name: 'Maya K.',  time: 'just now',   color: '#34d399' },
  { id: '2', type: 'ai',       text: 'AI replied to inquiry',  name: 'James T.',  time: '2 min ago', color: '#f59e0b' },
  { id: '3', type: 'upsell',   text: 'Upsell accepted +$20',   name: 'Sofia R.',  time: '8 min ago', color: '#a78bfa' },
  { id: '4', type: 'booking',  text: 'Slot filled automatically', name: 'Priya M.', time: '15 min ago', color: '#34d399' },
  { id: '5', type: 'reminder', text: 'Rebooking reminder sent', name: 'Lisa C.',  time: '22 min ago', color: '#fb7185' },
];

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  booking:  CheckCircle2,
  ai:       Sparkles,
  upsell:   TrendingUp,
  reminder: MessageSquare,
};

/* ─── Skeleton ───────────────────────────────────────────────── */
function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-7">
      <div className="space-y-1">
        <SkeletonBlock className="h-7 w-52" />
        <SkeletonBlock className="h-4 w-36 mt-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-36 w-full rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <SkeletonBlock className="lg:col-span-3 h-80 rounded-2xl" />
        <SkeletonBlock className="lg:col-span-2 h-80 rounded-2xl" />
      </div>
    </div>
  );
}

/* ─── Status badge ───────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  label: 'Pending' },
  confirmed: { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  label: 'Confirmed' },
  cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Cancelled' },
  no_show:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'No Show' },
};

/* ─── Page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
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
      const [a, b] = await Promise.all([getAnalytics('30d'), getBookings({ status: 'confirmed' })]);
      setAnalytics(a);
      setBookings(b.bookings.slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <AlertCircle className="w-5 h-5" style={{ color: '#f87171' }} />
      </div>
      <p className="text-[15px] font-semibold mb-1" style={{ color: '#f4f4f5' }}>Failed to load dashboard</p>
      <p className="text-[13px] mb-4" style={{ color: 'rgba(244,244,245,0.4)' }}>{error}</p>
      <button onClick={loadData} className="text-[13px] font-medium px-4 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
        Retry
      </button>
    </div>
  );

  const totalRevenue    = Number(analytics?.revenue.total || 0);
  const avgBooking      = Number(analytics?.revenue.avgPerBooking || 0);
  const totalBookings   = analytics?.bookings.total || 0;
  const noShowRate      = parseFloat(analytics?.bookings.noShowRate || '0');
  const maxDayCount     = Math.max(...(analytics?.busiestDays || []).map(d => d.count), 1);

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
            {greeting} 👋
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.4)' }}>
            Here's your performance overview — last 30 days
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <div className="live-dot" />
          <span className="text-[12px] font-semibold" style={{ color: '#34d399' }}>Live</span>
        </div>
      </motion.div>

      {/* ── KPI Grid ───────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Revenue" value={totalRevenue} sub="vs last month"
          prefix="$" trend="+12%" trendPositive
          sparkData={SPARK_REV} sparkColor="#f59e0b"
          icon={DollarSign} delay={0} format
        />
        <KPICard
          title="Avg Booking Value" value={avgBooking} sub="per appointment"
          prefix="$" trend="+5%" trendPositive
          sparkData={[74, 78, 76, 82, 79, 85, 82, 88, 86, 90, 89, 94]}
          sparkColor="#34d399" icon={TrendingUp} delay={0.06}
        />
        <KPICard
          title="Total Bookings" value={totalBookings} sub="this period"
          trend="+18%" trendPositive
          sparkData={SPARK_BOOK} sparkColor="#a78bfa"
          icon={CalendarDays} delay={0.12}
        />
        <KPICard
          title="No-Show Rate" value={noShowRate} sub="of all bookings"
          suffix="%" trend="-3%" trendPositive
          sparkData={SPARK_NOSH} sparkColor="#fb7185"
          icon={Users} delay={0.18} format={false}
        />
      </div>

      {/* ── Main Content ───────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Upcoming bookings */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="rounded-2xl overflow-hidden h-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.1)' }}>
                  <CalendarDays className="w-4 h-4" style={{ color: '#34d399' }} strokeWidth={2} />
                </div>
                <p className="text-[14px] font-semibold" style={{ color: '#f4f4f5' }}>Upcoming Bookings</p>
              </div>
              <span className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(244,244,245,0.4)' }}>
                {bookings.length} scheduled
              </span>
            </div>

            <div className="p-3">
              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarDays className="w-10 h-10 mb-3" style={{ color: 'rgba(244,244,245,0.15)' }} strokeWidth={1.5} />
                  <p className="text-[13px]" style={{ color: 'rgba(244,244,245,0.35)' }}>No upcoming bookings</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {bookings.map((booking, i) => {
                    const status = booking.status || 'confirmed';
                    const sc = STATUS_CONFIG[status] || STATUS_CONFIG.confirmed;
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                        style={{ '--hover-bg': 'rgba(255,255,255,0.04)' } as React.CSSProperties}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,113,133,0.15))', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}>
                            {(booking.clients?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium" style={{ color: '#f4f4f5' }}>{booking.clients?.name || 'Client'}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>{booking.services?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[12px] font-medium" style={{ color: 'rgba(244,244,245,0.7)' }}>{fmtDate(booking.starts_at)}</p>
                            <p className="text-[11px] mt-0.5 flex items-center justify-end gap-1" style={{ color: 'rgba(244,244,245,0.35)' }}>
                              <Clock className="w-3 h-3" />{fmtTime(booking.starts_at)}
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>
                            {sc.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Live activity feed */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="rounded-2xl overflow-hidden h-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <Activity className="w-4 h-4" style={{ color: '#f59e0b' }} strokeWidth={2} />
                </div>
                <p className="text-[14px] font-semibold" style={{ color: '#f4f4f5' }}>Live Activity</p>
              </div>
              <div className="live-dot" />
            </div>

            <div className="p-3 space-y-1">
              {MOCK_ACTIVITY.map((item, i) => {
                const Icon = ACTIVITY_ICONS[item.type] || Activity;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate" style={{ color: 'rgba(244,244,245,0.8)' }}>{item.text}</p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(244,244,245,0.35)' }}>{item.name}</p>
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(244,244,245,0.25)' }}>{item.time}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* AI status footer */}
            <div className="px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(245,158,11,0.03)' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
                <p className="text-[12px]" style={{ color: 'rgba(244,244,245,0.5)' }}>
                  AI agent handled <span className="text-amber-400 font-semibold">12 conversations</span> today
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Busiest Days + Top Clients ──────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Busiest days */}
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          <div className="rounded-2xl overflow-hidden h-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.1)' }}>
                  <BarChart3 className="w-4 h-4" style={{ color: '#a78bfa' }} strokeWidth={2} />
                </div>
                <p className="text-[14px] font-semibold" style={{ color: '#f4f4f5' }}>Busiest Days</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              {(analytics?.busiestDays || []).slice(0, 7).map((day, i) => {
                const w = Math.max((day.count / maxDayCount) * 100, 6);
                return (
                  <motion.div key={day.day} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 + i * 0.04 }} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold uppercase w-8" style={{ color: 'rgba(244,244,245,0.35)' }}>{day.day}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #a78bfa, #7c3aed)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${w}%` }}
                        transition={{ delay: 0.46 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums w-5 text-right" style={{ color: 'rgba(244,244,245,0.6)' }}>{day.count}</span>
                  </motion.div>
                );
              })}
              {(!analytics?.busiestDays?.length) && (
                <p className="text-[13px] text-center py-8" style={{ color: 'rgba(244,244,245,0.25)' }}>No data yet</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Top clients */}
        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="rounded-2xl overflow-hidden h-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,113,133,0.1)' }}>
                  <Users className="w-4 h-4" style={{ color: '#fb7185' }} strokeWidth={2} />
                </div>
                <p className="text-[14px] font-semibold" style={{ color: '#f4f4f5' }}>Top Clients</p>
              </div>
              <span className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(244,244,245,0.4)' }}>
                By revenue
              </span>
            </div>

            {analytics?.topClients?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Client', 'Avg Spend', 'Last Booked', 'Frequency'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,244,245,0.3)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topClients.slice(0, 6).map((client, i) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.44 + i * 0.04 }}
                        className="group transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,113,133,0.15))', color: '#f59e0b' }}>
                              {(client.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[13px] font-medium" style={{ color: '#f4f4f5' }}>{client.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[13px] font-semibold" style={{ color: '#f59e0b' }}>{fmtCurrency(client.avg_spend || 0)}</span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="text-[12px]" style={{ color: 'rgba(244,244,245,0.4)' }}>
                            {client.last_booked_at ? new Date(client.last_booked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          {client.typical_frequency_days ? (
                            <span className="text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>
                              Every {client.typical_frequency_days}d
                            </span>
                          ) : <span style={{ color: 'rgba(244,244,245,0.25)' }}>—</span>}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-10 h-10 mb-3" style={{ color: 'rgba(244,244,245,0.12)' }} strokeWidth={1.5} />
                <p className="text-[13px]" style={{ color: 'rgba(244,244,245,0.3)' }}>No client data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
