'use client';

import { useEffect, useState } from 'react';
import {
  Building2, Bell, Sparkles, Link2, Check, Loader2,
} from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { getMe, updateSettings } from '@/lib/api';

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f4f4f5',
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0 w-10 h-[22px] rounded-full transition-all duration-200"
      style={{
        background: value
          ? 'linear-gradient(135deg, #f97316, #f59e0b)'
          : 'rgba(255,255,255,0.08)',
        border: value ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: value ? '0 0 12px rgba(249,115,22,0.25)' : 'none',
      }}
    >
      <span
        className="absolute top-0.5 w-[17px] h-[17px] rounded-full transition-all duration-200"
        style={{
          background: '#f4f4f5',
          left: value ? 'calc(100% - 19px)' : '2px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-[13px] font-medium" style={{ color: '#d4d4d8' }}>{label}</p>
        {desc && <p className="text-[11px] mt-0.5" style={{ color: '#52525b' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingCard({ title, subtitle, icon: Icon, color, iconBg, children }: {
  title: string; subtitle?: string; icon: React.ElementType; color: string; iconBg: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderTop: `1.5px solid ${color}`,
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg, boxShadow: `0 0 10px ${color}10` }}
        >
          <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
        </div>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: '#e4e4e7' }}>{title}</p>
          {subtitle && <p className="text-[11px]" style={{ color: '#52525b' }}>{subtitle}</p>}
        </div>
      </div>
      <div className="px-5 pb-1">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all"
      style={inputStyle}
      onFocus={e => { e.target.style.borderColor = 'rgba(249,115,22,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.08)'; }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('');
  const [aiTone, setAiTone] = useState<'friendly' | 'professional' | 'casual'>('friendly');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [igEnabled, setIgEnabled] = useState(false);
  const [notifyNew, setNotifyNew] = useState(true);
  const [notifyCancel, setNotifyCancel] = useState(true);
  const [notifyUpsell, setNotifyUpsell] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getMe().then((me) => {
      if (me.business?.name) setBusinessName(me.business.name);
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await updateSettings({ business_name: businessName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageTransition>
      <div className="space-y-7 pb-12 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
              Settings
            </h1>
            <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.4)' }}>
              Manage your business configuration
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-60"
              style={saved ? {
                background: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)',
              } : {
                background: 'linear-gradient(135deg, #f97316, #ec4899)', color: '#fff', border: '1px solid transparent',
                boxShadow: '0 2px 8px rgba(249,115,22,0.18)',
              }}
            >
              {saving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
              ) : saved ? (
                <><Check className="w-3.5 h-3.5" /> Saved</>
              ) : 'Save changes'}
            </button>
            {saveError && (
              <p className="text-[11px]" style={{ color: '#f87171' }}>{saveError}</p>
            )}
          </div>
        </div>

        {/* Business */}
        <SettingCard title="Business Profile" icon={Building2} color="#f97316" iconBg="rgba(249,115,22,0.08)">
          <SettingRow label="Business name" desc="Shown to clients in messages and confirmations">
            <div className="w-56">
              <TextInput value={businessName} onChange={setBusinessName} placeholder="Your business name" />
            </div>
          </SettingRow>
          <SettingRow label="Booking slug" desc="Your unique booking link">
            <div className="flex items-center gap-2 text-[12px]" style={{ color: '#7c3aed' }}>
              <span>rezerve.app/</span>
              <TextInput value="" onChange={() => {}} placeholder="yourname" />
            </div>
          </SettingRow>
        </SettingCard>

        {/* AI Agent */}
        <SettingCard title="AI Agent" subtitle="Customize how your AI talks to clients" icon={Sparkles} color="#7c3aed" iconBg="rgba(124,58,237,0.08)">
          <SettingRow label="Tone & personality" desc="How your AI comes across to clients">
            <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['friendly', 'professional', 'casual'] as const).map(t => (
                <button key={t} onClick={() => setAiTone(t)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all"
                  style={aiTone === t ? {
                    background: 'rgba(255,255,255,0.1)', color: '#7c3aed',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)', border: '1px solid rgba(124,58,237,0.3)',
                  } : { color: 'rgba(244,244,245,0.4)' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Auto-confirm bookings" desc="AI confirms without your approval">
            <Toggle value={true} onChange={() => {}} />
          </SettingRow>
          <SettingRow label="Upsell suggestions" desc="AI suggests add-ons after booking">
            <Toggle value={true} onChange={() => {}} />
          </SettingRow>
          <SettingRow label="Slot-fill automation" desc="Auto reach out when cancellations happen">
            <Toggle value={true} onChange={() => {}} />
          </SettingRow>
        </SettingCard>

        {/* Notifications */}
        <SettingCard title="Notifications" icon={Bell} color="#16a34a" iconBg="rgba(22,163,74,0.08)">
          <SettingRow label="New booking" desc="Get notified when a booking is confirmed">
            <Toggle value={notifyNew} onChange={setNotifyNew} />
          </SettingRow>
          <SettingRow label="Cancellation" desc="Alert when a booking is cancelled">
            <Toggle value={notifyCancel} onChange={setNotifyCancel} />
          </SettingRow>
          <SettingRow label="Upsell accepted" desc="When a client accepts an add-on">
            <Toggle value={notifyUpsell} onChange={setNotifyUpsell} />
          </SettingRow>
        </SettingCard>

        {/* Integrations */}
        <SettingCard title="Integrations" subtitle="Connect your messaging channels" icon={Link2} color="#ec4899" iconBg="rgba(236,72,153,0.08)">
          <SettingRow label="SMS via Twilio" desc="Respond to text messages automatically">
            <Toggle value={smsEnabled} onChange={setSmsEnabled} />
          </SettingRow>
          <SettingRow label="Instagram DMs" desc="Handle DM bookings automatically">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(217,119,6,0.08)', color: '#d97706' }}>Beta</span>
              <Toggle value={igEnabled} onChange={setIgEnabled} />
            </div>
          </SettingRow>
          <SettingRow label="WhatsApp" desc="Coming soon">
            <span className="text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#71717a' }}>
              Soon
            </span>
          </SettingRow>
        </SettingCard>

        {/* Danger zone */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.1)' }}>
          <p className="text-[13px] font-semibold mb-1" style={{ color: '#f87171' }}>Danger Zone</p>
          <p className="text-[12px] mb-3" style={{ color: 'rgba(244,244,245,0.4)' }}>Irreversible actions — proceed with caution.</p>
          <button className="text-[13px] font-semibold px-4 py-2 rounded-xl transition-all" style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.15)' }}>
            Delete account
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
