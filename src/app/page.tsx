'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Instagram,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Star,
} from 'lucide-react';

/* ─── Design tokens ──────────────────────────────────────────── */
const D = {
  /* hero dark */
  dark: '#0c0a08',
  darkCard: 'rgba(255,255,255,0.04)',
  darkBorder: 'rgba(255,255,255,0.09)',
  darkText: '#f5f0ea',
  darkDim: 'rgba(245,240,234,0.5)',
  /* body cream */
  bg: '#f6f1eb',
  panel: '#fffdfa',
  panelSoft: '#f0e9e0',
  border: '#dfd3c5',
  text: '#171411',
  dim: '#6f655d',
  /* accent */
  accent: '#df6f38',
  accentSoft: '#f6d8c6',
  accentStrong: '#b84f1d',
  teal: '#1f7a72',
  gold: '#b7822f',
};

/* ─── Conversation thread data ───────────────────────────────── */
const THREAD = [
  { from: 'client', text: "Hey! Do you have anything open this Saturday? Looking for a soft gel full set 💅", time: '2:11 PM' },
  { from: 'ai',     text: "Hey Ariana! Saturday 2:00 PM is available. Soft gel full set is $95 and takes about 75 min. Want me to hold that slot for you?", time: '2:11 PM' },
  { from: 'client', text: "Yes please! That works perfect 🙏", time: '2:12 PM' },
  { from: 'ai',     text: "Done — Saturday 2 PM is locked in! Based on your last visit I also added cuticle care for $18. I'll send the deposit link now.", time: '2:12 PM' },
  { from: 'client', text: "Omg yes add that, thank you!!", time: '2:13 PM' },
  { from: 'ai',     text: "All set! Deposit link sent. You'll get a reminder Friday evening. See you Saturday 🎀", time: '2:13 PM' },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Reply instantly, in your voice',
    desc: 'Rezerve answers every DM and text as if you typed it yourself — quotes your exact pricing, checks your real availability, and pushes to confirm.',
    color: D.accent,
    bg: 'rgba(223,111,56,0.08)',
  },
  {
    icon: CalendarDays,
    title: 'Deposits and reminders, automatic',
    desc: 'Every booking triggers a deposit request, confirmation, and two reminders without you lifting a finger. Open slots stay sold.',
    color: D.teal,
    bg: 'rgba(31,122,114,0.08)',
  },
  {
    icon: TrendingUp,
    title: 'Upsells at exactly the right moment',
    desc: 'After intent is clear, Rezerve surfaces one relevant add-on based on the client\'s history — before they drop out of the thread.',
    color: D.gold,
    bg: 'rgba(183,130,47,0.08)',
  },
  {
    icon: ShieldCheck,
    title: 'You stay in control',
    desc: 'Review any conversation, set approval rules per service or price threshold, and override the AI any time. You define the guardrails.',
    color: '#7c6fcd',
    bg: 'rgba(124,111,205,0.08)',
  },
];

const TESTIMONIALS = [
  {
    quote: "Before Rezerve, I was losing bookings every week to DMs I saw too late. Now my calendar fills itself while I'm at the table.",
    name: 'Maya K.',
    role: 'Nail Artist · Austin, TX',
    stars: 5,
  },
  {
    quote: "The AI replies sound exactly like me. Clients have no idea, and they're booking faster than before. My no-show rate dropped in half.",
    name: 'Priya S.',
    role: 'Lash Studio Owner · New York, NY',
    stars: 5,
  },
  {
    quote: 'Setup took 20 minutes. I connected Instagram, added my services, and walked away. Now I check the calendar instead of my DMs.',
    name: 'Jordan R.',
    role: 'Independent Stylist · Los Angeles, CA',
    stars: 5,
  },
];

/* ─── Logo ───────────────────────────────────────────────────── */
function Logo({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  const id = `logo-${size}-${dark ? 'd' : 'l'}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#df6f38" />
          <stop offset="1" stopColor="#b84f1d" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill={`url(#${id})`} />
      <rect x="8" y="12" width="16" height="12" rx="2.5" fill="white" fillOpacity="0.95" />
      <rect x="8" y="10" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.6" />
      <rect x="12" y="8" width="3" height="5" rx="1.5" fill="white" />
      <rect x="17" y="8" width="3" height="5" rx="1.5" fill="white" />
      <path d="M12 18.5l2.5 2.5 5.5-6" stroke="#b84f1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Nav ────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDark = !scrolled;

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(246,241,235,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${D.border}` : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={28} dark={isDark} />
          <span
            className="text-[14px] font-bold tracking-[0.14em] uppercase"
            style={{ color: isDark ? D.darkText : D.text }}
          >
            Rezerve
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {[
            { label: 'Platform', href: '#platform' },
            { label: 'Workflow', href: '#workflow' },
            { label: 'FAQ', href: '#faq' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[13px] font-medium transition-opacity hover:opacity-70"
              style={{ color: isDark ? D.darkDim : D.dim }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="px-4 py-2 text-[13px] font-medium rounded-full transition-all hover:opacity-70"
            style={{ color: isDark ? D.darkDim : D.dim }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #df6f38, #b84f1d)',
              boxShadow: '0 4px 16px rgba(184,79,29,0.3)',
            }}
          >
            Start free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="md:hidden"
          style={{ color: isDark ? D.darkText : D.text }}
          onClick={() => setOpen(v => !v)}
        >
          <div className="space-y-[5px]">
            <span
              className="block h-px w-[22px]"
              style={{ background: 'currentColor', transition: 'transform 0.2s', transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }}
            />
            <span
              className="block h-px w-[22px]"
              style={{ background: 'currentColor', transition: 'opacity 0.2s', opacity: open ? 0 : 1 }}
            />
            <span
              className="block h-px w-[22px]"
              style={{ background: 'currentColor', transition: 'transform 0.2s', transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }}
            />
          </div>
        </button>
      </div>

      {open && (
        <div
          className="border-t px-6 py-5 md:hidden"
          style={{ background: D.panel, borderColor: D.border }}
        >
          <div className="flex flex-col gap-4">
            {[
              { label: 'Platform', href: '#platform' },
              { label: 'Workflow', href: '#workflow' },
              { label: 'FAQ', href: '#faq' },
            ].map(item => (
              <Link key={item.label} href={item.href} className="text-[14px]" style={{ color: D.dim }}>
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-3">
              <Link
                href="/login"
                className="flex-1 rounded-full border px-4 py-2.5 text-center text-[13px] font-medium"
                style={{ borderColor: D.border, color: D.text }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex-1 rounded-full px-4 py-2.5 text-center text-[13px] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #df6f38, #b84f1d)' }}
              >
                Start free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Conversation widget ────────────────────────────────────── */
function ConversationWidget() {
  return (
    <div className="relative w-full max-w-[520px] mx-auto">
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: '-60px -40px',
          background:
            'radial-gradient(ellipse at 35% 55%, rgba(223,111,56,0.2), transparent 52%), radial-gradient(ellipse at 72% 25%, rgba(31,122,114,0.13), transparent 44%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Card */}
      <div
        className="relative overflow-hidden rounded-[26px]"
        style={{
          background: 'rgba(255,253,250,0.98)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 40px 96px rgba(0,0,0,0.5), 0 0 0 1px rgba(223,111,56,0.08)',
        }}
      >
        {/* Chrome bar */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ background: D.panel, borderBottom: `1px solid ${D.border}` }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fc685d' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fdbc41' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#33c748' }} />
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              <Instagram className="w-3.5 h-3.5" style={{ color: '#c13584' }} />
              <span className="text-[12px] font-semibold" style={{ color: D.text }}>Ariana M.</span>
              <span className="text-[11px]" style={{ color: D.dim }}>· Instagram DM</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#34d399', boxShadow: '0 0 5px rgba(52,211,153,0.9)', animation: 'pulse 2s infinite' }}
            />
            <span className="text-[11px] font-semibold" style={{ color: D.teal }}>AI handling</span>
          </div>
        </div>

        {/* Message thread */}
        <div className="px-4 py-5 space-y-4">
          {THREAD.map((msg, i) => {
            const isClient = msg.from === 'client';
            return (
              <div
                key={i}
                className={`flex items-end gap-2.5 ${isClient ? 'justify-end' : 'justify-start'}`}
                style={{
                  animation: 'fadeUp 0.5s ease both',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {/* AI avatar */}
                {!isClient && (
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #df6f38, #b84f1d)',
                      boxShadow: '0 2px 8px rgba(184,79,29,0.3)',
                      marginBottom: 18,
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`} style={{ maxWidth: '78%' }}>
                  <div
                    className="px-4 py-2.5 text-[13px] leading-[1.55]"
                    style={isClient ? {
                      background: D.panelSoft,
                      border: `1px solid ${D.border}`,
                      borderRadius: '18px 18px 4px 18px',
                      color: D.text,
                    } : {
                      background: '#171411',
                      borderRadius: '18px 18px 18px 4px',
                      color: '#f5f0ea',
                    }}
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`flex items-center gap-1 mt-1 text-[10px] ${isClient ? 'flex-row-reverse' : ''}`}
                    style={{ color: D.dim }}
                  >
                    {!isClient && <Sparkles className="w-2.5 h-2.5" style={{ color: D.accent }} />}
                    <span>{isClient ? 'Ariana' : 'Rezerve AI'} · {msg.time}</span>
                  </div>
                </div>

                {/* Client avatar */}
                {isClient && (
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
                    style={{
                      background: D.accentSoft,
                      color: D.accentStrong,
                      marginBottom: 18,
                    }}
                  >
                    A
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Booking confirmation card */}
        <div
          className="mx-4 mb-4 rounded-[18px] p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(31,122,114,0.06), rgba(31,122,114,0.03))',
            border: '1px solid rgba(31,122,114,0.18)',
            animation: 'fadeUp 0.5s ease both',
            animationDelay: '0.56s',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: D.teal }} />
              <span className="text-[13px] font-bold" style={{ color: D.text }}>Booking confirmed</span>
            </div>
            <span
              className="text-[12px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(31,122,114,0.1)', color: D.teal }}
            >
              +$113
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Service', value: 'Soft gel + cuticle care' },
              { label: 'Date', value: 'Saturday, 2:00 PM' },
              { label: 'Deposit', value: 'Collected · $30' },
              { label: 'Reminder', value: 'Fri 6 PM · auto-sent' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: D.dim }}>{label}</p>
                <p className="text-[12px] font-semibold" style={{ color: D.text }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: `1px solid ${D.border}`, background: D.panelSoft }}
        >
          <span className="text-[11px]" style={{ color: D.dim }}>Handled by AI in 0.4s</span>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" style={{ color: D.teal }} />
            <span className="text-[11px] font-semibold" style={{ color: D.teal }}>Calendar updated</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat counter ───────────────────────────────────────────── */
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || started.current) return;
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const begin = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const p = Math.min((now - begin) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(value * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main>
      <style>{`
        @keyframes progressFill {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.22s; }
        .fade-up-3 { animation-delay: 0.34s; }
        .fade-up-4 { animation-delay: 0.46s; }
      `}</style>

      <Nav />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col justify-center overflow-hidden px-6 pt-24 pb-20"
        style={{ background: D.dark }}
      >
        {/* Background mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              'radial-gradient(ellipse at 12% 40%, rgba(223,111,56,0.18), transparent 38%)',
              'radial-gradient(ellipse at 88% 25%, rgba(31,122,114,0.12), transparent 35%)',
              'radial-gradient(ellipse at 55% 90%, rgba(183,130,47,0.08), transparent 40%)',
            ].join(', '),
          }}
        />
        {/* Noise overlay for texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px',
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_1fr]">

            {/* Left copy */}
            <div>
              <div
                className="fade-up inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] mb-8"
                style={{
                  borderColor: 'rgba(223,111,56,0.3)',
                  background: 'rgba(223,111,56,0.08)',
                  color: '#df6f38',
                }}
              >
                <Zap className="h-3 w-3" />
                AI booking for service pros
              </div>

              <h1
                className="fade-up fade-up-1 text-[52px] font-bold leading-[1.0] tracking-[-0.04em] md:text-[68px] lg:text-[60px] xl:text-[72px]"
                style={{ color: D.darkText, fontFamily: 'var(--font-display)' }}
              >
                Stop leaving
                <br />
                bookings in
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #df6f38, #f0a06a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  your DMs.
                </span>
              </h1>

              <p
                className="fade-up fade-up-2 mt-7 text-[17px] leading-[1.7] max-w-lg"
                style={{ color: D.darkDim }}
              >
                Rezerve reads the message, quotes your service, books the slot, collects the deposit, and sends the reminder — while you're with a client.
              </p>

              <div className="fade-up fade-up-3 mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold text-white transition-all hover:opacity-90 hover:translate-y-[-1px]"
                  style={{
                    background: 'linear-gradient(135deg, #df6f38, #b84f1d)',
                    boxShadow: '0 8px 24px rgba(184,79,29,0.4)',
                  }}
                >
                  Start free — no card needed
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#platform"
                  className="inline-flex items-center justify-center gap-2 rounded-full border px-7 py-3.5 text-[14px] font-medium transition-all hover:opacity-80"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: D.darkDim,
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  See how it works
                </Link>
              </div>

              {/* Stat pills */}
              <div className="fade-up fade-up-4 mt-10 flex flex-wrap gap-3">
                {[
                  { n: 24, suffix: '/7', label: 'response coverage' },
                  { n: 5, suffix: ' min', label: 'setup' },
                  { n: 3, suffix: 'x', label: 'less follow-up' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      className="text-[22px] font-bold tracking-[-0.03em] leading-none"
                      style={{ color: D.darkText }}
                    >
                      <Counter value={stat.n} suffix={stat.suffix} />
                    </div>
                    <p className="text-[11px] mt-1 uppercase tracking-[0.1em]" style={{ color: D.darkDim }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right widget */}
            <div
              className="fade-up fade-up-2"
              style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}
            >
              <LiveWidget />
            </div>
          </div>
        </div>

        {/* Bottom fade to cream */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent, ${D.bg})`,
          }}
        />
      </section>

      {/* ── SOCIAL PROOF BAR ──────────────────────────────────── */}
      <section style={{ background: D.bg }}>
        <div
          className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderBottom: `1px solid ${D.border}` }}
        >
          <p className="text-[13px]" style={{ color: D.dim }}>
            Trusted by independent artists and studios across 40+ cities
          </p>
          <div className="flex items-center gap-6">
            {[
              { icon: Instagram, label: 'Instagram DMs' },
              { icon: Phone, label: 'SMS / Text' },
              { icon: MessageSquare, label: 'Website chat' },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-1.5 text-[12px]" style={{ color: D.dim }}>
                <c.icon className="h-3.5 w-3.5" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="platform" style={{ background: D.bg }}>
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mb-14 max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-4" style={{ color: D.accent }}>
              Platform
            </p>
            <h2
              className="text-[38px] font-bold tracking-[-0.04em] leading-[1.08] md:text-[52px]"
              style={{ fontFamily: 'var(--font-display)', color: D.text }}
            >
              Everything a booking needs. Nothing it doesn't.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="rounded-[24px] p-6 group transition-all hover:translate-y-[-2px]"
                style={{
                  background: D.panel,
                  border: `1px solid ${D.border}`,
                  boxShadow: '0 1px 0 rgba(255,253,250,0.9) inset',
                }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl mb-5"
                  style={{ background: f.bg }}
                >
                  <f.icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-[17px] font-semibold mb-2.5 leading-snug" style={{ color: D.text }}>
                  {f.title}
                </h3>
                <p className="text-[14px] leading-[1.7]" style={{ color: D.dim }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHANNELS ──────────────────────────────────────────── */}
      <section
        className="px-6 py-20 md:py-24"
        style={{ background: D.panelSoft, borderTop: `1px solid ${D.border}`, borderBottom: `1px solid ${D.border}` }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-4" style={{ color: D.accent }}>
                Channels
              </p>
              <h2
                className="text-[34px] font-bold tracking-[-0.04em] leading-[1.1] mb-5 md:text-[42px]"
                style={{ fontFamily: 'var(--font-display)', color: D.text }}
              >
                One layer across every message source.
              </h2>
              <p className="text-[15px] leading-[1.7]" style={{ color: D.dim }}>
                Clients can start on Instagram, switch to text, and still land in the same scheduling flow with consistent pricing and instant confirmations.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Instagram, label: 'Instagram DMs', note: 'Capture leads where discovery happens.', color: '#e1306c', bg: 'rgba(225,48,108,0.07)' },
                { icon: Phone, label: 'SMS / Text', note: 'Keep confirmations and reminders direct.', color: D.teal, bg: 'rgba(31,122,114,0.07)' },
                { icon: MessageSquare, label: 'Website widget', note: 'Convert traffic without manual work.', color: D.accent, bg: D.accentSoft },
                { icon: Users, label: 'Waitlist fill', note: 'Refill cancelled slots before they go cold.', color: D.gold, bg: 'rgba(183,130,47,0.07)' },
              ].map(item => (
                <div
                  key={item.label}
                  className="rounded-[22px] p-5 transition-all hover:translate-y-[-1px]"
                  style={{
                    background: D.panel,
                    border: `1px solid ${D.border}`,
                    boxShadow: '0 2px 12px rgba(99,72,43,0.05)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                    style={{ background: item.bg }}
                  >
                    <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" style={{ color: item.color }} />
                  </div>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: D.text }}>{item.label}</p>
                  <p className="text-[13px] leading-[1.6]" style={{ color: D.dim }}>{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ──────────────────────────────────────────── */}
      <section id="workflow" className="px-6 py-20 md:py-28" style={{ background: D.bg }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-4" style={{ color: D.accent }}>
              Workflow
            </p>
            <h2
              className="text-[38px] font-bold tracking-[-0.04em] leading-[1.08] md:text-[48px]"
              style={{ fontFamily: 'var(--font-display)', color: D.text }}
            >
              Three steps. Then it runs itself.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                n: '01',
                title: 'Capture intent',
                desc: 'Rezerve reads the first message and extracts service, timing preference, and channel — instantly.',
                color: D.accent,
                bg: D.accentSoft,
              },
              {
                n: '02',
                title: 'Offer the best slot',
                desc: 'It checks your real calendar, matches service duration, and proposes a specific time with pricing. No back-and-forth.',
                color: D.teal,
                bg: 'rgba(31,122,114,0.1)',
              },
              {
                n: '03',
                title: 'Confirm and retain',
                desc: 'Deposit collected, reminder scheduled, next-visit nudge queued for post-checkout. The loop closes by itself.',
                color: D.gold,
                bg: 'rgba(183,130,47,0.1)',
              },
            ].map((step, i) => (
              <div
                key={step.n}
                className="rounded-[28px] p-8 relative overflow-hidden"
                style={{
                  background: D.panel,
                  border: `1px solid ${D.border}`,
                  boxShadow: '0 4px 20px rgba(99,72,43,0.06)',
                }}
              >
                <div
                  className="absolute top-0 right-0 text-[80px] font-bold leading-none select-none pointer-events-none"
                  style={{
                    color: 'rgba(0,0,0,0.04)',
                    fontFamily: 'var(--font-display)',
                    lineHeight: 1,
                    transform: 'translate(8px, -8px)',
                  }}
                >
                  {step.n}
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-bold mb-6"
                  style={{ background: step.bg, color: step.color }}
                >
                  {step.n}
                </div>
                <h3 className="text-[20px] font-bold mb-3 tracking-[-0.02em]" style={{ color: D.text }}>
                  {step.title}
                </h3>
                <p className="text-[14px] leading-[1.7]" style={{ color: D.dim }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section
        className="px-6 py-20 md:py-24"
        style={{ background: D.dark, borderTop: `1px solid rgba(255,255,255,0.04)` }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3" style={{ color: D.accent }}>
              Stories
            </p>
            <h2
              className="text-[34px] font-bold tracking-[-0.04em] md:text-[44px]"
              style={{ fontFamily: 'var(--font-display)', color: D.darkText }}
            >
              Real results, real studios.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                className="rounded-[24px] p-7 flex flex-col"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: D.gold }} />
                  ))}
                </div>
                <p className="text-[15px] leading-[1.7] flex-1 mb-6" style={{ color: D.darkDim }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: D.darkText }}>{t.name}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: 'rgba(245,240,234,0.35)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section id="faq" className="px-6 py-20 md:py-24" style={{ background: D.bg }}>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-4" style={{ color: D.accent }}>
                FAQ
              </p>
              <h2
                className="text-[34px] font-bold tracking-[-0.04em] leading-[1.1] md:text-[42px]"
                style={{ fontFamily: 'var(--font-display)', color: D.text }}
              >
                Questions before you commit.
              </h2>
              <p className="mt-4 text-[14px] leading-[1.7]" style={{ color: D.dim }}>
                Rezerve is built to stay out of your way — and out of your clients' way.
              </p>
            </div>

            <div className="space-y-0">
              {[
                ['Can I review messages before they send?', 'Yes. Fully automate common flows, or require your approval for specific services, price thresholds, or new clients. You set the rules.'],
                ['How does deposit collection work?', 'Rezerve sends a payment link after the client confirms. If the deposit isn\'t collected within your grace window, the slot stays open automatically.'],
                ['Does it replace my booking software?', 'Think of it as the front of the funnel — it converts inbound messages into confirmed slots, then hands off to your existing calendar or booking tool.'],
                ['What happens when I\'m mid-appointment?', 'The AI handles the inbox. You review the log when you come up for air. Edge cases queue for your attention without bothering the client.'],
              ].map(([q, a], i) => (
                <FaqItem key={i} q={q} a={a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section
        className="relative px-6 py-20 md:py-28 overflow-hidden"
        style={{ background: D.dark }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              'radial-gradient(ellipse at 30% 50%, rgba(223,111,56,0.2), transparent 50%)',
              'radial-gradient(ellipse at 75% 40%, rgba(31,122,114,0.12), transparent 45%)',
            ].join(', '),
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-5" style={{ color: D.accent }}>
            Get started
          </p>
          <h2
            className="text-[40px] font-bold tracking-[-0.04em] leading-[1.06] mb-5 md:text-[56px]"
            style={{ fontFamily: 'var(--font-display)', color: D.darkText }}
          >
            Start with your busiest inbox.
          </h2>
          <p className="text-[16px] leading-[1.7] mb-10 max-w-xl mx-auto" style={{ color: D.darkDim }}>
            Connect one channel, watch it book appointments, then expand. Setup takes five minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-semibold text-white transition-all hover:opacity-90 hover:translate-y-[-1px]"
              style={{
                background: 'linear-gradient(135deg, #df6f38, #b84f1d)',
                boxShadow: '0 8px 32px rgba(184,79,29,0.4)',
              }}
            >
              Start free — no card needed
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-8 py-4 text-[15px] font-medium transition-all hover:opacity-80"
              style={{
                borderColor: 'rgba(255,255,255,0.12)',
                color: D.darkDim,
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer
        className="px-6 py-10"
        style={{
          background: '#080705',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo size={24} dark />
            <span className="text-[13px] font-bold tracking-[0.14em] uppercase" style={{ color: D.darkDim }}>
              Rezerve
            </span>
            <span className="text-[12px] ml-2" style={{ color: 'rgba(245,240,234,0.2)' }}>
              © 2025
            </span>
          </div>
          <div className="flex gap-6 text-[13px]" style={{ color: 'rgba(245,240,234,0.3)' }}>
            <Link href="#" className="hover:opacity-70 transition-opacity">Privacy</Link>
            <Link href="#" className="hover:opacity-70 transition-opacity">Terms</Link>
            <Link href="#" className="hover:opacity-70 transition-opacity">Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── FAQ accordion item ─────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${D.border}` }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-[16px] font-semibold" style={{ color: D.text }}>{q}</span>
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform"
          style={{
            background: D.accentSoft,
            color: D.accentStrong,
            transform: open ? 'rotate(45deg)' : 'none',
          }}
        >
          <span className="text-[14px] font-bold leading-none">+</span>
        </div>
      </button>
      {open && (
        <p className="pb-5 text-[14px] leading-[1.75]" style={{ color: D.dim }}>
          {a}
        </p>
      )}
    </div>
  );
}
