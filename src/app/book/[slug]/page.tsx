'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { ArrowLeft, CheckCircle, Clock, DollarSign, Mail, RefreshCw, X, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
  | 'welcome'          // show identity form or returning greeting
  | 'otp'             // enter 6-digit code
  | 'my-bookings'     // returning user sees their bookings
  | 'services'        // pick a service
  | 'calendar'        // pick a date
  | 'slots'           // pick a time slot
  | 'review'          // confirm + pay
  | 'redirecting';    // going to Stripe

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

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-600',
  expired: 'bg-gray-50 text-gray-500',
  no_show: 'bg-red-50 text-red-600',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  // Data state
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [myBookings, setMyBookings] = useState<GuestBooking[]>([]);

  // Auth state
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');

  // Form state
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');

  // Booking flow
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // UI state
  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Init ──────────────────────────────────────────────────────────────────

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

      // Came back from a cancelled Stripe session
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
      setMyBookings(bookings);
    }
  }

  // ─── Auth handlers ─────────────────────────────────────────────────────────

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

  // ─── OTP input handling ────────────────────────────────────────────────────

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

  // ─── Slots ────────────────────────────────────────────────────────────────

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

  // ─── Booking ──────────────────────────────────────────────────────────────

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

  // ─── Cancel booking ────────────────────────────────────────────────────────

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

  // ─── Render helpers ────────────────────────────────────────────────────────

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), weekOffset * 7 + i));

  const upcomingBookings = myBookings.filter(
    (b) => ['confirmed', 'pending'].includes(b.status) && new Date(b.starts_at) > new Date()
  );
  const pastBookings = myBookings.filter(
    (b) => !['confirmed', 'pending'].includes(b.status) || new Date(b.starts_at) <= new Date()
  );

  // ─── Shell ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen flex flex-col bg-white shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          {step !== 'welcome' && step !== 'loading' && step !== 'my-bookings' && (
            <button
              onClick={() => {
                if (step === 'otp') { setStep('welcome'); setOtpInput(''); }
                else if (step === 'services') setStep('my-bookings');
                else if (step === 'calendar') setStep('services');
                else if (step === 'slots') setStep('calendar');
                else if (step === 'review') setStep('slots');
              }}
              className="p-1 -ml-1 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ec4899] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {business?.name?.[0]?.toUpperCase() || 'B'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0f0a1e] truncate">
                {business?.name || 'BookedUp'}
              </p>
              {step !== 'welcome' && step !== 'loading' && step !== 'otp' && (
                <p className="text-xs text-gray-400 truncate">{guestEmail}</p>
              )}
            </div>
          </div>
          {guestToken && step === 'my-bookings' && (
            <button
              onClick={() => { clearSession(slug); setGuestToken(null); setStep('welcome'); setNameInput(''); setEmailInput(''); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign out
            </button>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
            <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={() => setError(null)}>
              <X className="w-3.5 h-3.5 text-red-300" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── LOADING ── */}
          {step === 'loading' && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 text-[#f97316] animate-spin" />
            </div>
          )}

          {/* ── WELCOME / IDENTITY ── */}
          {step === 'welcome' && (
            <div className="px-4 pt-8 pb-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ec4899] flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {business?.name?.[0]?.toUpperCase() || 'B'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-[#0f0a1e]">{business?.name}</h1>
                <p className="text-sm text-gray-500 mt-1">Book your appointment</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Jane Smith"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="jane@example.com"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/15 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy || !nameInput.trim() || !emailInput.trim()}
                  className="w-full rounded-xl bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white py-3 text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send verification code
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                Already booked? Use the same email to access your bookings.
              </p>
            </div>
          )}

          {/* ── OTP ── */}
          {step === 'otp' && (
            <div className="px-4 pt-8 pb-6">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-[#f97316]" />
                </div>
                <h2 className="text-xl font-bold text-[#0f0a1e]">Check your email</h2>
                <p className="text-sm text-gray-500 mt-1.5">
                  We sent a 6-digit code to<br />
                  <span className="font-medium text-[#0f0a1e]">{emailInput}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex gap-2 justify-center">
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
                      className="w-11 h-14 rounded-xl border-2 border-gray-200 text-center text-xl font-bold outline-none focus:border-[#f97316] transition-colors"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={busy || otpInput.length !== 6}
                  className="w-full rounded-xl bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white py-3 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
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
                  className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend code
                </button>
              </form>
            </div>
          )}

          {/* ── MY BOOKINGS ── */}
          {step === 'my-bookings' && (
            <div className="px-4 pt-6 pb-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#0f0a1e]">
                  Hi, {guestName.split(' ')[0]}!
                </h2>
                <p className="text-sm text-gray-500">Here are your appointments.</p>
              </div>

              {upcomingBookings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    Upcoming
                  </p>
                  <div className="space-y-2">
                    {upcomingBookings.map((b) => (
                      <div key={b.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#0f0a1e] truncate">
                              {b.services?.name || 'Appointment'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(b.starts_at), 'EEE, MMM d · h:mm a')}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status] || 'bg-gray-50 text-gray-500'}`}>
                              {b.status}
                            </span>
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancellingId === b.id}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              {cancellingId === b.id ? 'Cancelling…' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{b.services?.duration_mins} min
                          </span>
                          <span className="text-xs font-semibold text-[#0f0a1e]">
                            ${Number(b.total_price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {upcomingBookings.length === 0 && (
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 text-center">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No upcoming appointments</p>
                </div>
              )}

              <button
                onClick={() => setStep('services')}
                className="w-full rounded-xl bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Book a new appointment
              </button>

              {pastBookings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    Past
                  </p>
                  <div className="space-y-2">
                    {pastBookings.slice(0, 5).map((b) => (
                      <div key={b.id} className="rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-gray-600 truncate">{b.services?.name}</p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(b.starts_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[b.status] || 'bg-gray-50 text-gray-500'}`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SERVICES ── */}
          {step === 'services' && (
            <div className="px-4 pt-6 pb-6">
              <h2 className="text-lg font-bold text-[#0f0a1e] mb-1">Choose a service</h2>
              <p className="text-sm text-gray-500 mb-5">Select what you'd like to book.</p>

              {services.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No services available yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => selectService(svc)}
                      className="w-full text-left rounded-xl border border-gray-100 bg-white p-4 hover:border-[#f97316]/40 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-[#0f0a1e] group-hover:text-[#f97316] transition-colors">
                          {svc.name}
                        </p>
                        <span className="text-sm font-bold text-[#f97316]">
                          ${Number(svc.price).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {svc.duration_mins} min
                        </span>
                        {svc.add_ons?.length > 0 && (
                          <span className="text-xs text-gray-400">
                            +{svc.add_ons.length} add-on{svc.add_ons.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CALENDAR ── */}
          {step === 'calendar' && (
            <div className="px-4 pt-6 pb-6">
              <h2 className="text-lg font-bold text-[#0f0a1e] mb-1">Pick a date</h2>
              <p className="text-sm text-gray-500 mb-5">
                {selectedService?.name} · {selectedService?.duration_mins} min
              </p>

              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => { setWeekOffset(w => Math.max(0, w - 1)); }}
                  disabled={weekOffset === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
                </span>
                <button
                  onClick={() => setWeekOffset(w => w + 1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const isPast = day < startOfToday();
                  const isSelected = isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => !isPast && selectDate(day)}
                      disabled={isPast}
                      className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-medium transition-all
                        ${isPast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-orange-50'}
                        ${isSelected ? 'bg-gradient-to-b from-[#f97316] to-[#ec4899] text-white shadow-md' : 'text-gray-700'}
                      `}
                    >
                      <span className="text-[10px] mb-1 font-normal opacity-70">
                        {format(day, 'EEE')}
                      </span>
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setStep('slots')}
                className="w-full mt-5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                See available times
              </button>
            </div>
          )}

          {/* ── SLOTS ── */}
          {step === 'slots' && (
            <div className="px-4 pt-6 pb-6">
              <h2 className="text-lg font-bold text-[#0f0a1e] mb-1">Choose a time</h2>
              <p className="text-sm text-gray-500 mb-5">
                {format(selectedDate, 'EEEE, MMMM d')}
              </p>

              {slots.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-1">No available times on this day.</p>
                  <button
                    onClick={() => setStep('calendar')}
                    className="text-sm text-[#f97316] font-medium"
                  >
                    Pick another date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.startsAt}
                      onClick={() => selectSlot(slot)}
                      className="rounded-xl border border-gray-100 py-3 text-sm font-medium text-gray-700 hover:border-[#f97316]/40 hover:bg-orange-50 hover:text-[#f97316] transition-all"
                    >
                      {format(new Date(slot.startsAt), 'h:mm a')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REVIEW ── */}
          {step === 'review' && selectedService && selectedSlot && (
            <div className="px-4 pt-6 pb-6 space-y-4">
              <h2 className="text-lg font-bold text-[#0f0a1e]">Confirm your booking</h2>

              <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#f97316]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Date & time</p>
                    <p className="text-sm font-semibold text-[#0f0a1e]">
                      {format(new Date(selectedSlot.startsAt), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedSlot.startsAt), 'h:mm a')} –{' '}
                      {format(new Date(selectedSlot.endsAt), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#ec4899]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Service</p>
                    <p className="text-sm font-semibold text-[#0f0a1e]">{selectedService.name}</p>
                    <p className="text-sm text-gray-600">{selectedService.duration_mins} min</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Total</p>
                    <p className="text-xl font-bold text-[#0f0a1e]">
                      ${Number(selectedService.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500">
                  Booking for <span className="font-medium text-gray-700">{guestName}</span> ({guestEmail})
                </p>
              </div>

              <button
                onClick={handleBook}
                disabled={busy}
                className="w-full rounded-xl bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white py-4 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Pay ${Number(selectedService.price).toFixed(2)} to confirm
              </button>

              <p className="text-xs text-center text-gray-400">
                Secured by Stripe · Cancel up to 2 hours before
              </p>
            </div>
          )}

          {/* ── REDIRECTING ── */}
          {step === 'redirecting' && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-8 h-8 text-[#f97316] animate-spin" />
              <p className="text-sm text-gray-500">Redirecting to checkout…</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
