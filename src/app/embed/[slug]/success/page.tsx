'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

interface BookingData {
  id: string; status: string; payment_status: string;
  starts_at: string; ends_at: string; total_price: number;
  services?: { name: string; duration_mins: number };
}

function storageKey(slug: string) { return `bk_guest_${slug}`; }

const SUCCESS_STYLES = `
* { box-sizing: border-box; }
body { margin: 0; background: transparent; }
@keyframes s-rise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes s-check { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }
@keyframes s-spin { to { transform: rotate(360deg); } }
.s-root { font-family: system-ui, -apple-system, sans-serif; }
.s-serif { font-family: Georgia, serif; }
.s-card { animation: s-rise .4s cubic-bezier(.22,1,.36,1) forwards; }
.s-check { animation: s-check .35s cubic-bezier(.34,1.56,.64,1) .15s both; }
.s-spin { animation: s-spin .8s linear infinite; }
`.trim();

export default function EmbedSuccessPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const sessionId = searchParams.get('session_id');

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) { setError('No booking ID.'); return; }
    const raw = localStorage.getItem(storageKey(slug));
    const token = raw ? JSON.parse(raw)?.token : null;
    if (!token) { setError('Session expired. Check your email for confirmation.'); return; }

    async function confirmAndLoad() {
      try {
        // Confirm via Stripe session
        await fetch(`/api/book/${slug}/booking/${bookingId}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const res = await fetch(`/api/book/${slug}/booking/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setError('Could not load booking details.'); return; }
        const { booking: b } = await res.json();
        setBooking(b);
        setConfirmed(true);

        // Notify parent window of successful booking
        try {
          window.parent.postMessage(
            { type: 'bookedup:complete', bookingId, slug, service: b.services?.name },
            '*'
          );
        } catch { /* cross-origin */ }
      } catch {
        setError('Could not load booking details.');
      }
    }

    confirmAndLoad();
  }, [bookingId, slug, sessionId]);

  // Also resize parent on mount
  useEffect(() => {
    const notify = () => {
      try { window.parent.postMessage({ type: 'bookedup:resize', height: document.body.scrollHeight }, '*'); } catch { /* */ }
    };
    notify();
    const ro = new ResizeObserver(notify);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [booking, confirmed]);

  return (
    <>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SUCCESS_STYLES }} />

      <div
        className="s-root flex items-center justify-center p-6"
        style={{
          background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(52,211,153,0.05) 0%, transparent 60%), #0a0a12',
          minHeight: 320, borderRadius: 16,
        }}
      >
        <div className="s-card w-full max-w-xs text-center">
          {/* Icon */}
          <div
            className="s-check w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={confirmed
              ? { background: 'linear-gradient(135deg,rgba(52,211,153,0.15),rgba(52,211,153,0.05))', border: '1px solid rgba(52,211,153,0.25)', boxShadow: '0 0 32px rgba(52,211,153,0.12)' }
              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {confirmed ? (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14.5L11.5 20L22 9" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <div className="s-spin w-7 h-7 rounded-full border-2" style={{ borderColor: 'rgba(240,169,107,0.2)', borderTopColor: '#f0a96b' }} />
            )}
          </div>

          {error ? (
            <>
              <h1 className="s-serif text-xl font-semibold mb-2" style={{ color: '#fff' }}>Booking received</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{error}</p>
            </>
          ) : !confirmed ? (
            <>
              <h1 className="s-serif text-xl font-semibold mb-2" style={{ color: '#fff' }}>Confirming…</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Just a moment while we confirm payment.</p>
            </>
          ) : (
            <>
              <h1 className="s-serif text-2xl font-semibold mb-2" style={{ color: '#fff' }}>You&rsquo;re booked!</h1>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Your appointment is confirmed. Check your email for a receipt.
              </p>
            </>
          )}

          {booking && confirmed && (
            <div
              className="rounded-xl px-4 py-3.5 mb-4 text-left space-y-2.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {booking.services && (
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Service</span>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{booking.services.name}</span>
                </div>
              )}
              {booking.starts_at && (
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Date & time</span>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {format(new Date(booking.starts_at), 'EEE, MMM d · h:mm a')}
                  </span>
                </div>
              )}
              {booking.total_price > 0 && (
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Paid</span>
                  <span className="text-xs font-semibold" style={{ color: '#34d399' }}>${booking.total_price.toFixed(2)}</span>
                </div>
              )}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Reference</span>
                <span className="font-mono text-xs font-semibold" style={{ color: '#f0a96b' }}>
                  {bookingId?.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Powered by */}
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Powered by BookedUp</p>
        </div>
      </div>
    </>
  );
}
