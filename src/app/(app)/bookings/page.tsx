'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Filter, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBookings, updateBookingStatus, type Booking } from '@/lib/api';

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  pending:   { badge: 'bg-orange-50 text-orange-700 ring-orange-200/60', dot: 'bg-orange-400' },
  confirmed: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60', dot: 'bg-emerald-400' },
  cancelled: { badge: 'bg-rose-50 text-rose-700 ring-rose-200/60', dot: 'bg-rose-400' },
  expired:   { badge: 'bg-muted text-muted-foreground ring-border', dot: 'bg-muted-foreground/50' },
  no_show:   { badge: 'bg-violet-50 text-violet-700 ring-violet-200/60', dot: 'bg-violet-400' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    getBookings({ status: statusFilter || undefined, date: dateFilter || undefined })
      .then((d) => setBookings(d.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [statusFilter, dateFilter]);

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled' | 'no_show') => {
    try {
      await updateBookingStatus(id, status);
      fetchBookings();
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-display)]">Bookings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-orange-100/80 bg-white/88 shadow-[0_18px_44px_-32px_rgba(236,72,153,0.16)]">
          <CardContent className="py-3.5">
            <div className="flex items-center gap-4">
              <Filter className="w-4 h-4 text-muted-foreground/50 shrink-0" strokeWidth={1.8} />
              <div className="flex gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Status</label>
                  <select
                    className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Date</label>
                  <input
                    type="date"
                    className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-orange-100/80 bg-white/88 shadow-[0_18px_44px_-32px_rgba(236,72,153,0.16)]">
          <CardContent className="px-0 py-0">
            {loading ? (
              <div className="p-12 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <CalendarDays className="w-10 h-10 text-muted-foreground/25 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground font-medium">No bookings found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Client</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Service</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Date & Time</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Price</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Channel</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => {
                    const style = STATUS_STYLES[b.status] || STATUS_STYLES.expired;
                    return (
                      <motion.tr
                        key={b.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 + i * 0.03 }}
                        className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(236,72,153,0.14))] flex items-center justify-center text-[10px] font-bold text-rose-600 shrink-0 ring-1 ring-rose-100/90">
                              {(b.clients?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold">{b.clients?.name || '\u2014'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{b.services?.name || '\u2014'}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                            <span>
                              {new Date(b.starts_at).toLocaleString('en-US', {
                                weekday: 'short', month: 'short', day: 'numeric',
                                hour: 'numeric', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-rose-600 font-[family-name:var(--font-display)]">
                            ${Number(b.total_price || 0).toFixed(0)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] font-medium bg-muted px-2 py-1 rounded-md capitalize text-muted-foreground">
                            {b.source_channel || '\u2014'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1">
                            {b.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(b.id, 'confirmed')}
                                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                              >
                                Confirm
                              </button>
                            )}
                            {['pending', 'confirmed'].includes(b.status) && (
                              <button
                                onClick={() => handleStatusChange(b.id, 'cancelled')}
                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(b.id, 'no_show')}
                                className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-md transition-colors"
                              >
                                No Show
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
