'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
        setSlug((me.business as any)?.slug ?? null);
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
    <div className="max-w-xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-display)]">
          Booking Link
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Share this link in your Instagram bio or anywhere else. Customers click it, verify their
          email, pick a service and time, and pay — all in one flow.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-orange-100/80 bg-white/88 shadow-[0_18px_44px_-32px_rgba(236,72,153,0.16)]">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(236,72,153,0.14),rgba(124,58,237,0.14))] ring-1 ring-rose-100/80">
                <Link2 className="w-4 h-4 text-rose-500" strokeWidth={1.8} />
              </div>
              <div>
                <CardTitle className="text-base">Your BookedUp link</CardTitle>
                <CardDescription className="text-xs">
                  Drop this in your bio — it stays the same forever.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : bookingUrl ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3">
                  <span className="flex-1 text-sm font-mono text-[#0f0a1e] truncate">{bookingUrl}</span>
                  <button
                    onClick={copyLink}
                    className="flex-shrink-0 text-gray-400 hover:text-[#f97316] transition-colors"
                    title="Copy link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={copyLink} className="flex-1">
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
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-muted-foreground">
                  Customers who book through this link will appear in your{' '}
                  <strong>Clients</strong> and <strong>Bookings</strong> tabs automatically.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  You don't have a booking link yet. Generate one to get started.
                </p>
                <Button onClick={generateSlug} disabled={generating}>
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground">
              {[
                'Customer clicks your link from Instagram bio or anywhere you share it.',
                'They enter their name and email — a 6-digit code is sent to verify.',
                'They pick a service, choose an available date and time slot.',
                'They pay securely through Stripe and get a confirmation.',
                'Returning customers use the same email to view or cancel bookings.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-50 border border-orange-100 text-[#f97316] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
