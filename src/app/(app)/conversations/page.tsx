'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram, Phone, Search, Sparkles, Send, CheckCircle2,
  Clock, AlertCircle, TrendingUp, MessageSquare, Filter,
  ChevronRight, DollarSign, CalendarDays, X, Zap,
} from 'lucide-react';

/* ─── Mock data ────────────────────────────────────────────── */
const INTENT_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  booking_request: { bg: 'rgba(52,211,153,0.1)',   color: '#34d399', label: 'Booking' },
  pricing_inquiry: { bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b', label: 'Pricing' },
  cancellation:    { bg: 'rgba(248,113,113,0.1)',  color: '#f87171', label: 'Cancel' },
  availability:    { bg: 'rgba(167,139,250,0.1)',  color: '#a78bfa', label: 'Avail.' },
  general:         { bg: 'rgba(255,255,255,0.07)', color: 'rgba(244,244,245,0.5)', label: 'General' },
};

const MOCK_CONVOS = [
  {
    id: '1', name: 'Sofia Reyes', channel: 'instagram', unread: 2,
    intent: 'booking_request', lastMsg: "Hey! Can I get a full set this Saturday?",
    time: '2m', avatar: 'S', status: 'active',
    messages: [
      { id: 'm1', from: 'client', text: "Hey!! Can I get a full set this Saturday at 2pm? 💅", ts: '2:14 PM' },
      { id: 'm2', from: 'ai', text: "Hi Sofia! I have Saturday 2pm available for you — full set with gel top coat is $85 and takes about 75 min. Want me to lock it in? 🎀", ts: '2:14 PM', isAI: true },
      { id: 'm3', from: 'client', text: "Yes please!! Book me 🙌", ts: '2:15 PM' },
      { id: 'm4', from: 'ai', text: "You're all set! Booking confirmed for Saturday March 8 at 2:00 PM — Full Set · $85. I'll send a reminder 24 hours before. See you then! ✨", ts: '2:15 PM', isAI: true },
    ],
  },
  {
    id: '2', name: 'James Park', channel: 'sms', unread: 1,
    intent: 'pricing_inquiry', lastMsg: "What's the price for brow lamination?",
    time: '8m', avatar: 'J', status: 'pending',
    messages: [
      { id: 'm1', from: 'client', text: "Hi! What's the price for brow lamination + tint?", ts: '1:52 PM' },
      { id: 'm2', from: 'ai', text: "Hey James! Brow lamination + tint is $75 and takes about 45 minutes. I have openings today at 4pm and 5:30pm, or tomorrow anytime before 3pm. Would any of those work for you? 😊", ts: '1:52 PM', isAI: true },
    ],
  },
  {
    id: '3', name: 'Maya Chen', channel: 'instagram', unread: 0,
    intent: 'cancellation', lastMsg: "I need to cancel tomorrow, so sorry",
    time: '32m', avatar: 'M', status: 'resolved',
    messages: [
      { id: 'm1', from: 'client', text: "Hey, I'm so sorry but I need to cancel my appointment tomorrow. Something came up 😭", ts: '1:30 PM' },
      { id: 'm2', from: 'ai', text: "No worries Maya! I've cancelled your booking for tomorrow at 11am. Would you like me to find you a new slot for later this week? 💕", ts: '1:30 PM', isAI: true },
      { id: 'm3', from: 'client', text: "Yes that would be great! Anytime Thursday or Friday?", ts: '1:33 PM' },
      { id: 'm4', from: 'ai', text: "Thursday 2pm or Friday 10am are both open — which works better for you?", ts: '1:33 PM', isAI: true },
    ],
  },
  {
    id: '4', name: 'Priya Sharma', channel: 'sms', unread: 0,
    intent: 'availability', lastMsg: "Do you have anything next Tuesday?",
    time: '1h', avatar: 'P', status: 'resolved',
    messages: [
      { id: 'm1', from: 'client', text: "Hi! Do you have any openings next Tuesday afternoon?", ts: '12:10 PM' },
      { id: 'm2', from: 'ai', text: "Hi Priya! I have Tuesday 2pm, 3:30pm, and 5pm available. What service were you looking for? 💅", ts: '12:10 PM', isAI: true },
      { id: 'm3', from: 'client', text: "Gel manicure please!", ts: '12:12 PM' },
      { id: 'm4', from: 'ai', text: "Perfect! Gel manicure is $55 and takes 60 min. Would you like 2pm, 3:30pm, or 5pm on Tuesday?", ts: '12:12 PM', isAI: true },
    ],
  },
  {
    id: '5', name: 'Lisa Wong', channel: 'instagram', unread: 0,
    intent: 'booking_request', lastMsg: "Confirmed! See you Wednesday 💅",
    time: '3h', avatar: 'L', status: 'resolved',
    messages: [
      { id: 'm1', from: 'client', text: "Can I book a full set Wednesday morning?", ts: '9:40 AM' },
      { id: 'm2', from: 'ai', text: "Hi Lisa! Wednesday 10am works great — full set with gel is $85. Shall I book it for you?", ts: '9:40 AM', isAI: true },
      { id: 'm3', from: 'client', text: "Yes please! 🙌", ts: '9:41 AM' },
      { id: 'm4', from: 'ai', text: "Booked! Wednesday March 12 at 10:00 AM — Full Set · $85. See you then Lisa! ✨", ts: '9:41 AM', isAI: true },
    ],
  },
];

const AI_SUGGESTIONS = [
  "I have Tuesday 2pm and Thursday 11am available — which works for you?",
  "Our full set with gel top coat is $85, takes about 75 min. Want me to book it?",
  "I've noted your cancellation. Can I find you a new slot this week? 💕",
];

/* ─── Channel icon ─────────────────────────────────────────── */
function ChannelIcon({ channel }: { channel: string }) {
  if (channel === 'instagram') return <Instagram className="w-3 h-3" style={{ color: '#e1306c' }} />;
  return <Phone className="w-3 h-3" style={{ color: '#34d399' }} />;
}

/* ─── Message bubble ───────────────────────────────────────── */
function MessageBubble({ msg, isNew = false }: {
  msg: { id: string; from: string; text: string; ts: string; isAI?: boolean }; isNew?: boolean;
}) {
  const isClient = msg.from === 'client';
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 8, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex ${isClient ? 'justify-end' : 'justify-start'} gap-2 items-end`}
    >
      {!isClient && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mb-1" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
        </div>
      )}
      <div className="max-w-[72%]">
        <div
          className="px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
          style={isClient ? {
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '18px 18px 4px 18px',
            color: 'rgba(244,244,245,0.9)',
          } : {
            background: msg.isAI ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.05)',
            border: msg.isAI ? '1px solid rgba(245,158,11,0.15)' : '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px 18px 18px 4px',
            color: 'rgba(244,244,245,0.85)',
          }}
        >
          {msg.text}
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1" style={{ justifyContent: isClient ? 'flex-end' : 'flex-start' }}>
          {!isClient && msg.isAI && (
            <span className="text-[10px] font-medium" style={{ color: 'rgba(245,158,11,0.6)' }}>AI ·</span>
          )}
          <span className="text-[10px]" style={{ color: 'rgba(244,244,245,0.25)' }}>{msg.ts}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Typing indicator ─────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
        <Sparkles className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
      </div>
      <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: '18px 18px 18px 4px' }}>
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function ConversationsPage() {
  const [selected, setSelected] = useState(MOCK_CONVOS[0]);
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [messages, setMessages] = useState(selected.messages);
  const [filter, setFilter] = useState('all');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(selected.messages);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  const filtered = MOCK_CONVOS.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'unread' && c.unread > 0) || (filter === 'pending' && c.status === 'pending');
    return matchSearch && matchFilter;
  });

  async function handleSend() {
    if (!reply.trim() || sending) return;
    const text = reply.trim();
    setReply('');
    setSending(true);

    const newMsg = { id: `m${Date.now()}`, from: 'me', text, ts: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);

    setTimeout(() => {
      setSending(false);
      setAiTyping(true);
      setTimeout(() => {
        setAiTyping(false);
        const aiMsg = { id: `m${Date.now()}`, from: 'ai', isAI: true, text: "Got it! Let me check availability and confirm the booking details for you. 🎀", ts: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
        setMessages(prev => [...prev, aiMsg]);
      }, 2000);
    }, 400);
  }

  const intentCfg = INTENT_COLORS[selected.intent] || INTENT_COLORS.general;

  return (
    <div className="flex h-[calc(100vh-56px)] -mx-8 -mt-7 overflow-hidden">
      {/* ── Conversation List ──────────────────────────── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col" style={{ background: '#0d0d12', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold" style={{ color: '#f4f4f5', fontFamily: 'var(--font-display)' }}>Conversations</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185' }}>
              {MOCK_CONVOS.filter(c => c.unread > 0).length} new
            </span>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(244,244,245,0.3)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-[13px] outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(244,244,245,0.8)', caretColor: '#f59e0b' }}
            />
          </div>
          {/* Filters */}
          <div className="flex gap-2 mt-3">
            {[['all', 'All'], ['unread', 'Unread'], ['pending', 'Pending']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all"
                style={filter === val ? {
                  background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)'
                } : {
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(244,244,245,0.4)', border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map(convo => {
            const ic = INTENT_COLORS[convo.intent] || INTENT_COLORS.general;
            const isActive = selected.id === convo.id;
            return (
              <motion.button
                key={convo.id}
                onClick={() => setSelected(convo)}
                className="w-full text-left px-3 py-3 mx-1 rounded-xl transition-all relative"
                style={{
                  width: 'calc(100% - 8px)',
                  background: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(245,158,11,0.15)' : '1px solid transparent',
                }}
                whileHover={{ background: isActive ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,113,133,0.18))', color: '#f59e0b' }}>
                      {convo.avatar}
                    </div>
                    {convo.unread > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: '#fb7185', color: '#09090b' }}>
                        {convo.unread}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[13px] font-semibold truncate" style={{ color: '#f4f4f5' }}>{convo.name}</span>
                      <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: 'rgba(244,244,245,0.3)' }}>{convo.time}</span>
                    </div>
                    <p className="text-[11px] truncate mb-1.5" style={{ color: 'rgba(244,244,245,0.45)' }}>{convo.lastMsg}</p>
                    <div className="flex items-center gap-1.5">
                      <ChannelIcon channel={convo.channel} />
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: ic.bg, color: ic.color }}>
                        {ic.label}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Thread ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#0a0a0f' }}>
        {/* Thread header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0d0d12' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,113,133,0.2))', color: '#f59e0b' }}>
              {selected.avatar}
            </div>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: '#f4f4f5' }}>{selected.name}</p>
              <div className="flex items-center gap-2">
                <ChannelIcon channel={selected.channel} />
                <span className="text-[11px]" style={{ color: 'rgba(244,244,245,0.35)' }}>
                  via {selected.channel === 'instagram' ? 'Instagram DM' : 'SMS'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Intent badge */}
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: intentCfg.bg, color: intentCfg.color, border: `1px solid ${intentCfg.color}25` }}>
              {selected.intent.replace('_', ' ')}
            </span>
            {/* AI active */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="live-dot" style={{ width: 6, height: 6 }} />
              <span className="text-[11px] font-medium" style={{ color: '#f59e0b' }}>AI On</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <AnimatePresence>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {aiTyping && <TypingIndicator key="typing" />}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* AI Suggestions */}
        <div className="px-6 py-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-1 flex-shrink-0 mr-1">
            <Zap className="w-3 h-3" style={{ color: '#f59e0b' }} />
            <span className="text-[11px] font-semibold" style={{ color: 'rgba(245,158,11,0.6)' }}>Quick</span>
          </div>
          {AI_SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => setReply(s)}
              className="flex-shrink-0 text-[12px] px-3 py-1.5 rounded-xl whitespace-nowrap transition-all"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', color: 'rgba(244,244,245,0.6)' }}
            >
              {s.length > 50 ? s.slice(0, 50) + '…' : s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-6 pb-6 pt-3 flex-shrink-0">
          <div className="flex items-end gap-3 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Reply as your AI… (Enter to send)"
              rows={2}
              className="flex-1 resize-none bg-transparent outline-none text-[13px] leading-relaxed"
              style={{ color: 'rgba(244,244,245,0.85)', caretColor: '#f59e0b' }}
            />
            <button
              onClick={handleSend}
              disabled={!reply.trim() || sending}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: reply.trim() ? 'linear-gradient(135deg, #f59e0b, #fb7185)' : 'rgba(255,255,255,0.05)',
                color: reply.trim() ? '#09090b' : 'rgba(244,244,245,0.2)',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 px-1">
            <Sparkles className="w-3 h-3" style={{ color: '#f59e0b' }} />
            <span className="text-[11px]" style={{ color: 'rgba(244,244,245,0.3)' }}>AI is handling replies automatically · You're in override mode</span>
          </div>
        </div>
      </div>

      {/* ── Booking Panel ────────────────────────────────── */}
      <div className="w-[260px] flex-shrink-0 flex flex-col" style={{ background: '#0d0d12', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>Booking Actions</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick book */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.12)' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
              <span className="text-[12px] font-semibold" style={{ color: '#34d399' }}>Quick Book</span>
            </div>
            <div className="space-y-2">
              {['Full Set · $85', 'Gel Manicure · $55', 'Brow Lamination · $75'].map(svc => (
                <button key={svc} className="w-full text-left text-[12px] px-3 py-2 rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(244,244,245,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {svc}
                </button>
              ))}
            </div>
          </div>

          {/* Client info */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(244,244,245,0.3)' }}>Client</p>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,113,133,0.18))', color: '#f59e0b' }}>
                {selected.avatar}
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>{selected.name}</p>
                <p className="text-[11px]" style={{ color: 'rgba(244,244,245,0.3)' }}>3 past bookings</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'rgba(244,244,245,0.35)' }}>Lifetime spend</span>
                <span className="text-[12px] font-semibold" style={{ color: '#f59e0b' }}>$255</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'rgba(244,244,245,0.35)' }}>Last visited</span>
                <span className="text-[12px]" style={{ color: 'rgba(244,244,245,0.6)' }}>3 weeks ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'rgba(244,244,245,0.35)' }}>Frequency</span>
                <span className="text-[12px]" style={{ color: 'rgba(244,244,245,0.6)' }}>Every 3–4 wks</span>
              </div>
            </div>
          </div>

          {/* Upsell suggestion */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.12)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
              <span className="text-[12px] font-semibold" style={{ color: '#a78bfa' }}>AI Upsell</span>
            </div>
            <p className="text-[12px] mb-3" style={{ color: 'rgba(244,244,245,0.55)' }}>
              Suggest gel removal add-on (+$20) — {selected.name} usually does it.
            </p>
            <button className="w-full text-[12px] font-semibold py-2 rounded-lg transition-all" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
              Send upsell suggestion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
