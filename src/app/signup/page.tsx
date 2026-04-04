'use client';

import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

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
      <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
        {label}
      </p>
    </motion.div>
  );
}

function BookingFeed() {
  const items = [
    { name: 'Chloe B.', service: 'Balayage · 3h', price: '+$220', delay: 0.9 },
    { name: 'Devon W.', service: 'Sports Massage · 1h', price: '+$75', delay: 1.1 },
    { name: 'Fatima A.', service: 'Lash Lift · 45min', price: '+$95', delay: 1.3 },
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
            <p className="text-xs font-semibold" style={{ color: 'var(--ivory)' }}>
              {name}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {service}
            </p>
          </div>
          <span className="text-xs font-bold shrink-0" style={{ color: '#a78bfa' }}>
            {price}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default function SignupPage() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const perks = [
    'Free 14-day trial, no credit card',
    'AI fills your calendar from day one',
    'Cancel any time',
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ink)' }}>
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0d1a3e 0%, #0b0e24 50%, #09090f 100%)',
          borderRight: '1px solid var(--ink-border)',
        }}
      >
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

        <motion.div
          className="relative z-10 flex items-center gap-2"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--violet)' }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold" style={{ color: 'var(--ivory)' }}>
            BookedUp
          </span>
        </motion.div>

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
              Join 2,400+
              <br />
              <span style={{ color: '#a78bfa' }}>growing businesses</span>
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Start earning more from your existing schedule in minutes.
            </p>
          </motion.div>

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

          <div className="grid grid-cols-3 gap-3">
            <StatCard value="$2.4M+" label="Revenue generated" delay={1.6} />
            <StatCard value="43%" label="Avg revenue increase" delay={1.75} />
            <StatCard value="4.9★" label="Customer rating" delay={1.9} />
          </div>
        </div>

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

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex lg:hidden items-center gap-2 mb-10 justify-center">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--violet)' }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--ivory)' }}>
              BookedUp
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--ivory)' }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Sign up with Auth0 — Google, Facebook, or email.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: 'signup' },
                  appState: { returnTo: '/dashboard' },
                })
              }
              className="w-full h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'var(--violet)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(124,58,237,0.3)',
              }}
            >
              {isLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Sign up with Auth0
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: 'var(--ink-border)' }} />
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                or
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--ink-border)' }} />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { connection: 'facebook', screen_hint: 'signup' },
                  appState: { returnTo: '/dashboard' },
                })
              }
              className="w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2.5 transition-colors"
              style={{
                background: 'var(--ink-2)',
                border: '1px solid var(--ink-border)',
                color: 'var(--ivory)',
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Sign up with Facebook
            </button>
          </div>

          <p className="text-center text-[11px] leading-relaxed mt-6" style={{ color: 'var(--text-dim)' }}>
            By continuing you agree to Auth0&apos;s and our Terms and Privacy Policy.
          </p>

          <p className="text-center text-sm mt-4" style={{ color: 'var(--text-dim)' }}>
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
