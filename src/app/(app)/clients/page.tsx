'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getClients, type Client } from '@/lib/api';

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-display)]">Clients</h2>
        <p className="text-sm text-muted-foreground mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-orange-100/80 bg-white/88 shadow-[0_18px_44px_-32px_rgba(236,72,153,0.16)]">
          <CardContent className="py-3.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
            ) : clients.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-muted-foreground/25 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground font-medium">No clients found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Name</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Phone</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Avg Spend</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Last Booked</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Frequency</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 + i * 0.03 }}
                      className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(236,72,153,0.14))] flex items-center justify-center text-[10px] font-bold text-rose-600 shrink-0 ring-1 ring-rose-100/90">
                            {(c.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold">{c.name || '\u2014'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{c.phone || c.instagram_id || '\u2014'}</td>
                      <td className="px-5 py-3.5">
                        {c.avg_spend ? (
                          <span className="font-bold text-rose-600 font-[family-name:var(--font-display)]">
                            ${Number(c.avg_spend).toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">&mdash;</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {c.last_booked_at
                          ? new Date(c.last_booked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Never'}
                      </td>
                      <td className="px-5 py-3.5">
                        {c.typical_frequency_days ? (
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            Every {c.typical_frequency_days}d
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">&mdash;</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground/70 text-xs max-w-[200px] truncate">{c.notes || '\u2014'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
