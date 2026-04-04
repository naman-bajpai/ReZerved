'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ExternalLink } from 'lucide-react';
import { getMe, patchBookingLink } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BookingLinkPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        setUrl(me.business?.external_booking_url || '');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const trimmed = url.trim();
      await patchBookingLink(trimmed.length ? trimmed : null);
      setMessage('Saved. Share this link in your bio so clients can book via your assistant.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
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
          Paste your Google Calendar booking page, Cal.com, Calendly, or any URL where clients can
          schedule. Your AI can reference this when chatting in DMs.
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
                <ExternalLink className="w-4 h-4 text-rose-500" strokeWidth={1.8} />
              </div>
              <div>
                <CardTitle className="text-base">Booking URL</CardTitle>
                <CardDescription className="text-xs">
                  The link you promote in your bio for external booking flows.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="url" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">HTTPS link</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://cal.com/yourname or Google appointment URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="font-mono text-sm"
                />
              </div>
              <Button type="submit" disabled={saving || loading}>
                {saving ? 'Saving\u2026' : 'Save'}
              </Button>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
