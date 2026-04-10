'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

type Message = { role: 'user' | 'bot'; text: string };

const INITIAL: Message = {
  role: 'bot',
  text: "Hey! I'm the booking assistant. What service are you looking to book, and when works for you?",
};

export default function BookPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const sessionId = typeof window !== 'undefined'
    ? (sessionStorage.getItem('chat_sid') || (() => { const id = Math.random().toString(36).slice(2); sessionStorage.setItem('chat_sid', id); return id; })())
    : 'default';

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.reply ?? "Got it! I'll get back to you shortly." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Sorry, something went wrong. Try again.' },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <style>{`
        .bp-root { font-family: var(--font-sans), system-ui, sans-serif; }
        .bp-serif { font-family: var(--font-display), Georgia, serif; }
        .bp-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .bp-input::placeholder { color: rgba(255,255,255,0.25); }
        .bp-input:focus {
          border-color: rgba(240,169,107,0.5);
          box-shadow: 0 0 0 3px rgba(240,169,107,0.08);
        }
        @keyframes bp-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bp-msg { animation: bp-fade-in 0.25s ease forwards; }
        @keyframes bp-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
        .bp-dot-1 { animation: bp-bounce 1.2s ease-in-out infinite; }
        .bp-dot-2 { animation: bp-bounce 1.2s ease-in-out 0.2s infinite; }
        .bp-dot-3 { animation: bp-bounce 1.2s ease-in-out 0.4s infinite; }
      `}</style>

      <div
        className="bp-root min-h-screen flex flex-col max-w-lg mx-auto"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(240,169,107,0.06) 0%, transparent 60%), #0a0a12',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f0a96b, #e879a0)',
                boxShadow: '0 4px 14px rgba(240,169,107,0.3)',
              }}
            >
              <span className="text-sm font-bold" style={{ color: '#0a0a12', fontFamily: 'var(--font-sans), sans-serif' }}>B</span>
            </div>
            <div>
              <p className="bp-serif text-base font-semibold" style={{ color: '#fff' }}>Booking Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.6)' }} />
                <span className="text-xs" style={{ color: 'rgba(52,211,153,0.8)' }}>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`bp-msg flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  m.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, #f0a96b, #e879a0)',
                        color: '#0a0a12',
                        fontWeight: 500,
                        borderBottomRightRadius: '6px',
                        boxShadow: '0 4px 16px rgba(240,169,107,0.2)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.8)',
                        borderBottomLeftRadius: '6px',
                      }
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {sending && (
            <div className="bp-msg flex justify-start">
              <div
                className="rounded-2xl px-5 py-3.5 flex items-center gap-1.5"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderBottomLeftRadius: '6px',
                }}
              >
                <span className="bp-dot-1 w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'rgba(240,169,107,0.6)' }} />
                <span className="bp-dot-2 w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'rgba(240,169,107,0.6)' }} />
                <span className="bp-dot-3 w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'rgba(240,169,107,0.6)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex gap-2.5 items-center">
            <input
              className="bp-input flex-1 rounded-2xl px-4 py-3 text-sm"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={sending}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: input.trim() && !sending
                  ? 'linear-gradient(135deg, #f0a96b, #e879a0)'
                  : 'rgba(255,255,255,0.06)',
                color: input.trim() && !sending ? '#0a0a12' : 'rgba(255,255,255,0.2)',
                boxShadow: input.trim() && !sending ? '0 4px 16px rgba(240,169,107,0.25)' : 'none',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
