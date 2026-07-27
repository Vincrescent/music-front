import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, Moon, ChevronDown } from 'lucide-react';
import api from '../utils/axiosConfig';

/* ────────────────────────────────────────────────────────
   MOON 🌙 — AI Chat Assistant for Studio Musik Lantai Atas
   ──────────────────────────────────────────────────────── */

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: 'Halo! Aku **MOON** 🌙, asisten virtual Studio Musik Lantai Atas.\n\nAku bisa bantu kamu tentang:\n🎵 Info studio & harga\n🎤 Fasilitas & peralatan\n📅 Cara booking\n❓ Pertanyaan lainnya\n\nAda yang bisa aku bantu hari ini?',
  timestamp: new Date(),
};

const QUICK_REPLIES = [
  { label: '🎵 Info Studio', message: 'Apa saja studio yang tersedia dan berapa harganya?' },
  { label: '🎤 Fasilitas', message: 'Apa saja fasilitas yang ada di studio?' },
  { label: '📅 Cara Booking', message: 'Bagaimana cara booking studio?' },
  { label: '💰 Harga', message: 'Berapa harga sewa studio per jam?' },
];

function formatMessage(text) {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="moon-typing-dot w-2 h-2 rounded-full bg-amber-400" style={{ animationDelay: '0ms' }} />
        <span className="moon-typing-dot w-2 h-2 rounded-full bg-amber-400" style={{ animationDelay: '150ms' }} />
        <span className="moon-typing-dot w-2 h-2 rounded-full bg-amber-400" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-gray-400 ml-1.5 italic">MOON sedang mengetik...</span>
    </div>
  );
}

function MoonAvatar({ size = 'sm' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0`}>
      <Moon size={size === 'sm' ? 14 : 18} className="text-white" />
    </div>
  );
}

function ChatMessage({ msg, isLatest }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`moon-msg-appear flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isLatest ? 'moon-msg-latest' : ''}`}>
      {!isUser && <MoonAvatar />}
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md'
            : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-md border border-gray-100 dark:border-slate-600'
        }`}
      >
        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
        <div className={`text-[10px] mt-1.5 ${isUser ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'} text-right`}>
          {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function MoonChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Detect if user scrolled up
  const handleScroll = () => {
    if (!chatBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setHasInteracted(true);

    // Build history for context (last 10 messages)
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-10)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));

    try {
      const res = await api.post('/moon/chat', {
        message: text.trim(),
        history,
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: res.data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Maaf, terjadi kesalahan koneksi. Coba lagi nanti ya! 🌙',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (message) => {
    sendMessage(message);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* ── Chat Window ── */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-[9999] transition-all duration-500 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}
      >
        <div className="w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden border border-gray-200 dark:border-slate-700 moon-chat-glass">
          {/* ── Header ── */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 px-4 py-3.5 flex items-center gap-3 shrink-0">
            {/* Decorative stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="moon-star absolute top-2 right-12 w-1 h-1 bg-white rounded-full opacity-60" />
              <div className="moon-star absolute top-5 right-24 w-0.5 h-0.5 bg-white rounded-full opacity-40" style={{ animationDelay: '1s' }} />
              <div className="moon-star absolute bottom-2 right-32 w-1 h-1 bg-amber-200 rounded-full opacity-50" style={{ animationDelay: '2s' }} />
              <div className="moon-star absolute top-3 left-48 w-0.5 h-0.5 bg-white rounded-full opacity-30" style={{ animationDelay: '0.5s' }} />
            </div>

            <MoonAvatar size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-white font-bold text-base tracking-tight">MOON</h3>
                <Sparkles size={14} className="text-amber-300" />
              </div>
              <p className="text-indigo-200 text-xs truncate">Asisten AI Studio Musik Lantai Atas</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Messages Body ── */}
          <div
            ref={chatBodyRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-850 moon-chat-scrollbar"
          >
            {messages.map((msg, i) => (
              <ChatMessage key={msg.id} msg={msg} isLatest={i === messages.length - 1} />
            ))}

            {isLoading && <TypingIndicator />}

            {/* Quick Replies — show only if no user interaction yet */}
            {!hasInteracted && messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1 moon-msg-appear">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.label}
                    onClick={() => handleQuickReply(qr.message)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-all duration-200 cursor-pointer hover:shadow-sm"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-gray-200 dark:border-slate-600 text-gray-500 hover:text-purple-500 transition-colors cursor-pointer z-10"
            >
              <ChevronDown size={16} />
            </button>
          )}

          {/* ── Input Area ── */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya MOON sesuatu..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all max-h-24"
              style={{ minHeight: '40px' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`shrink-0 p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Kirim pesan"
            >
              <Send size={16} className={isLoading ? 'animate-pulse' : ''} />
            </button>
          </form>

          {/* ── Footer brand ── */}
          <div className="shrink-0 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 px-3 py-1.5 text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Powered by <span className="font-medium text-purple-400">MOON AI</span> × Gemini ✨
            </p>
          </div>
        </div>
      </div>

      {/* ── Floating Action Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-4 sm:right-6 z-[9999] group cursor-pointer transition-all duration-300 ${
          isOpen ? 'scale-90' : 'scale-100 hover:scale-110'
        }`}
        aria-label={isOpen ? 'Tutup MOON Chat' : 'Buka MOON Chat'}
      >
        {/* Pulse ring */}
        {!isOpen && !hasInteracted && (
          <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20" />
        )}

        {/* Main button */}
        <div className={`relative w-14 h-14 rounded-full shadow-xl transition-all duration-500 flex items-center justify-center ${
          isOpen
            ? 'bg-gradient-to-r from-gray-600 to-gray-700 shadow-gray-500/30 rotate-90'
            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 shadow-purple-500/40 moon-fab-glow'
        }`}>
          {isOpen ? (
            <X size={22} className="text-white transition-transform duration-300" />
          ) : (
            <div className="relative">
              <MessageCircle size={22} className="text-white" />
              <Sparkles size={10} className="text-amber-300 absolute -top-1 -right-1" />
            </div>
          )}
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg moon-badge-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Tooltip */}
        {!isOpen && !hasInteracted && (
          <div className="absolute bottom-full right-0 mb-3 moon-tooltip-appear">
            <div className="bg-white dark:bg-slate-700 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600 px-4 py-2.5 whitespace-nowrap">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Hai! Butuh bantuan? 👋</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Chat dengan MOON 🌙</p>
              {/* Arrow */}
              <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white dark:bg-slate-700 border-r border-b border-gray-200 dark:border-slate-600 rotate-45" />
            </div>
          </div>
        )}
      </button>
    </>
  );
}
