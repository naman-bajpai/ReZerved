'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';

const DAYS = [
  { label: 'Monday',    short: 'Mon', dow: 1 },
  { label: 'Tuesday',   short: 'Tue', dow: 2 },
  { label: 'Wednesday', short: 'Wed', dow: 3 },
  { label: 'Thursday',  short: 'Thu', dow: 4 },
  { label: 'Friday',    short: 'Fri', dow: 5 },
  { label: 'Saturday',  short: 'Sat', dow: 6 },
  { label: 'Sunday',    short: 'Sun', dow: 0 },
];

const DEFAULT_TIMES = { start_time: '09:00', end_time: '17:00' };

interface DaySchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

function timeOptions() {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return opts;
}

function fmt12(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const TIME_OPTS = timeOptions();

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/availability/schedule');
        if (!res.ok) throw new Error('Failed to load schedule');
        const { schedule: rows } = await res.json();

        const map: Record<number, DaySchedule> = {};
        // seed all 7 days with defaults
        DAYS.forEach(d => {
          map[d.dow] = { day_of_week: d.dow, is_active: false, ...DEFAULT_TIMES };
        });
        // overlay what's in DB
        (rows ?? []).forEach((r: DaySchedule) => {
          map[r.day_of_week] = r;
        });
        setSchedule(map);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function toggle(dow: number) {
    setSchedule(prev => ({
      ...prev,
      [dow]: { ...prev[dow], is_active: !prev[dow].is_active },
    }));
    setSaved(false);
  }

  function setTime(dow: number, field: 'start_time' | 'end_time', value: string) {
    setSchedule(prev => ({
      ...prev,
      [dow]: { ...prev[dow], [field]: value },
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule: Object.values(schedule) }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const activeDays = Object.values(schedule).filter(d => d.is_active).length;

  return (
    <PageTransition>
      <div className="space-y-7 pb-12 max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
              Availability
            </h1>
            <p className="text-[14px] mt-1" style={{ color: '#71717a' }}>
              Set your weekly working hours. Clients can only book during these windows.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-40"
            style={saved ? {
              background: 'rgba(22,163,74,0.08)',
              border: '1px solid rgba(22,163,74,0.2)',
              color: '#16a34a',
            } : {
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              border: '1px solid transparent',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(249,115,22,0.18)',
            }}
          >
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
            ) : saved ? (
              <><Check className="w-3.5 h-3.5" /> Saved</>
            ) : (
              'Save schedule'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px]"
            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)', color: '#dc2626' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Summary pill */}
        {!loading && (
          <div className="flex items-center gap-2.5 text-[13px]" style={{ color: '#71717a' }}>
            <div className="w-2 h-2 rounded-full"
              style={{ background: activeDays > 0 ? '#16a34a' : 'rgba(255,255,255,0.1)' }} />
            {activeDays === 0 ? 'No days active — clients cannot book.' : `${activeDays} day${activeDays !== 1 ? 's' : ''} active per week`}
          </div>
        )}

        {/* Schedule grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 rounded-full border-2 border-[#f97316]/20 border-t-[#f97316] animate-spin" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {DAYS.map(d => {
              const row = schedule[d.dow] ?? { day_of_week: d.dow, is_active: false, ...DEFAULT_TIMES };
              return (
                <div
                  key={d.dow}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-150"
                  style={{
                    background: row.is_active ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                    border: row.is_active
                      ? '1px solid rgba(255,255,255,0.07)'
                      : '1px solid rgba(255,255,255,0.04)',
                    boxShadow: row.is_active ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  {/* Toggle */}
                  <button
                    onClick={() => toggle(d.dow)}
                    className="relative flex-shrink-0 w-10 h-6 rounded-full transition-all"
                    style={{
                      background: row.is_active
                        ? 'linear-gradient(135deg, #f97316, #ec4899)'
                        : 'rgba(255,255,255,0.1)',
                      boxShadow: row.is_active ? '0 0 8px rgba(249,115,22,0.2)' : 'none',
                    }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                      style={{
                        background: '#f4f4f5',
                        left: row.is_active ? 'calc(100% - 22px)' : '2px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      }}
                    />
                  </button>

                  {/* Day label */}
                  <div className="w-24 flex-shrink-0">
                    <p className="text-[14px] font-semibold"
                      style={{ color: row.is_active ? '#f4f4f5' : '#71717a' }}>
                      {d.label}
                    </p>
                  </div>

                  {/* Time selectors */}
                  {row.is_active ? (
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        value={row.start_time}
                        onChange={e => setTime(d.dow, 'start_time', e.target.value)}
                        className="rounded-xl px-3 py-2 text-[13px] outline-none appearance-none cursor-pointer transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: '#f4f4f5',
                        }}
                      >
                        {TIME_OPTS.map(t => (
                          <option key={t} value={t} className="bg-[#09090b]">{fmt12(t)}</option>
                        ))}
                      </select>

                      <span className="text-[12px] flex-shrink-0" style={{ color: '#71717a' }}>to</span>

                      <select
                        value={row.end_time}
                        onChange={e => setTime(d.dow, 'end_time', e.target.value)}
                        className="rounded-xl px-3 py-2 text-[13px] outline-none appearance-none cursor-pointer transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: '#f4f4f5',
                        }}
                      >
                        {TIME_OPTS.filter(t => t > row.start_time).map(t => (
                          <option key={t} value={t} className="bg-[#09090b]">{fmt12(t)}</option>
                        ))}
                      </select>

                      <span className="text-[12px] ml-1 flex-shrink-0" style={{ color: '#71717a' }}>
                        {(() => {
                          const [sh, sm] = row.start_time.split(':').map(Number);
                          const [eh, em] = row.end_time.split(':').map(Number);
                          const mins = (eh * 60 + em) - (sh * 60 + sm);
                          if (mins <= 0) return '';
                          const h = Math.floor(mins / 60);
                          const m = mins % 60;
                          return `${h > 0 ? `${h}h` : ''}${m > 0 ? ` ${m}m` : ''}`;
                        })()}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[13px]" style={{ color: '#71717a' }}>Closed</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Help text */}
        <p className="text-[12px] leading-relaxed" style={{ color: '#71717a' }}>
          These hours define when your booking slots are generated. Individual appointment buffers and service durations are factored in automatically.
        </p>
      </div>
    </PageTransition>
  );
}
