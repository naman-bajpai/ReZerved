'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { format, addDays, startOfToday } from 'date-fns';
import { ArrowLeft, Mail, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Business { id: string; name: string; slug: string; timezone: string }
interface Service { id: string; name: string; duration_mins: number; price: number }
interface Slot { startsAt: string; endsAt: string; label: string }
interface GuestBooking {
  id: string; status: string; payment_status: string;
  starts_at: string; ends_at: string; total_price: number;
  services?: { name: string; duration_mins: number };
}

type Step = 'loading' | 'welcome' | 'otp' | 'services' | 'calendar' | 'slots' | 'review' | 'my-bookings' | 'redirecting';

// ─── Session helpers ───────────────────────────────────────────────────────────

function storageKey(slug: string) { return `bk_guest_${slug}`; }
function loadSession(slug: string) {
  try { const raw = localStorage.getItem(storageKey(slug)); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function saveSession(slug: string, d: { token: string; name: string; email: string }) {
  localStorage.setItem(storageKey(slug), JSON.stringify(d));
}
function clearSession(slug: string) { localStorage.removeItem(storageKey(slug)); }

// ─── Styles ───────────────────────────────────────────────────────────────────

const EMBED_STYLES = `
* { box-sizing: border-box; }
body { margin: 0; background: transparent; }
.em-root { font-family: system-ui, -apple-system, sans-serif; }
.em-serif { font-family: Georgia, serif; }
.em-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.em-input::placeholder { color: rgba(255,255,255,0.25); }
.em-input:focus { border-color: rgba(240,169,107,.6); box-shadow: 0 0 0 3px rgba(240,169,107,.1); }
.em-btn {
  background: linear-gradient(135deg,#f0a96b,#e879a0);
  color: #0a0a12; font-weight: 600;
  transition: opacity .2s, transform .15s;
  box-shadow: 0 4px 20px rgba(240,169,107,.25);
}
.em-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.em-btn:disabled { opacity: .35; cursor: not-allowed; }
.em-otp {
  background: rgba(255,255,255,.05); border: 1.5px solid rgba(255,255,255,.12);
  color: #fff; font-weight: 600; text-align: center; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.em-otp:focus { border-color: #f0a96b; box-shadow: 0 0 0 3px rgba(240,169,107,.15); }
.em-card {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.09);
  transition: border-color .15s, background .15s;
}
.em-card:hover { border-color: rgba(240,169,107,.35); background: rgba(255,255,255,.06); }
.em-date { border: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.5); transition: all .15s; }
.em-date:hover:not(:disabled) { border-color: rgba(240,169,107,.4); color: #f0a96b; background: rgba(240,169,107,.06); }
.em-date.selected { background: linear-gradient(135deg,#f0a96b,#e879a0); border-color: transparent; color: #0a0a12; font-weight: 600; }
.em-date:disabled { opacity: .2; cursor: not-allowed; }
.em-slot { border: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.65); background: rgba(255,255,255,.03); transition: all .15s; }
.em-slot:hover { border-color: rgba(240,169,107,.4); color: #f0a96b; background: rgba(240,169,107,.07); }
@keyframes em-up { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
.em-up { animation: em-up .3s cubic-bezier(.22,1,.36,1) forwards; }
@keyframes em-spin { to { transform: rotate(360deg); } }
.em-spin { animation: em-spin .8s linear infinite; }
`.trim();

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmbedPage() {
  const { slug } = useParams<{ slug: string }>();

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
  const rootRef = useRef<HTMLDivElement>(null);

  // postMessage height to parent on every render
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = rootRef.current ?? document.body;
    const notify = () => {
      const h = el.scrollHeight;
      try { window.parent.postMessage({ type: 'bookedup:resize', height: h }, '*'); } catch { /* cross-origin parent */ }
    };
    notify();
    const ro = new ResizeObserver(notify);
    ro.observe(el);
    return () => ro.disconnect();
  }, [step, slots, myBookings, services]);

  // Initial load
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
        const ok = await fetchMyBookings(sess.token, slug);
        setStep(ok ? 'my-bookings' : 'welcome');
      } else {
        setStep('welcome');
      }
    })();
  }, [slug]);

  async function fetchMyBookings(token: string, s: string): Promise<boolean> {
    const res = await fetch(`/api/book/${s}/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { const { bookings } = await res.json(); setMyBookings(bookings ?? []); return true; }
    if (res.status === 401) { clearSession(s); setGuestToken(null); return false; }
    return true;
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
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otpInput.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/book/${slug}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), name: nameInput.trim(), code: otpInput }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const { token, email, name } = await res.json();
      saveSession(slug, { token, email, name });
      setGuestToken(token); setGuestEmail(email); setGuestName(name);
      setOtpInput('');
      await fetchMyBookings(token, slug);
      setStep('my-bookings');
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const arr = otpInput.split('').concat(Array(6).fill('')).slice(0, 6);
    arr[index] = digit;
    setOtpInput(arr.join(''));
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }

  async function loadSlots(service: Service, date: Date) {
    setSlots([]); setSelectedSlot(null);
    if (!guestToken) return;
    const from = format(date, 'yyyy-MM-dd');
    const res = await fetch(
      `/api/book/${slug}/slots?service_id=${service.id}&date_from=${from}&date_to=${from}`,
      { headers: { Authorization: `Bearer ${guestToken}` } }
    );
    if (res.ok) { const { slots: s } = await res.json(); setSlots(s); }
  }

  async function handleBook() {
    if (!selectedService || !selectedSlot || !guestToken) return;
    setError(null); setBusy(true);
    try {
      const res = await fetch(`/api/book/${slug}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${guestToken}` },
        body: JSON.stringify({ service_id: selectedService.id, starts_at: selectedSlot.startsAt }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const { checkout_url } = await res.json();
      setStep('redirecting');
      // Open Stripe in the top-level window to avoid iframe Stripe restrictions
      try { window.top!.location.href = checkout_url; } catch { window.location.href = checkout_url; }
    } catch (err: any) { setError(err.message); setBusy(false); }
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
      await fetchMyBookings(guestToken, slug);
    } catch (err: any) { setError(err.message); }
    finally { setCancellingId(null); }
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), weekOffset * 7 + i));
  const upcomingBookings = myBookings.filter(
    (b) => ['confirmed', 'pending'].includes(b.status) && new Date(b.ends_at) > new Date()
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: EMBED_STYLES }} />

      <div
        ref={rootRef}
        className="em-root"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(240,169,107,0.06) 0%, transparent 60%), #0a0a12',
          minHeight: 400,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
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
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#f0a96b,#e879a0)', boxShadow: '0 4px 12px rgba(240,169,107,0.3)' }}
            >
              <span className="em-serif text-sm font-bold" style={{ color: '#0a0a12' }}>
                {business?.name?.[0]?.toUpperCase() || 'B'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="em-serif text-sm font-semibold truncate" style={{ color: '#fff' }}>
                {business?.name || 'Book appointment'}
              </p>
              {guestEmail && step !== 'welcome' && step !== 'otp' && (
                <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{guestEmail}</p>
              )}
            </div>
          </div>

          {guestToken && step === 'my-bookings' && (
            <button
              onClick={() => { clearSession(slug); setGuestToken(null); setStep('welcome'); setNameInput(''); setEmailInput(''); }}
              className="text-[11px] px-2.5 py-1 rounded-lg"
              style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Sign out
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="mx-4 mt-3 px-3 py-2.5 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
          >
            <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
            <p className="text-xs flex-1" style={{ color: '#fca5a5' }}>{error}</p>
            <button onClick={() => setError(null)}><X className="w-3 h-3" style={{ color: 'rgba(248,113,113,0.5)' }} /></button>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-4">

          {/* LOADING */}
          {step === 'loading' && (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 rounded-full border-2 em-spin" style={{ borderColor: 'rgba(240,169,107,0.2)', borderTopColor: '#f0a96b' }} />
            </div>
          )}

          {/* WELCOME */}
          {step === 'welcome' && (
            <div className="pt-6 pb-2 em-up">
              <div className="text-center mb-7">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg,#f0a96b,#e879a0)', boxShadow: '0 8px 28px rgba(240,169,107,0.3)' }}
                >
                  <span className="em-serif text-2xl font-bold" style={{ color: '#0a0a12' }}>
                    {business?.name?.[0]?.toUpperCase() || 'B'}
                  </span>
                </div>
                <h1 className="em-serif text-2xl font-semibold mb-1.5" style={{ color: '#fff' }}>{business?.name}</h1>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Reserve your appointment</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-medium mb-1.5 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Your name</label>
                  <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                    placeholder="Jane Smith" required className="em-input w-full rounded-xl px-3.5 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium mb-1.5 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Email address</label>
                  <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)}
                    placeholder="jane@example.com" required className="em-input w-full rounded-xl px-3.5 py-3 text-sm" />
                </div>
                <button type="submit" disabled={busy || !nameInput.trim() || !emailInput.trim()}
                  className="em-btn w-full rounded-xl py-3 text-sm flex items-center justify-center gap-2 mt-1">
                  {busy
                    ? <div className="w-4 h-4 rounded-full border-2 em-spin" style={{ borderColor: 'rgba(10,10,18,.3)', borderTopColor: '#0a0a12' }} />
                    : <Mail className="w-4 h-4" />}
                  Send verification code
                </button>
              </form>
              <p className="text-[11px] text-center mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Already booked? Use the same email to view your appointments.
              </p>
            </div>
          )}

          {/* OTP */}
          {step === 'otp' && (
            <div className="pt-6 pb-2 em-up">
              <div className="text-center mb-7">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(240,169,107,0.1)', border: '1px solid rgba(240,169,107,0.2)' }}
                >
                  <Mail className="w-6 h-6" style={{ color: '#f0a96b' }} />
                </div>
                <h2 className="em-serif text-xl font-semibold mb-1.5" style={{ color: '#fff' }}>Check your email</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  We sent a 6-digit code to<br />
                  <span className="font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{emailInput}</span>
                </p>
              </div>
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={otpInput[i] ?? ''}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="em-otp w-10 h-11 rounded-xl text-base"
                    />
                  ))}
                </div>
                <button type="submit" disabled={busy || otpInput.length !== 6}
                  className="em-btn w-full rounded-xl py-3 text-sm flex items-center justify-center gap-2">
                  {busy ? <div className="w-4 h-4 rounded-full border-2 em-spin" style={{ borderColor: 'rgba(10,10,18,.3)', borderTopColor: '#0a0a12' }} /> : 'Verify & continue'}
                </button>
              </form>
            </div>
          )}

          {/* MY BOOKINGS */}
          {step === 'my-bookings' && (
            <div className="pt-4 pb-2 em-up space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {upcomingBookings.length > 0 ? 'Your appointments' : 'No upcoming appointments'}
                </p>
              </div>

              {upcomingBookings.map(b => (
                <div key={b.id} className="em-card rounded-xl px-3.5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#fff' }}>{b.services?.name ?? 'Appointment'}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {format(new Date(b.starts_at), 'EEE, MMM d · h:mm a')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancellingId === b.id}
                      className="text-[11px] px-2 py-1 rounded-lg flex-shrink-0"
                      style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.15)' }}
                    >
                      {cancellingId === b.id ? '…' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setStep('services')}
                className="em-btn w-full rounded-xl py-3 text-sm font-semibold"
              >
                Book new appointment
              </button>
            </div>
          )}

          {/* SERVICES */}
          {step === 'services' && (
            <div className="pt-4 pb-2 em-up space-y-2">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Choose a service</p>
              {services.map(svc => (
                <button
                  key={svc.id}
                  onClick={() => { setSelectedService(svc); setStep('calendar'); loadSlots(svc, selectedDate); }}
                  className="em-card w-full rounded-xl px-3.5 py-3 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#fff' }}>{svc.name}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{svc.duration_mins} min</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#f0a96b' }}>${svc.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* CALENDAR + SLOTS */}
          {(step === 'calendar' || step === 'slots') && (
            <div className="pt-4 pb-2 em-up">
              {selectedService && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Pick a date</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { if (weekOffset > 0) setWeekOffset(w => w - 1); }}
                      disabled={weekOffset === 0}
                      className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setWeekOffset(w => w + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Date pills */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map(day => {
                  const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  const isPast = day < startOfToday();
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        setSelectedDate(day);
                        if (selectedService) loadSlots(selectedService, day);
                        setStep('slots');
                      }}
                      disabled={isPast}
                      className={`em-date rounded-xl py-2 flex flex-col items-center gap-0.5${isSelected ? ' selected' : ''}`}
                    >
                      <span className="text-[9px] font-medium">{format(day, 'EEE')}</span>
                      <span className="text-sm font-semibold">{format(day, 'd')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Slots */}
              {step === 'slots' && (
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {format(selectedDate, 'EEEE, MMM d')}
                  </p>
                  {slots.length === 0 ? (
                    <p className="text-center py-6 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No slots available — try another date</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      {slots.map(slot => (
                        <button key={slot.startsAt} onClick={() => { setSelectedSlot(slot); setStep('review'); }}
                          className="em-slot rounded-xl py-2 text-xs font-medium text-center">
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* REVIEW */}
          {step === 'review' && selectedService && selectedSlot && (
            <div className="pt-4 pb-2 em-up space-y-3">
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Review & confirm</p>
              <div className="rounded-xl px-4 py-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Service</p>
                  <p className="text-sm font-medium" style={{ color: '#fff' }}>{selectedService.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Duration</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{selectedService.duration_mins} min</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Date & time</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {format(new Date(selectedSlot.startsAt), 'EEE, MMM d · h:mm a')}
                  </p>
                </div>
                <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)' }} />
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Total</p>
                  <p className="text-base font-bold" style={{ color: '#f0a96b' }}>${selectedService.price.toFixed(2)}</p>
                </div>
              </div>
              <button onClick={handleBook} disabled={busy} className="em-btn w-full rounded-xl py-3 text-sm flex items-center justify-center gap-2">
                {busy ? <div className="w-4 h-4 rounded-full border-2 em-spin" style={{ borderColor: 'rgba(10,10,18,.3)', borderTopColor: '#0a0a12' }} /> : 'Confirm & pay'}
              </button>
              <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                You'll be redirected to Stripe to complete payment securely.
              </p>
            </div>
          )}

          {/* REDIRECTING */}
          {step === 'redirecting' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-8 h-8 rounded-full border-2 em-spin" style={{ borderColor: 'rgba(240,169,107,0.2)', borderTopColor: '#f0a96b' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Redirecting to payment…</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-center gap-1.5 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Powered by</span>
          <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>BookedUp</span>
        </div>
      </div>
    </>
  );
}
