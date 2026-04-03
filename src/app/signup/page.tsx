'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/* Animated stat cards shown on the brand panel */
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <p
        className="text-2xl font-bold leading-none mb-1"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          color: '#a78bfa',
        }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{label}</p>
    </motion.div>
  );
}

/* Brand panel illustration — staggered booking cards */
function BookingFeed() {
  const items = [
    { name: 'Chloe B.',    service: 'Balayage · 3h',         price: '+$220', delay: 0.9 },
    { name: 'Devon W.',    service: 'Sports Massage · 1h',    price: '+$75',  delay: 1.1 },
    { name: 'Fatima A.',   service: 'Lash Lift · 45min',      price: '+$95',  delay: 1.3 },
  ];
  return (
    <div className="space-y-2.5">
      {items.map(({ name, service, price, delay }) => (
        <motion.div
          key={name}
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'rgba(124,58,237,0.25)', color: '#a78bfa' }}
          >
            {name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold" style={{ color: 'var(--ivory)' }}>{name}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{service}</p>
          </div>
          <span className="text-xs font-bold shrink-0" style={{ color: '#a78bfa' }}>{price}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const perks = [
    'Free 14-day trial, no credit card',
    'AI fills your calendar from day one',
    'Cancel any time',
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ink)' }}>

      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0d1a3e 0%, #0b0e24 50%, #09090f 100%)',
          borderRight: '1px solid var(--ink-border)',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 40% 30%, rgba(76,29,149,0.25) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
            filter: 'blur(32px)',
          }}
        />

        {/* Top logo */}
        <motion.div
          className="relative z-10 flex items-center gap-2"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--violet)' }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold" style={{ color: 'var(--ivory)' }}>BookedUp</span>
        </motion.div>

        {/* Middle content */}
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2
              className="text-3xl leading-snug mb-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 600,
                color: 'var(--ivory)',
              }}
            >
              Join 2,400+<br />
              <span style={{ color: '#a78bfa' }}>growing businesses</span>
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Start earning more from your existing schedule in minutes.
            </p>
          </motion.div>

          {/* Live booking feed */}
          <div>
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--text-dim)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Live bookings right now
            </motion.p>
            <BookingFeed />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard value="$2.4M+" label="Revenue generated"    delay={1.6} />
            <StatCard value="43%"    label="Avg revenue increase"  delay={1.75} />
            <StatCard value="4.9★"   label="Customer rating"       delay={1.9} />
          </div>
        </div>

        {/* Bottom perks */}
        <motion.div
          className="relative z-10 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {perks.map((p) => (
            <div key={p} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#a78bfa' }} />
              {p}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10 justify-center">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--violet)' }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--ivory)' }}>BookedUp</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--ivory)' }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Free for 14 days. No credit card needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={form.name}
                onChange={update('name')}
                required
                className="h-10 text-sm"
                style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-border)', color: 'var(--ivory)' }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
                Work email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update('email')}
                required
                className="h-10 text-sm"
                style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-border)', color: 'var(--ivory)' }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={8}
                  className="h-10 text-sm pr-10"
                  style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-border)', color: 'var(--ivory)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {form.password.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{
                        background: form.password.length >= i * 2
                          ? i <= 2 ? '#f59e0b' : '#a78bfa'
                          : 'var(--ink-border)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2 hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'var(--violet)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(124,58,237,0.3)',
              }}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              By signing up you agree to our{' '}
              <a href="#" style={{ color: '#a78bfa' }}>Terms</a>{' '}
              and{' '}
              <a href="#" style={{ color: '#a78bfa' }}>Privacy Policy</a>.
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--ink-border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--ink-border)' }} />
          </div>

          {/* Social login */}
          <button
            type="button"
            className="w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2.5 transition-colors"
            style={{
              background: 'var(--ink-2)',
              border: '1px solid var(--ink-border)',
              color: 'var(--ivory)',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" style={{ fill: '#4285F4' }} />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" style={{ fill: '#34A853' }} />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" style={{ fill: '#FBBC05' }} />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" style={{ fill: '#EA4335' }} />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-dim)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium" style={{ color: '#a78bfa' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
