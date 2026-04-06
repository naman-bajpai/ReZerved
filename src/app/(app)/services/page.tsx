'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Clock3, DollarSign, Loader2, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createService, getServices, type Service } from '@/lib/api';

function fmtCurrency(v: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(v || 0));
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    () => [...services].sort((a, b) => a.name.localeCompare(b.name)),
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

  return (
    <div className="space-y-7 pb-12">
      <div>
        <h1
          className="text-[26px] font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}
        >
          Services
        </h1>
        <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.45)' }}>
          Add and manage the services your clients can book.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="border-white/[0.08] bg-white/[0.04] shadow-[0_18px_44px_-28px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm" style={{ color: '#f4f4f5' }}>
              Add service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium" style={{ color: 'rgba(244,244,245,0.55)' }}>
                  Name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Haircut + Style"
                  className="w-full rounded-xl px-3 py-2 text-[13px] outline-none"
                  style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#f4f4f5',
                  }}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium" style={{ color: 'rgba(244,244,245,0.55)' }}>
                  Duration (mins)
                </span>
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-[13px] outline-none"
                  style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#f4f4f5',
                  }}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium" style={{ color: 'rgba(244,244,245,0.55)' }}>
                  Price (USD)
                </span>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="90"
                  className="w-full rounded-xl px-3 py-2 text-[13px] outline-none"
                  style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#f4f4f5',
                  }}
                />
              </label>

              {formError && (
                <div
                  className="rounded-xl px-3 py-2 text-[12px]"
                  style={{ border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.12)', color: '#fda4af' }}
                >
                  {formError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add service
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] bg-white/[0.03] shadow-[0_18px_44px_-28px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm" style={{ color: '#f4f4f5' }}>
              Active services
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />
                ))}
              </div>
            ) : error ? (
              <div className="py-10 text-center">
                <AlertCircle className="w-5 h-5 mx-auto mb-2" style={{ color: '#fda4af' }} />
                <p className="text-[13px] mb-3" style={{ color: 'rgba(244,244,245,0.5)' }}>
                  {error}
                </p>
                <Button variant="outline" onClick={loadServices}>
                  Retry
                </Button>
              </div>
            ) : sortedServices.length === 0 ? (
              <div className="py-14 text-center">
                <div
                  className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg,rgba(249,115,22,0.14),rgba(236,72,153,0.14),rgba(124,58,237,0.14))',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Sparkles className="w-5 h-5 text-amber-300" strokeWidth={1.8} />
                </div>
                <p className="text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>
                  No services yet
                </p>
                <p className="text-[12px] mt-1" style={{ color: 'rgba(244,244,245,0.45)' }}>
                  Add your first service to start taking bookings.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-xl px-4 py-3"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>
                          {service.name}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-[12px]" style={{ color: 'rgba(244,244,245,0.5)' }}>
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
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          background: service.is_active ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                          color: service.is_active ? '#34d399' : '#f87171',
                        }}
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
