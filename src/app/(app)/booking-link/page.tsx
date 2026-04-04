'use client';

import { useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Link2 className="w-6 h-6 text-primary" />
          Public booking link
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste your Google Calendar booking page, Cal.com, Calendly, or any URL where clients can
          schedule. Your AI can reference this when chatting in DMs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking URL</CardTitle>
          <CardDescription>
            This does not replace in-app availability — it is the link you promote in your bio for
            external booking flows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="url">HTTPS link</Label>
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
              {saving ? 'Saving…' : 'Save'}
            </Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
