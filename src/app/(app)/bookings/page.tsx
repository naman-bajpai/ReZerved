'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays, Clock, X, CheckCircle2,
  AlertCircle, Ban, UserX, ChevronDown, Search,
} from 'lucide-react';
import { getBookings, updateBookingStatus, type Booking } from '@/lib/api';
import { PageTransition } from '@/components/page-transition';

/* ─── Status config ────────────────────────────────────────── */
const STATUS_CFG: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ElementType }> = {
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.2)',   label: 'Pending',   icon: Clock },
  confirmed: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.2)',   label: 'Confirmed', icon: CheckCircle2 },
  cancelled: { color: '#fb7185', bg: 'rgba(251,113,133,0.08)',  border: 'rgba(251,113,133,0.2)',  label: 'Cancelled', icon: Ban },
  expired:   { color: '#71717a', bg: 'rgba(113,113,122,0.08)',  border: 'rgba(113,113,122,0.2)',  label: 'Expired',   icon: AlertCircle },
  no_show:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)',  border: 'rgba(167,139,250,0.2)',  label: 'No Show',   icon: UserX },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function fmtCurrency(v: number | string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0));
}

/* ─── Status badge ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <Icon className="w-3 h-3" strokeWidth={2} />
      {cfg.label}
    </span>
  );
}

/* ─── Booking card ─────────────────────────────────────────── */
function BookingCard({ booking, onStatusChange }: {
  booking: Booking; onStatusChange: (id: string, status: 'confirmed' | 'cancelled' | 'no_show') => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [acting, setActing] = useState(false);

  async function act(e: React.MouseEvent, status: 'confirmed' | 'cancelled' | 'no_show') {
    e.stopPropagation();
    setActing(true);
    try {
      await onStatusChange(booking.id, status);
      setOpen(false);
    } catch {
      // error already surfaced by onStatusChange
    } finally {
      setActing(false);
    }
  }

  const cfg = STATUS_CFG[booking.status] || STATUS_CFG.pending;

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-150 hover:translate-y-[-1px]"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `2px solid ${cfg.color}`,
      }}
    >
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-150"
        onClick={() => setOpen(!open)}
      >
        {/* Status dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}90` }}
        />

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
          {(booking.clients?.name || 'U').charAt(0).toUpperCase()}
        </div>

        {/* Client + service */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[14px] font-semibold truncate" style={{ color: '#f4f4f5' }}>{booking.clients?.name || 'Client'}</p>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-[12px] truncate" style={{ color: '#71717a' }}>{booking.services?.name}</p>
        </div>

        {/* Date/time */}
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className="text-[13px] font-medium" style={{ color: '#f4f4f5' }}>{fmtDate(booking.starts_at)}</p>
          <p className="text-[11px] mt-0.5 flex items-center justify-end gap-1" style={{ color: '#52525b' }}>
            <Clock className="w-3 h-3" />{fmtTime(booking.starts_at)}
          </p>
        </div>

        {/* Price */}
        {booking.services?.price && (
          <div className="text-[14px] font-bold flex-shrink-0 hidden md:block" style={{ color: '#f97316' }}>
            {fmtCurrency(booking.services.price)}
          </div>
        )}

        {/* Expand */}
        <div
          className="flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: '#52525b' }} />
        </div>
      </div>

      {/* Expanded actions */}
      {open && (
        <div className="overflow-hidden">
          <div className="px-5 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3 mb-4 pl-[calc(4px+40px+16px)]">
              <div className="text-[12px] rounded-xl px-3 py-1.5 sm:hidden" style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}>
                {fmtDate(booking.starts_at)} · {fmtTime(booking.starts_at)}
              </div>
            </div>

            {booking.status === 'pending' && (
              <div className="flex gap-2 pl-[calc(4px+40px+16px)]">
                <button
                  onClick={(e) => act(e, 'confirmed')} disabled={acting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                  style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                </button>
                <button
                  onClick={(e) => act(e, 'cancelled')} disabled={acting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                  style={{ background: 'rgba(220,38,38,0.07)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            )}
            {booking.status === 'confirmed' && (
              <div className="flex gap-2 pl-[calc(4px+40px+16px)]">
                <button
                  onClick={(e) => act(e, 'no_show')} disabled={acting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                  style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  <UserX className="w-3.5 h-3.5" /> Mark No-Show
                </button>
                <button
                  onClick={(e) => act(e, 'cancelled')} disabled={acting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                  style={{ background: 'rgba(220,38,38,0.07)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            )}
            {(booking.status === 'cancelled' || booking.status === 'no_show' || booking.status === 'expired') && (
              <div className="pl-[calc(4px+40px+16px)]">
                <p className="text-[12px]" style={{ color: '#52525b' }}>No actions available for this booking.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Filter bar ───────────────────────────────────────────── */
const STATUS_FILTERS = [
  { val: '', label: 'All' },
  { val: 'pending',   label: 'Pending' },
  { val: 'confirmed', label: 'Confirmed' },
  { val: 'cancelled', label: 'Cancelled' },
  { val: 'no_show',   label: 'No Show' },
];

/* ─── Page ─────────────────────────────────────────────────── */
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    getBookings({ status: statusFilter || undefined, date: dateFilter || undefined })
      .then(d => setBookings(d.bookings))
      .catch((err) => {
        console.error(err);
        setActionError(err instanceof Error ? err.message : 'Failed to load bookings.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [statusFilter, dateFilter]);

  async function handleStatusChange(id: string, status: 'confirmed' | 'cancelled' | 'no_show') {
    setActionError(null);
    try {
      await updateBookingStatus(id, status);
      fetchBookings();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update booking status.';
      setActionError(message);
      throw err;
    }
  }

  const filtered = bookings.filter(b =>
    !search || b.clients?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.services?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
  };

  return (
    <PageTransition>
      <div className="space-y-7 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
              Bookings
            </h1>
            <p className="text-[14px] mt-1" style={{ color: '#71717a' }}>
              Manage and track all your appointments
            </p>
          </div>
          {counts.pending > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Clock className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
              <span className="text-[13px] font-semibold" style={{ color: '#f59e0b' }}>{counts.pending} pending</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status tabs */}
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {STATUS_FILTERS.map(({ val, label }) => (
              <button key={val} onClick={() => setStatusFilter(val)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={statusFilter === val ? {
                  background: 'rgba(245,158,11,0.12)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245,158,11,0.22)',
                  boxShadow: '0 0 10px rgba(245,158,11,0.08)',
                } : { color: '#52525b' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Date picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-[12px] outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#f4f4f5' }}
          />

          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="flex items-center gap-1 text-[12px] px-2 py-1 rounded-lg" style={{ color: '#fb7185', background: 'rgba(251,113,133,0.07)' }}>
              <X className="w-3 h-3" /> Clear
            </button>
          )}

          {/* Search */}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#52525b' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search bookings…"
              className="pl-9 pr-4 py-2 rounded-xl text-[12px] outline-none w-48 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#f4f4f5' }}
            />
          </div>
        </div>

        {actionError && (
          <div
            className="rounded-xl px-4 py-3 text-[13px] flex items-center justify-between gap-3"
            style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#fca5a5' }}
          >
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-[12px] font-semibold"
              style={{ color: '#fecaca' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 rounded-full border-2 border-[#f97316]/20 border-t-[#f97316] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <CalendarDays className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.06)' }} strokeWidth={1.5} />
              </div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: '#f4f4f5' }}>No bookings found</p>
              <p className="text-[13px]" style={{ color: '#52525b' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {filtered.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </>
          )}
        </div>

        {/* Count line */}
        {!loading && filtered.length > 0 && (
          <p
            className="text-[12px] text-center"
            style={{ color: '#52525b' }}
          >
            {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
            {statusFilter ? ` · ${STATUS_CFG[statusFilter]?.label}` : ''}
          </p>
        )}
      </div>
    </PageTransition>
  );
}
