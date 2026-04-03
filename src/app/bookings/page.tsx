'use client';

import { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus, type Booking } from '../../lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
  no_show: 'bg-orange-100 text-orange-700',
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Bookings</h2>
          <p className="text-gray-500 mt-1">{bookings.length} bookings found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white border border-gray-200 rounded-xl p-4">
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Status</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
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
          <label className="text-xs text-gray-500 font-medium block mb-1">Date</label>
          <input
            type="date"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No bookings found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Service</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Channel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{b.clients?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{b.services?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(b.starts_at).toLocaleString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                      hour: 'numeric', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-purple-600">
                    ${Number(b.total_price || 0).toFixed(0)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                      {b.source_channel || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${STATUS_COLORS[b.status] || ''}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'confirmed')}
                          className="text-xs text-green-600 hover:underline"
                        >
                          Confirm
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(b.status) && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'no_show')}
                          className="text-xs text-orange-500 hover:underline"
                        >
                          No Show
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
