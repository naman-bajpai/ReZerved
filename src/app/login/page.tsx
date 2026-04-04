'use client';

import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CalendarDays, TrendingUp, Users } from 'lucide-react';

function FeaturePill({
  icon: Icon,
  text,
  delay,
  x,
  y,
}: {
  icon: React.ElementType;
  text: string;
  delay: number;
  x: string;
  y: string;
}) {
  return (
    <motion.div
      className="absolute flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap"
      style={{
        left: x,
        top: y,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(12px)',
        color: 'rgba(240,236,226,0.85)',
      }}
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} strokeWidth={1.8} />
      {text}
    </motion.div>
  );
}

function OrbRing() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 480,
          height: 480,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(124,58,237,0.2)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(167,139,250,0.15)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 180,
          height: 180,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="absolute flex items-center justify-center rounded-2xl"
        style={{
          width: 64,
          height: 64,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(124,58,237,0.25)',
          border: '1px solid rgba(167,139,250,0.3)',
        }}
      >
        <Zap className="w-7 h-7" style={{ color: '#a78bfa' }} strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ink)' }}>
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1a0a3e 0%, #0d0920 50%, #09090f 100%)',
          borderRight: '1px solid var(--ink-border)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 60% 40%, rgba(124,58,237,0.2) 0%, transparent 60%)',
          }}
        />
        <OrbRing />
        <FeaturePill icon={CalendarDays} text="Smart AI Scheduling" delay={0.8} x="8%" y="20%" />
        <FeaturePill icon={TrendingUp} text="Revenue Analytics" delay={1.0} x="45%" y="72%" />
        <FeaturePill icon={Users} text="Client Intelligence" delay={1.2} x="5%" y="75%" />

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

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p
            className="text-3xl leading-snug mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 600,
              color: 'var(--ivory)',
            }}
          >
            Your schedule,
            <br />
            <span style={{ color: '#a78bfa' }}>always full.</span>
          </p>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Trusted by 2,400+ service professionals.
          </p>
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
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Sign in with Auth0 — use email/password, Google, or Facebook.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                loginWithRedirect({
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
                  Continue to sign in
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
                  authorizationParams: { connection: 'facebook' },
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
              Continue with Facebook
            </button>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-dim)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium" style={{ color: '#a78bfa' }}>
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
