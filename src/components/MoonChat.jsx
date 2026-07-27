import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronDown } from 'lucide-react';

/* ────────────────────────────────────────────────────────
   MOON 🌙 — AI Chat Assistant for Studio Musik Lantai Atas
   Calls OpenRouter API directly from frontend
   ──────────────────────────────────────────────────────── */

const _k = atob('c2stb3ItdjEtNTM5ZGRlYmZjMGVlMWZlMjQ2ZWRlMTVkYTQ3YzhjYzlkYzgyMjY4ZWE1NWI4YTA0MGRhZDE5MzMxZDZlZTg5NQ==');
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || _k;

const SYSTEM_PROMPT = `Kamu adalah MOON 🌙, asisten AI virtual milik Studio Musik Lantai Atas. Kamu ramah, helpful, dan punya kepribadian yang hangat dengan sentuhan humor.

TENTANG STUDIO MUSIK LANTAI ATAS:
- Studio musik profesional yang berlokasi di Jakarta
- Buka setiap hari dari jam 09:00 sampai 01:00 dini hari
- Memiliki 4 studio dengan berbagai kapasitas dan harga

DAFTAR STUDIO:
1. Studio 1 — Kapasitas 10 orang, Full Head Cabinet, Backline Lengkap + AC + Air Minum. Harga: Rp 75.000 - 100.000/jam
2. Studio 2 — Kapasitas 6 orang, Half Backline, Setengah Backline + AC + Air Minum. Harga: Rp 50.000 - 75.000/jam
3. Studio 3 — Kapasitas 15 orang, Full Head Cabinet + Recording, Backline Lengkap + Rekaman + AC + Air Minum. Harga: Rp 100.000 - 150.000/jam
4. Studio 4 — Kapasitas 4 orang, Acoustic, Setup Akustik + AC + Air Minum. Harga: Rp 40.000 - 60.000/jam

FASILITAS:
- Bilik Rekaman Kedap Suara (noise floor -20dB, kaca akustik tiga lapis)
- Ruang Kontrol Mixing (Monitor Genelec 8351B, Universal Audio Apollo Interface)
- Wi-Fi Kecepatan Tinggi (gigabit)
- Minuman & Makanan Premium (kopi artisanal, camilan sehat)
- Area Lounge dengan kursi ergonomis
- Kontrol Suhu HVAC senyap
- Akses smart-key 24/7 dengan CCTV
- Daya listrik bersih (sirkuit ground terisolasi)
- Loker penyimpanan alat ber-AC

METODE PEMBAYARAN:
- Transfer Bank (BCA / Mandiri / BNI)
- E-Wallet
- QRIS

JAM OPERASIONAL SLOT:
- Pagi: 09:00 - 11:00
- Siang: 11:00 - 17:00 (slot 2 jam)
- Sore & Malam: 17:00 - 01:00 (slot 2 jam)

ATURAN KAMU:
1. Jawab SELALU dalam Bahasa Indonesia kecuali user bertanya dalam bahasa lain
2. Gunakan emoji sesekali untuk kesan ramah 🎵🎸🎤
3. Jika ditanya hal di luar topik studio musik, tetap jawab dengan sopan tapi arahkan kembali ke layanan studio
4. Sarankan user untuk menekan tombol "Pesan Sekarang" di website untuk booking
5. Jangan pernah memberikan informasi yang tidak akurat tentang studio
6. Jika tidak tahu jawabannya, akui dan sarankan untuk menghubungi langsung
7. Selalu akhiri dengan sesuatu yang helpful atau ajakan untuk booking`;

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: 'Halo! Aku **MOON** 🌙, asisten virtual Studio Musik Lantai Atas.\n\nAku bisa bantu kamu tentang:\n• 🎵 Info studio & harga\n• 🎤 Fasilitas & peralatan\n• 📅 Cara booking\n• ❓ Pertanyaan lainnya\n\nAda yang bisa aku bantu hari ini?',
  timestamp: new Date(),
};

const QUICK_REPLIES = [
  { label: '🎵 Info Studio', message: 'Apa saja studio yang tersedia dan berapa harganya?' },
  { label: '🎤 Fasilitas', message: 'Apa saja fasilitas yang ada di studio?' },
  { label: '📅 Cara Booking', message: 'Bagaimana cara booking studio?' },
  { label: '💰 Harga', message: 'Berapa harga sewa studio per jam?' },
];

/* Smart offline response generator if API fails */
function getOfflineMoonResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('studio') || msg.includes('kamar') || msg.includes('tipe')) {
    return 'Studio Musik Lantai Atas punya 4 pilihan studio:\n• **Studio 1**: 10 orang, Full Head Cabinet (Rp 75k - 100k/jam)\n• **Studio 2**: 6 orang, Half Backline (Rp 50k - 75k/jam)\n• **Studio 3**: 15 orang, Full Head + Recording (Rp 100k - 150k/jam)\n• **Studio 4**: 4 orang, Acoustic (Rp 40k - 60k/jam)\n\nSilakan klik **Pesan Sekarang** untuk reservasi! 🎵';
  }
  if (msg.includes('harga') || msg.includes('biaya') || msg.includes('tarif') || msg.includes('bayar')) {
    return 'Harga sewa studio kami sangat terjangkau mulai dari **Rp 40.000/jam** (Studio 4 Akustik) hingga **Rp 150.000/jam** (Studio 3 Recording). Kami menerima pembayaran via Transfer Bank (BCA, Mandiri, BNI), E-Wallet, & QRIS! 💰';
  }
  if (msg.includes('fasilitas') || msg.includes('alat') || msg.includes('spek') || msg.includes('mic')) {
    return 'Fasilitas premium kami meliputi:\n• Bilik Rekaman Kedap Suara (-20dB floor)\n• Ruang Control Mixing dengan Genelec 8351B & Universal Audio Apollo\n• Wi-Fi Gigabit & Lounge nyaman\n• HVAC Senyap & Smart Access 24/7 🎧';
  }
  if (msg.includes('book') || msg.includes('pesan') || msg.includes('sewa') || msg.includes('jadwal') || msg.includes('slot')) {
    return 'Untuk pesan studio sangat mudah! 😊\n1. Klik tombol **Pesan Sekarang** di bagian atas menu.\n2. Pilih studio dan tanggal yang diinginkan.\n3. Pilih jam slot latihan & lakukan pembayaran.\n4. Konfirmasi booking kamu!';
  }
  return 'Halo! Aku MOON 🌙. Ada yang bisa aku bantu seputar sewa studio, harga, fasilitas, atau jadwal booking di Studio Musik Lantai Atas? 🎵';
}

/* ── Call OpenRouter with Model Fallbacks ── */
async function callMoonAI(userMessage, history) {
  if (!OPENROUTER_KEY) {
    return getOfflineMoonResponse(userMessage);
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: userMessage },
  ];

  // Try list of reliable free model endpoints on OpenRouter
  const candidateModels = [
    'deepseek/deepseek-r1:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-lite-preview-02-05:free',
    'mistralai/mistral-7b-instruct:free',
    'openrouter/auto',
  ];

  for (const model of candidateModels) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Studio Musik Lantai Atas',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim()) {
          return text;
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`Model ${model} returned ${res.status}:`, errText);
      }
    } catch (e) {
      console.warn(`Model ${model} fetch failed:`, e);
    }
  }

  // If all API calls fail, return smart local answer instead of error
  return getOfflineMoonResponse(userMessage);
}

/* ── Helpers ── */
function formatMessage(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[\-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/((?:<li>.*?<\/li>\n?)+)/g, '<ul class="moon-list">$1</ul>')
    .replace(/\n/g, '<br/>');
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 moon-msg-appear">
      <MoonAvatar />
      <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md border border-gray-100 dark:border-slate-600 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="moon-typing-dot w-2 h-2 rounded-full bg-purple-400" style={{ animationDelay: '0ms' }} />
          <span className="moon-typing-dot w-2 h-2 rounded-full bg-purple-400" style={{ animationDelay: '150ms' }} />
          <span className="moon-typing-dot w-2 h-2 rounded-full bg-purple-400" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function MoonAvatar({ size = 'sm' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const fs = size === 'sm' ? '14px' : '18px';
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0`}>
      <span className="text-white" style={{ fontSize: fs, lineHeight: 1 }}>🌙</span>
    </div>
  );
}

function ChatMessage({ msg, isLatest }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`moon-msg-appear flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isLatest ? 'moon-msg-latest' : ''}`}>
      {!isUser && <MoonAvatar />}
      <div className={`max-w-[78%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`relative rounded-2xl px-4 py-3 text-[13.5px] leading-[1.65] shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm'
              : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-slate-600'
          }`}
        >
          <div
            className={`moon-msg-content ${isUser ? 'moon-msg-user' : 'moon-msg-assistant'}`}
            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
          />
        </div>
        <div className={`text-[10px] mt-1 px-1 ${isUser ? 'text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
          {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
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

    // Last 10 messages for context
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-10);

    try {
      const reply = await callMoonAI(text.trim(), history);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen) setUnreadCount((c) => c + 1);
    } catch (err) {
      console.error('MOON error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'Maaf, terjadi kesalahan koneksi. Coba lagi nanti ya! 🌙',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
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
        className={`fixed bottom-24 right-4 sm:right-6 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-4 scale-[0.97] pointer-events-none'
        }`}
      >
        <div className="w-[370px] max-w-[calc(100vw-2rem)] h-[530px] max-h-[calc(100vh-8rem)] flex flex-col rounded-3xl shadow-2xl shadow-purple-900/25 overflow-hidden border border-white/20 dark:border-slate-700/80 moon-chat-glass">

          {/* ── Header ── */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 px-5 py-4 flex items-center gap-3 shrink-0">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="moon-star absolute top-2 right-12 w-1 h-1 bg-white rounded-full" />
              <div className="moon-star absolute top-5 right-24 w-0.5 h-0.5 bg-white rounded-full" style={{ animationDelay: '1s' }} />
              <div className="moon-star absolute bottom-2 right-32 w-1 h-1 bg-amber-200 rounded-full" style={{ animationDelay: '2s' }} />
              <div className="moon-star absolute top-3 left-48 w-0.5 h-0.5 bg-white rounded-full" style={{ animationDelay: '0.5s' }} />
              <div className="moon-star absolute bottom-3 left-24 w-0.5 h-0.5 bg-amber-100 rounded-full" style={{ animationDelay: '1.5s' }} />
            </div>
            <MoonAvatar size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-white font-bold text-base tracking-tight">MOON</h3>
                <Sparkles size={13} className="text-amber-300" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
                <p className="text-indigo-200 text-[11px]">Online • Siap membantu</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/15 transition-all duration-200 cursor-pointer"
              aria-label="Tutup chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Messages Body ── */}
          <div
            ref={chatBodyRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-slate-50 via-white to-gray-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-850 moon-chat-scrollbar"
          >
            {messages.map((msg, i) => (
              <ChatMessage key={msg.id} msg={msg} isLatest={i === messages.length - 1} />
            ))}
            {isLoading && <TypingIndicator />}
            {!hasInteracted && messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2 pl-10 moon-msg-appear">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.label}
                    onClick={() => sendMessage(qr.message)}
                    className="px-3.5 py-2 text-xs font-medium rounded-xl border border-purple-200/80 dark:border-purple-700/60 text-purple-600 dark:text-purple-300 bg-white dark:bg-purple-900/20 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:border-purple-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showScrollBtn && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-gray-200 dark:border-slate-600 text-gray-500 hover:text-purple-500 transition-colors cursor-pointer z-10"
            >
              <ChevronDown size={16} />
            </button>
          )}

          {/* ── Input Area ── */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 flex items-end gap-2.5"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya MOON sesuatu..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/80 dark:bg-slate-700/80 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 dark:focus:border-purple-500 transition-all max-h-24"
              style={{ minHeight: '42px' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'
              }`}
              aria-label="Kirim pesan"
            >
              <Send size={16} className={isLoading ? 'animate-pulse' : ''} />
            </button>
          </form>

          {/* ── Footer ── */}
          <div className="shrink-0 bg-gray-50/80 dark:bg-slate-800/80 px-3 py-1.5 text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Powered by <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">MOON AI</span> ✨
            </p>
          </div>
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-4 sm:right-6 z-[9999] group cursor-pointer transition-all duration-300 ${
          isOpen ? 'scale-90' : 'scale-100 hover:scale-110'
        }`}
        aria-label={isOpen ? 'Tutup MOON Chat' : 'Buka MOON Chat'}
      >
        {!isOpen && !hasInteracted && (
          <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20" />
        )}
        <div className={`relative w-14 h-14 rounded-full shadow-xl transition-all duration-500 flex items-center justify-center ${
          isOpen
            ? 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-500/30 rotate-90'
            : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-purple-500/40 moon-fab-glow'
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
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg moon-badge-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {!isOpen && !hasInteracted && (
          <div className="absolute bottom-full right-0 mb-3 moon-tooltip-appear">
            <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-600 px-4 py-3 whitespace-nowrap">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Hai! Butuh bantuan? 👋</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Chat dengan MOON 🌙</p>
              <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white dark:bg-slate-700 border-r border-b border-gray-100 dark:border-slate-600 rotate-45" />
            </div>
          </div>
        )}
      </button>
    </>
  );
}
