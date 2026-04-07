'use client';

import { useEffect, useState } from 'react';
import {
  Users, Search, TrendingUp, CalendarDays, Clock, Star,
  ChevronRight, DollarSign, AlertCircle, ArrowUpRight,
  Sparkles, Phone, X,
} from 'lucide-react';
import { getClients, type Client } from '@/lib/api';

function fmtCurrency(v: number | string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0));
}

/* ─── Segment config ─────────────────────────────────────── */
function getSegment(client: Client): { label: string; color: string; bg: string } {
  const spend = Number(client.avg_spend || 0);
  const freq = client.typical_frequency_days || 999;
  const lastDays = client.last_booked_at
    ? Math.floor((Date.now() - new Date(client.last_booked_at).getTime()) / 86400000)
    : 999;

  if (spend >= 100 && freq <= 28)    return { label: 'Champion',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
  if (lastDays > 60)                  return { label: 'At Risk',   color: '#fb7185', bg: 'rgba(251,113,133,0.1)' };
  if (lastDays > 30)                  return { label: 'Lapsing',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
  if (spend >= 60)                    return { label: 'Loyal',     color: '#34d399', bg: 'rgba(52,211,153,0.1)' };
  return                               { label: 'New',        color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' };
}

/* ─── Avatar ─────────────────────────────────────────────── */
const AVATAR_COLORS = [
  ['rgba(245,158,11,0.18)', '#f59e0b'],
  ['rgba(52,211,153,0.18)', '#34d399'],
  ['rgba(251,113,133,0.18)', '#fb7185'],
  ['rgba(167,139,250,0.18)', '#a78bfa'],
];

function Avatar({ name, size = 40, idx = 0 }: { name: string; size?: number; idx?: number }) {
  const [bg, color] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center font-bold"
      style={{ width: size, height: size, background: bg, color, fontSize: size * 0.35, border: `1px solid ${color}25` }}
    >
      {(name || 'U').charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── Client card ───────────────────────────────────────── */
function ClientCard({ client, idx, onSelect }: {
  client: Client; idx: number; onSelect: (c: Client) => void;
}) {
  const seg = getSegment(client);
  const lastBooked = client.last_booked_at
    ? Math.floor((Date.now() - new Date(client.last_booked_at).getTime()) / 86400000)
    : null;

  return (
    <div
      className="group flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
      onClick={() => onSelect(client)}
    >
      <Avatar name={client.name || 'U'} idx={idx} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[14px] font-semibold truncate" style={{ color: '#f4f4f5' }}>{client.name || 'Unknown'}</p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: seg.bg, color: seg.color }}>
            {seg.label}
          </span>
        </div>
        <p className="text-[12px] truncate" style={{ color: '#71717a' }}>
          {client.phone || 'No contact info'}
        </p>
      </div>

      {/* Avg spend */}
      <div className="text-right flex-shrink-0 hidden sm:block">
        <p className="text-[14px] font-bold font-mono-nums" style={{ color: '#f59e0b' }}>
          {fmtCurrency(client.avg_spend || 0)}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: '#71717a' }}>avg spend</p>
      </div>

      {/* Last booked */}
      <div className="text-right flex-shrink-0 hidden md:block">
        <p className="text-[13px] font-medium" style={{ color: '#71717a' }}>
          {lastBooked !== null ? (lastBooked === 0 ? 'Today' : `${lastBooked}d ago`) : 'Never'}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: '#71717a' }}>last visited</p>
      </div>

      {/* Frequency */}
      <div className="flex-shrink-0 hidden lg:block">
        {client.typical_frequency_days ? (
          <span className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.15)' }}>
            Every {client.typical_frequency_days}d
          </span>
        ) : (
          <span style={{ color: 'rgba(244,244,245,0.2)' }}>—</span>
        )}
      </div>

      <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: '#f4f4f5' }} />
    </div>
  );
}

/* ─── Client detail panel ────────────────────────────────── */
function ClientPanel({ client, onClose }: { client: Client; onClose: () => void }) {
  const seg = getSegment(client);
  const lastBooked = client.last_booked_at
    ? Math.floor((Date.now() - new Date(client.last_booked_at).getTime()) / 86400000)
    : null;

  return (
    <div
      className="fixed right-0 top-0 h-full w-[320px] flex flex-col z-40 overflow-y-auto"
      style={{ background: '#0d0d12', borderLeft: '1px solid rgba(255,255,255,0.07)', boxShadow: '-16px 0 48px rgba(0,0,0,0.5)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[14px] font-semibold" style={{ color: '#f4f4f5' }}>Client Profile</p>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#71717a' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile */}
      <div className="px-5 py-5 flex flex-col items-center text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Avatar name={client.name || 'U'} size={56} idx={0} />
        <h3 className="text-[16px] font-bold mt-3 mb-1" style={{ color: '#f4f4f5' }}>{client.name}</h3>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3" style={{ background: seg.bg, color: seg.color }}>
          {seg.label}
        </span>
        {client.phone && (
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: '#71717a' }}>
            <Phone className="w-3 h-3" />
            {client.phone}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: 'Avg Spend', value: fmtCurrency(client.avg_spend || 0), color: '#f59e0b' },
          { label: 'Last Visit', value: lastBooked !== null ? `${lastBooked}d ago` : 'Never', color: '#f4f4f5' },
          { label: 'Frequency', value: client.typical_frequency_days ? `${client.typical_frequency_days}d` : '—', color: '#a78bfa' },
          { label: 'Total Visits', value: '12', color: '#34d399' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[15px] font-bold font-mono-nums mb-0.5" style={{ color }}>{value}</p>
            <p className="text-[10px]" style={{ color: '#71717a' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Retention opportunity */}
      {lastBooked !== null && lastBooked > 28 && (
        <div className="mx-5 mt-4 rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.14)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
            <span className="text-[12px] font-semibold" style={{ color: '#f59e0b' }}>Retention Opportunity</span>
          </div>
          <p className="text-[12px] mb-3" style={{ color: '#71717a' }}>
            {client.name?.split(' ')[0]} hasn't visited in {lastBooked} days. Send a win-back message?
          </p>
          <button className="w-full py-2 rounded-lg text-[12px] font-semibold transition-all" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
            Send re-engagement SMS
          </button>
        </div>
      )}

      {/* Notes placeholder */}
      <div className="mx-5 mt-4 mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#71717a' }}>Notes</p>
        <textarea
          placeholder="Add client notes…"
          rows={4}
          className="w-full resize-none rounded-xl px-3 py-2.5 text-[12px] outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f4f4f5', caretColor: '#f59e0b' }}
        />
      </div>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-36 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="skeleton h-4 w-16 rounded hidden sm:block" />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState('all');
  const [selected, setSelected] = useState<Client | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      getClients({ search: search || undefined })
        .then(d => setClients(d.clients))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = clients.filter(c => {
    if (segment === 'all') return true;
    const s = getSegment(c);
    return s.label.toLowerCase() === segment;
  });

  const segCounts = {
    all: clients.length,
    champion: clients.filter(c => getSegment(c).label === 'Champion').length,
    loyal: clients.filter(c => getSegment(c).label === 'Loyal').length,
    'at risk': clients.filter(c => getSegment(c).label === 'At Risk').length,
  };

  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
            Clients
          </h1>
          <p className="text-[14px] mt-1" style={{ color: '#71717a' }}>
            {clients.length} client{clients.length !== 1 ? 's' : ''} · manage relationships
          </p>
        </div>
      </div>

      {/* Segment + Search bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { val: 'all', label: 'All', count: segCounts.all },
            { val: 'champion', label: 'Champions', count: segCounts.champion },
            { val: 'loyal', label: 'Loyal', count: segCounts.loyal },
            { val: 'at risk', label: 'At Risk', count: segCounts['at risk'] },
          ].map(({ val, label, count }) => (
            <button key={val} onClick={() => setSegment(val)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={segment === val ? {
                background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)'
              } : { color: '#71717a' }}
            >
              {label}
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: '#71717a' }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#71717a' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="pl-9 pr-4 py-2 rounded-xl text-[12px] outline-none w-52 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#f4f4f5', caretColor: '#f59e0b' }}
          />
        </div>
      </div>

      {/* Table header */}
      {!loading && filtered.length > 0 && (
        <div className="grid px-5" style={{ gridTemplateColumns: '1fr auto auto auto auto' }}>
          {['Client', 'Avg Spend', 'Last Visit', 'Frequency', ''].map((h, i) => (
            <p key={i} className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#52525b', display: i >= 2 ? 'none' : undefined }}>
              {h}
            </p>
          ))}
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Users className="w-7 h-7" style={{ color: '#71717a' }} strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-semibold mb-1" style={{ color: '#f4f4f5' }}>
              {search ? 'No clients found' : 'No clients yet'}
            </p>
            <p className="text-[13px]" style={{ color: '#71717a' }}>
              {search ? 'Try a different search' : 'Clients will appear when they book'}
            </p>
          </div>
        ) : (
          <>
            {filtered.map((client, i) => (
              <ClientCard key={client.id} client={client} idx={i} onSelect={setSelected} />
            ))}
          </>
        )}
      </div>

      {/* Detail panel */}
      <>
        {selected && (
          <>
            <div
              className="fixed inset-0 z-30"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSelected(null)}
            />
            <ClientPanel client={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </>
    </div>
  );
}
