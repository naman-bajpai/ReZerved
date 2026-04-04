'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, CalendarDays, TrendingUp, Users, Eye, EyeOff } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

// ─── Design tokens ────────────────────────────────────────────
const ORANGE = '#f97316';
const PINK   = '#ec4899';
const TEXT   = '#0f0a1e';
const MID    = '#4b5563';
const DIM    = '#9ca3af';
const BORDER = 'rgba(15,10,30,0.08)';
const GRAD   = `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`;

function LogoMark({ size = 32, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <defs>
        <linearGradient id="lm-g2" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {light ? (
        <rect width="30" height="30" rx="9" fill="rgba(255,255,255,0.22)" />
      ) : (
        <rect width="30" height="30" rx="9" fill="url(#lm-g2)" />
      )}
      <rect x="7" y="11" width="16" height="12" rx="2.5" fill="white" fillOpacity="0.95" />
      <rect x="7" y="9" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.7" />
      <rect x="11" y="7.5" width="2.5" height="4" rx="1.25" fill="white" />
      <rect x="16.5" y="7.5" width="2.5" height="4" rx="1.25" fill="white" />
      <path d="M11 17.5l2.5 2.5 5-5.5" stroke={light ? 'rgba(255,255,255,0.8)' : '#f97316'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeatureTile({ icon: Icon, title, desc, delay }: { icon: React.ElementType; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
        <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-tight">{title}</p>
        <p className="text-[12px] text-white/65 mt-0.5 leading-snug">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authClient.signUp.email({ name, email, password, callbackURL: '/dashboard' });
      if (result.error) {
        setError(result.error.message || 'Could not create account');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true);
    setError('');
    try {
      await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' });
    } catch {
      setError('Could not sign up with Google.');
      setLoading(false);
    }
  }

  async function handleFacebookSignUp() {
    setLoading(true);
    setError('');
    try {
      await authClient.signIn.social({ provider: 'facebook', callbackURL: '/dashboard' });
    } catch {
      setError('Could not sign up with Facebook.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#fafaf8' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #f97316 0%, #ec4899 58%, #7c3aed 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', filter: 'blur(48px)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, transparent 70%)', filter: 'blur(32px)' }} />

        <motion.div className="relative z-10 flex items-center gap-2.5" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <LogoMark size={32} light />
          <span className="font-bold text-white text-base tracking-tight">BookedUp</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Beta</span>
        </motion.div>

        <div className="relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="text-4xl leading-tight mb-3 text-white" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700 }}>
              Stop leaving money<br />on the table.
            </h2>
            <p className="text-sm text-white/70 max-w-xs leading-relaxed">
              Join free, explore every feature, and let AI fill your calendar automatically.
            </p>
          </motion.div>
          <div className="space-y-2.5">
            <FeatureTile icon={CalendarDays} title="AI Schedule Filling" desc="Gaps detected and filled in real-time." delay={0.45} />
            <FeatureTile icon={TrendingUp} title="No-Show Recovery" desc="Automated re-booking that recovers lost revenue." delay={0.55} />
            <FeatureTile icon={Users} title="Client Intelligence" desc="Know who to reach out to and when." delay={0.65} />
          </div>
        </div>

        <motion.div className="relative z-10 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}>
          {['Free during open beta', 'No credit card required', 'Cancel anytime'].map(p => (
            <div key={p} className="flex items-center gap-2 text-xs text-white/70">
              <CheckCircle2 className="w-3.5 h-3.5 text-white/80 shrink-0" />
              {p}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#fafaf8' }}>
        <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
            <LogoMark size={28} />
            <span className="font-bold text-sm" style={{ color: TEXT }}>
              Booked<span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Up</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-6" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(236,72,153,0.1))', border: '1px solid rgba(249,115,22,0.22)', color: ORANGE }}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Open Beta · Free to join
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: TEXT }}>Create your account</h1>
            <p className="text-sm" style={{ color: MID }}>Join free — no credit card needed.</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignUp} className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}`, color: TEXT }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}`, color: TEXT }}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full h-11 px-4 pr-11 rounded-xl text-sm outline-none"
                style={{ background: '#ffffff', border: `1px solid ${BORDER}`, color: TEXT }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: DIM }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: GRAD, color: '#fff', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>Join the open beta <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: BORDER }} />
            <span className="text-xs" style={{ color: DIM }}>or</span>
            <div className="flex-1 h-px" style={{ background: BORDER }} />
          </div>

          <div className="space-y-2.5">
            <motion.button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignUp}
              className="w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 disabled:opacity-60"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}`, color: TEXT, boxShadow: '0 1px 3px rgba(15,10,30,0.05)' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </motion.button>

            <motion.button
              type="button"
              disabled={loading}
              onClick={handleFacebookSignUp}
              className="w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 disabled:opacity-60"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}`, color: TEXT, boxShadow: '0 1px 3px rgba(15,10,30,0.05)' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Sign up with Facebook
            </motion.button>
          </div>

          <p className="text-center text-[11px] leading-relaxed mt-6" style={{ color: DIM }}>
            By continuing you agree to our Terms and Privacy Policy.
          </p>
          <p className="text-center text-sm mt-4" style={{ color: MID }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: ORANGE }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = PINK)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = ORANGE)}
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
