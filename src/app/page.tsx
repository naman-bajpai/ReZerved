'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ElementType } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Instagram,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

const C = {
  bg: '#f6f1eb',
  panel: '#fffdfa',
  panelSoft: '#f2ebe3',
  border: '#dfd3c5',
  text: '#171411',
  dim: '#6f655d',
  accent: '#df6f38',
  accentSoft: '#f6d8c6',
  accentStrong: '#b84f1d',
  teal: '#1f7a72',
  gold: '#b7822f',
};

const BOARD_STEPS = [
  {
    label: 'New DM captured',
    customer: 'Ariana',
    service: 'Soft gel full set',
    time: 'Today, 2:14 PM',
    reply: 'Saturday 2:00 PM is open. Full set with removal is 95 and takes 75 min. Want me to reserve it?',
    outcome: 'Awaiting confirmation',
    revenue: '+$95',
  },
  {
    label: 'AI follow-up sent',
    customer: 'Ariana',
    service: 'Soft gel full set',
    time: 'Today, 2:15 PM',
    reply: 'Locked. I also suggested cuticle treatment for 18 based on her last visit.',
    outcome: 'Upsell offered',
    revenue: '+$113',
  },
  {
    label: 'Booking confirmed',
    customer: 'Ariana',
    service: 'Soft gel + treatment',
    time: 'Saturday, 2:00 PM',
    reply: 'Appointment confirmed. Reminder and deposit request were sent automatically.',
    outcome: 'Calendar updated',
    revenue: '+$113',
  },
];

const FEATURE_CARDS = [
  {
    icon: MessageSquare,
    title: 'Reply instantly',
    desc: 'BookedUp answers DMs and texts in your tone, quotes services correctly, and moves straight to a confirmed slot.',
  },
  {
    icon: CalendarDays,
    title: 'Protect the calendar',
    desc: 'Deposits, reminders, confirmations, and waitlist fills run automatically so open time gets sold instead of wasted.',
  },
  {
    icon: TrendingUp,
    title: 'Lift ticket size',
    desc: 'Suggested add-ons appear at the right moment, after intent is clear and before the client drops out.',
  },
  {
    icon: ShieldCheck,
    title: 'Stay in control',
    desc: 'You can review conversations, approve edge cases, and keep every workflow inside simple operating rules.',
  },
];

const PROCESS_STEPS = [
  {
    title: 'Capture intent',
    desc: 'Pull service, timing, and platform context from the first message.',
  },
  {
    title: 'Offer the best slot',
    desc: 'Match real availability, service length, and pricing without back-and-forth.',
  },
  {
    title: 'Confirm and retain',
    desc: 'Send reminders, deposits, and next-booking nudges after checkout.',
  },
];

function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bookedup-logo" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#df6f38" />
          <stop offset="1" stopColor="#b84f1d" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="32" height="32" rx="11" fill="url(#bookedup-logo)" />
      <rect x="9" y="12" width="18" height="13" rx="3" fill="#fffdfa" />
      <rect x="9" y="10" width="18" height="5" rx="2.5" fill="#f4d4c0" />
      <path d="M13.5 18.5 16.5 21.5 22.5 15.5" stroke="#b84f1d" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(246,241,235,0.84)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <span className="text-[15px] font-semibold tracking-[0.12em] uppercase" style={{ color: C.text }}>
            BookedUp
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: 'Platform', href: '#platform' },
            { label: 'Workflow', href: '#workflow' },
            { label: 'FAQ', href: '#faq' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="text-[14px]" style={{ color: C.dim }}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="px-4 py-2 text-[14px]" style={{ color: C.dim }}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium text-white"
            style={{ background: C.accent }}
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="md:hidden"
          style={{ color: C.text }}
          onClick={() => setOpen(value => !value)}
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t px-6 py-5 md:hidden" style={{ background: C.panel, borderColor: C.border }}>
          <div className="flex flex-col gap-4">
            <Link href="#platform" style={{ color: C.dim }}>Platform</Link>
            <Link href="#workflow" style={{ color: C.dim }}>Workflow</Link>
            <Link href="#faq" style={{ color: C.dim }}>FAQ</Link>
            <div className="mt-2 flex gap-3">
              <Link
                href="/login"
                className="flex-1 rounded-full border px-4 py-2.5 text-center text-[14px]"
                style={{ borderColor: C.border, color: C.text }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex-1 rounded-full px-4 py-2.5 text-center text-[14px] font-medium text-white"
                style={{ background: C.accent }}
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

function RevealNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || started.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const begin = performance.now();
      const duration = 1200;

      const tick = (time: number) => {
        const progress = Math.min((time - begin) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function CommandCenter() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep(current => (current + 1) % BOARD_STEPS.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, []);

  const current = BOARD_STEPS[activeStep];

  return (
    <div className="relative mx-auto w-full max-w-[580px]">
      <div
        className="absolute -inset-10 rounded-[40px] blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(223,111,56,0.18), transparent 45%), radial-gradient(circle at 70% 70%, rgba(31,122,114,0.12), transparent 40%)',
        }}
      />

      <div
        className="relative overflow-hidden rounded-[30px] border p-4 shadow-[0_30px_90px_rgba(99,72,43,0.14)] md:p-5"
        style={{ background: 'rgba(255,253,250,0.92)', borderColor: C.border }}
      >
        <div className="mb-4 flex items-center justify-between rounded-[22px] border px-4 py-3" style={{ borderColor: C.border, background: C.panel }}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: C.dim }}>Live booking desk</p>
            <p className="mt-1 text-[17px] font-semibold" style={{ color: C.text }}>AI command center</p>
          </div>
          <div className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: C.accentSoft, color: C.accentStrong }}>
            {current.revenue}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3 rounded-[24px] border p-3" style={{ borderColor: C.border, background: C.panel }}>
            {BOARD_STEPS.map((step, index) => {
              const active = index === activeStep;
              return (
                <div
                  key={step.label}
                  className="rounded-[18px] border p-3 transition-all duration-500"
                  style={{
                    borderColor: active ? '#e7b18f' : C.border,
                    background: active ? '#fff4ed' : C.panel,
                    transform: active ? 'translateX(0)' : 'translateX(0)',
                    boxShadow: active ? '0 14px 32px rgba(223,111,56,0.12)' : 'none',
                    opacity: active ? 1 : 0.58,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: C.text }}>{step.customer}</p>
                      <p className="text-[12px]" style={{ color: C.dim }}>{step.service}</p>
                    </div>
                    <span className="text-[11px]" style={{ color: C.dim }}>{step.time}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[12px]" style={{ color: active ? C.accentStrong : C.dim }}>
                    <Sparkles className="h-3.5 w-3.5" />
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border p-4" style={{ borderColor: C.border, background: '#171411' }}>
              <div className="flex items-center gap-2 text-[12px]" style={{ color: '#d8c7b6' }}>
                <div className="h-2.5 w-2.5 rounded-full bg-[#df6f38]" />
                Auto-response in progress
              </div>
              <p className="mt-4 text-[20px] font-semibold leading-tight text-white">
                {current.reply}
              </p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  key={activeStep}
                  className="h-full rounded-full"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #df6f38, #f0c29b)',
                    animation: 'progressFill 2.1s linear',
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-[22px] border p-4" style={{ borderColor: C.border, background: C.panelSoft }}>
                <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.dim }}>Outcome</p>
                <p className="mt-2 text-[17px] font-semibold" style={{ color: C.text }}>{current.outcome}</p>
                <div className="mt-4 flex items-center gap-2 text-[12px]" style={{ color: C.teal }}>
                  <CheckCircle2 className="h-4 w-4" />
                  Deposit and reminder armed
                </div>
              </div>

              <div className="rounded-[22px] border p-4" style={{ borderColor: C.border, background: C.panel }}>
                <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.dim }}>Next opening</p>
                <p className="mt-2 text-[17px] font-semibold" style={{ color: C.text }}>Saturday 3:30 PM</p>
                <div className="mt-4 flex items-center gap-2 text-[12px]" style={{ color: C.gold }}>
                  <Clock3 className="h-4 w-4" />
                  Waitlist ready to fill gaps
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: ElementType; title: string; desc: string }) {
  return (
    <div
      className="rounded-[26px] border p-6"
      style={{ background: C.panel, borderColor: C.border, boxShadow: '0 14px 40px rgba(86,63,36,0.05)' }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: C.accentSoft, color: C.accentStrong }}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-[20px] font-semibold" style={{ color: C.text }}>{title}</h3>
      <p className="mt-3 text-[15px] leading-7" style={{ color: C.dim }}>{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main style={{ background: C.bg, color: C.text }}>
      <style>{`
        @keyframes progressFill {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
      `}</style>

      <Nav />

      <section className="relative overflow-hidden px-6 pb-20 pt-28 md:pb-28 md:pt-36">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 15% 20%, rgba(223,111,56,0.12), transparent 28%), radial-gradient(circle at 85% 35%, rgba(31,122,114,0.09), transparent 24%), linear-gradient(180deg, rgba(255,253,250,0.65) 0%, rgba(246,241,235,0) 100%)',
          }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] uppercase tracking-[0.18em]"
              style={{ borderColor: C.border, background: 'rgba(255,253,250,0.72)', color: C.dim }}
            >
              <Zap className="h-3.5 w-3.5" />
              Booking automation for service pros
            </div>

            <h1
              className="mt-7 max-w-xl text-5xl font-semibold leading-[1.02] md:text-7xl"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
            >
              Clean up your inbox.
              <span className="block" style={{ color: C.accentStrong }}>Fill your calendar automatically.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[18px] leading-8 md:text-[19px]" style={{ color: C.dim }}>
              BookedUp turns Instagram DMs and texts into paid appointments with faster replies, better slot matching, and automatic follow-up after the booking is closed.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium text-white"
                style={{ background: C.accent, boxShadow: '0 18px 40px rgba(223,111,56,0.22)' }}
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#platform"
                className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-[15px] font-medium"
                style={{ borderColor: C.border, background: 'rgba(255,253,250,0.72)' }}
              >
                See the workflow
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { value: 24, suffix: '/7', label: 'fast response coverage' },
                { value: 5, suffix: ' min', label: 'average setup time' },
                { value: 3, suffix: 'x', label: 'less manual follow-up' },
              ].map(item => (
                <div key={item.label} className="rounded-[22px] border px-4 py-4" style={{ borderColor: C.border, background: 'rgba(255,253,250,0.82)' }}>
                  <div className="text-[28px] font-semibold tracking-[-0.04em]" style={{ color: C.text }}>
                    <RevealNumber value={item.value} suffix={item.suffix} />
                  </div>
                  <p className="mt-1 text-[12px] uppercase tracking-[0.12em]" style={{ color: C.dim }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <CommandCenter />
        </div>
      </section>

      <section id="platform" className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[12px] uppercase tracking-[0.2em]" style={{ color: C.dim }}>Platform</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                A quieter interface, built for real booking work.
              </h2>
            </div>
            <p className="max-w-xl text-[16px] leading-7" style={{ color: C.dim }}>
              The product story is simpler now: capture demand, close the appointment, and keep the calendar full without making the page feel busy.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {FEATURE_CARDS.map(card => (
              <FeatureCard key={card.title} icon={card.icon} title={card.title} desc={card.desc} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y px-6 py-20 md:py-24" style={{ borderColor: C.border, background: '#efe5d9' }}>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-[30px] border p-8" style={{ borderColor: '#d6c5b4', background: 'rgba(255,253,250,0.74)' }}>
            <p className="text-[12px] uppercase tracking-[0.2em]" style={{ color: C.dim }}>Channels</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]" style={{ fontFamily: 'var(--font-display)' }}>
              One operating layer across every message source.
            </h3>
            <p className="mt-4 text-[16px] leading-7" style={{ color: C.dim }}>
              Clients can start on Instagram, continue over text, and still land in the same scheduling flow with consistent pricing and confirmations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Instagram, label: 'Instagram DMs', note: 'Capture leads where discovery happens.' },
              { icon: Phone, label: 'SMS follow-up', note: 'Keep confirmations and reminders direct.' },
              { icon: MessageSquare, label: 'Website inquiries', note: 'Convert traffic without adding admin work.' },
              { icon: Users, label: 'Waitlist outreach', note: 'Refill cancelled slots before they go cold.' },
            ].map(item => (
              <div key={item.label} className="rounded-[26px] border p-6" style={{ borderColor: '#d6c5b4', background: 'rgba(255,253,250,0.9)' }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: '#f7d7c6', color: C.accentStrong }}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[18px] font-semibold">{item.label}</p>
                <p className="mt-2 text-[15px] leading-7" style={{ color: C.dim }}>{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="max-w-xl">
              <p className="text-[12px] uppercase tracking-[0.2em]" style={{ color: C.dim }}>Workflow</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                The booking loop is short on purpose.
              </h2>
              <p className="mt-5 text-[16px] leading-7" style={{ color: C.dim }}>
                Most pages over-explain the software. This one now shows the exact sequence that matters to a studio owner: respond, schedule, retain.
              </p>
            </div>

            <div className="space-y-4">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.title} className="rounded-[28px] border p-6 md:p-8" style={{ borderColor: C.border, background: C.panel }}>
                  <div className="flex items-start gap-5">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold"
                      style={{ background: C.accentSoft, color: C.accentStrong }}
                    >
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-[22px] font-semibold">{step.title}</h3>
                      <p className="mt-2 text-[15px] leading-7" style={{ color: C.dim }}>{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-[34px] border p-8 md:p-12" style={{ borderColor: C.border, background: C.panel }}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em]" style={{ color: C.dim }}>FAQ</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]" style={{ fontFamily: 'var(--font-display)' }}>
                Built to feel automatic, not risky.
              </h2>
            </div>

            <div className="space-y-6">
              {[
                ['Can I approve messages?', 'Yes. You can fully automate common flows or require approval for specific services, clients, or price thresholds.'],
                ['Does it work for deposits and reminders?', 'The booking flow supports confirmation prompts, reminder messages, and deposit-driven handoff so fewer appointments go dark.'],
                ['Will this replace my booking software?', 'It is better framed as the layer that converts inbound demand into scheduled appointments, then keeps the client engaged after booking.'],
              ].map(([q, a]) => (
                <div key={q} className="border-b pb-6 last:border-b-0 last:pb-0" style={{ borderColor: C.border }}>
                  <p className="text-[18px] font-semibold">{q}</p>
                  <p className="mt-2 text-[15px] leading-7" style={{ color: C.dim }}>{a}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[28px] border px-6 py-6 md:flex-row md:items-center"
            style={{ borderColor: '#e7b18f', background: '#fff4ed' }}
          >
            <div>
              <p className="text-[24px] font-semibold tracking-[-0.03em]">Start with your busiest inbox.</p>
              <p className="mt-1 text-[15px]" style={{ color: C.dim }}>
                Connect one channel first, prove conversion lift, then expand.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium text-white"
              style={{ background: C.accent }}
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-10" style={{ borderColor: C.border }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="text-[14px] font-semibold tracking-[0.12em] uppercase">BookedUp</span>
          </div>
          <div className="flex gap-6 text-[14px]" style={{ color: C.dim }}>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
