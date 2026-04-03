'use client';

import { useEffect, useState } from 'react';
import { getClients, type Client } from '../../lib/api';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      getClients({ search: search || undefined })
        .then((d) => setClients(d.clients))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Clients</h2>
        <p className="text-gray-500 mt-1">{clients.length} clients</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No clients found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Avg Spend</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Booked</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Frequency</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || c.instagram_id || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-purple-600">
                    {c.avg_spend ? `$${Number(c.avg_spend).toFixed(0)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.last_booked_at
                      ? new Date(c.last_booked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.typical_frequency_days ? `Every ${c.typical_frequency_days}d` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{c.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
