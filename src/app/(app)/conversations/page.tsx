'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Instagram, Phone, Search, Sparkles, Send, MessageSquare, Zap,
} from 'lucide-react';

/* ─── Intent config ────────────────────────────────────────── */
const INTENT_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  booking_request: { bg: 'rgba(52,211,153,0.1)',   color: '#34d399', label: 'Booking' },
  pricing_inquiry: { bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b', label: 'Pricing' },
  cancellation:    { bg: 'rgba(248,113,113,0.1)',  color: '#f87171', label: 'Cancel' },
  availability:    { bg: 'rgba(167,139,250,0.1)',  color: '#a78bfa', label: 'Avail.' },
  general:         { bg: 'rgba(255,255,255,0.07)', color: 'rgba(244,244,245,0.5)', label: 'General' },
};

type Msg = { id: string; from: string; text: string; ts: string; isAI?: boolean };
type Convo = {
  id: string; name: string; channel: string; unread: number;
  intent: string; lastMsg: string; time: string; avatar: string;
  status: string; messages: Msg[];
};

/* ─── Channel icon ─────────────────────────────────────────── */
function ChannelIcon({ channel }: { channel: string }) {
  if (channel === 'instagram') return <Instagram className="w-3 h-3" style={{ color: '#e1306c' }} />;
  return <Phone className="w-3 h-3" style={{ color: '#34d399' }} />;
}

/* ─── Message bubble ───────────────────────────────────────── */
function MessageBubble({ msg }: { msg: Msg }) {
  const isClient = msg.from === 'client';
  return (
    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
      {!isClient && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mb-1"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
        </div>
      )}
        <div className="max-w-[72%]">
        <div className="px-4 py-2.5 text-[13px] leading-relaxed"
          style={isClient ? {
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '18px 18px 4px 18px',
            color: '#f4f4f5',
          } : {
            background: msg.isAI ? 'rgba(245,158,11,0.08)' : 'rgba(20,20,28,0.95)',
            border: msg.isAI ? '1px solid rgba(245,158,11,0.15)' : '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px 18px 18px 4px',
            color: '#f4f4f5',
          }}
        >
          {msg.text}
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1"
          style={{ justifyContent: isClient ? 'flex-end' : 'flex-start' }}>
          {!isClient && msg.isAI && (
            <span className="text-[10px] font-medium" style={{ color: 'rgba(245,158,11,0.6)' }}>AI ·</span>
          )}
          <span className="text-[10px]" style={{ color: 'rgba(244,244,245,0.25)' }}>{msg.ts}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Typing indicator ─────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'rgba(245,158,11,0.12)' }}>
        <Sparkles className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
      </div>
      <div className="px-4 py-3"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: '18px 18px 18px 4px' }}>
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ background: '#f59e0b', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function ConversationsPage() {
  const [convos] = useState<Convo[]>([]);
  const [selected, setSelected] = useState<Convo | null>(null);
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [filter, setFilter] = useState('all');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(selected?.messages ?? []);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  const filtered = convos.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all'
      || (filter === 'unread' && c.unread > 0)
      || (filter === 'pending' && c.status === 'pending');
    return matchSearch && matchFilter;
  });

  async function handleSend() {
    if (!reply.trim() || sending || !selected) return;
    const text = reply.trim();
    setReply('');
    setSending(true);
    const newMsg: Msg = {
      id: `m${Date.now()}`, from: 'me', text,
      ts: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setTimeout(() => {
      setSending(false);
      setAiTyping(true);
      setTimeout(() => {
        setAiTyping(false);
        const aiMsg: Msg = {
          id: `m${Date.now()}`, from: 'ai', isAI: true,
          text: "Got it! Let me check availability and confirm the booking details for you. 🎀",
          ts: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMsg]);
      }, 2000);
    }, 400);
  }

  const intentCfg = selected ? (INTENT_COLORS[selected.intent] || INTENT_COLORS.general) : INTENT_COLORS.general;

  return (
    /* Fixed panel pinned to sidebar right edge — avoids parent overflow issues */
    <div
      className="fixed flex overflow-hidden"
      style={{ left: 256, top: 0, right: 0, bottom: 0, background: '#0a0a0f' }}
    >
      {/* ── Conversation List ──────────────────────────── */}
      <div className="w-[280px] flex-shrink-0 flex flex-col"
        style={{ background: '#0c0b0a', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold" style={{ color: '#f4f4f5', fontFamily: 'var(--font-display)' }}>
              Conversations
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185' }}>
              {convos.filter(c => c.unread > 0).length} new
            </span>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'rgba(244,244,245,0.3)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-[13px] outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#f4f4f5', caretColor: '#f59e0b' }}
            />
          </div>
          {/* Filters */}
          <div className="flex gap-1.5 mt-3">
            {[['all', 'All'], ['unread', 'Unread'], ['pending', 'Pending']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all"
                style={filter === val ? {
                  background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)'
                } : {
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(244,244,245,0.6)', border: '1px solid rgba(255,255,255,0.07)'
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <MessageSquare className="w-5 h-5" style={{ color: 'rgba(244,244,245,0.2)' }} />
              </div>
              <p className="text-[12px] font-semibold mb-1" style={{ color: 'rgba(244,244,245,0.4)' }}>
                No conversations yet
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(244,244,245,0.2)' }}>
                Connect Instagram DM or SMS to start receiving messages
              </p>
            </div>
          ) : (
            filtered.map(convo => {
              const ic = INTENT_COLORS[convo.intent] || INTENT_COLORS.general;
              const isActive = selected?.id === convo.id;
              return (
                <button key={convo.id} type="button" onClick={() => setSelected(convo)}
                  className="w-full text-left px-3 py-3 mx-1 rounded-xl transition-all"
                  style={{
                    width: 'calc(100% - 8px)',
                    background: isActive
                      ? 'linear-gradient(105deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.04) 100%)'
                      : 'transparent',
                    border: isActive ? '1px solid rgba(245,158,11,0.18)' : '1px solid transparent',
                    borderLeft: isActive ? '2px solid #f59e0b' : '2px solid transparent',
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold"
                        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,113,133,0.18))', color: '#f59e0b' }}>
                        {convo.avatar}
                      </div>
                      {convo.unread > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ background: '#fb7185', color: '#f4f4f5' }}>
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
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: ic.bg, color: ic.color }}>
                          {ic.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Thread ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#0a0a0f' }}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.12)' }}>
              <MessageSquare className="w-6 h-6" style={{ color: 'rgba(245,158,11,0.4)' }} />
            </div>
            <p className="text-[13px]" style={{ color: 'rgba(244,244,245,0.3)' }}>
              Select a conversation
            </p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0d0d12' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,113,133,0.2))', color: '#f59e0b' }}>
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
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: intentCfg.bg, color: intentCfg.color, border: `1px solid ${intentCfg.color}25` }}>
                  {selected.intent.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                  <span className="text-[11px] font-medium" style={{ color: '#f59e0b' }}>AI On</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              {aiTyping && <TypingIndicator key="typing" />}
              <div ref={bottomRef} />
            </div>

            {/* AI Suggestions */}
            <div className="px-6 py-2 flex gap-2 overflow-x-auto flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-1 flex-shrink-0 mr-1">
                <Zap className="w-3 h-3" style={{ color: '#f59e0b' }} />
                <span className="text-[11px] font-semibold" style={{ color: 'rgba(245,158,11,0.6)' }}>Quick</span>
              </div>
              {[
                "I have Tuesday 2pm and Thursday 11am available — which works?",
                "Our full set with gel is $85, takes about 75 min. Shall I book it?",
                "I've noted your cancellation. Can I find you a new slot? 💕",
              ].map((s, i) => (
                <button key={i} onClick={() => setReply(s)}
                  className="flex-shrink-0 text-[12px] px-3 py-1.5 rounded-xl whitespace-nowrap transition-all"
                  style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', color: 'rgba(244,244,245,0.6)' }}>
                  {s.length > 45 ? s.slice(0, 45) + '…' : s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-6 pb-6 pt-3 flex-shrink-0">
              <div className="flex items-end gap-3 rounded-2xl p-3"
                style={{ background: 'rgba(17,17,24,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Reply… (Enter to send)"
                  rows={2}
                  className="flex-1 resize-none bg-transparent outline-none text-[13px] leading-relaxed"
                  style={{ color: 'rgba(244,244,245,0.85)', caretColor: '#f59e0b' }}
                />
                <button onClick={handleSend} disabled={!reply.trim() || sending}
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: reply.trim() ? 'linear-gradient(135deg, #f59e0b, #fb7185)' : 'rgba(255,255,255,0.05)',
                    color: reply.trim() ? '#09090b' : 'rgba(244,244,245,0.2)',
                  }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 px-1">
                <Sparkles className="w-3 h-3" style={{ color: '#f59e0b' }} />
                <span className="text-[11px]" style={{ color: 'rgba(244,244,245,0.3)' }}>
                  AI is handling replies automatically · You're in override mode
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Right Panel ──────────────────────────────────── */}
      <div className="w-[240px] flex-shrink-0 flex flex-col"
        style={{ background: '#0c0b0a', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>Details</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[12px] text-center" style={{ color: 'rgba(244,244,245,0.2)' }}>
                No conversation selected
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Client info */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(244,244,245,0.3)' }}>Client</p>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold"
                    style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,113,133,0.18))', color: '#f59e0b' }}>
                    {selected.avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>{selected.name}</p>
                    <p className="text-[11px]" style={{ color: 'rgba(244,244,245,0.3)' }}>via {selected.channel}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(244,244,245,0.3)' }}>Status</p>
                <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full capitalize"
                  style={intentCfg}>
                  {selected.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
