'use client';

import { useEffect, useState } from 'react';
import { getAnalytics, getBookings, type Analytics, type Booking } from '../lib/api';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics('30d'), getBookings({ status: 'confirmed' })])
      .then(([a, b]) => {
        setAnalytics(a);
        setUpcomingBookings(b.bookings.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Last 30 days overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Total Revenue"
          value={`$${Number(analytics?.revenue.total || 0).toLocaleString()}`}
          sub={`${analytics?.revenue.confirmedCount || 0} bookings`}
          color="purple"
        />
        <KPICard
          label="Avg Per Booking"
          value={`$${analytics?.revenue.avgPerBooking || '0'}`}
          sub="per confirmed booking"
          color="blue"
        />
        <KPICard
          label="No-Show Rate"
          value={analytics?.bookings.noShowRate || '0%'}
          sub="of completed bookings"
          color={parseFloat(analytics?.bookings.noShowRate || '0') > 10 ? 'red' : 'green'}
        />
        <KPICard
          label="Total Bookings"
          value={String(analytics?.bookings.total || 0)}
          sub={`${analytics?.bookings.breakdown?.confirmed || 0} confirmed`}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Bookings</h3>
          {upcomingBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming bookings</p>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{b.clients?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{b.services?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">
                      {new Date(b.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(b.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Busiest Days */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Busiest Days</h3>
          <div className="space-y-2">
            {(analytics?.busiestDays || []).slice(0, 5).map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-sm w-8 text-gray-500">{d.day}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (d.count / (analytics?.busiestDays[0]?.count || 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-6 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Top Clients</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Avg Spend</th>
                <th className="pb-3 font-medium">Last Booked</th>
                <th className="pb-3 font-medium">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.topClients || []).slice(0, 8).map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium">{c.name || 'Unknown'}</td>
                  <td className="py-3 text-purple-600 font-semibold">${Number(c.avg_spend || 0).toFixed(0)}</td>
                  <td className="py-3 text-gray-500">
                    {c.last_booked_at
                      ? new Date(c.last_booked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Never'}
                  </td>
                  <td className="py-3 text-gray-500">
                    {c.typical_frequency_days ? `Every ${c.typical_frequency_days}d` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs mt-1 opacity-60">{sub}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Loading dashboard...</div>
    </div>
  );
}
