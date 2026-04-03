'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  CalendarDays,
  BarChart3,
  Shield,
  Star,
  CheckCircle2,
  Activity,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Sparkline — animated SVG revenue chart
───────────────────────────────────────────────────────────── */
const SPARK = [38, 44, 36, 58, 50, 63, 60, 74, 70, 88, 82, 97, 92, 114];

function Sparkline() {
  const W = 130, H = 34;
  const min = Math.min(...SPARK), max = Math.max(...SPARK);
  const pts = SPARK.map((v, i) => {
    const x = (i / (SPARK.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="sfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#sfill)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#a78bfa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Dashboard panel — hero product mockup
───────────────────────────────────────────────────────────── */
const FEED = [
  { init: 'S', name: 'Sarah M.', svc: 'Haircut + Color', time: 'Today 2:00 pm', amt: '+$165' },
  { init: 'J', name: 'James T.', svc: 'Deep Tissue · 1h', time: 'Today 4:30 pm', amt: '+$90' },
  { init: 'M', name: 'Maya K.', svc: 'Brow Shaping', time: 'Tomorrow 10 am', amt: '+$75' },
];

function DashPanel() {
  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: 'var(--ink-2)',
        border: '1px solid var(--ink-border)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 px-4 h-9"
        style={{ background: '#0d0c18', borderBottom: '1px solid var(--ink-border)' }}
      >
        <div className="flex gap-1.5">
          {['#ef4444', '#eab308', '#22c55e'].map((c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.5 }} />
          ))}
        </div>
        <div
          className="flex-1 mx-3 px-3 h-5 rounded flex items-center text-[10px]"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-dim)' }}
        >
          bookedup.app/dashboard
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#a78bfa' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Revenue metric + sparkline */}
      <div className="px-5 pt-4 pb-3.5" style={{ borderBottom: '1px solid var(--ink-border)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
          This week
        </p>
        <div className="flex items-end justify-between mb-2">
          <motion.p
            className="text-[2rem] font-bold leading-none"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ivory)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            $4,280
          </motion.p>
          <motion.div
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold"
            style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <TrendingUp className="w-3 h-3" />
            +43%
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
          <Sparkline />
        </motion.div>
      </div>

      {/* Booking feed */}
      <div className="px-5 py-3.5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
            Upcoming
          </p>
          <Activity className="w-3 h-3" style={{ color: 'var(--text-dim)' }} />
        </div>
        <div className="space-y-3">
          {FEED.map((b, i) => (
            <motion.div
              key={b.name}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.15 + i * 0.18, duration: 0.35, ease: 'easeOut' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: 'rgba(124,58,237,0.18)', color: '#a78bfa' }}
              >
                {b.init}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-none" style={{ color: 'var(--ivory)' }}>{b.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{b.svc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold" style={{ color: '#a78bfa' }}>{b.amt}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{b.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div
        className="px-5 py-2.5 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--ink-border)', background: '#0d0c18' }}
      >
        <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>3 slots auto-filled today</span>
        <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#a78bfa' }}>
          <Zap className="w-2.5 h-2.5" />
          Autopilot on
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Scroll-reveal wrapper
───────────────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Feature card
───────────────────────────────────────────────────────────── */
function Feat({ icon: Icon, title, desc, delay }: {
  icon: React.ElementType; title: string; desc: string; delay: number;
}) {
  return (
    <FadeUp delay={delay}>
      <div
        className="rounded-2xl p-6 h-full"
        style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-border)', transition: 'border-color 0.2s, transform 0.2s' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,0.28)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ink-border)';
          (e.currentTarget as HTMLDivElement).style.transform = 'none';
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(76,29,149,0.1))',
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          <Icon className="w-4 h-4" style={{ color: '#a78bfa' }} strokeWidth={1.8} />
        </div>
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--ivory)' }}>{title}</h3>
        <p className="text-[13px]" style={{ color: 'var(--text-dim)', lineHeight: 1.65 }}>{desc}</p>
      </div>
    </FadeUp>
  );
}

/* ─────────────────────────────────────────────────────────────
   Landing page
───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--ink)' }}>

      {/* Dot-grid background texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.038) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-6 md:px-10"
        style={{
          borderBottom: '1px solid var(--ink-border)',
          backdropFilter: 'blur(24px) saturate(160%)',
          background: 'rgba(9,9,15,0.82)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--violet)' }}>
            <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--ivory)' }}>BookedUp</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {['Features', 'Pricing', 'Blog'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[13px] transition-colors duration-150"
              style={{ color: 'var(--text-dim)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--ivory)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-dim)')}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <button
              className="text-[13px] px-3.5 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-dim)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--ivory)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-dim)')}
            >
              Sign in
            </button>
          </Link>
          <Link href="/signup">
            <button
              className="text-[13px] px-4 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-85"
              style={{ background: 'var(--violet)', color: '#fff', boxShadow: '0 0 18px rgba(124,58,237,0.35)' }}
            >
              Get started
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-28 pb-20 px-6 md:px-10 overflow-hidden">
        {/* Ambient glow blobs */}
        <div
          className="pointer-events-none absolute -top-24 right-[8%] w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 62%)', filter: 'blur(64px)' }}
        />
        <div
          className="pointer-events-none absolute top-[45%] -left-[8%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(76,29,149,0.06) 0%, transparent 70%)', filter: 'blur(64px)' }}
        />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-7"
            style={{
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.25)',
              color: '#a78bfa',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-powered revenue intelligence
          </motion.div>

          {/* Headline — Fraunces italic at scale */}
          <motion.h1
            className="mb-6 max-w-4xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.4rem, 7.5vw, 6.2rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: 'var(--ivory)',
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
            }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            Your calendar
            <br />
            is{' '}
            <span
              style={{
                background: 'linear-gradient(95deg, #c4b5fd 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              leaking money.
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-[1.1rem] mb-8 max-w-[460px]"
            style={{ color: 'var(--text-dim)', lineHeight: 1.72 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            BookedUp uses AI to detect gaps, recover no-shows, and fill
            your schedule automatically — so you earn more without working more.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-9"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/signup">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0"
                style={{
                  background: 'var(--violet)',
                  color: '#fff',
                  boxShadow: '0 0 36px rgba(124,58,237,0.42), 0 2px 10px rgba(0,0,0,0.35)',
                }}
              >
                Start free trial
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: 'var(--ink-3)',
                border: '1px solid var(--ink-border)',
                color: 'var(--ivory)',
              }}
            >
              Watch 2-min demo
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-5 mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.44 }}
          >
            {[
              { icon: CheckCircle2, text: 'No credit card required' },
              { icon: Shield, text: 'SOC 2 compliant' },
              { icon: Star, text: '4.9 / 5 · 800+ reviews' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: '#a78bfa' }} />
                {text}
              </div>
            ))}
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            className="w-full max-w-xl relative"
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.52, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <DashPanel />
            {/* Glow below panel */}
            <div
              className="absolute -inset-x-8 -bottom-10 -z-10 h-28 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.3) 0%, transparent 70%)',
                filter: 'blur(24px)',
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <FadeUp>
        <div className="relative z-10 px-6 md:px-10 mb-20">
          {/* gap-px trick: wrapper bg shows through as hairline dividers */}
          <div
            className="max-w-5xl mx-auto rounded-2xl overflow-hidden"
            style={{ background: 'var(--ink-border)', border: '1px solid var(--ink-border)' }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
              {[
                { v: '$2.4M+', l: 'Revenue recovered' },
                { v: '47K+',   l: 'Bookings processed' },
                { v: '2,400+', l: 'Active businesses' },
                { v: '43%',    l: 'Avg revenue lift' },
              ].map(({ v, l }) => (
                <div key={l} className="px-7 py-7" style={{ background: 'var(--ink-2)' }}>
                  <p
                    className="text-[1.6rem] font-bold mb-1"
                    style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#a78bfa' }}
                  >
                    {v}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── Features ── */}
      <section className="relative z-10 px-6 md:px-10 mb-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: '#a78bfa' }}>
              Platform
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontStyle: 'italic',
                fontWeight: 700,
                color: 'var(--ivory)',
                lineHeight: 1.12,
              }}
            >
              Every tool you need.
              <br />
              <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>Nothing you don't.</span>
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-3.5">
            <Feat icon={CalendarDays} title="AI Schedule Filling"   desc="Detects gaps in real-time and messages clients to fill them before the slot goes cold."       delay={0} />
            <Feat icon={TrendingUp}   title="No-Show Recovery"      desc="Automated re-booking sequences that turn missed appointments into rescheduled revenue."       delay={0.07} />
            <Feat icon={Users}        title="Client Intelligence"   desc="Know your most valuable clients, predict churn, and know exactly when to reach out."          delay={0.14} />
            <Feat icon={BarChart3}    title="Revenue Analytics"     desc="Real-time income breakdowns by service, day, and channel. Know what's actually working."      delay={0.21} />
            <Feat icon={Zap}          title="Instant Booking Links" desc="One link for Instagram, WhatsApp, anywhere. Clients book in seconds. You get paid faster."  delay={0.28} />
            <Feat icon={Shield}       title="Enterprise Security"   desc="SOC 2 Type II certified, GDPR-ready, end-to-end encrypted. Your data is never for sale."     delay={0.35} />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 px-6 md:px-10 mb-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-12 text-center">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontStyle: 'italic',
                fontWeight: 700,
                color: 'var(--ivory)',
              }}
            >
              Live in 5 minutes.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-10 md:gap-8 relative">
            {/* Connecting line between step circles */}
            <div
              className="hidden md:block absolute top-[18px] left-[calc(16.7%+16px)] right-[calc(16.7%+16px)] h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.35) 20%, rgba(124,58,237,0.35) 80%, transparent)',
              }}
            />
            {[
              { n: '01', t: 'Connect', d: 'Sync your calendar, Instagram DMs, or WhatsApp business account in two clicks.' },
              { n: '02', t: 'Analyze', d: 'AI maps your schedule, client history, and pricing gaps to build your revenue model.' },
              { n: '03', t: 'Grow',    d: 'Your calendar fills automatically. More clients, fewer gaps, zero extra effort.' },
            ].map(({ n, t, d }, i) => (
              <FadeUp key={n} delay={i * 0.1}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mb-4 relative z-10"
                  style={{
                    background: 'var(--ink-3)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    color: '#a78bfa',
                  }}
                >
                  {n}
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--ivory)' }}>{t}</h3>
                <p className="text-[13px]" style={{ color: 'var(--text-dim)', lineHeight: 1.65 }}>{d}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 px-6 md:px-10 mb-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-10 text-center">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontStyle: 'italic',
                fontWeight: 700,
                color: 'var(--ivory)',
              }}
            >
              Trusted by service pros.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-3.5">
            {[
              {
                q: 'I went from 60% to 92% utilization in one month. BookedUp pays for itself ten times over.',
                name: 'Amara Chen',   role: 'Hair Stylist, Brooklyn', stat: '+53%',  statL: 'utilization',
              },
              {
                q: "The no-show recovery alone recovered $800 last month. I didn't even know that money was on the table.",
                name: 'Marcus Rivera', role: 'Personal Trainer, LA', stat: '$800',  statL: 'recovered',
              },
              {
                q: 'Finally a tool that gets service businesses. The client frequency alerts are genuinely game-changing.',
                name: 'Priya Mehta',  role: 'Esthetician, Chicago',  stat: '4.9★', statL: 'client rating',
              },
            ].map(({ q, name, role, stat, statL }, i) => (
              <FadeUp key={name} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-6 h-full relative overflow-hidden"
                  style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-border)' }}
                >
                  {/* Decorative large quote mark */}
                  <div
                    className="absolute top-3 right-5 text-6xl leading-none select-none pointer-events-none"
                    style={{ fontFamily: 'Georgia, serif', color: 'rgba(124,58,237,0.08)' }}
                  >
                    "
                  </div>

                  <div className="mb-4">
                    <p
                      className="text-2xl font-bold"
                      style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#a78bfa' }}
                    >
                      {stat}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
                      {statL}
                    </p>
                  </div>

                  <p className="text-[13px] mb-5" style={{ color: 'var(--ivory)', opacity: 0.82, lineHeight: 1.65 }}>
                    "{q}"
                  </p>

                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
                    >
                      {name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--ivory)' }}>{name}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-current" style={{ color: '#a78bfa' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <FadeUp>
        <section className="relative z-10 px-6 md:px-10 pb-24">
          <div
            className="max-w-5xl mx-auto rounded-3xl p-14 md:p-20 text-center relative overflow-hidden"
            style={{ background: 'var(--ink-2)', border: '1px solid rgba(124,58,237,0.18)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.16) 0%, transparent 55%)' }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-5"
                style={{
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  color: '#a78bfa',
                }}
              >
                <Zap className="w-3 h-3" />
                Start earning more today
              </div>

              <h2
                className="mb-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  color: 'var(--ivory)',
                  lineHeight: 1.06,
                }}
              >
                Fill your calendar.
                <br />
                <span style={{ color: '#a78bfa' }}>Keep it full.</span>
              </h2>

              <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-dim)', lineHeight: 1.72 }}>
                Join 2,400+ service professionals earning more with BookedUp.
              </p>

              <Link href="/signup">
                <button
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-px"
                  style={{
                    background: 'var(--violet)',
                    color: '#fff',
                    boxShadow: '0 0 48px rgba(124,58,237,0.5)',
                  }}
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <p className="mt-3.5 text-xs" style={{ color: 'var(--text-dim)' }}>
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 px-6 md:px-10 pb-8 pt-6"
        style={{ borderTop: '1px solid var(--ink-border)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--violet)' }}>
              <Zap className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--ivory)' }}>BookedUp</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>© 2026 BookedUp. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs transition-colors"
                style={{ color: 'var(--text-dim)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--ivory)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-dim)')}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
