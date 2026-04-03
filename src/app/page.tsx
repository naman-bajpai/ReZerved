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
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ────────────────────────────────────────────────────────────
   Animated booking-grid hero visual
   A 7-col × 9-row calendar where cells light up like bookings
   being filled in by AI in real time.
──────────────────────────────────────────────────────────── */
const FILLED = new Set([1,2,4,8,9,11,15,16,18,22,23,25,29,30,32,36,38,43,44,50,51,56,57,58,60,61]);
const PULSING = [5, 12, 19, 26, 33, 40, 47, 54, 62];

function BookingGrid() {
  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-7 gap-1 mb-2.5">
        {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium tracking-wide" style={{ color: 'var(--text-dim)' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 63 }, (_, i) => {
          const filled = FILLED.has(i);
          const pulsing = PULSING.includes(i);
          return (
            <motion.div
              key={i}
              className="h-8 rounded-md relative overflow-hidden"
              style={{
                background: filled
                  ? 'rgba(124,58,237,0.5)'
                  : pulsing
                    ? 'rgba(124,58,237,0.12)'
                    : 'rgba(255,255,255,0.03)',
                border: filled
                  ? '1px solid rgba(167,139,250,0.35)'
                  : pulsing
                    ? '1px solid rgba(124,58,237,0.3)'
                    : '1px solid rgba(255,255,255,0.05)',
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.012, duration: 0.3, ease: 'easeOut' }}
            >
              {pulsing && (
                <motion.div
                  className="absolute inset-0 rounded-md"
                  style={{ background: 'rgba(124,58,237,0.4)' }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  transition={{
                    duration: 2.2,
                    delay: PULSING.indexOf(i) * 0.7,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              )}
              {filled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-violet-300/60" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* Floating notification card that slides in */
function BookingNotif({ name, service, price, delay }: { name: string; service: string; price: string; delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
      style={{
        background: 'var(--ink-3)',
        border: '1px solid var(--ink-border)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.2)' }}>
        <CalendarDays className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-none" style={{ color: 'var(--ivory)' }}>{name}</p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{service}</p>
      </div>
      <span className="ml-auto text-xs font-bold shrink-0" style={{ color: '#a78bfa' }}>{price}</span>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Fade-up section wrapper
──────────────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Feature card
──────────────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon, title, desc, delay,
}: { icon: React.ElementType; title: string; desc: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <div
        className="rounded-2xl p-6 h-full transition-colors group"
        style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-border)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
        >
          <Icon className="w-5 h-5" style={{ color: '#a78bfa' }} strokeWidth={1.8} />
        </div>
        <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--ivory)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>{desc}</p>
      </div>
    </FadeUp>
  );
}

/* ────────────────────────────────────────────────────────────
   Main landing page
──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--ink)' }}>

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{
          borderBottom: '1px solid var(--ink-border)',
          backdropFilter: 'blur(16px)',
          background: 'rgba(9,9,15,0.85)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--violet)' }}>
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--ivory)' }}>BookedUp</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Blog'].map((item) => (
            <a key={item} href="#" className="text-sm transition-colors" style={{ color: 'var(--text-dim)' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'var(--ivory)')}
               onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="text-sm px-4 py-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-dim)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ivory)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
              Sign in
            </button>
          </Link>
          <Link href="/signup">
            <button
              className="text-sm px-4 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--violet)', color: '#fff' }}
            >
              Get started
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 overflow-hidden">
        {/* Background glow blobs */}
        <div
          className="pointer-events-none absolute top-0 right-[10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-[5%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(76,29,149,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                style={{
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: '#a78bfa',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                AI-powered revenue optimization
              </div>
            </motion.div>

            <motion.h1
              className="mb-6 leading-[1.1] tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
                color: 'var(--ivory)',
                fontStyle: 'italic',
                fontWeight: 600,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              Turn your calendar<br />
              <span style={{ color: '#a78bfa' }}>into a revenue</span><br />
              machine.
            </motion.h1>

            <motion.p
              className="text-base leading-relaxed mb-8 max-w-md"
              style={{ color: 'var(--text-dim)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              BookedUp uses AI to fill gaps in your schedule, recover
              no-shows, and surface your most profitable clients —
              all on autopilot.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3 mb-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link href="/signup">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:translate-y-[-1px] active:translate-y-0"
                  style={{ background: 'var(--violet)', color: '#fff', boxShadow: '0 0 24px rgba(124,58,237,0.35)' }}
                >
                  Start free trial
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: 'var(--ink-3)',
                  border: '1px solid var(--ink-border)',
                  color: 'var(--ivory)',
                }}
              >
                Watch demo
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              {[
                { icon: CheckCircle2, text: 'No credit card required' },
                { icon: Shield, text: 'SOC 2 compliant' },
                { icon: Star, text: '4.9 / 5 from 800+ reviews' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: '#a78bfa' }} />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: animated product visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="rounded-2xl p-5 relative"
              style={{
                background: 'var(--ink-2)',
                border: '1px solid var(--ink-border)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
              }}
            >
              {/* Mini header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--ivory)' }}>April 2026</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>AI filling your schedule</p>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Live
                </div>
              </div>

              <BookingGrid />

              {/* Floating notification cards */}
              <div className="mt-4 space-y-2">
                <BookingNotif name="Sarah M." service="Haircut + Color · 2h" price="+$165" delay={1.2} />
                <BookingNotif name="James T." service="Deep Tissue Massage · 1h" price="+$90" delay={1.8} />
              </div>

              {/* Revenue pill */}
              <motion.div
                className="absolute -top-4 -right-4 px-3.5 py-2 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                  boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
                }}
                initial={{ opacity: 0, y: 8, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: -3 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <p className="text-[10px] font-medium text-violet-200">This week</p>
                <p className="text-lg font-bold text-white leading-none mt-0.5">+$1,840</p>
              </motion.div>
            </div>

            {/* Glow behind card */}
            <div
              className="absolute inset-0 -z-10 rounded-2xl"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, transparent 70%)',
                filter: 'blur(24px)',
                transform: 'translateY(20px)',
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <FadeUp>
        <div
          className="mx-6 md:mx-12 rounded-2xl px-8 py-6 mb-20"
          style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-border)' }}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x"
            style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
            {[
              { value: '$2.4M+', label: 'Revenue generated' },
              { value: '47K+',   label: 'Bookings processed' },
              { value: '2,400+', label: 'Active businesses' },
              { value: '43%',    label: 'Avg revenue increase' },
            ].map(({ value, label }, i) => (
              <div key={label} className={`${i > 0 ? 'pt-6 md:pt-0 md:pl-6' : ''} text-center md:text-left`}>
                <p
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: '#a78bfa', fontStyle: 'italic' }}
                >
                  {value}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* ── Features ── */}
      <section className="px-6 md:px-12 mb-24">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>
              Everything you need
            </p>
            <h2
              className="text-3xl md:text-4xl"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                color: 'var(--ivory)',
                fontWeight: 600,
              }}
            >
              Built for service professionals
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={CalendarDays}
              title="Smart AI Scheduling"
              desc="BookedUp spots empty slots and proactively messages clients to fill them — before you even notice the gap."
              delay={0}
            />
            <FeatureCard
              icon={Users}
              title="Client Intelligence"
              desc="Know exactly who your top earners are, how often they book, and when to expect them back."
              delay={0.1}
            />
            <FeatureCard
              icon={BarChart3}
              title="Revenue Analytics"
              desc="Real-time breakdowns of what services, days, and channels are driving the most income."
              delay={0.2}
            />
            <FeatureCard
              icon={TrendingUp}
              title="No-Show Recovery"
              desc="Automated follow-ups that re-book no-shows and turn missed appointments into rescheduled revenue."
              delay={0.3}
            />
            <FeatureCard
              icon={Zap}
              title="Instant Booking Links"
              desc="Share a link on Instagram, WhatsApp, or anywhere. Clients book in seconds, you get notified instantly."
              delay={0.4}
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Compliant"
              desc="SOC 2 Type II, GDPR-ready, and encrypted end-to-end. Your clients' data is safe with us."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 md:px-12 mb-24">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-12 text-center">
            <h2
              className="text-3xl md:text-4xl"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                color: 'var(--ivory)',
                fontWeight: 600,
              }}
            >
              Up and running in 5 minutes
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect', desc: 'Link your existing calendar, Instagram DMs, or WhatsApp business account.' },
              { step: '02', title: 'Optimize', desc: 'AI analyzes your schedule, pricing, and client patterns to spot opportunities.' },
              { step: '03', title: 'Grow', desc: 'Watch your calendar fill up and revenue climb without lifting a finger.' },
            ].map(({ step, title, desc }, i) => (
              <FadeUp key={step} delay={i * 0.1}>
                <div className="flex gap-5">
                  <div
                    className="text-3xl font-bold shrink-0 leading-none"
                    style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'rgba(124,58,237,0.3)' }}
                  >
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1.5" style={{ color: 'var(--ivory)' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>{desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 md:px-12 mb-24">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-10 text-center">
            <h2
              className="text-2xl md:text-3xl"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                color: 'var(--ivory)',
                fontWeight: 600,
              }}
            >
              Loved by service pros worldwide
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: "I went from 60% to 92% calendar utilization in one month. BookedUp pays for itself ten times over.",
                name: "Amara Chen",
                role: "Hair Stylist, Brooklyn NY",
              },
              {
                quote: "The no-show recovery alone recovered $800 last month. I didn't even know that money was on the table.",
                name: "Marcus Rivera",
                role: "Personal Trainer, LA",
              },
              {
                quote: "Finally a tool that understands service businesses. The client frequency alerts are game-changing.",
                name: "Priya Mehta",
                role: "Esthetician, Chicago",
              },
            ].map(({ quote, name, role }, i) => (
              <FadeUp key={name} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-6 h-full"
                  style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-border)' }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: '#a78bfa' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--ivory)', opacity: 0.85 }}>
                    "{quote}"
                  </p>
                  <div className="flex items-center gap-3">
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
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <FadeUp>
        <section className="px-6 md:px-12 pb-24">
          <div
            className="max-w-7xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 50%, #0c0c1a 100%)',
              border: '1px solid rgba(124,58,237,0.3)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.3) 0%, transparent 60%)',
              }}
            />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#a78bfa' }}>
                Ready to grow?
              </p>
              <h2
                className="text-3xl md:text-5xl mb-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  color: 'var(--ivory)',
                  fontWeight: 700,
                }}
              >
                Fill your calendar.<br />Keep it full.
              </h2>
              <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'rgba(240,236,226,0.6)' }}>
                Join 2,400+ service professionals who use BookedUp to earn more without working more.
              </p>
              <Link href="/signup">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:translate-y-[-1px]"
                  style={{
                    background: 'var(--ivory)',
                    color: 'var(--ink)',
                    boxShadow: '0 0 32px rgba(240,236,226,0.15)',
                  }}
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ── Footer ── */}
      <footer
        className="px-6 md:px-12 pb-8 pt-6"
        style={{ borderTop: '1px solid var(--ink-border)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--violet)' }}>
              <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--ivory)' }}>BookedUp</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            © 2026 BookedUp. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <a key={item} href="#" className="text-xs transition-colors" style={{ color: 'var(--text-dim)' }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
