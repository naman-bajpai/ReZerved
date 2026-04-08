'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { ArrowLeft, CheckCircle, Clock, Mail, RefreshCw, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Business { id: string; name: string; slug: string; timezone: string }
interface Service { id: string; name: string; duration_mins: number; price: number; add_ons: AddOn[] }
interface AddOn { name: string; price: number; duration_mins: number }
interface Slot { startsAt: string; endsAt: string; label: string }
interface GuestBooking {
  id: string;
  status: string;
  payment_status: string;
  starts_at: string;
  ends_at: string;
  total_price: number;
  services?: { name: string; duration_mins: number };
}

type Step =
  | 'loading'
  | 'welcome'
  | 'otp'
  | 'my-bookings'
  | 'services'
  | 'calendar'
  | 'slots'
  | 'review'
  | 'redirecting';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function storageKey(slug: string) { return `bk_guest_${slug}`; }

function loadSession(slug: string): { token: string; name: string; email: string } | null {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSession(slug: string, data: { token: string; name: string; email: string }) {
  localStorage.setItem(storageKey(slug), JSON.stringify(data));
}

function clearSession(slug: string) {
  localStorage.removeItem(storageKey(slug));
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  expired: 'bg-white/5 text-white/30 border border-white/10',
  no_show: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const BOOKING_PAGE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

.bk-root * { box-sizing: border-box; }
.bk-root { font-family: 'Outfit', system-ui, sans-serif; }
.bk-serif { font-family: 'Cormorant', Georgia, serif; }

.bk-glass {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(16px);
}
.bk-glass-hover {
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.bk-glass-hover:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(240,169,107,0.3);
  box-shadow: 0 0 24px rgba(240,169,107,0.08);
}

.bk-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  outline: none;
}
.bk-input::placeholder { color: rgba(255,255,255,0.25); }
.bk-input:focus {
  border-color: rgba(240,169,107,0.6);
  background: rgba(255,255,255,0.07);
  box-shadow: 0 0 0 3px rgba(240,169,107,0.1);
}

.bk-btn-primary {
  background: linear-gradient(135deg, #f0a96b 0%, #e879a0 100%);
  color: #0a0a12;
  font-weight: 600;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 24px rgba(240,169,107,0.25), 0 2px 8px rgba(232,121,160,0.15);
}
.bk-btn-primary:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 8px 32px rgba(240,169,107,0.35), 0 4px 16px rgba(232,121,160,0.25);
}
.bk-btn-primary:active:not(:disabled) { transform: translateY(0); }
.bk-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

.bk-otp-box {
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.12);
  color: #fff;
  font-family: 'Outfit', monospace;
  font-weight: 600;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  text-align: center;
}
.bk-otp-box:focus {
  border-color: #f0a96b;
  box-shadow: 0 0 0 3px rgba(240,169,107,0.15), 0 0 20px rgba(240,169,107,0.2);
}

.bk-date-pill {
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  transition: all 0.15s;
  background: transparent;
}
.bk-date-pill:hover:not(:disabled) {
  border-color: rgba(240,169,107,0.35);
  color: rgba(240,169,107,0.9);
  background: rgba(240,169,107,0.06);
}
.bk-date-pill.selected {
  background: linear-gradient(135deg, #f0a96b, #e879a0);
  border-color: transparent;
  color: #0a0a12;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(240,169,107,0.3);
}
.bk-date-pill:disabled { opacity: 0.2; cursor: not-allowed; }

.bk-slot {
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.65);
  background: rgba(255,255,255,0.03);
  transition: all 0.15s;
  font-weight: 500;
}
.bk-slot:hover {
  border-color: rgba(240,169,107,0.4);
  color: #f0a96b;
  background: rgba(240,169,107,0.07);
  box-shadow: 0 0 16px rgba(240,169,107,0.12);
}

@keyframes bk-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.bk-fade-up { animation: bk-fade-up 0.38s cubic-bezier(0.22,1,0.36,1) forwards; }

@keyframes bk-spin { to { transform: rotate(360deg); } }
.bk-spin { animation: bk-spin 0.8s linear infinite; }

@keyframes bk-pulse-dot {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.bk-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
}
`.trim();

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [myBookings, setMyBookings] = useState<GuestBooking[]>([]);

  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/book/${slug}`);
      if (!res.ok) { setStep('welcome'); return; }
      const { business: biz, services: svcs } = await res.json();
      setBusiness(biz);
      setServices(svcs);

      const sess = loadSession(slug);
      if (sess) {
        setGuestToken(sess.token);
        setGuestEmail(sess.email);
        setGuestName(sess.name);
        await fetchMyBookings(sess.token, biz.id, slug);
        setStep('my-bookings');
      } else {
        setStep('welcome');
      }

      if (searchParams.get('cancelled') === '1') {
        setError('Payment was cancelled — your time slot has been held for a moment. Try again.');
      }
    })();
  }, [slug]);

  async function fetchMyBookings(token: string, _bizId: string, s: string) {
    const res = await fetch(`/api/book/${s}/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const { bookings } = await res.json();
      setMyBookings(bookings ?? []);
    } else {
      const d = await res.json().catch(() => ({}));
      console.error('[fetchMyBookings] failed', res.status, d);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nameInput.trim() || !emailInput.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/book/${slug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), name: nameInput.trim() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otpInput.length !== 6) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/book/${slug}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), name: nameInput.trim(), code: otpInput }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const { token, email, name } = await res.json();
      saveSession(slug, { token, email, name });
      setGuestToken(token);
      setGuestEmail(email);
      setGuestName(name);
      setOtpInput('');
      await fetchMyBookings(token, business!.id, slug);
      setStep('my-bookings');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const arr = otpInput.split('').concat(Array(6).fill('')).slice(0, 6);
    arr[index] = digit;
    const next = arr.join('');
    setOtpInput(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function loadSlots(service: Service, date: Date) {
    setSlots([]);
    setSelectedSlot(null);
    if (!guestToken) return;
    const from = format(date, 'yyyy-MM-dd');
    const res = await fetch(
      `/api/book/${slug}/slots?service_id=${service.id}&date_from=${from}&date_to=${from}`,
      { headers: { Authorization: `Bearer ${guestToken}` } }
    );
    if (res.ok) {
      const { slots: s } = await res.json();
      setSlots(s);
    }
  }

  function selectDate(date: Date) {
    setSelectedDate(date);
    if (selectedService) loadSlots(selectedService, date);
  }

  function selectService(svc: Service) {
    setSelectedService(svc);
    setStep('calendar');
    loadSlots(svc, selectedDate);
  }

  function selectSlot(slot: Slot) {
    setSelectedSlot(slot);
    setStep('review');
  }

  async function handleBook() {
    if (!selectedService || !selectedSlot || !guestToken) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/book/${slug}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${guestToken}`,
        },
        body: JSON.stringify({
          service_id: selectedService.id,
          starts_at: selectedSlot.startsAt,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const { checkout_url } = await res.json();
      setStep('redirecting');
      window.location.href = checkout_url;
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function handleCancel(id: string) {
    if (!guestToken) return;
    setCancellingId(id);
    try {
      const res = await fetch(`/api/book/${slug}/my-bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${guestToken}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      await fetchMyBookings(guestToken, business!.id, slug);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), weekOffset * 7 + i));

  const upcomingBookings = myBookings.filter(
    (b) => ['confirmed', 'pending'].includes(b.status) && new Date(b.starts_at) > new Date()
  );
  const pastBookings = myBookings.filter(
    (b) => !['confirmed', 'pending'].includes(b.status) || new Date(b.starts_at) <= new Date()
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BOOKING_PAGE_STYLES }} />

      <div
        className="bk-root min-h-screen flex flex-col items-center"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% -5%, rgba(240,169,107,0.07) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 90% 110%, rgba(232,121,160,0.06) 0%, transparent 60%), #0a0a12',
        }}
      >
        <div className="w-full max-w-md min-h-screen flex flex-col">

          {/* ── Header ── */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {step !== 'welcome' && step !== 'loading' && step !== 'my-bookings' && (
              <button
                onClick={() => {
                  if (step === 'otp') { setStep('welcome'); setOtpInput(''); }
                  else if (step === 'services') setStep('my-bookings');
                  else if (step === 'calendar') setStep('services');
                  else if (step === 'slots') setStep('calendar');
                  else if (step === 'review') setStep('slots');
                }}
                className="flex items-center justify-center w-8 h-8 rounded-lg -ml-1 transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f0a96b, #e879a0)', boxShadow: '0 4px 16px rgba(240,169,107,0.3)' }}
              >
                <span className="text-sm font-bold" style={{ color: '#0a0a12', fontFamily: 'Outfit, sans-serif' }}>
                  {business?.name?.[0]?.toUpperCase() || 'B'}
                </span>
              </div>
              <div className="min-w-0">
                <p
                  className="bk-serif text-base font-semibold truncate"
                  style={{ color: '#fff', letterSpacing: '0.01em' }}
                >
                  {business?.name || 'BookedUp'}
                </p>
                {step !== 'welcome' && step !== 'loading' && step !== 'otp' && (
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{guestEmail}</p>
                )}
              </div>
            </div>

            {guestToken && step === 'my-bookings' && (
              <button
                onClick={() => { clearSession(slug); setGuestToken(null); setStep('welcome'); setNameInput(''); setEmailInput(''); }}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Sign out
              </button>
            )}
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div
              className="mx-5 mt-4 px-4 py-3 rounded-xl flex items-start gap-3 bk-fade-up"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
            >
              <X className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
              <p className="text-sm flex-1" style={{ color: '#fca5a5' }}>{error}</p>
              <button onClick={() => setError(null)}>
                <X className="w-3.5 h-3.5" style={{ color: 'rgba(248,113,113,0.5)' }} />
              </button>
            </div>
          )}

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto">

            {/* LOADING */}
            {step === 'loading' && (
              <div className="flex items-center justify-center h-64">
                <div
                  className="w-8 h-8 rounded-full border-2 bk-spin"
                  style={{ borderColor: 'rgba(240,169,107,0.2)', borderTopColor: '#f0a96b' }}
                />
              </div>
            )}

            {/* WELCOME */}
            {step === 'welcome' && (
              <div className="px-5 pt-10 pb-8 bk-fade-up">
                <div className="text-center mb-10">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{
                      background: 'linear-gradient(135deg, #f0a96b, #e879a0)',
                      boxShadow: '0 8px 32px rgba(240,169,107,0.35), 0 0 0 1px rgba(240,169,107,0.15)',
                    }}
                  >
                    <span
                      className="bk-serif text-3xl font-semibold"
                      style={{ color: '#0a0a12' }}
                    >
                      {business?.name?.[0]?.toUpperCase() || 'B'}
                    </span>
                  </div>
                  <h1 className="bk-serif text-3xl font-semibold mb-2" style={{ color: '#fff', letterSpacing: '0.01em' }}>
                    {business?.name}
                  </h1>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Reserve your appointment
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>
                      Your name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Jane Smith"
                      required
                      className="bk-input w-full rounded-xl px-4 py-3.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>
                      Email address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="jane@example.com"
                      required
                      className="bk-input w-full rounded-xl px-4 py-3.5 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy || !nameInput.trim() || !emailInput.trim()}
                    className="bk-btn-primary w-full rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 mt-2"
                  >
                    {busy
                      ? <div className="w-4 h-4 rounded-full border-2 bk-spin" style={{ borderColor: 'rgba(10,10,18,0.3)', borderTopColor: '#0a0a12' }} />
                      : <Mail className="w-4 h-4" />
                    }
                    Send verification code
                  </button>
                </form>

                <p className="text-xs text-center mt-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Already booked? Use the same email to view your appointments.
                </p>
              </div>
            )}

            {/* OTP */}
            {step === 'otp' && (
              <div className="px-5 pt-10 pb-8 bk-fade-up">
                <div className="text-center mb-10">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'rgba(240,169,107,0.1)', border: '1px solid rgba(240,169,107,0.2)' }}
                  >
                    <Mail className="w-7 h-7" style={{ color: '#f0a96b' }} />
                  </div>
                  <h2 className="bk-serif text-2xl font-semibold mb-2" style={{ color: '#fff' }}>
                    Check your email
                  </h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    We sent a 6-digit code to<br />
                    <span className="font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{emailInput}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex gap-2.5 justify-center">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpInput[i] || ''}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        className="bk-otp-box w-11 h-14 rounded-xl text-xl"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={busy || otpInput.length !== 6}
                    className="bk-btn-primary w-full rounded-xl py-3.5 text-sm flex items-center justify-center gap-2"
                  >
                    {busy
                      ? <div className="w-4 h-4 rounded-full border-2 bk-spin" style={{ borderColor: 'rgba(10,10,18,0.3)', borderTopColor: '#0a0a12' }} />
                      : <CheckCircle className="w-4 h-4" />
                    }
                    Verify code
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setOtpInput('');
                      setError(null);
                      setBusy(true);
                      try {
                        await fetch(`/api/book/${slug}/auth`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: emailInput.trim(), name: nameInput.trim() }),
                        });
                      } finally { setBusy(false); }
                    }}
                    disabled={busy}
                    className="w-full text-sm flex items-center justify-center gap-1.5 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend code
                  </button>
                </form>
              </div>
            )}

            {/* MY BOOKINGS */}
            {step === 'my-bookings' && (
              <div className="px-5 pt-7 pb-8 space-y-6 bk-fade-up">
                <div>
                  <h2 className="bk-serif text-2xl font-semibold" style={{ color: '#fff' }}>
                    Welcome back, {guestName.split(' ')[0]}.
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Your appointments</p>
                </div>

                {upcomingBookings.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium mb-3 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>
                      Upcoming
                    </p>
                    <div className="space-y-2.5">
                      {upcomingBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bk-glass rounded-2xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate" style={{ color: '#fff' }}>
                                {b.services?.name || 'Appointment'}
                              </p>
                              <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                <Calendar className="w-3 h-3" />
                                {format(new Date(b.starts_at), 'EEE, MMM d · h:mm a')}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[b.status] || 'bg-white/5 text-white/30 border border-white/10'}`}>
                                {b.status}
                              </span>
                              <button
                                onClick={() => handleCancel(b.id)}
                                disabled={cancellingId === b.id}
                                className="text-xs transition-colors disabled:opacity-40"
                                style={{ color: 'rgba(248,113,113,0.6)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,113,113,0.6)')}
                              >
                                {cancellingId === b.id ? 'Cancelling…' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                          <div className="bk-divider my-3" />
                          <div className="flex items-center justify-between">
                            <span className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              <Clock className="w-3 h-3" />{b.services?.duration_mins} min
                            </span>
                            <span className="text-sm font-semibold" style={{ color: '#f0a96b' }}>
                              ${Number(b.total_price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl p-8 text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Calendar className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No upcoming appointments</p>
                  </div>
                )}

                <button
                  onClick={() => setStep('services')}
                  className="bk-btn-primary w-full rounded-xl py-3.5 text-sm"
                >
                  Book a new appointment
                </button>

                {pastBookings.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-3 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>
                      Past
                    </p>
                    <div className="space-y-2">
                      {pastBookings.slice(0, 5).map((b) => (
                        <div
                          key={b.id}
                          className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <div className="min-w-0">
                            <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.services?.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                              {format(new Date(b.starts_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[b.status] || 'bg-white/5 text-white/30 border border-white/10'}`}>
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SERVICES */}
            {step === 'services' && (
              <div className="px-5 pt-7 pb-8 bk-fade-up">
                <h2 className="bk-serif text-2xl font-semibold mb-1" style={{ color: '#fff' }}>Choose a service</h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>Select what you'd like to book.</p>

                {services.length === 0 ? (
                  <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    <p className="text-sm">No services available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => selectService(svc)}
                        className="bk-glass bk-glass-hover w-full text-left rounded-2xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm" style={{ color: '#fff' }}>{svc.name}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                <Clock className="w-3 h-3" /> {svc.duration_mins} min
                              </span>
                              {svc.add_ons?.length > 0 && (
                                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                  +{svc.add_ons.length} add-on{svc.add_ons.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className="bk-serif text-xl font-semibold flex-shrink-0"
                            style={{ color: '#f0a96b' }}
                          >
                            ${Number(svc.price).toFixed(0)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CALENDAR */}
            {step === 'calendar' && (
              <div className="px-5 pt-7 pb-8 bk-fade-up">
                <h2 className="bk-serif text-2xl font-semibold mb-1" style={{ color: '#fff' }}>Pick a date</h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {selectedService?.name} · {selectedService?.duration_mins} min
                </p>

                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                    disabled={weekOffset === 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-20"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
                  </span>
                  <button
                    onClick={() => setWeekOffset(w => w + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {weekDays.map((day) => {
                    const isPast = day < startOfToday();
                    const isSelected = isSameDay(day, selectedDate);
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !isPast && selectDate(day)}
                        disabled={isPast}
                        className={`bk-date-pill flex flex-col items-center py-2.5 rounded-xl text-xs transition-all ${isSelected ? 'selected' : ''}`}
                      >
                        <span className="text-[9px] mb-1 font-medium" style={{ opacity: isSelected ? 0.7 : 0.5 }}>
                          {format(day, 'EEE')}
                        </span>
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setStep('slots')}
                  className="bk-btn-primary w-full rounded-xl py-3.5 text-sm mt-6"
                >
                  See available times
                </button>
              </div>
            )}

            {/* SLOTS */}
            {step === 'slots' && (
              <div className="px-5 pt-7 pb-8 bk-fade-up">
                <h2 className="bk-serif text-2xl font-semibold mb-1" style={{ color: '#fff' }}>Choose a time</h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {format(selectedDate, 'EEEE, MMMM d')}
                </p>

                {slots.length === 0 ? (
                  <div className="text-center py-16">
                    <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                    <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>No available times on this day.</p>
                    <button
                      onClick={() => setStep('calendar')}
                      className="text-sm font-medium transition-opacity hover:opacity-70"
                      style={{ color: '#f0a96b' }}
                    >
                      Pick another date
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {slots.map((slot) => (
                      <button
                        key={slot.startsAt}
                        onClick={() => selectSlot(slot)}
                        className="bk-slot rounded-xl py-3.5 text-sm"
                      >
                        {format(new Date(slot.startsAt), 'h:mm a')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVIEW */}
            {step === 'review' && selectedService && selectedSlot && (
              <div className="px-5 pt-7 pb-8 space-y-4 bk-fade-up">
                <div>
                  <h2 className="bk-serif text-2xl font-semibold" style={{ color: '#fff' }}>Confirm booking</h2>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Review your appointment details</p>
                </div>

                <div className="bk-glass rounded-2xl p-5 space-y-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(240,169,107,0.1)', border: '1px solid rgba(240,169,107,0.15)' }}
                    >
                      <Calendar className="w-4.5 h-4.5" style={{ color: '#f0a96b' }} />
                    </div>
                    <div>
                      <p className="text-xs mb-1 font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>Date & time</p>
                      <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                        {format(new Date(selectedSlot.startsAt), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {format(new Date(selectedSlot.startsAt), 'h:mm a')} – {format(new Date(selectedSlot.endsAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="bk-divider" />

                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(232,121,160,0.1)', border: '1px solid rgba(232,121,160,0.15)' }}
                    >
                      <Clock className="w-4.5 h-4.5" style={{ color: '#e879a0' }} />
                    </div>
                    <div>
                      <p className="text-xs mb-1 font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>Service</p>
                      <p className="text-sm font-semibold" style={{ color: '#fff' }}>{selectedService.name}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{selectedService.duration_mins} min</p>
                    </div>
                  </div>

                  <div className="bk-divider" />

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>Total</p>
                    <p className="bk-serif text-3xl font-semibold" style={{ color: '#f0a96b' }}>
                      ${Number(selectedService.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Booking for{' '}
                    <span className="font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{guestName}</span>
                    {' '}({guestEmail})
                  </p>
                </div>

                <button
                  onClick={handleBook}
                  disabled={busy}
                  className="bk-btn-primary w-full rounded-xl py-4 text-sm flex items-center justify-center gap-2.5"
                >
                  {busy && (
                    <div className="w-4 h-4 rounded-full border-2 bk-spin" style={{ borderColor: 'rgba(10,10,18,0.3)', borderTopColor: '#0a0a12' }} />
                  )}
                  Pay ${Number(selectedService.price).toFixed(2)} to confirm
                </button>

                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Secured by Stripe · Cancel up to 2 hours before
                </p>
              </div>
            )}

            {/* REDIRECTING */}
            {step === 'redirecting' && (
              <div className="flex flex-col items-center justify-center h-64 gap-4 bk-fade-up">
                <div
                  className="w-10 h-10 rounded-full border-2 bk-spin"
                  style={{ borderColor: 'rgba(240,169,107,0.2)', borderTopColor: '#f0a96b' }}
                />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Redirecting to checkout…</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
