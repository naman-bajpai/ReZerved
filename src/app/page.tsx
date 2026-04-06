'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Zap, TrendingUp, Users, CalendarDays, Shield,
  CheckCircle2, MessageSquare, Sparkles, BarChart3, Clock,
  ChevronRight, Star, Instagram, Phone, Bell, Activity,
  DollarSign, RefreshCw, Target, Lock, Layers,
} from 'lucide-react';

/* ─── Design tokens ─────────────────────────────────────── */
const C = {
  bg:     '#09090b',
  surf:   '#111116',
  card:   '#16161c',
  border: 'rgba(255,255,255,0.07)',
  amber:  '#f59e0b',
  rose:   '#fb7185',
  violet: '#a78bfa',
  em:     '#34d399',
  text:   '#f4f4f5',
  dim:    '#71717a',
  faint:  'rgba(255,255,255,0.04)',
};

/* ─── Logo ─────────────────────────────────────────────── */
function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b"/>
          <stop offset="1" stopColor="#fb7185"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#lg1)"/>
      <rect x="8" y="12" width="16" height="12" rx="2.5" fill="white" fillOpacity="0.95"/>
      <rect x="8" y="10" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.65"/>
      <rect x="12" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <rect x="17" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <path d="M12 18.5l2.5 2.5 5.5-6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Animated counter ──────────────────────────────────── */
function Counter({ to, prefix = '', suffix = '', duration = 2 }: {
  to: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const ms = duration * 1000;
        const tick = (now: number) => {
          const t = Math.min((now - start) / ms, 1);
          setDisplay(Math.round(t * to));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className="font-mono-nums">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Live demo conversation ────────────────────────────── */
const DEMO_STEPS = [
  { type: 'client',  text: 'Hey, can I get a full set Saturday at 2pm? 💅', delay: 0 },
  { type: 'typing',  text: '',                                               delay: 1400 },
  { type: 'ai',      text: 'Hi Sofia! I have Saturday 2pm open for you — full set with gel top coat is $85, takes about 75 min. Want me to lock it in? 🎀', delay: 2600 },
  { type: 'client',  text: 'Yes!! Book it please 🙌',                        delay: 4200 },
  { type: 'confirm', text: '✓ Booking confirmed for Saturday 2:00 PM · Full Set · $85',  delay: 5400 },
  { type: 'upsell',  text: '💡 AI suggested gel removal add-on (+$20) — Sofia said yes!', delay: 6800 },
];

function DemoConversation() {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    DEMO_STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => setStep(i + 1), s.delay));
    });
    // Loop
    const loopTimer = setTimeout(() => setStep(0), 9000);
    timers.push(loopTimer);
    return () => timers.forEach(clearTimeout);
  }, [step === 0 ? step : undefined]); // eslint-disable-line

  const visible = DEMO_STEPS.slice(0, step);

  return (
    <div
      ref={ref}
      className="rounded-2xl overflow-hidden"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: C.surf, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-violet-400 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">S</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: C.text }}>Sofia M.</p>
            <div className="flex items-center gap-1.5">
              <Instagram className="w-3 h-3" style={{ color: C.dim }} />
              <span className="text-[10px]" style={{ color: C.dim }}>via Instagram DM</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="live-dot" style={{ width: 6, height: 6 }} />
          <span className="text-[11px] font-medium" style={{ color: C.amber }}>AI Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 min-h-[260px]">
        <>
          {visible.map((s, i) => {
            if (s.type === 'typing') {
              return (
                <div key={i} className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
                    <Sparkles className="w-3 h-3" style={{ color: C.amber }} />
                  </div>
                  <div className="px-3 py-2 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.12)' }}>
                    <div className="flex gap-1 items-center h-4">
                      {[0,1,2].map(j => (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{ background: C.amber, animationDelay: `${j * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px]" style={{ color: C.dim }}>BookedUp AI is replying…</span>
                </div>
              );
            }
            if (s.type === 'confirm') {
              return (
                <div key={i}>
                  <div className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: C.em }} />
                    <span className="text-[13px] font-medium" style={{ color: C.em }}>{s.text}</span>
                  </div>
                </div>
              );
            }
            if (s.type === 'upsell') {
              return (
                <div key={i}>
                  <div className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
                    <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: C.violet }} />
                    <span className="text-[12px]" style={{ color: C.violet }}>{s.text}</span>
                  </div>
                </div>
              );
            }
            if (s.type === 'client') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-br-sm text-[13px] leading-relaxed" style={{ background: 'rgba(255,255,255,0.07)', color: C.text }}>
                    {s.text}
                  </div>
                </div>
              );
            }
            if (s.type === 'ai') {
              return (
                <div key={i} className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
                    <Sparkles className="w-3 h-3" style={{ color: C.amber }} />
                  </div>
                  <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-[13px] leading-relaxed" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.14)', color: C.text }}>
                    {s.text}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}>
          <span className="text-[12px] flex-1" style={{ color: C.dim }}>Reply as @yourbusiness · Handled automatically ✓</span>
          <div className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: 'rgba(245,158,11,0.12)', color: C.amber }}>Auto</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ──────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color, delay: _delay = 0 }: {
  icon: React.ElementType; title: string; desc: string; color: string; delay?: number;
}) {
  return (
    <div
      className="group relative rounded-2xl p-6 premium-card-hover cursor-default"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 30% 30%, ${color}08 0%, transparent 70%)` }}
      />
      <div className="relative">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.8} />
        </div>
        <h3 className="text-[15px] font-semibold mb-2" style={{ color: C.text }}>{title}</h3>
        <p className="text-[13px] leading-relaxed" style={{ color: C.dim }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Stat block ────────────────────────────────────────── */
function StatBlock({ label, to, prefix = '', suffix = '' }: {
  label: string; to: number; prefix?: string; suffix?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold mb-2 text-gradient-gold">
        <Counter to={to} prefix={prefix} suffix={suffix} duration={2.5} />
      </div>
      <p className="text-sm" style={{ color: C.dim }}>{label}</p>
    </div>
  );
}

/* ─── Nav ───────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(9,9,11,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo size={30} />
          <span className="text-[15px] font-bold tracking-tight" style={{ color: C.text }}>
            BookedUp
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {['Features', 'Pricing', 'About'].map(item => (
            <Link key={item} href="#" className="text-[14px] transition-colors duration-200 hover:text-white" style={{ color: C.dim }}>
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 hover:text-white"
            style={{ color: C.dim }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #fb7185)',
              color: '#09090b',
            }}
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" style={{ color: C.dim }} onClick={() => setOpen(!open)}>
          <div className="space-y-1.5">
            <span className="block w-5 h-0.5 bg-current" />
            <span className="block w-5 h-0.5 bg-current" />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden overflow-hidden"
          style={{ background: C.surf, borderTop: `1px solid ${C.border}` }}
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            {['Features', 'Pricing', 'About'].map(item => (
              <Link key={item} href="#" className="text-[15px]" style={{ color: C.dim }}>{item}</Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 text-center py-2.5 rounded-lg text-[14px] font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: C.text }}>Sign in</Link>
              <Link href="/signup" className="flex-1 text-center py-2.5 rounded-lg text-[14px] font-semibold" style={{ background: 'linear-gradient(135deg,#f59e0b,#fb7185)', color: '#09090b' }}>Get started</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Testimonial ───────────────────────────────────────── */
function Testimonial({ text, name, title, avatar, delay: _delay }: {
  text: string; name: string; title: string; avatar: string; delay: number;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: C.amber }} />
        ))}
      </div>
      <p className="text-[14px] leading-relaxed mb-5" style={{ color: 'rgba(244,244,245,0.75)' }}>"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,113,133,0.2))', color: C.amber }}>
          {avatar}
        </div>
        <div>
          <p className="text-[13px] font-semibold" style={{ color: C.text }}>{name}</p>
          <p className="text-[11px]" style={{ color: C.dim }}>{title}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh' }}>
      <Nav />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
        {/* Mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(251,113,133,0.05) 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[2px] blur-sm" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.15), rgba(251,113,133,0.1), transparent)' }} />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }}
        />

        <div className="relative max-w-5xl w-full mx-auto text-center">
          {/* Label */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[13px] font-medium"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: C.amber }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Now available for nail & lash studios
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
            style={{ fontFamily: 'var(--font-display)', color: C.text }}
          >
            Your AI books clients
            <br />
            <span className="text-gradient">while you work.</span>
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: 'rgba(244,244,245,0.55)' }}
          >
            BookedUp turns every Instagram DM and SMS into a confirmed booking — automatically.
            Fill empty slots, send upsells, and grow revenue without lifting a finger.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fb7185 100%)',
                color: '#09090b',
                boxShadow: '0 8px 32px rgba(245,158,11,0.3)',
              }}
            >
              Start for free
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#demo"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.text }}
            >
              Watch demo
            </Link>
          </div>

          {/* Trust line */}
          <p
            className="mt-6 text-[13px]"
            style={{ color: 'rgba(244,244,245,0.3)' }}
          >
            No credit card required · Setup in 5 minutes · Cancel anytime
          </p>
        </div>

        {/* Demo panel */}
        <div
          className="relative mt-16 w-full max-w-2xl mx-auto"
          id="demo"
        >
          {/* Glow behind panel */}
          <div className="absolute -inset-8 blur-3xl rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, rgba(251,113,133,0.05) 50%, transparent 80%)' }} />
          <DemoConversation />
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: C.dim }}
        >
          <div className="animate-bounce">
            <ChevronRight className="w-5 h-5 rotate-90" />
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatBlock to={94} suffix="%" label="Booking conversion rate" />
          <StatBlock to={340} prefix="$" label="Avg. revenue lift / month" />
          <StatBlock to={2800} suffix="+" label="Service pros on platform" />
          <StatBlock to={98} suffix="%" label="No-show reduction" />
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[13px] uppercase tracking-widest mb-4 font-semibold" style={{ color: C.amber }}>Platform</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5" style={{ fontFamily: 'var(--font-display)' }}>
              Every tool you need,<br />
              <span className="text-gradient">nothing you don't.</span>
            </h2>
            <p className="text-[16px] max-w-xl mx-auto" style={{ color: C.dim }}>
              BookedUp is more than a booking tool — it's a complete revenue engine that works 24/7 in the background.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard delay={0} color={C.amber} icon={MessageSquare} title="AI Booking Conversion"
              desc="Your AI replies to DMs and texts instantly, extracts intent, and converts inquiries into confirmed appointments — without you touching your phone." />
            <FeatureCard delay={0.06} color={C.em} icon={CheckCircle2} title="Verified Confirmations"
              desc="Every booking is confirmed with a two-tap flow. No more ghost clients, last-minute cancellations, or empty chairs." />
            <FeatureCard delay={0.12} color={C.rose} icon={CalendarDays} title="Empty Slot Filler"
              desc="When cancellations happen, BookedUp auto-reaches out to your waitlist and fills that slot — usually within minutes." />
            <FeatureCard delay={0.18} color={C.violet} icon={TrendingUp} title="Smart Upsells"
              desc="After a booking is confirmed, AI suggests relevant add-ons based on the client's history. Average ticket lift of 23%." />
            <FeatureCard delay={0.24} color="#22d3ee" icon={RefreshCw} title="Retention Engine"
              desc="Automatic follow-ups, rebooking reminders, and win-back campaigns keep your loyal clients coming back — on autopilot." />
            <FeatureCard delay={0.3} color="#f472b6" icon={BarChart3} title="Revenue Intelligence"
              desc="See which clients drive the most revenue, which days are slowest, and where money is being left on the table — in real time." />
          </div>
        </div>
      </section>

      {/* ── CHANNELS ──────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: C.surf, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-4xl mx-auto text-center">
          <div>
            <p className="text-[13px] uppercase tracking-widest mb-4 font-semibold" style={{ color: C.dim }}>Works everywhere your clients message you</p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {[
                { icon: Instagram, label: 'Instagram DMs', color: '#e1306c' },
                { icon: Phone, label: 'SMS / Text', color: C.em },
                { icon: MessageSquare, label: 'WhatsApp', color: '#25d366' },
                { icon: Bell, label: 'Booking Link', color: C.amber },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2.5 px-5 py-3 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.8} />
                  <span className="text-[14px] font-medium" style={{ color: C.text }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5" style={{ fontFamily: 'var(--font-display)' }}>
              Real results from<br />
              <span className="text-gradient">real businesses</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Testimonial delay={0} avatar="M" name="Maya Rodriguez" title="Nail Tech · Miami, FL"
              text="I was skeptical but BookedUp literally paid for itself in week one. I went from missing DMs to having a full calendar." />
            <Testimonial delay={0.1} avatar="J" name="Jessica Kim" title="Lash Artist · LA"
              text="My no-show rate dropped from 25% to under 3% after switching. The AI conversations feel so natural, clients don't even realize." />
            <Testimonial delay={0.2} avatar="T" name="Tiana Davis" title="Nail Studio Owner · NYC"
              text="The upsell feature alone adds $400-600 extra per month. It suggests gel removal or nail art and clients just say yes." />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(251,113,133,0.06) 50%, rgba(167,139,250,0.06) 100%)', border: `1px solid rgba(245,158,11,0.15)` }}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
            <div className="relative">
              <div className="flex justify-center mb-6">
                <Logo size={48} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                Ready to fill your<br />
                <span className="text-gradient-gold">calendar automatically?</span>
              </h2>
              <p className="text-[16px] mb-8 max-w-lg mx-auto" style={{ color: C.dim }}>
                Join thousands of service pros who let BookedUp handle their bookings while they focus on what they do best.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[16px] font-semibold transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #fb7185)', color: '#09090b', boxShadow: '0 12px 40px rgba(245,158,11,0.35)' }}
              >
                Start free — no card needed
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="py-12 px-6" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-[14px] font-semibold" style={{ color: C.text }}>BookedUp</span>
          </div>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Support'].map(item => (
              <Link key={item} href="#" className="text-[13px] transition-colors" style={{ color: C.dim }}>{item}</Link>
            ))}
          </div>
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} BookedUp · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
