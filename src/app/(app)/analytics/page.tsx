'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import {
  DollarSign, TrendingUp, Users, CalendarDays, ArrowUpRight,
  Sparkles, Target, BarChart3, Activity,
} from 'lucide-react';
import { getAnalytics, type Analytics } from '@/lib/api';

/* ─── Mock chart data ──────────────────────────────────────── */
const REVENUE_DATA = [
  { month: 'Oct', revenue: 1840, bookings: 22 },
  { month: 'Nov', revenue: 2100, bookings: 26 },
  { month: 'Dec', revenue: 1980, bookings: 24 },
  { month: 'Jan', revenue: 2540, bookings: 30 },
  { month: 'Feb', revenue: 2780, bookings: 34 },
  { month: 'Mar', revenue: 3210, bookings: 39 },
];

const CONVERSION_DATA = [
  { name: 'Mon', rate: 78 },
  { name: 'Tue', rate: 85 },
  { name: 'Wed', rate: 92 },
  { name: 'Thu', rate: 88 },
  { name: 'Fri', rate: 96 },
  { name: 'Sat', rate: 90 },
  { name: 'Sun', rate: 72 },
];

const CHANNEL_DATA = [
  { name: 'Instagram DM', value: 48, color: '#e1306c' },
  { name: 'SMS / Text',   value: 33, color: '#34d399' },
  { name: 'Booking Link', value: 19, color: '#f59e0b' },
];

const CLIENT_SEGMENTS = [
  { name: 'Champions',    count: 12, spend: '$180+', color: '#f59e0b', desc: 'High freq, high spend' },
  { name: 'Loyal',        count: 28, spend: '$80–180', color: '#34d399', desc: 'Regular, consistent' },
  { name: 'At Risk',      count: 9,  spend: '$50–80',  color: '#fb7185', desc: 'No visit in 45+ days' },
  { name: 'Win-back',     count: 15, spend: '$40–80',  color: '#a78bfa', desc: 'Inactive 90+ days' },
];

const SLOT_FILL_DATA = [
  { day: 'Mon', filled: 3, missed: 1 },
  { day: 'Tue', filled: 2, missed: 2 },
  { day: 'Wed', filled: 4, missed: 0 },
  { day: 'Thu', filled: 5, missed: 1 },
  { day: 'Fri', filled: 6, missed: 0 },
  { day: 'Sat', filled: 4, missed: 1 },
  { day: 'Sun', filled: 1, missed: 0 },
];

/* ─── Animated counter ──────────────────────────────────────── */
function AnimCounter({ to, prefix = '', suffix = '', decimals = 0 }: {
  to: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 55, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) setTimeout(() => mv.set(to), 150);
  }, [inView, to, mv]);

  useEffect(() => spring.on('change', v => setDisplay(v)), [spring]);

  return (
    <span ref={ref} className="font-mono-nums">
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Custom tooltip ────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl text-[12px]" style={{ background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <p className="font-semibold mb-1.5" style={{ color: 'rgba(244,244,245,0.6)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}{p.name === 'rate' ? '%' : ''}
        </p>
      ))}
    </div>
  );
}

/* ─── KPI Card ────────────────────────────────────────────────── */
function KPICard({ title, value, sub, icon: Icon, color, trend, trendPos, delay }: {
  title: string; value: number; sub: string; icon: React.ElementType;
  color: string; trend: string; trendPos: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
      whileHover={{ borderColor: `${color}22`, y: -1, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}14`, border: `1px solid ${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{
          background: trendPos ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
          color: trendPos ? '#34d399' : '#f87171',
        }}>
          <ArrowUpRight className={`inline w-2.5 h-2.5 ${!trendPos ? 'rotate-180' : ''}`} />
          {trend}
        </span>
      </div>
      <div className="text-[28px] font-bold tracking-tight leading-none mb-1.5" style={{ color: '#f4f4f5' }}>
        <AnimCounter to={value} prefix={title.includes('Revenue') || title.includes('Ticket') ? '$' : ''} suffix={title.includes('Rate') || title.includes('Conversion') ? '%' : ''} />
      </div>
      <p className="text-[12px] font-medium mb-0.5" style={{ color: 'rgba(244,244,245,0.45)' }}>{title}</p>
      <p className="text-[11px]" style={{ color: 'rgba(244,244,245,0.25)' }}>{sub}</p>
    </motion.div>
  );
}

/* ─── Section wrapper ───────────────────────────────────────── */
function Section({ title, subtitle, icon: Icon, color, children, delay = 0 }: {
  title: string; subtitle?: string; icon?: React.ElementType;
  color?: string; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
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
    </motion.div>
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

  useEffect(() => {
    getAnalytics(period as '7d' | '30d' | '90d')
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, [period]);

  const totalRevenue = Number(analytics?.revenue.total || 3210);
  const avgBooking   = Number(analytics?.revenue.avgPerBooking || 85);
  const noShowRate   = parseFloat(analytics?.bookings.noShowRate || '4.2');
  const convRate     = 94;

  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
            Analytics
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.4)' }}>
            Deep dive into your business performance
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </motion.div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Revenue" value={totalRevenue} sub="This period" icon={DollarSign} color="#f59e0b" trend="+18%" trendPos delay={0} />
        <KPICard title="Avg Ticket Size" value={avgBooking} sub="Per booking" icon={TrendingUp} color="#34d399" trend="+5%" trendPos delay={0.06} />
        <KPICard title="AI Conversion Rate" value={convRate} sub="DM → confirmed" icon={Target} color="#a78bfa" trend="+3%" trendPos delay={0.12} />
        <KPICard title="No-Show Rate" value={noShowRate} sub="Of all bookings" icon={Users} color="#fb7185" trend="-3%" trendPos delay={0.18} />
      </div>

      {/* Revenue Chart */}
      <Section title="Revenue Trend" subtitle="Monthly revenue over time" icon={BarChart3} color="#f59e0b" delay={0.22}>
        <div className="p-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#f59e0b', stroke: '#09090b', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Two-column */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Conversion by day */}
        <Section title="Conversion Rate by Day" subtitle="% of inquiries that booked" icon={Activity} color="#34d399" delay={0.28}>
          <div className="p-5 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONVERSION_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {CONVERSION_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 90 ? '#34d399' : entry.rate >= 80 ? '#f59e0b' : '#fb7185'} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Booking channels */}
        <Section title="Booking Channels" subtitle="Where clients are coming from" icon={Target} color="#a78bfa" delay={0.31}>
          <div className="p-5 flex items-center gap-6">
            <div className="w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CHANNEL_DATA} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                    {CHANNEL_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {CHANNEL_DATA.map(ch => (
                <div key={ch.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                      <span className="text-[12px] font-medium" style={{ color: 'rgba(244,244,245,0.7)' }}>{ch.name}</span>
                    </div>
                    <span className="text-[12px] font-bold font-mono-nums" style={{ color: ch.color }}>{ch.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: ch.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${ch.value}%` }}
                      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Slot fill + Client segments */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Slot fill */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Section title="Empty Slot Recovery" subtitle="Filled vs missed cancellations" icon={CalendarDays} color="#fb7185" delay={0}>
            <div className="p-5 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SLOT_FILL_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(244,244,245,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="filled" fill="#34d399" radius={[3, 3, 0, 0]} opacity={0.85} />
                  <Bar dataKey="missed" fill="#f87171" radius={[3, 3, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </motion.div>

        {/* Client segments */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          <Section title="Client Segments" subtitle="RFM-based retention intelligence" icon={Users} color="#a78bfa" delay={0}>
            <div className="p-5 space-y-3">
              {CLIENT_SEGMENTS.map((seg, i) => (
                <motion.div
                  key={seg.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>{seg.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${seg.color}15`, color: seg.color }}>{seg.count} clients</span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'rgba(244,244,245,0.35)' }}>{seg.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-bold font-mono-nums" style={{ color: seg.color }}>{seg.spend}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(244,244,245,0.3)' }}>avg spend</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </motion.div>
      </div>

      {/* AI insight banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.14)' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.12)' }}>
          <Sparkles className="w-5 h-5" style={{ color: '#f59e0b' }} />
        </div>
        <div>
          <p className="text-[13px] font-semibold mb-0.5" style={{ color: '#f4f4f5' }}>AI Revenue Insight</p>
          <p className="text-[13px]" style={{ color: 'rgba(244,244,245,0.55)' }}>
            Friday bookings convert 24% higher than average. Consider opening 2 more Friday slots — projected uplift{' '}
            <span className="text-amber-400 font-semibold">+$170/mo</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
