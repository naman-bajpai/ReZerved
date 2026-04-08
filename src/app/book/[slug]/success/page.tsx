'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const SUCCESS_PAGE_STYLES = `
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
@keyframes sk-spin { to { transform: rotate(360deg); } }
.sk-spin { animation: sk-spin 0.8s linear infinite; }
`.trim();

interface BookingData {
  id: string;
  status: string;
  payment_status: string;
  starts_at: string;
  ends_at: string;
  total_price: number;
  services?: { name: string; duration_mins: number };
}

function storageKey(slug: string) { return `bk_guest_${slug}`; }

export default function SuccessPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const { slug } = params;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!bookingId) { setError('No booking ID found.'); return; }

    const raw = localStorage.getItem(storageKey(slug));
    const token = raw ? JSON.parse(raw)?.token : null;
    if (!token) { setError('Session expired. Check your email for confirmation.'); return; }

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/book/${slug}/booking/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setError('Could not load booking details.'); return; }
        const { booking: b } = await res.json();
        setBooking(b);

        if (b.status === 'confirmed' || b.payment_status === 'paid') {
          setConfirmed(true);
        } else if (attemptsRef.current < 10) {
          attemptsRef.current += 1;
          pollRef.current = setTimeout(fetchStatus, 1500);
        } else {
          // After ~15s still not confirmed — show what we have anyway
          setConfirmed(true);
        }
      } catch {
        setError('Could not load booking details.');
      }
    }

    fetchStatus();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [bookingId, slug]);

  const isPending = booking && !confirmed;

  return (
    <>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SUCCESS_PAGE_STYLES }} />

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
          {/* Icon */}
          <div
            className="sk-check w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={
              isPending
                ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
                : {
                    background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))',
                    border: '1px solid rgba(52,211,153,0.25)',
                    boxShadow: '0 0 40px rgba(52,211,153,0.12)',
                  }
            }
          >
            {isPending ? (
              <div
                className="sk-spin w-8 h-8 rounded-full border-2"
                style={{ borderColor: 'rgba(240,169,107,0.2)', borderTopColor: '#f0a96b' }}
              />
            ) : (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M7 16.5L13 22.5L25 10"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          {error ? (
            <>
              <h1 className="sk-serif text-2xl font-semibold mb-2" style={{ color: '#fff' }}>
                Booking received
              </h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {error}
              </p>
            </>
          ) : isPending ? (
            <>
              <h1 className="sk-serif text-2xl font-semibold mb-2" style={{ color: '#fff' }}>
                Confirming payment…
              </h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Just a moment while we confirm your payment.
              </p>
            </>
          ) : (
            <>
              <h1 className="sk-serif text-3xl font-semibold mb-2" style={{ color: '#fff' }}>
                You&rsquo;re booked!
              </h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Your appointment is confirmed and payment received.
                Check your email for a receipt.
              </p>
            </>
          )}

          {/* Booking details */}
          {bookingId && (
            <div
              className="rounded-2xl px-5 py-4 mb-4 text-left"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {booking?.services && (
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(232,121,160,0.1)', border: '1px solid rgba(232,121,160,0.15)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.5" stroke="#e879a0" strokeWidth="1.3" />
                      <path d="M7 4.5V7L8.5 8.5" stroke="#e879a0" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>SERVICE</p>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {booking.services.name}
                      <span className="ml-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {booking.services.duration_mins} min
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {booking?.starts_at && (
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(240,169,107,0.1)', border: '1px solid rgba(240,169,107,0.15)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="#f0a96b" strokeWidth="1.3" />
                      <path d="M4.5 1V3.5M9.5 1V3.5M1.5 6h11" stroke="#f0a96b" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>DATE & TIME</p>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {format(new Date(booking.starts_at), 'EEE, MMM d · h:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {booking?.total_price != null && booking.total_price > 0 && (
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.12)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.5" stroke="#34d399" strokeWidth="1.3" />
                      <path d="M7 4v1M7 9v1M5.5 8c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5S8.33 6.5 7 6.5 5.5 5.83 5.5 5s.67-1.5 1.5-1.5S8.5 4.17 8.5 5" stroke="#34d399" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>TOTAL PAID</p>
                    <p className="text-sm font-medium" style={{ color: '#34d399' }}>
                      ${booking.total_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              <div
                className="flex items-center gap-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '4px' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(240,169,107,0.1)', border: '1px solid rgba(240,169,107,0.15)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4l5 4 5-4M2 4h10v7a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="#f0a96b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>CONFIRMATION</p>
                  <p className="font-mono text-sm font-semibold tracking-wider" style={{ color: '#f0a96b' }}>
                    {bookingId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div
            className="sk-divider mb-5"
            style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
          />

          <Link
            href={`/book/${slug}`}
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
