'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, CheckCircle2, X, UserX, Clock,
  Ban, AlertCircle, User, Scissors, DollarSign,
} from 'lucide-react';
import { type Booking } from '@/lib/api';

/* ─── Constants ─────────────────────────────────────────────── */
const HOUR_HEIGHT = 72;   // px per hour
const GRID_START  = 7;    // 7 AM
const GRID_END    = 22;   // 10 PM
const HOURS = Array.from({ length: GRID_END - GRID_START }, (_, i) => GRID_START + i);

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CFG: Record<string, { color: string; bg: string; border: string; glow: string; label: string; icon: React.ElementType }> = {
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.35)',  glow: 'rgba(245,158,11,0.2)',  label: 'Pending',   icon: Clock },
  confirmed: { color: '#34d399', bg: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.35)',  glow: 'rgba(52,211,153,0.2)',  label: 'Confirmed', icon: CheckCircle2 },
  cancelled: { color: '#fb7185', bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.3)',  glow: 'rgba(251,113,133,0.15)',label: 'Cancelled', icon: Ban },
  expired:   { color: '#71717a', bg: 'rgba(113,113,122,0.12)', border: 'rgba(113,113,122,0.25)', glow: 'rgba(113,113,122,0.1)', label: 'Expired',   icon: AlertCircle },
  no_show:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.35)', glow: 'rgba(167,139,250,0.2)', label: 'No Show',   icon: UserX },
};

/* ─── Helpers ───────────────────────────────────────────────── */
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtTime(d: string | Date) {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtCurrency(v: number | string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0));
}

/* ─── Overlap layout computation ─────────────────────────────── */
interface BookingLayout {
  col: number;
  totalCols: number;
}

function computeLayouts(bookings: Booking[]): Map<string, BookingLayout> {
  const sorted = [...bookings].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );

  const result = new Map<string, BookingLayout>();
  // Each element is an array of bookings currently "active" in that column
  const columns: Booking[][] = [];

  for (const booking of sorted) {
    const start = new Date(booking.starts_at).getTime();
    const end   = new Date(booking.ends_at).getTime();

    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const last = columns[c][columns[c].length - 1];
      if (new Date(last.ends_at).getTime() <= start) {
        columns[c].push(booking);
        result.set(booking.id, { col: c, totalCols: 0 });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([booking]);
      result.set(booking.id, { col: columns.length - 1, totalCols: 0 });
    }
  }

  // Update totalCols — for simplicity we assign total columns = max concurrent at any point
  // We do a two-pass: find the maximum columns that each booking overlaps with.
  for (const booking of sorted) {
    const start = new Date(booking.starts_at).getTime();
    const end   = new Date(booking.ends_at).getTime();
    let maxCol = (result.get(booking.id)?.col ?? 0) + 1;
    for (const other of sorted) {
      if (other.id === booking.id) continue;
      const os = new Date(other.starts_at).getTime();
      const oe = new Date(other.ends_at).getTime();
      if (os < end && oe > start) {
        const otherCol = (result.get(other.id)?.col ?? 0) + 1;
        if (otherCol > maxCol) maxCol = otherCol;
      }
    }
    const cur = result.get(booking.id)!;
    result.set(booking.id, { col: cur.col, totalCols: maxCol });
  }

  return result;
}

/* ─── Booking block ─────────────────────────────────────────── */
function BookingBlock({
  booking, layout, onClick, isSelected,
}: {
  booking: Booking;
  layout: BookingLayout;
  onClick: (b: Booking, rect: DOMRect) => void;
  isSelected: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CFG[booking.status] ?? STATUS_CFG.pending;

  const startDate = new Date(booking.starts_at);
  const endDate   = new Date(booking.ends_at);

  const startMins = startDate.getHours() * 60 + startDate.getMinutes();
  const endMins   = endDate.getHours() * 60 + endDate.getMinutes();
  const dur = endMins - startMins;

  const top    = ((startMins - GRID_START * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max((dur / 60) * HOUR_HEIGHT, 28);

  const left  = layout.totalCols > 1 ? `${(layout.col / layout.totalCols) * 100}%` : '2px';
  const width = layout.totalCols > 1 ? `calc(${(1 / layout.totalCols) * 100}% - 4px)` : 'calc(100% - 4px)';

  const isShort = height < 44;

  return (
    <div
      ref={ref}
      onClick={() => ref.current && onClick(booking, ref.current.getBoundingClientRect())}
      className="absolute cursor-pointer rounded-lg overflow-hidden transition-all duration-150 hover:brightness-110 select-none"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left,
        width,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        boxShadow: isSelected ? `0 0 0 2px ${cfg.color}, 0 4px 16px ${cfg.glow}` : `0 2px 8px ${cfg.glow}`,
        zIndex: isSelected ? 20 : 10,
      }}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-start overflow-hidden">
        <p
          className="font-semibold leading-tight truncate"
          style={{ color: cfg.color, fontSize: isShort ? '10px' : '11px' }}
        >
          {booking.clients?.name || booking.guest_name || 'Client'}
        </p>
        {!isShort && (
          <p className="truncate leading-tight mt-0.5" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>
            {booking.services?.name}
          </p>
        )}
        {!isShort && height >= 60 && (
          <p className="leading-tight mt-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>
            {fmtTime(booking.starts_at)} – {fmtTime(booking.ends_at)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Booking detail panel ──────────────────────────────────── */
function BookingDetail({
  booking, onClose, onStatusChange, acting,
}: {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: string, status: 'confirmed' | 'cancelled' | 'no_show') => Promise<void>;
  acting: boolean;
}) {
  const cfg = STATUS_CFG[booking.status] ?? STATUS_CFG.pending;
  const Icon = cfg.icon;

  async function act(status: 'confirmed' | 'cancelled' | 'no_show') {
    await onStatusChange(booking.id, status);
    onClose();
  }

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: '#141417',
        border: `1px solid rgba(255,255,255,0.1)`,
        borderTop: `2px solid ${cfg.color}`,
        minWidth: 280,
        maxWidth: 320,
      }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            <Icon className="w-3 h-3" strokeWidth={2} />
            {cfg.label}
          </div>
          <p className="text-[15px] font-bold leading-tight" style={{ color: '#f4f4f5' }}>
            {booking.clients?.name || booking.guest_name || 'Client'}
          </p>
          {booking.clients?.phone && (
            <p className="text-[11px] mt-0.5" style={{ color: '#71717a' }}>{booking.clients.phone}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: '#52525b' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pb-4 space-y-2.5">
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <Row icon={Clock}>
            <span className="font-medium" style={{ color: '#f4f4f5' }}>
              {new Date(booking.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span style={{ color: '#52525b' }}>
              {' '}· {fmtTime(booking.starts_at)} – {fmtTime(booking.ends_at)}
            </span>
          </Row>
          {booking.services?.name && (
            <Row icon={Scissors}>
              <span style={{ color: '#d4d4d8' }}>{booking.services.name}</span>
              {booking.services.duration_mins && (
                <span style={{ color: '#52525b' }}> · {booking.services.duration_mins} min</span>
              )}
            </Row>
          )}
          {(booking.total_price || booking.services?.price) && (
            <Row icon={DollarSign}>
              <span style={{ color: '#f97316' }}>
                {fmtCurrency(booking.total_price || booking.services?.price || 0)}
              </span>
              {booking.payment_status && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                  style={{
                    background: booking.payment_status === 'paid' ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.1)',
                    color: booking.payment_status === 'paid' ? '#34d399' : '#f59e0b',
                  }}
                >
                  {booking.payment_status}
                </span>
              )}
            </Row>
          )}
        </div>

        {/* Actions */}
        {booking.status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <ActionBtn onClick={() => act('confirmed')} disabled={acting}
              color="#16a34a" bg="rgba(22,163,74,0.08)" border="rgba(22,163,74,0.2)"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >Confirm</ActionBtn>
            <ActionBtn onClick={() => act('cancelled')} disabled={acting}
              color="#dc2626" bg="rgba(220,38,38,0.07)" border="rgba(220,38,38,0.18)"
              icon={<X className="w-3.5 h-3.5" />}
            >Cancel</ActionBtn>
          </div>
        )}
        {booking.status === 'confirmed' && (
          <div className="flex gap-2 pt-1">
            <ActionBtn onClick={() => act('no_show')} disabled={acting}
              color="#7c3aed" bg="rgba(124,58,237,0.08)" border="rgba(124,58,237,0.2)"
              icon={<UserX className="w-3.5 h-3.5" />}
            >No-Show</ActionBtn>
            <ActionBtn onClick={() => act('cancelled')} disabled={acting}
              color="#dc2626" bg="rgba(220,38,38,0.07)" border="rgba(220,38,38,0.18)"
              icon={<X className="w-3.5 h-3.5" />}
            >Cancel</ActionBtn>
          </div>
        )}
        {['cancelled', 'no_show', 'expired'].includes(booking.status) && (
          <p className="text-[11px] text-center pt-1" style={{ color: '#3f3f46' }}>No further actions available.</p>
        )}
      </div>
    </div>
  );
}

function Row({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#52525b' }} strokeWidth={1.8} />
      <p className="text-[12px] leading-tight">{children}</p>
    </div>
  );
}

function ActionBtn({
  onClick, disabled, color, bg, border, icon, children,
}: {
  onClick: () => void; disabled: boolean;
  color: string; bg: string; border: string;
  icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold transition-all hover:brightness-110 disabled:opacity-50"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {icon}{children}
    </button>
  );
}

/* ─── Now indicator ─────────────────────────────────────────── */
function NowIndicator() {
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    function calc() {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      if (mins < GRID_START * 60 || mins > GRID_END * 60) { setTop(null); return; }
      setTop(((mins - GRID_START * 60) / 60) * HOUR_HEIGHT);
    }
    calc();
    const t = setInterval(calc, 60_000);
    return () => clearInterval(t);
  }, []);

  if (top === null) return null;
  return (
    <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: `${top}px` }}>
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#f97316', boxShadow: '0 0 6px #f97316' }} />
      <div className="flex-1 h-px" style={{ background: '#f97316', opacity: 0.7 }} />
    </div>
  );
}

/* ─── Main Calendar ─────────────────────────────────────────── */
export interface BookingsCalendarProps {
  bookings: Booking[];
  loading: boolean;
  onWeekChange: (from: Date, to: Date) => void;
  onStatusChange: (id: string, status: 'confirmed' | 'cancelled' | 'no_show') => Promise<void>;
}

export function BookingsCalendar({ bookings, loading, onWeekChange, onStatusChange }: BookingsCalendarProps) {
  const today    = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [monday, setMonday] = useState(() => getMondayOfWeek(today));
  const [selected, setSelected] = useState<{ booking: Booking; rect: DOMRect } | null>(null);
  const [acting, setActing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(monday, i)),
  [monday]);

  // Notify parent when week changes
  useEffect(() => {
    onWeekChange(monday, addDays(monday, 6));
  }, [monday]);

  // Close detail on outside click
  useEffect(() => {
    if (!selected) return;
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSelected(null);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selected]);

  function goToToday() {
    setMonday(getMondayOfWeek(today));
    setSelected(null);
  }

  function prevWeek() { setMonday(d => addDays(d, -7)); setSelected(null); }
  function nextWeek() { setMonday(d => addDays(d,  7)); setSelected(null); }

  // Group bookings by day
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const day of weekDays) {
      const key = toDateStr(day);
      map.set(key, bookings.filter(b => isSameDay(new Date(b.starts_at), day)));
    }
    return map;
  }, [bookings, weekDays]);

  // Layout per day
  const layoutByDay = useMemo(() => {
    const map = new Map<string, Map<string, BookingLayout>>();
    bookingsByDay.forEach((dayBookings, key) => {
      map.set(key, computeLayouts(dayBookings));
    });
    return map;
  }, [bookingsByDay]);

  async function handleStatusChange(id: string, status: 'confirmed' | 'cancelled' | 'no_show') {
    setActing(true);
    try {
      await onStatusChange(id, status);
    } finally {
      setActing(false);
    }
  }

  // Compute popover position
  const popoverStyle = useMemo(() => {
    if (!selected || !gridRef.current) return {};
    const gridRect = gridRef.current.getBoundingClientRect();
    const { rect } = selected;

    // Position to the right of the block, or left if near right edge
    let left = rect.right - gridRect.left + 12;
    let top  = rect.top - gridRect.top;

    if (left + 340 > gridRect.width) {
      left = rect.left - gridRect.left - 340;
    }
    if (left < 0) left = 8;

    // Clamp vertically
    const estHeight = 260;
    if (top + estHeight > gridRect.height) {
      top = Math.max(8, gridRect.height - estHeight - 8);
    }

    return { left: `${left}px`, top: `${top}px` };
  }, [selected]);

  // Week label
  const weekLabel = useMemo(() => {
    const from = monday;
    const to   = addDays(monday, 6);
    if (from.getMonth() === to.getMonth()) {
      return `${MONTH_NAMES[from.getMonth()]} ${from.getDate()}–${to.getDate()}, ${from.getFullYear()}`;
    }
    return `${MONTH_NAMES[from.getMonth()]} ${from.getDate()} – ${MONTH_NAMES[to.getMonth()]} ${to.getDate()}, ${to.getFullYear()}`;
  }, [monday]);

  const isCurrentWeek = isSameDay(monday, getMondayOfWeek(today));

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* Calendar header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={goToToday}
          className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
          style={{
            background: isCurrentWeek ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.05)',
            color: isCurrentWeek ? '#f97316' : '#a1a1aa',
            border: `1px solid ${isCurrentWeek ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          Today
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={prevWeek}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: '#71717a' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextWeek}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: '#71717a' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[14px] font-semibold" style={{ color: '#f4f4f5' }}>{weekLabel}</span>

        {loading && (
          <div className="ml-2 w-4 h-4 rounded-full border-2 border-white/10 border-t-[#f97316] animate-spin flex-shrink-0" />
        )}

        {/* Booking count */}
        <div className="ml-auto text-[11px]" style={{ color: '#52525b' }}>
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} this week
        </div>
      </div>

      {/* Grid wrapper */}
      <div
        className="rounded-2xl overflow-hidden flex-1"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0d0d10' }}
      >
        {/* Day headers */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Time gutter spacer */}
          <div className="flex-shrink-0" style={{ width: 52 }} />

          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            const dayBookings = bookingsByDay.get(toDateStr(day)) || [];
            return (
              <div
                key={i}
                className="flex-1 py-3 text-center"
                style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p
                  className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                  style={{ color: isToday ? '#f97316' : '#52525b' }}
                >
                  {DAY_LABELS[i]}
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold"
                    style={isToday ? {
                      background: '#f97316',
                      color: '#fff',
                      boxShadow: '0 0 12px rgba(249,115,22,0.5)',
                    } : { color: '#a1a1aa' }}
                  >
                    {day.getDate()}
                  </div>
                  {dayBookings.length > 0 && (
                    <span
                      className="text-[9px] font-bold px-1 py-0.5 rounded-full"
                      style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}
                    >
                      {dayBookings.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable time grid */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 340px)', minHeight: 400 }}
        >
          <div ref={gridRef} className="flex relative">
            {/* Time gutter */}
            <div className="flex-shrink-0 relative" style={{ width: 52 }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  className="flex items-start justify-end pr-2"
                  style={{ height: HOUR_HEIGHT }}
                >
                  <span
                    className="text-[9px] font-semibold leading-none -translate-y-2"
                    style={{ color: '#3f3f46' }}
                  >
                    {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, i) => {
              const key = toDateStr(day);
              const dayBookings  = bookingsByDay.get(key) || [];
              const layouts      = layoutByDay.get(key) || new Map();
              const isToday      = isSameDay(day, today);

              return (
                <div
                  key={i}
                  className="flex-1 relative"
                  style={{
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                    background: isToday ? 'rgba(249,115,22,0.015)' : undefined,
                  }}
                >
                  {/* Hour lines */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      className="absolute left-0 right-0"
                      style={{
                        top: `${(h - GRID_START) * HOUR_HEIGHT}px`,
                        height: HOUR_HEIGHT,
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                      }}
                    />
                  ))}

                  {/* Half-hour lines */}
                  {HOURS.map(h => (
                    <div
                      key={`half-${h}`}
                      className="absolute left-0 right-0"
                      style={{
                        top: `${(h - GRID_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px`,
                        height: 1,
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    />
                  ))}

                  {/* Now indicator for today */}
                  {isToday && <NowIndicator />}

                  {/* Booking blocks */}
                  {dayBookings.map(booking => {
                    const layout = layouts.get(booking.id) ?? { col: 0, totalCols: 1 };
                    return (
                      <BookingBlock
                        key={booking.id}
                        booking={booking}
                        layout={layout}
                        isSelected={selected?.booking.id === booking.id}
                        onClick={(b, rect) => {
                          if (selected?.booking.id === b.id) {
                            setSelected(null);
                          } else {
                            setSelected({ booking: b, rect });
                          }
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Popover detail panel */}
            {selected && (
              <div
                ref={popoverRef}
                className="absolute z-40"
                style={{ ...popoverStyle, pointerEvents: 'auto' }}
              >
                <BookingDetail
                  booking={selected.booking}
                  onClose={() => setSelected(null)}
                  onStatusChange={handleStatusChange}
                  acting={acting}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
