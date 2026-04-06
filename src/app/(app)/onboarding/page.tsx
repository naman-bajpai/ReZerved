'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Clock, CheckCircle2, ArrowRight, ArrowLeft,
  Sparkles, Zap, CalendarDays, Globe, Loader2,
} from 'lucide-react';
import { onboardingCreator } from '@/lib/api';

const COMMON_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Phoenix', 'Europe/London',
  'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney',
];

const STEPS = [
  { id: 1, label: 'Business', icon: Building2 },
  { id: 2, label: 'Location', icon: Globe },
  { id: 3, label: 'Launch',   icon: Zap },
];

/* ─── Logo ───────────────────────────────────────────────── */
function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="onbl" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b"/>
          <stop offset="1" stopColor="#fb7185"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#onbl)"/>
      <rect x="8" y="12" width="16" height="12" rx="2.5" fill="white" fillOpacity="0.95"/>
      <rect x="8" y="10" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.65"/>
      <rect x="12" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <rect x="17" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <path d="M12 18.5l2.5 2.5 5.5-6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Step indicator ─────────────────────────────────────── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((step, i) => {
        const done = i + 1 < current;
        const active = i + 1 === current;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={active ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={done ? {
                  background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                } : active ? {
                  background: 'linear-gradient(135deg, #f59e0b, #fb7185)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {done
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: '#34d399' }} />
                  : <Icon className="w-3.5 h-3.5" style={{ color: active ? '#09090b' : 'rgba(244,244,245,0.3)' }} strokeWidth={2} />
                }
              </motion.div>
              <span className="text-[12px] font-semibold hidden sm:block" style={{ color: active ? '#f4f4f5' : 'rgba(244,244,245,0.3)' }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px" style={{ background: done ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Field component ────────────────────────────────────── */
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[13px] font-semibold" style={{ color: 'rgba(244,244,245,0.7)' }}>{label}</label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: 'rgba(244,244,245,0.3)' }}>{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#f4f4f5',
        caretColor: '#f59e0b',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(245,158,11,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleFinish() {
    if (!businessName.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await onboardingCreator({ business_name: businessName.trim(), timezone });
      setSuccess(true);
      setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.toLowerCase().includes('already linked')) {
        setSuccess(true);
        setTimeout(() => { window.location.href = '/dashboard'; }, 600);
        return;
      }
      setError(msg);
      setLoading(false);
    }
  }

  const canAdvance = step === 1 ? businessName.trim().length >= 2 : true;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: '#09090b' }}>
      {/* Ambient blobs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(251,113,133,0.04) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-10"
        >
          <Logo />
          <h1 className="text-[22px] font-bold mt-4 tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
            Set up BookedUp
          </h1>
          <p className="text-[14px] mt-1.5 text-center" style={{ color: 'rgba(244,244,245,0.4)' }}>
            Takes 2 minutes. No credit card.
          </p>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <StepIndicator current={step} total={3} />
        </motion.div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-10 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,211,153,0.2)', boxShadow: '0 0 40px rgba(52,211,153,0.06)' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: '#34d399' }} />
              </motion.div>
              <h2 className="text-[20px] font-bold mb-2" style={{ color: '#f4f4f5' }}>You're all set!</h2>
              <p className="text-[14px]" style={{ color: 'rgba(244,244,245,0.45)' }}>
                Taking you to your dashboard…
              </p>
              <div className="mt-6 flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
              </div>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-7"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Building2 className="w-5 h-5" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-[15px] font-bold" style={{ color: '#f4f4f5' }}>Your business</p>
                  <p className="text-[12px]" style={{ color: 'rgba(244,244,245,0.4)' }}>What should we call it?</p>
                </div>
              </div>

              <Field label="Business name" hint="This is shown to clients in booking confirmations">
                <TextInput value={businessName} onChange={setBusinessName} placeholder="e.g. Glam by Maya" />
              </Field>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canAdvance}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all"
                  style={canAdvance ? {
                    background: 'linear-gradient(135deg, #f59e0b, #fb7185)',
                    color: '#09090b',
                    boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                  } : {
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(244,244,245,0.3)',
                    cursor: 'not-allowed',
                  }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-7"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
                  <Globe className="w-5 h-5" style={{ color: '#a78bfa' }} />
                </div>
                <div>
                  <p className="text-[15px] font-bold" style={{ color: '#f4f4f5' }}>Your timezone</p>
                  <p className="text-[12px]" style={{ color: 'rgba(244,244,245,0.4)' }}>For accurate booking times</p>
                </div>
              </div>

              <Field label="Timezone" hint="We've pre-filled based on your browser settings">
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all appearance-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f4f4f5',
                    colorScheme: 'dark',
                  }}
                >
                  {COMMON_TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                  ))}
                </select>
              </Field>

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                  style={{ color: 'rgba(244,244,245,0.45)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #fb7185)', color: '#09090b', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-7"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <Zap className="w-5 h-5" style={{ color: '#34d399' }} />
                </div>
                <div>
                  <p className="text-[15px] font-bold" style={{ color: '#f4f4f5' }}>Ready to launch!</p>
                  <p className="text-[12px]" style={{ color: 'rgba(244,244,245,0.4)' }}>Confirm your setup below</p>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Business name', value: businessName, color: '#f59e0b' },
                  { label: 'Timezone', value: timezone, color: '#a78bfa' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-[12px]" style={{ color: 'rgba(244,244,245,0.4)' }}>{label}</span>
                    <span className="text-[13px] font-semibold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* What happens next */}
              <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <p className="text-[12px] font-semibold mb-2.5" style={{ color: '#f59e0b' }}>What happens next</p>
                <div className="space-y-2">
                  {[
                    'AI booking agent activates immediately',
                    'Add your services and availability',
                    'Share your booking link with clients',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#34d399' }} />
                      <span className="text-[12px]" style={{ color: 'rgba(244,244,245,0.55)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-[13px]" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                  style={{ color: 'rgba(244,244,245,0.45)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl text-[14px] font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #fb7185)', color: '#09090b', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Launch BookedUp</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
