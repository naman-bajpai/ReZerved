'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Bell, Shield, Sparkles, Link2, Globe,
  ChevronRight, Check, ToggleLeft, ToggleRight,
} from 'lucide-react';

const SECTIONS = [
  { id: 'business', label: 'Business', icon: Building2, color: '#f59e0b' },
  { id: 'ai',       label: 'AI Agent',  icon: Sparkles,  color: '#a78bfa' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: '#34d399' },
  { id: 'integrations',  label: 'Integrations',  icon: Link2, color: '#fb7185' },
  { id: 'security', label: 'Security', icon: Shield, color: '#60a5fa' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex-shrink-0 transition-all">
      {value
        ? <ToggleRight className="w-7 h-7" style={{ color: '#f59e0b' }} />
        : <ToggleLeft className="w-7 h-7" style={{ color: 'rgba(244,244,245,0.25)' }} />
      }
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-[13px] font-medium" style={{ color: '#f4f4f5' }}>{label}</p>
        {desc && <p className="text-[11px] mt-0.5" style={{ color: 'rgba(244,244,245,0.35)' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingCard({ title, subtitle, icon: Icon, color, children }: {
  title: string; subtitle?: string; icon: React.ElementType; color: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
        </div>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: '#f4f4f5' }}>{title}</p>
          {subtitle && <p className="text-[11px]" style={{ color: 'rgba(244,244,245,0.35)' }}>{subtitle}</p>}
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
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f4f4f5', caretColor: '#f59e0b' }}
      onFocus={e => { e.target.style.borderColor = 'rgba(245,158,11,0.35)'; }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
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

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-7 pb-12 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}>
            Settings
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.4)' }}>
            Manage your business configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
          style={saved ? {
            background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)',
          } : {
            background: 'linear-gradient(135deg, #f59e0b, #fb7185)', color: '#09090b',
          }}
        >
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save changes'}
        </button>
      </motion.div>

      {/* Business */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <SettingCard title="Business Profile" icon={Building2} color="#f59e0b">
          <SettingRow label="Business name" desc="Shown to clients in messages and confirmations">
            <div className="w-56">
              <TextInput value={businessName} onChange={setBusinessName} placeholder="Your business name" />
            </div>
          </SettingRow>
          <SettingRow label="Booking slug" desc="Your unique booking link">
            <div className="flex items-center gap-2 text-[12px]" style={{ color: '#a78bfa' }}>
              <span>bookedup.app/</span>
              <TextInput value="" onChange={() => {}} placeholder="yourname" />
            </div>
          </SettingRow>
        </SettingCard>
      </motion.div>

      {/* AI Agent */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <SettingCard title="AI Agent" subtitle="Customize how your AI talks to clients" icon={Sparkles} color="#a78bfa">
          <SettingRow label="Tone & personality" desc="How your AI comes across to clients">
            <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {(['friendly', 'professional', 'casual'] as const).map(t => (
                <button key={t} onClick={() => setAiTone(t)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all"
                  style={aiTone === t ? { background: 'rgba(167,139,250,0.15)', color: '#a78bfa' } : { color: 'rgba(244,244,245,0.4)' }}
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
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <SettingCard title="Notifications" icon={Bell} color="#34d399">
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
      </motion.div>

      {/* Integrations */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SettingCard title="Integrations" subtitle="Connect your messaging channels" icon={Link2} color="#fb7185">
          <SettingRow label="SMS via Twilio" desc="Respond to text messages automatically">
            <Toggle value={smsEnabled} onChange={setSmsEnabled} />
          </SettingRow>
          <SettingRow label="Instagram DMs" desc="Handle DM bookings automatically">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>Beta</span>
              <Toggle value={igEnabled} onChange={setIgEnabled} />
            </div>
          </SettingRow>
          <SettingRow label="WhatsApp" desc="Coming soon">
            <span className="text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(244,244,245,0.3)' }}>
              Soon
            </span>
          </SettingRow>
        </SettingCard>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <div className="rounded-2xl p-5" style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.1)' }}>
          <p className="text-[13px] font-semibold mb-1" style={{ color: '#f87171' }}>Danger Zone</p>
          <p className="text-[12px] mb-3" style={{ color: 'rgba(244,244,245,0.35)' }}>Irreversible actions — proceed with caution.</p>
          <button className="text-[13px] font-semibold px-4 py-2 rounded-xl transition-all" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            Delete account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
