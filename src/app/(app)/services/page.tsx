'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Clock3, DollarSign, Loader2, Plus, Sparkles, Power } from 'lucide-react';
import { createService, getServices, updateService, type Service } from '@/lib/api';
import { PageTransition } from '@/components/page-transition';

function fmtCurrency(v: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(v || 0));
}

const inputStyle = {
  border: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.04)',
  color: '#f4f4f5',
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('');

  async function loadServices() {
    setLoading(true);
    setError(null);
    try {
      const res = await getServices();
      setServices(res.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return a.name.localeCompare(b.name);
    }),
    [services]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const parsedDuration = Number(duration);
    const parsedPrice = price === '' ? 0 : Number(price);

    if (!trimmedName) {
      setFormError('Service name is required.');
      return;
    }
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setFormError('Duration must be a positive number of minutes.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFormError('Price must be zero or a positive number.');
      return;
    }

    setSaving(true);
    try {
      const res = await createService({
        name: trimmedName,
        duration_mins: parsedDuration,
        price: parsedPrice,
      });
      setServices((prev) => [res.service, ...prev]);
      setName('');
      setDuration('60');
      setPrice('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(service: Service) {
    setToggling(service.id);
    try {
      const res = await updateService(service.id, { is_active: !service.is_active });
      setServices((prev) => prev.map((s) => (s.id === service.id ? res.service : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
    } finally {
      setToggling(null);
    }
  }

  return (
    <PageTransition>
      <div className="space-y-7 pb-12">
        <div>
          <h1
            className="text-[26px] font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}
          >
            Services
          </h1>
          <p className="text-[14px] mt-1" style={{ color: '#71717a' }}>
            Add and manage the services your clients can book.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          {/* Add service form */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderTop: '1.5px solid #f97316',
            }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[14px] font-semibold" style={{ color: '#e4e4e7' }}>Add service</p>
            </div>
            <div className="px-5 py-4">
              <form className="space-y-3" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-medium" style={{ color: '#71717a' }}>
                    Name
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Haircut + Style"
                    className="w-full rounded-xl px-3 py-2 text-[13px] outline-none transition-all placeholder:text-white/20"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(249,115,22,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-medium" style={{ color: '#71717a' }}>
                    Duration (mins)
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-[13px] outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(249,115,22,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-medium" style={{ color: '#71717a' }}>
                    Price (USD)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="90"
                    className="w-full rounded-xl px-3 py-2 text-[13px] outline-none transition-all placeholder:text-white/20"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(249,115,22,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                  />
                </label>

                {formError && (
                  <div
                    className="rounded-xl px-3 py-2 text-[12px]"
                    style={{ border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.06)', color: '#dc2626' }}
                  >
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', color: '#fff' }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add service
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Services list */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[14px] font-semibold" style={{ color: '#e4e4e7' }}>All services</p>
            </div>
            <div className="px-5 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 rounded-full border-2 border-[#f97316]/20 border-t-[#f97316] animate-spin" />
                </div>
              ) : error ? (
                <div className="py-10 text-center">
                  <AlertCircle className="w-5 h-5 mx-auto mb-2" style={{ color: '#dc2626' }} />
                  <p className="text-[13px] mb-3" style={{ color: '#71717a' }}>
                    {error}
                  </p>
                  <button
                    onClick={loadServices}
                    className="text-[13px] font-medium px-4 py-2 rounded-lg"
                    style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}
                  >
                    Retry
                  </button>
                </div>
              ) : sortedServices.length === 0 ? (
                <div className="py-14 text-center">
                  <div
                    className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: '#f97316' }} strokeWidth={1.8} />
                  </div>
                  <p className="text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>
                    No services yet
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: '#71717a' }}>
                    Add your first service to start taking bookings.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedServices.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-xl px-4 py-3 transition-all hover:bg-[rgba(255,255,255,0.03)]"
                      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>
                            {service.name}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-[12px]" style={{ color: '#71717a' }}>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="w-3.5 h-3.5" />
                              {service.duration_mins}m
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              {fmtCurrency(service.price || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: service.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: service.is_active ? '#4ade80' : '#f87171',
                            }}
                          >
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleToggle(service)}
                            disabled={toggling === service.id}
                            title={service.is_active ? 'Deactivate' : 'Activate'}
                            className="p-1.5 rounded-lg transition-all hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-40"
                            style={{ color: service.is_active ? '#71717a' : '#4ade80' }}
                          >
                            {toggling === service.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Power className="w-3.5 h-3.5" strokeWidth={1.8} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
