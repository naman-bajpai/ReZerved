'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="ll" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b"/>
          <stop offset="1" stopColor="#fb7185"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#ll)"/>
      <rect x="8" y="12" width="16" height="12" rx="2.5" fill="white" fillOpacity="0.95"/>
      <rect x="8" y="10" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.65"/>
      <rect x="12" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <rect x="17" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <path d="M12 18.5l2.5 2.5 5.5-6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Field({ label, type, value, onChange, placeholder, showToggle }: {
  label: string; type: string; value: string; onChange: (v: string) => void;
  placeholder: string; showToggle?: boolean;
}) {
  const [show, setShow] = useState(false);
  const inputType = type === 'password' ? (show ? 'text' : 'password') : type;
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold" style={{ color: 'rgba(244,244,245,0.55)' }}>{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f4f4f5', caretColor: '#f59e0b' }}
          onFocus={e => { e.target.style.borderColor = 'rgba(245,158,11,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.07)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
        />
        {showToggle && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(244,244,245,0.35)' }}>
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await authClient.signIn.email({ email, password });
      if (authError) { setError(authError.message || 'Invalid credentials'); return; }
      router.push(searchParams.get('callbackUrl') || '/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" showToggle />
      {error && (
        <div className="px-4 py-3 rounded-xl text-[13px]" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={loading || !email || !password}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold transition-all mt-2"
        style={{
          background: email && password && !loading ? 'linear-gradient(135deg, #f59e0b, #fb7185)' : 'rgba(255,255,255,0.06)',
          color: email && password && !loading ? '#09090b' : 'rgba(244,244,245,0.3)',
          boxShadow: email && password && !loading ? '0 4px 20px rgba(245,158,11,0.25)' : 'none',
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#09090b' }}>
      <div className="fixed top-1/3 left-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(245,158,11,0.04)' }} />
      <div className="fixed bottom-1/3 right-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(251,113,133,0.03)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <h1 className="text-[22px] font-bold mt-4 tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
            Welcome back
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.4)' }}>Sign in to your BookedUp account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
          <Suspense>
            <LoginForm />
          </Suspense>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-[12px]" style={{ color: 'rgba(244,244,245,0.25)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <p className="text-center text-[13px]" style={{ color: 'rgba(244,244,245,0.35)' }}>
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold transition-colors hover:text-amber-400" style={{ color: '#f59e0b' }}>
              Sign up free
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 text-[12px]" style={{ color: 'rgba(244,244,245,0.2)' }}>
          By signing in you agree to our{' '}
          <Link href="#" style={{ color: 'rgba(244,244,245,0.4)' }}>Terms</Link> &amp;{' '}
          <Link href="#" style={{ color: 'rgba(244,244,245,0.4)' }}>Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
