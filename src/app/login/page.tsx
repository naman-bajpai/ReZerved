'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnTo = searchParams.get('returnTo') || searchParams.get('callbackUrl') || '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await authClient.signIn.email({ email, password });
      if (authError) { setError(authError.message || 'Invalid credentials'); return; }
      router.push(returnTo);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: returnTo,
      });
    } catch {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-[14px] font-medium transition-all hover:brightness-110 disabled:opacity-50"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#f4f4f5' }}
      >
        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span className="text-[12px]" style={{ color: 'rgba(244,244,245,0.25)' }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" showToggle />
        {error && (
          <div className="px-4 py-3 rounded-xl text-[13px]" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading || !email || !password}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold transition-all"
          style={{
            background: email && password && !loading ? 'linear-gradient(135deg, #f59e0b, #fb7185)' : 'rgba(255,255,255,0.06)',
            color: email && password && !loading ? '#09090b' : 'rgba(244,244,245,0.3)',
            boxShadow: email && password && !loading ? '0 4px 20px rgba(245,158,11,0.25)' : 'none',
          }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#09090b' }}>
      <div className="fixed top-1/3 left-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(245,158,11,0.04)' }} />
      <div className="fixed bottom-1/3 right-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(251,113,133,0.03)' }} />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <h1 className="text-[22px] font-bold mt-4 tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
            Welcome back
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.4)' }}>Sign in to your BookedUp account</p>
        </div>

        <div className="rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
          <Suspense>
            <LoginForm />
          </Suspense>

          <p className="text-center text-[13px] mt-6" style={{ color: 'rgba(244,244,245,0.35)' }}>
            Don&apos;t have an account?{' '}
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
      </div>
    </div>
  );
}
