'use client';

import { useEffect, useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { getAdminUsers, getMe, type AdminUser } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function AdminPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        if (!me.profile.is_admin) {
          setAllowed(false);
          setLoading(false);
          return;
        }
        setAllowed(true);
        const res = await getAdminUsers();
        if (!cancelled) setUsers(res.users);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || allowed === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="max-w-lg">
        <Card className="border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] shadow-[0_18px_44px_-32px_rgba(236,72,153,0.16)]">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center ring-1 ring-destructive/20">
                <Shield className="w-4 h-4 text-destructive" strokeWidth={1.8} />
              </div>
              <CardTitle className="text-base text-[#f4f4f5]">Access Denied</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-[#71717a]">
            Admin access is restricted. Ask your team to add your email to{' '}
            <code className="text-[#f4f4f5] bg-white/5 px-1.5 py-0.5 rounded text-xs font-mono">ADMIN_EMAILS</code>{' '}
            in the environment.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-display)] text-[#f4f4f5]">Admin</h2>
        <p className="text-sm text-[#71717a] mt-1">
          All registered users across the platform.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-sm font-semibold tracking-tight text-[#f4f4f5]">Users</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5 bg-white/5 text-[#f4f4f5] border-white/10">
                <Users className="w-3 h-3 mr-0.5" strokeWidth={2} />
                {users.length}
              </Badge>
            </div>
          </CardHeader>
          <Separator className="bg-white/5" />
          <CardContent className="px-0 py-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[rgba(244,244,245,0.3)] uppercase tracking-widest">Name</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[rgba(244,244,245,0.3)] uppercase tracking-widest">Email</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[rgba(244,244,245,0.3)] uppercase tracking-widest">Role</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[rgba(244,244,245,0.3)] uppercase tracking-widest">Business</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[rgba(244,244,245,0.3)] uppercase tracking-widest">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#f4f4f5] shrink-0 ring-1 ring-white/10">
                          {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#f4f4f5]">{u.name || '\u2014'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#71717a]">{u.email || '\u2014'}</td>
                    <td className="px-5 py-3.5">
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 text-[#71717a] ring-1 ring-white/10">
                          Creator
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#71717a]/60 max-w-[120px] truncate">
                      {u.business_id || '\u2014'}
                    </td>
                    <td className="px-5 py-3.5 text-[#71717a] text-sm">
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
