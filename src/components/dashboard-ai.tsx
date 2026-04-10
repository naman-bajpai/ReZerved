'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bot, X, Send, Loader2, Sparkles, ChevronDown, Minimize2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

const SUGGESTIONS = [
  'Cancel all bookings for today',
  'Cancel all bookings for tomorrow',
  'What bookings do I have today?',
  'Block off Saturdays',
  'Show me this week\'s revenue',
  'Confirm all pending bookings',
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[5px] h-[5px] rounded-full"
          style={{
            background: 'rgba(249,115,22,0.6)',
            animation: `dash-ai-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function AssistantBubble({ content }: { content: string }) {
  // Simple markdown-ish: bold **text** and line breaks
  const lines = content.split('\n').filter(Boolean);
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-[13px] leading-relaxed" style={{ color: '#e4e4e7' }}>
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} style={{ color: '#f4f4f5', fontWeight: 600 }}>
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export function DashboardAI() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `dash-${Math.random().toString(36).slice(2)}`);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && !minimised) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimised]);

  useEffect(() => {
    if (open && !minimised) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, minimised]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setShowSuggestions(false);
      const userMsg: Message = { role: 'user', content: trimmed, ts: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      try {
        const res = await fetch('/api/dashboard-ai', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, sessionId }),
        });
        const data = await res.json();
        const reply = data.reply || "Done.";
        setMessages((prev) => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Something went wrong. Please try again.', ts: Date.now() },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionId]
  );

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes dash-ai-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes dash-ai-fadein {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dash-ai-slidein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-ai-panel {
          animation: dash-ai-fadein 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .dash-ai-msg {
          animation: dash-ai-slidein 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Floating trigger button */}
      <button
        onClick={() => {
          if (open && !minimised) {
            setMinimised(true);
          } else {
            setOpen(true);
            setMinimised(false);
          }
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: open && !minimised
            ? 'rgba(249,115,22,0.12)'
            : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          border: open && !minimised
            ? '1px solid rgba(249,115,22,0.3)'
            : '1px solid rgba(249,115,22,0.4)',
          boxShadow: open && !minimised
            ? '0 0 0 1px rgba(249,115,22,0.1)'
            : '0 4px 20px rgba(249,115,22,0.35), 0 2px 6px rgba(0,0,0,0.3)',
          color: open && !minimised ? '#f97316' : '#fff',
        }}
        title="Dashboard AI Assistant"
      >
        <Bot className="w-4 h-4 flex-shrink-0" />
        <span className="text-[13px] font-semibold tracking-tight">
          {open && !minimised ? 'Minimise' : 'Ask AI'}
        </span>
        {!open && (
          <Sparkles className="w-3.5 h-3.5 opacity-80" />
        )}
      </button>

      {/* Chat panel */}
      {open && !minimised && (
        <div
          className="dash-ai-panel fixed bottom-[72px] right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: '380px',
            height: '520px',
            background: '#111113',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}
              >
                <Bot className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: '#f4f4f5' }}>Dashboard AI</p>
                <p className="text-[10px] leading-none mt-0.5" style={{ color: '#52525b' }}>
                  {loading ? 'Thinking…' : 'Ready'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimised(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: '#52525b' }}
                title="Minimise"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: '#52525b' }}
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
            {!hasMessages && (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(249,115,22,0.1)' }}
                  >
                    <Bot className="w-3 h-3" style={{ color: '#f97316' }} />
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-md px-3.5 py-2.5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-[13px] leading-relaxed" style={{ color: '#e4e4e7' }}>
                      Hi! I can help you manage bookings, update your availability, and more. What would you like to do?
                    </p>
                  </div>
                </div>

                {showSuggestions && (
                  <div className="pl-8 flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-[11px] px-2.5 py-1.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'rgba(249,115,22,0.06)',
                          border: '1px solid rgba(249,115,22,0.15)',
                          color: '#f97316',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`dash-ai-msg flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(249,115,22,0.1)' }}
                  >
                    <Bot className="w-3 h-3" style={{ color: '#f97316' }} />
                  </div>
                )}
                <div className="max-w-[85%] space-y-1">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 ${msg.role === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'}`}
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'rgba(249,115,22,0.12)',
                            border: '1px solid rgba(249,115,22,0.2)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }
                    }
                  >
                    {msg.role === 'user' ? (
                      <p className="text-[13px] leading-relaxed" style={{ color: '#fddcca' }}>
                        {msg.content}
                      </p>
                    ) : (
                      <AssistantBubble content={msg.content} />
                    )}
                  </div>
                  <p className={`text-[10px] px-1 ${msg.role === 'user' ? 'text-right' : ''}`} style={{ color: '#3f3f46' }}>
                    {formatTime(msg.ts)}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="dash-ai-msg flex items-start gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(249,115,22,0.1)' }}
                >
                  <Bot className="w-3 h-3" style={{ color: '#f97316' }} />
                </div>
                <div
                  className="rounded-2xl rounded-tl-md px-3.5 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex-shrink-0 px-3 pb-3 pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
                }}
                onKeyDown={handleKey}
                placeholder="Ask anything about your dashboard…"
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-[13px] leading-relaxed py-0.5"
                style={{
                  color: '#f4f4f5',
                  minHeight: '22px',
                  maxHeight: '96px',
                  scrollbarWidth: 'none',
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-[1.05] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.06)',
                }}
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#f97316' }} />
                ) : (
                  <Send className="w-3.5 h-3.5" style={{ color: input.trim() ? '#fff' : '#52525b' }} />
                )}
              </button>
            </div>
            <p className="text-[10px] text-center mt-2" style={{ color: '#27272a' }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
