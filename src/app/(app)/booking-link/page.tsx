'use client';

import { useEffect, useState } from 'react';
import { Link2, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { getMe } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BookingLinkPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const appUrl =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_APP_URL || '';

  const bookingUrl = slug ? `${appUrl}/book/${slug}` : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        setSlug(me.business?.slug ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function generateSlug() {
    setGenerating(true);
    try {
      const res = await fetch('/api/creator/slug', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const { slug: s } = await res.json();
        setSlug(s);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function copyLink() {
    if (!bookingUrl) return;
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-7 pb-12">
      <div>
        <h1
          className="text-[26px] font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}
        >
          Booking Link
        </h1>
        <p className="text-[14px] mt-1 max-w-lg leading-relaxed" style={{ color: 'rgba(244,244,245,0.45)' }}>
          Share this link in your Instagram bio or anywhere else. Customers click it, verify their email, pick a service
          and time, and pay — all in one flow.
        </p>
      </div>

      <div>
        <Card
          className="shadow-[0_18px_44px_-28px_rgba(0,0,0,0.45)] backdrop-blur-sm"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
        >
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg,rgba(249,115,22,0.14),rgba(236,72,153,0.14),rgba(124,58,237,0.14))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Link2 className="w-4 h-4 text-rose-400" strokeWidth={1.8} />
              </div>
              <div>
                <CardTitle className="text-base" style={{ color: '#f4f4f5' }}>
                  Your Rezerve link
                </CardTitle>
                <CardDescription className="text-xs" style={{ color: '#71717a' }}>
                  Drop this in your bio — it stays the same forever.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div
                className="h-10 rounded-lg animate-pulse"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            ) : bookingUrl ? (
              <>
                <div
                  className="flex items-center gap-2 rounded-xl px-4 py-3"
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="flex-1 text-sm font-mono truncate" style={{ color: '#f4f4f5' }}>
                    {bookingUrl}
                  </span>
                  <button
                    onClick={copyLink}
                    className="flex-shrink-0 transition-colors rounded-md p-1.5"
                    style={{
                      color: copied ? '#34d399' : '#f4f4f5',
                      background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    title="Copy link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={copyLink}
                    className="flex-1 border-0 text-white hover:opacity-95"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 45%, #ec4899 100%)',
                      boxShadow: '0 8px 20px rgba(245,158,11,0.28)',
                    }}
                  >
                    {copied ? (
                      <><Check className="w-4 h-4 mr-1.5" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-1.5" /> Copy link</>
                    )}
                  </Button>
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border px-3 h-9 transition-colors"
                    style={{
                      borderColor: 'rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#f4f4f5',
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: '#71717a' }}>
                  Customers who book through this link will appear in your{' '}
                  <strong className="font-semibold" style={{ color: 'rgba(244,244,245,0.75)' }}>
                    Clients
                  </strong>{' '}
                  and{' '}
                  <strong className="font-semibold" style={{ color: 'rgba(244,244,245,0.75)' }}>
                    Bookings
                  </strong>{' '}
                  tabs automatically.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm" style={{ color: '#71717a' }}>
                  You don&apos;t have a booking link yet. Generate one to get started.
                </p>
                <Button
                  onClick={generateSlug}
                  disabled={generating}
                  className="border-0 text-white hover:opacity-95"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 45%, #ec4899 100%)',
                    boxShadow: '0 8px 20px rgba(245,158,11,0.28)',
                  }}
                >
                  {generating ? (
                    <><RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> Generating…</>
                  ) : (
                    <><Link2 className="w-4 h-4 mr-1.5" /> Generate my link</>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card
          className="backdrop-blur-sm"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
        >
          <CardHeader>
            <CardTitle className="text-sm" style={{ color: '#f4f4f5' }}>
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm" style={{ color: '#71717a' }}>
              {[
                'Customer clicks your link from Instagram bio or anywhere you share it.',
                'They enter their name and email — a 6-digit code is sent to verify.',
                'They pick a service, choose an available date and time slot.',
                'They pay securely through Stripe and get a confirmation.',
                'Returning customers use the same email to view or cancel bookings.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{
                      border: '1px solid rgba(245,158,11,0.25)',
                      background: 'rgba(245,158,11,0.1)',
                      color: '#fbbf24',
                    }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
