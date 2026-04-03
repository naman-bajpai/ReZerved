'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Eye, EyeOff, CalendarDays, TrendingUp, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/* Floating pill shown on the brand panel */
function FeaturePill({ icon: Icon, text, delay, x, y }: {
  icon: React.ElementType; text: string; delay: number; x: string; y: string;
}) {
  return (
    <motion.div
      className="absolute flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap"
      style={{
        left: x, top: y,
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

/* Abstract orb / ring decoration */
function OrbRing() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Large outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 480, height: 480,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(124,58,237,0.2)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
      {/* Mid ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 320, height: 320,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(167,139,250,0.15)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      {/* Glow core */}
      <div
        className="absolute rounded-full"
        style={{
          width: 180, height: 180,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      {/* Center icon */}
      <div
        className="absolute flex items-center justify-center rounded-2xl"
        style={{
          width: 64, height: 64,
          top: '50%', left: '50%',
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
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ink)' }}>

      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1a0a3e 0%, #0d0920 50%, #09090f 100%)',
          borderRight: '1px solid var(--ink-border)',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 60% 40%, rgba(124,58,237,0.2) 0%, transparent 60%)',
          }}
        />

        <OrbRing />

        {/* Floating feature pills */}
        <FeaturePill icon={CalendarDays} text="Smart AI Scheduling"  delay={0.8}  x="8%"  y="20%" />
        <FeaturePill icon={TrendingUp}  text="Revenue Analytics"     delay={1.0}  x="45%" y="72%" />
        <FeaturePill icon={Users}       text="Client Intelligence"   delay={1.2}  x="5%"  y="75%" />

        {/* Top logo */}
        <motion.div
          className="relative z-10 flex items-center gap-2"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--violet)' }}
          >
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold" style={{ color: 'var(--ivory)' }}>BookedUp</span>
        </motion.div>

        {/* Bottom copy */}
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
            Your schedule,<br />
            <span style={{ color: '#a78bfa' }}>always full.</span>
          </p>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Trusted by 2,400+ service professionals.
          </p>
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
            <h1
              className="text-2xl font-bold mb-1.5"
              style={{ color: 'var(--ivory)' }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Sign in to your BookedUp account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-sm"
                style={{
                  background: 'var(--ink-2)',
                  border: '1px solid var(--ink-border)',
                  color: 'var(--ivory)',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
                  Password
                </Label>
                <a href="#" className="text-xs" style={{ color: '#a78bfa' }}>Forgot password?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 text-sm pr-10"
                  style={{
                    background: 'var(--ink-2)',
                    border: '1px solid var(--ink-border)',
                    color: 'var(--ivory)',
                  }}
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
                  Sign in
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--ink-border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--ink-border)' }} />
          </div>

          {/* Social login (visual only) */}
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
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium" style={{ color: '#a78bfa' }}>
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
