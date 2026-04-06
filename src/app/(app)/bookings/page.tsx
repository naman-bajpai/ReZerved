'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, Filter, ChevronDown, X, CheckCircle2,
  AlertCircle, Ban, UserX, ArrowUpRight, Sparkles, DollarSign,
  Search, ChevronRight, Phone,
} from 'lucide-react';
import { getBookings, updateBookingStatus, type Booking } from '@/lib/api';

/* ─── Status config ────────────────────────────────────────── */
const STATUS_CFG: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ElementType }> = {
  pending:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)',  label: 'Pending',   icon: Clock },
  confirmed: { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)',  label: 'Confirmed', icon: CheckCircle2 },
  cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', label: 'Cancelled', icon: Ban },
  expired:   { color: 'rgba(244,244,245,0.35)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)', label: 'Expired', icon: AlertCircle },
  no_show:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', label: 'No Show',  icon: UserX },
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
function BookingCard({ booking, idx, onStatusChange }: {
  booking: Booking; idx: number; onStatusChange: (id: string, status: 'confirmed' | 'cancelled' | 'no_show') => void;
}) {
  const [open, setOpen] = useState(false);
  const [acting, setActing] = useState(false);

  async function act(status: 'confirmed' | 'cancelled' | 'no_show') {
    setActing(true);
    try {
      await onStatusChange(booking.id, status);
    } finally {
      setActing(false);
      setOpen(false);
    }
  }

  const cfg = STATUS_CFG[booking.status] || STATUS_CFG.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
      whileHover={{ borderColor: `${cfg.color}18`, transition: { duration: 0.2 } }}
    >
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {/* Status stripe */}
        <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: cfg.color, opacity: 0.7 }} />

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold" style={{ background: `${cfg.color}15`, color: cfg.color }}>
          {(booking.clients?.name || 'U').charAt(0).toUpperCase()}
        </div>

        {/* Client + service */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[14px] font-semibold truncate" style={{ color: '#f4f4f5' }}>{booking.clients?.name || 'Client'}</p>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-[12px] truncate" style={{ color: 'rgba(244,244,245,0.4)' }}>{booking.services?.name}</p>
        </div>

        {/* Date/time */}
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className="text-[13px] font-medium" style={{ color: 'rgba(244,244,245,0.7)' }}>{fmtDate(booking.starts_at)}</p>
          <p className="text-[11px] mt-0.5 flex items-center justify-end gap-1" style={{ color: 'rgba(244,244,245,0.35)' }}>
            <Clock className="w-3 h-3" />{fmtTime(booking.starts_at)}
          </p>
        </div>

        {/* Price */}
        {booking.services?.price && (
          <div className="text-[14px] font-bold font-mono-nums flex-shrink-0 hidden md:block" style={{ color: '#f59e0b' }}>
            {fmtCurrency(booking.services.price)}
          </div>
        )}

        {/* Expand */}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown className="w-4 h-4" style={{ color: 'rgba(244,244,245,0.3)' }} />
        </motion.div>
      </div>

      {/* Expanded actions */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3 mb-4 pl-[calc(4px+40px+16px)]">
                <div className="text-[12px] rounded-xl px-3 py-1.5 sm:hidden" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(244,244,245,0.6)' }}>
                  {fmtDate(booking.starts_at)} · {fmtTime(booking.starts_at)}
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="flex gap-2 pl-[calc(4px+40px+16px)]">
                  <button
                    onClick={() => act('confirmed')} disabled={acting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                    style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                  </button>
                  <button
                    onClick={() => act('cancelled')} disabled={acting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                    style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              )}
              {booking.status === 'confirmed' && (
                <div className="flex gap-2 pl-[calc(4px+40px+16px)]">
                  <button
                    onClick={() => act('no_show')} disabled={acting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                    style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}
                  >
                    <UserX className="w-3.5 h-3.5" /> Mark No-Show
                  </button>
                  <button
                    onClick={() => act('cancelled')} disabled={acting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                    style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              )}
              {(booking.status === 'cancelled' || booking.status === 'no_show' || booking.status === 'expired') && (
                <div className="pl-[calc(4px+40px+16px)]">
                  <p className="text-[12px]" style={{ color: 'rgba(244,244,245,0.3)' }}>No actions available for this booking.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="skeleton w-1 h-12 rounded-full flex-shrink-0" />
      <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="skeleton h-4 w-24 rounded hidden sm:block" />
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

  const fetchBookings = () => {
    setLoading(true);
    getBookings({ status: statusFilter || undefined, date: dateFilter || undefined })
      .then(d => setBookings(d.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [statusFilter, dateFilter]);

  async function handleStatusChange(id: string, status: 'confirmed' | 'cancelled' | 'no_show') {
    try {
      await updateBookingStatus(id, status);
      fetchBookings();
    } catch (err) {
      console.error(err);
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
    <div className="space-y-7 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
            Bookings
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.4)' }}>
            Manage and track all your appointments
          </p>
        </div>
        {counts.pending > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <Clock className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
            <span className="text-[13px] font-semibold" style={{ color: '#fbbf24' }}>{counts.pending} pending</span>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {STATUS_FILTERS.map(({ val, label }) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={statusFilter === val ? {
                background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)'
              } : { color: 'rgba(244,244,245,0.45)' }}
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
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(244,244,245,0.6)', colorScheme: 'dark' }}
        />

        {dateFilter && (
          <button onClick={() => setDateFilter('')} className="flex items-center gap-1 text-[12px] px-2 py-1 rounded-lg" style={{ color: '#fb7185', background: 'rgba(248,113,113,0.08)' }}>
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(244,244,245,0.3)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings…"
            className="pl-9 pr-4 py-2 rounded-xl text-[12px] outline-none w-48 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(244,244,245,0.8)', caretColor: '#f59e0b' }}
          />
        </div>
      </motion.div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <CalendarDays className="w-7 h-7" style={{ color: 'rgba(244,244,245,0.2)' }} strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgba(244,244,245,0.5)' }}>No bookings found</p>
            <p className="text-[13px]" style={{ color: 'rgba(244,244,245,0.25)' }}>Try adjusting your filters</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filtered.map((booking, i) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                idx={i}
                onStatusChange={handleStatusChange}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Count line */}
      {!loading && filtered.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[12px] text-center"
          style={{ color: 'rgba(244,244,245,0.2)' }}
        >
          {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
          {statusFilter ? ` · ${STATUS_CFG[statusFilter]?.label}` : ''}
        </motion.p>
      )}
    </div>
  );
}
