'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SuccessPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        .sk-root { font-family: 'Outfit', system-ui, sans-serif; }
        .sk-serif { font-family: 'Cormorant', Georgia, serif; }
        @keyframes sk-rise {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sk-check {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .sk-card { animation: sk-rise 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        .sk-check { animation: sk-check 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
        .sk-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
        }
      `}</style>

      <div
        className="sk-root min-h-screen flex items-center justify-center px-5"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(240,169,107,0.07) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 90% 110%, rgba(232,121,160,0.06) 0%, transparent 60%), #0a0a12',
        }}
      >
        <div
          className="sk-card w-full max-w-sm rounded-3xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Check icon */}
          <div
            className="sk-check w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))',
              border: '1px solid rgba(52,211,153,0.25)',
              boxShadow: '0 0 40px rgba(52,211,153,0.12)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M7 16.5L13 22.5L25 10"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="sk-serif text-3xl font-semibold mb-2" style={{ color: '#fff' }}>
            You&rsquo;re booked!
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Your appointment is confirmed and payment received.
            Check your email for a receipt.
          </p>

          <div
            className="rounded-2xl px-5 py-4 mb-8 flex items-center gap-4 text-left"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(240,169,107,0.1)', border: '1px solid rgba(240,169,107,0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="11" rx="2" stroke="#f0a96b" strokeWidth="1.5"/>
                <path d="M5 1.5V4M11 1.5V4M2 7h12" stroke="#f0a96b" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                CONFIRMATION
              </p>
              <p className="font-mono text-sm font-semibold tracking-wider" style={{ color: '#f0a96b' }}>
                {bookingId?.slice(0, 8).toUpperCase() || '—'}
              </p>
            </div>
          </div>

          <div className="sk-divider mb-6" />

          <Link
            href={`/book/${params.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to booking page
          </Link>
        </div>
      </div>
    </>
  );
}
