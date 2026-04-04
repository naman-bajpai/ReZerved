'use client';

import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, TrendingUp, Users, Bell } from 'lucide-react';
import { isAuth0Configured } from '@/lib/auth0-config';

// ─── Design tokens (match landing page) ──────────────────────
const ORANGE = '#f97316';
const PINK   = '#ec4899';
const VIOLET = '#7c3aed';
const TEXT   = '#0f0a1e';
const MID    = '#4b5563';
const DIM    = '#9ca3af';
const BORDER = 'rgba(15,10,30,0.08)';
const GRAD   = `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`;

// ─── Logo mark ────────────────────────────────────────────────
function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="30" height="30" rx="9" fill="url(#lm-g)" />
      <rect x="7" y="11" width="16" height="12" rx="2.5" fill="white" fillOpacity="0.95" />
      <rect x="7" y="9" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.7" />
      <rect x="11" y="7.5" width="2.5" height="4" rx="1.25" fill="white" />
      <rect x="16.5" y="7.5" width="2.5" height="4" rx="1.25" fill="white" />
      <path d="M11 17.5l2.5 2.5 5-5.5" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Floating feature pill ────────────────────────────────────
function FeaturePill({
  icon: Icon, text, delay, x, y, color,
}: {
  icon: React.ElementType; text: string; delay: number; x: string; y: string; color: string;
}) {
  return (
    <motion.div
      className="absolute flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{
        left: x, top: y,
        background: 'rgba(255,255,255,0.92)',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 4px 16px rgba(15,10,30,0.08)',
        backdropFilter: 'blur(12px)',
        color: TEXT,
      }}
      initial={{ opacity: 0, scale: 0.85, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} strokeWidth={2} />
      {text}
    </motion.div>
  );
}

// ─── Animated orb rings (re-colored) ─────────────────────────
function OrbRing() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 420, height: 420,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(249,115,22,0.2)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 280, height: 280,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(236,72,153,0.18)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 160, height: 160,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(124,58,237,0.15)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 140, height: 140,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(236,72,153,0.12) 50%, transparent 70%)',
          filter: 'blur(18px)',
        }}
      />
      {/* Center icon box */}
      <motion.div
        className="absolute flex items-center justify-center rounded-2xl"
        style={{
          width: 58, height: 58,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.92)',
          border: `1px solid ${BORDER}`,
          boxShadow: '0 8px 32px rgba(249,115,22,0.18)',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <LogoMark size={30} />
      </motion.div>
    </div>
  );
}

// ─── Auth-connected login page ────────────────────────────────
function LoginPageWithAuth() {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <div className="min-h-screen flex" style={{ background: '#fafaf8' }}>

      {/* ── Left panel — soft warm panel with animated orb ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #fff7ed 0%, #fce7f3 55%, #ede9fe 100%)',
          borderRight: `1px solid ${BORDER}`,
        }}
      >
        {/* Floating blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', filter: 'blur(48px)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Floating feature pills */}
        <FeaturePill icon={CalendarDays} text="Smart AI Scheduling" delay={0.8} x="6%" y="18%" color={ORANGE} />
        <FeaturePill icon={TrendingUp}   text="Revenue Analytics"   delay={1.0} x="42%" y="70%" color={PINK} />
        <FeaturePill icon={Users}        text="Client Intelligence"  delay={1.2} x="4%"  y="73%" color={VIOLET} />
        <FeaturePill icon={Bell}         text="No-Show Recovery"     delay={1.4} x="55%" y="22%" color={ORANGE} />

        {/* Orb ring */}
        <OrbRing />

        {/* Logo */}
        <motion.div
          className="relative z-10 flex items-center gap-2.5"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LogoMark size={30} />
          <span className="font-bold text-sm" style={{ color: TEXT }}>
            Booked<span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Up</span>
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-3xl leading-snug mb-2"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, color: TEXT }}
          >
            Your schedule,
            <br />
            <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              always full.
            </span>
          </h2>
          <p className="text-sm" style={{ color: MID }}>
            We&apos;re in open beta — the best time to join is now.
          </p>
        </motion.div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#fafaf8' }}>
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
            <LogoMark size={28} />
            <span className="font-bold text-sm" style={{ color: TEXT }}>
              Booked<span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Up</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: TEXT }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: MID }}>
              Sign in with Auth0 — use email, Google, or Facebook.
            </p>
          </div>

          <div className="space-y-3">
            {/* Primary CTA */}
            <motion.button
              type="button"
              disabled={isLoading}
              onClick={() =>
                loginWithRedirect({
                  appState: { returnTo: '/dashboard' },
                })
              }
              className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: GRAD, color: '#fff', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}
              whileHover={{ scale: 1.02, boxShadow: '0 6px 28px rgba(249,115,22,0.42)' }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Continue to sign in
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: BORDER }} />
              <span className="text-xs" style={{ color: DIM }}>or</span>
              <div className="flex-1 h-px" style={{ background: BORDER }} />
            </div>

            {/* Facebook */}
            <motion.button
              type="button"
              disabled={isLoading}
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { connection: 'facebook' },
                  appState: { returnTo: '/dashboard' },
                })
              }
              className="w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 disabled:opacity-60"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}`, color: TEXT, boxShadow: '0 1px 3px rgba(15,10,30,0.05)' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </motion.button>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: MID }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold transition-colors"
              style={{ color: ORANGE }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = PINK)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = ORANGE)}
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────
export default function LoginPage() {
  if (!isAuth0Configured()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#fafaf8' }}>
        <motion.div
          className="max-w-md rounded-2xl p-8 text-sm"
          style={{ background: '#ffffff', border: `1px solid ${BORDER}`, boxShadow: '0 4px 24px rgba(15,10,30,0.06)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <LogoMark size={28} />
            <span className="font-bold text-sm" style={{ color: TEXT }}>BookedUp</span>
          </div>
          <p className="font-semibold mb-2" style={{ color: TEXT }}>
            Auth0 is not configured
          </p>
          <p className="mb-4 leading-relaxed" style={{ color: MID }}>
            Add{' '}
            <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.1)', color: ORANGE }}>NEXT_PUBLIC_AUTH0_DOMAIN</code> and{' '}
            <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.1)', color: ORANGE }}>NEXT_PUBLIC_AUTH0_CLIENT_ID</code>{' '}
            to{' '}
            <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.1)', color: ORANGE }}>frontend/.env.local</code>, then restart dev.
            Server-only names like{' '}
            <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.1)', color: ORANGE }}>AUTH0_DOMAIN</code>{' '}
            are not available here.
          </p>
          <Link href="/" className="text-sm font-semibold" style={{ color: ORANGE }}>
            ← Back to home
          </Link>
        </motion.div>
      </div>
    );
  }
  return <LoginPageWithAuth />;
}
