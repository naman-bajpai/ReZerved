'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  CalendarDays,
  BarChart3,
  Shield,
  CheckCircle2,
  Activity,
  Menu,
  X,
  Bell,
} from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────
const BG       = '#fafaf8';
const ORANGE   = '#f97316';
const PINK     = '#ec4899';
const VIOLET   = '#7c3aed';
const TEXT     = '#0f0a1e';
const MID      = '#4b5563';
const DIM      = '#9ca3af';
const CARD     = '#ffffff';
const BORDER   = 'rgba(15,10,30,0.08)';

const GRAD        = `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`;
const GRAD_FULL   = `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 55%, ${VIOLET} 100%)`;

// ─── Logo mark ───────────────────────────────────────────────
function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="30" height="30" rx="9" fill="url(#logo-g)" />
      <rect x="7" y="11" width="16" height="12" rx="2.5" fill="white" fillOpacity="0.95" />
      <rect x="7" y="9" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.7" />
      <rect x="11" y="7.5" width="2.5" height="4" rx="1.25" fill="white" />
      <rect x="16.5" y="7.5" width="2.5" height="4" rx="1.25" fill="white" />
      <path d="M11 17.5l2.5 2.5 5-5.5" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sparkline ───────────────────────────────────────────────
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
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#sfill)" />
      <polyline points={pts} fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Dashboard panel (dark, shown as product screenshot) ─────
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
        background: '#13121e',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 32px 72px rgba(15,10,30,0.14), 0 8px 24px rgba(249,115,22,0.07)',
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 h-9" style={{ background: '#0d0c18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex gap-1.5">
          {['#ef4444','#eab308','#22c55e'].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.5 }} />
          ))}
        </div>
        <div className="flex-1 mx-3 px-3 h-5 rounded flex items-center text-[10px]" style={{ background: 'rgba(255,255,255,0.04)', color: '#9a95ae' }}>
          bookedup.app/dashboard
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#fb923c' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Revenue metric */}
      <div className="px-5 pt-4 pb-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#9a95ae' }}>This week</p>
        <div className="flex items-end justify-between mb-2">
          <motion.p
            className="text-[2rem] font-bold leading-none"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#f0ece2' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}
          >
            $4,280
          </motion.p>
          <motion.div
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold"
            style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
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
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9a95ae' }}>Upcoming</p>
          <Activity className="w-3 h-3" style={{ color: '#9a95ae' }} />
        </div>
        <div className="space-y-3">
          {FEED.map((b, i) => (
            <motion.div
              key={b.name}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.15 + i * 0.18, duration: 0.35, ease: 'easeOut' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'rgba(249,115,22,0.18)', color: '#fb923c' }}>
                {b.init}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-none" style={{ color: '#f0ece2' }}>{b.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#9a95ae' }}>{b.svc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold" style={{ color: '#fb923c' }}>{b.amt}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#9a95ae' }}>{b.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-5 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0d0c18' }}>
        <span className="text-[10px]" style={{ color: '#9a95ae' }}>3 slots auto-filled today</span>
        <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#fb923c' }}>
          <Zap className="w-2.5 h-2.5" />Autopilot on
        </div>
      </div>
    </div>
  );
}

// ─── FadeUp wrapper ───────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Bento feature card ───────────────────────────────────────
function BentoCard({
  icon: Icon, title, desc, color1, color2, delay, className = '',
}: {
  icon: React.ElementType; title: string; desc: string;
  color1: string; color2: string; delay: number; className?: string;
}) {
  return (
    <FadeUp delay={delay} className={className}>
      <motion.div
        className="group relative min-h-[200px] rounded-2xl p-6 overflow-hidden cursor-default h-full"
        style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(15,10,30,0.04)' }}
        whileHover={{ scale: 0.98, rotate: '-0.4deg' }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      >
        {/* Sliding color swatch on hover */}
        <div
          className="absolute bottom-0 left-3 right-3 top-28 translate-y-10 rounded-xl transition-transform duration-300 ease-out group-hover:translate-y-2"
          style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, opacity: 0.1 }}
        />
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative z-10"
          style={{ background: `linear-gradient(135deg, ${color1}20, ${color2}20)`, border: `1px solid ${color1}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: color1 }} strokeWidth={1.8} />
        </div>
        <h3 className="text-sm font-semibold mb-2 relative z-10" style={{ color: TEXT }}>{title}</h3>
        <p className="text-[13px] relative z-10 leading-relaxed" style={{ color: MID }}>{desc}</p>
      </motion.div>
    </FadeUp>
  );
}

// ─── Landing page ─────────────────────────────────────────────
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: BG }}>

      {/* ── Floating navbar ── */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4">
        <motion.nav
          className="w-full max-w-4xl flex items-center justify-between px-5 h-14 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: `1px solid ${BORDER}`,
            boxShadow: '0 4px 24px rgba(15,10,30,0.07), 0 1px 0 rgba(255,255,255,0.6) inset',
          }}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <motion.div whileHover={{ rotate: 8, scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
              <LogoMark size={30} />
            </motion.div>
            <span className="font-bold text-sm tracking-tight" style={{ color: TEXT }}>
              Booked
              <span style={{
                background: GRAD,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Up</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {['Features', 'How it works', 'Pricing'].map(item => (
              <a
                key={item}
                href="#"
                className="text-[13px] font-medium transition-colors duration-150"
                style={{ color: MID }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TEXT)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = MID)}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link href="/login">
              <button
                className="text-[13px] font-medium px-4 py-1.5 rounded-xl transition-colors"
                style={{ color: MID }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TEXT)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = MID)}
              >
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <motion.button
                className="text-[13px] font-semibold px-4 py-2 rounded-xl text-white flex items-center gap-1.5"
                style={{ background: GRAD, boxShadow: '0 2px 12px rgba(249,115,22,0.28)' }}
                whileHover={{ scale: 1.04, boxShadow: '0 4px 20px rgba(249,115,22,0.4)' }}
                whileTap={{ scale: 0.97 }}
              >
                Join beta
              </motion.button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-xl transition-colors"
            style={{ color: MID }}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.nav>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col pt-24 px-6 pb-8"
            style={{ background: 'rgba(250,250,248,0.97)', backdropFilter: 'blur(20px)' }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <nav className="flex flex-col gap-1">
              {['Features', 'How it works', 'Pricing'].map((item, i) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-xl font-semibold py-4 border-b"
                  style={{ color: TEXT, borderColor: BORDER }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full py-3.5 rounded-xl text-sm font-semibold border" style={{ color: TEXT, borderColor: BORDER, background: CARD }}>
                  Sign in
                </button>
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                <button className="w-full py-3.5 rounded-xl text-sm font-semibold text-white" style={{ background: GRAD }}>
                  Join the open beta — it&apos;s free
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-32 pb-16 px-6 md:px-10 overflow-hidden">
        {/* Ambient gradient blobs */}
        <div className="pointer-events-none absolute -top-12 right-[3%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 62%)', filter: 'blur(80px)' }} />
        <div className="pointer-events-none absolute top-[35%] -left-[8%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 68%)', filter: 'blur(80px)' }} />
        <div className="pointer-events-none absolute top-[15%] left-[38%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">

          {/* Open beta badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(236,72,153,0.1))',
              border: '1px solid rgba(249,115,22,0.25)',
              color: ORANGE,
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            Open Beta · Free to join — no credit card needed
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mb-6 max-w-4xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.2rem, 7vw, 5.8rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: TEXT,
              lineHeight: 1.03,
              letterSpacing: '-0.025em',
            }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            Your calendar
            <br />
            is{' '}
            <span style={{
              background: GRAD_FULL,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              leaking money.
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-[1.1rem] mb-8 max-w-[500px]"
            style={{ color: MID, lineHeight: 1.72 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            We&apos;re building an AI tool that detects gaps, recovers no-shows, and fills
            your schedule automatically — so you earn more without working more.{' '}
            <strong style={{ color: TEXT }}>We&apos;re doing an open beta test. Feel free to sign up and try it free.</strong>
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/signup">
              <motion.button
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: GRAD, boxShadow: '0 4px 24px rgba(249,115,22,0.32)' }}
                whileHover={{ scale: 1.04, boxShadow: '0 6px 32px rgba(249,115,22,0.44)' }}
                whileTap={{ scale: 0.97 }}
              >
                Join the open beta
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <motion.button
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium"
              style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT, boxShadow: '0 1px 4px rgba(15,10,30,0.05)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              See how it works
            </motion.button>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            className="flex flex-wrap justify-center gap-5 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.44 }}
          >
            {[
              { icon: CheckCircle2, text: 'Free during beta' },
              { icon: CheckCircle2, text: 'No credit card required' },
              { icon: Shield, text: 'Cancel anytime' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: DIM }}>
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: ORANGE }} />
                {text}
              </div>
            ))}
          </motion.div>

          {/* Dashboard mockup + floating cards */}
          <motion.div
            className="w-full max-w-xl relative"
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.52, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Floating notification — top left */}
            <motion.div
              className="absolute -left-4 md:-left-10 top-8 z-20 rounded-2xl px-4 py-3 text-left"
              style={{
                background: 'rgba(255,255,255,0.96)',
                border: `1px solid ${BORDER}`,
                boxShadow: '0 8px 32px rgba(15,10,30,0.09)',
                backdropFilter: 'blur(12px)',
                minWidth: 158,
              }}
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Bell className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ORANGE }}>New booking</span>
              </div>
              <p className="text-xs font-semibold" style={{ color: TEXT }}>Alex B. just booked</p>
              <p className="text-[10px]" style={{ color: DIM }}>Cut + Beard · $85</p>
            </motion.div>

            {/* Floating revenue pill — bottom right */}
            <motion.div
              className="absolute -right-2 md:-right-8 bottom-14 z-20 rounded-2xl px-4 py-3"
              style={{
                background: GRAD,
                boxShadow: '0 8px 32px rgba(249,115,22,0.28)',
                minWidth: 128,
              }}
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            >
              <p className="text-[10px] font-semibold text-white/75 uppercase tracking-wide mb-0.5">Recovered</p>
              <p className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>+$340</p>
              <p className="text-[10px] text-white/75">this week</p>
            </motion.div>

            <DashPanel />

            {/* Glow beneath */}
            <div
              className="absolute -inset-x-8 -bottom-10 -z-10 h-28 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.18) 0%, transparent 70%)',
                filter: 'blur(24px)',
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Features bento grid ── */}
      <section className="relative z-10 px-6 md:px-10 mb-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-12 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: ORANGE }}>
              Platform
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontStyle: 'italic',
                fontWeight: 700,
                color: TEXT,
                lineHeight: 1.12,
              }}
            >
              Every tool you need.{' '}
              <span style={{ color: DIM, fontWeight: 400 }}>Nothing you don&apos;t.</span>
            </h2>
          </FadeUp>

          <div className="grid grid-cols-12 gap-3.5">
            <div className="col-span-12 md:col-span-8">
              <BentoCard
                icon={CalendarDays}
                title="AI Schedule Filling"
                desc="Detects gaps in real-time and messages clients to fill them before the slot goes cold. Your calendar stays full automatically."
                color1="#f97316" color2="#ec4899" delay={0} className="h-full"
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <BentoCard
                icon={TrendingUp}
                title="No-Show Recovery"
                desc="Automated re-booking sequences that turn missed appointments into rescheduled revenue."
                color1="#ec4899" color2="#7c3aed" delay={0.07} className="h-full"
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <BentoCard
                icon={Users}
                title="Client Intelligence"
                desc="Know your most valuable clients, predict churn, and know exactly when to reach out."
                color1="#7c3aed" color2="#06b6d4" delay={0.14} className="h-full"
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <BentoCard
                icon={BarChart3}
                title="Revenue Analytics"
                desc="Real-time income breakdowns by service, day, and channel. Know what&apos;s actually working."
                color1="#10b981" color2="#06b6d4" delay={0.21} className="h-full"
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <BentoCard
                icon={Zap}
                title="Instant Booking Links"
                desc="One link for Instagram, WhatsApp, anywhere. Clients book in seconds. You get paid faster."
                color1="#f59e0b" color2="#f97316" delay={0.28} className="h-full"
              />
            </div>
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
                color: TEXT,
              }}
            >
              Live in 5 minutes.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-10 md:gap-8 relative">
            <div
              className="hidden md:block absolute top-[18px] left-[calc(16.7%+16px)] right-[calc(16.7%+16px)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.3) 20%, rgba(249,115,22,0.3) 80%, transparent)' }}
            />
            {[
              { n: '01', t: 'Connect', d: 'Sync your calendar, Instagram DMs, or WhatsApp business account in two clicks.' },
              { n: '02', t: 'Analyze', d: 'AI maps your schedule, client history, and pricing gaps to build your revenue model.' },
              { n: '03', t: 'Grow', d: 'Your calendar fills automatically. More clients, fewer gaps, zero extra effort.' },
            ].map(({ n, t, d }, i) => (
              <FadeUp key={n} delay={i * 0.1}>
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mb-4 relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(236,72,153,0.1))',
                    border: '1px solid rgba(249,115,22,0.22)',
                    color: ORANGE,
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {n}
                </motion.div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: TEXT }}>{t}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: MID }}>{d}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Beta CTA ── */}
      <FadeUp>
        <section className="relative z-10 px-6 md:px-10 pb-24">
          <div
            className="max-w-5xl mx-auto rounded-3xl p-14 md:p-20 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 55%, #7c3aed 100%)' }}
          >
            {/* Dot grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.22) 0%, transparent 55%)' }}
            />

            <div className="relative z-10">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold mb-6"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', color: 'white' }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Now in open beta
              </motion.div>

              <h2
                className="mb-5 text-white"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  lineHeight: 1.06,
                }}
              >
                Be one of the first.
                <br />
                <span style={{ opacity: 0.82 }}>It&apos;s completely free.</span>
              </h2>

              <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.72 }}>
                We&apos;re doing an open beta test — feel free to sign up, explore every feature,
                and help shape what BookedUp becomes. No risk, no credit card, just early access.
              </p>

              <Link href="/signup">
                <motion.button
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold"
                  style={{ background: 'white', color: ORANGE, boxShadow: '0 4px 24px rgba(0,0,0,0.14)' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 36px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign up for free
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>

              <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Free during beta · No credit card · Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 md:px-10 pb-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={22} />
            <span className="text-sm font-bold" style={{ color: TEXT }}>
              Booked
              <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Up
              </span>
            </span>
          </div>
          <p className="text-xs" style={{ color: DIM }}>© 2026 BookedUp. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <a
                key={item}
                href="#"
                className="text-xs transition-colors"
                style={{ color: DIM }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TEXT)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = DIM)}
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
