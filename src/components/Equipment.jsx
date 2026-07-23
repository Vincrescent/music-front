import { useState, useEffect, useRef, useCallback } from "react";
import { equipment, categories } from "../data/equipment";

/* ── Scroll reveal hook ── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Toast component ── */
function Toast({ message, show, onClose }) {
  useEffect(() => { if (show) { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); } }, [show, onClose]);
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <div className="bg-dark-brown text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium">
        <span className="text-green-400">✓</span> {message}
      </div>
    </div>
  );
}

/* ── SVG helpers ── */
const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
  </svg>
);

const SoundBars = ({ className = "" }) => (
  <div className={`flex items-end gap-[3px] ${className}`}>
    {[14, 22, 10, 26, 16, 20, 12].map((h, i) => (
      <span key={i} className="w-[3px] rounded-full bg-amber animate-pulse" style={{ height: h, animationDelay: `${i * 100}ms` }} />
    ))}
  </div>
);

/* ── Category mapping removed (not needed) ── */

/* ── Main component ── */
export default function Equipment() {
  const [activeCategory, setActiveCategory] = useState("Semua Alat");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [flippedCard, setFlippedCard] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState({ show: false, message: "" });
  const [sectionRef, sectionVisible] = useReveal();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = equipment.filter((item) => {
    const matchCat = activeCategory === "Semua Alat" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const showToast = useCallback((msg) => setToast({ show: true, message: msg }), []);
  const hideToast = useCallback(() => setToast({ show: false, message: "" }), []);

  const handleAdd = (item) => {
    setQuantities((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
    showToast(`${item.name} berhasil ditambahkan ke sesi!`);
  };

  const handleQty = (id, delta) => {
    setQuantities((prev) => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  };

  return (
    <section id="equipment" className="bg-cream py-16 md:py-24">
      <Toast message={toast.message} show={toast.show} onClose={hideToast} />

      <div className="max-w-6xl mx-auto px-4" ref={sectionRef}>
        {/* ─── HEADER ─── */}
        <div className={`flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 transition-all duration-700 ${sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <span className="inline-block bg-peach text-brand text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">Peralatan Profesional</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-dark-brown leading-tight">Suara Presisi</h2>
            <p className="mt-3 max-w-xl text-warm-gray text-sm md:text-base">
              Tingkatkan produksi Anda dengan koleksi instrumen standar industri dan peralatan audio high-fidelity pilihan kami.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <SoundBars />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm-gray-light">Standar&nbsp;Studio</span>
          </div>
        </div>

        <hr className="border-t border-amber mb-10" />

        {/* ─── FILTER BAR ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer ${activeCategory === cat ? "bg-accent text-white shadow-md shadow-accent/20 scale-105" : "border border-gray-300 text-gray-600 hover:border-accent hover:text-accent"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><SearchIcon /></span>
            <input type="text" placeholder="Cari peralatan…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
          </div>
        </div>

        {/* ─── EQUIPMENT GRID ─── */}
        {search && debouncedSearch !== search ? (
          /* Shimmer loading */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /><div className="h-8 bg-gray-200 rounded-full mt-4" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-warm-gray-light py-16 text-lg">Tidak ada peralatan yang cocok dengan pencarian Anda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, idx) => {
              const isFlipped = flippedCard === item.id;
              const qty = quantities[item.id];
              return (
                <div
                  key={item.id}
                  className={`transition-all duration-700 ${sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${idx * 100}ms`, perspective: "1000px" }}
                >
                  <div className={`relative w-full transition-transform duration-500 ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`} style={{ transformStyle: "preserve-3d" }}>
                    {/* FRONT */}
                    <div className={`group border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-shadow duration-300 ${isFlipped ? "invisible" : ""}`} style={{ backfaceVisibility: "hidden" }}>
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-peach via-cream-dark to-peach-dark dark:from-slate-800 dark:to-slate-900 overflow-hidden cursor-pointer" onClick={() => setFlippedCard(item.id)}>
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        <span className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 ${item.available ? "bg-emerald-600 text-white" : "bg-gray-500 text-white"}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${item.available ? "bg-emerald-200" : "bg-gray-200"}`} />
                          {item.available ? "Tersedia" : "Tidak Tersedia"}
                        </span>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="bg-white text-slate-900 text-sm font-bold px-4 py-2 rounded-full shadow-lg cursor-pointer">🔄 Balik untuk detail</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-b-xl">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-bold text-lg text-dark-brown dark:text-white truncate">{item.name}</h3>
                          <span className="shrink-0 border border-gray-300 dark:border-slate-700 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 rounded-full px-2.5 py-0.5">{item.category}</span>
                        </div>
                        <p className="text-accent dark:text-amber-400 text-sm font-medium mb-3">{item.subtitle}</p>
                        <div className="space-y-1 mb-4">
                          {item.specs.map((spec, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">{spec.label}</span>
                              <span className="font-bold text-dark-brown dark:text-gray-100">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setFlippedCard(item.id)}
                          className="w-full border-2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-accent hover:text-accent dark:hover:border-amber-400 dark:hover:text-amber-400 rounded-full py-2 text-sm font-semibold transition-all cursor-pointer active:scale-95">
                          Lihat Detail Alat
                        </button>
                      </div>
                    </div>

                    {/* BACK */}
                    {isFlipped && (
                      <div className="absolute inset-0 border border-accent/30 dark:border-amber-500/40 rounded-xl bg-white dark:bg-slate-900 shadow-xl p-6 flex flex-col justify-between [transform:rotateY(180deg)]" style={{ backfaceVisibility: "hidden" }}>
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-lg text-dark-brown dark:text-white">{item.name}</h3>
                            <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${item.available ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400"}`}>
                              {item.available ? "✓ Tersedia" : "✗ Tidak Tersedia"}
                            </span>
                          </div>
                          <p className="text-accent dark:text-amber-400 text-sm mb-4">{item.subtitle}</p>
                          <div className="bg-cream dark:bg-slate-800/80 rounded-lg p-4 space-y-2 mb-4 border border-transparent dark:border-slate-700">
                            <p className="text-xs font-bold text-warm-gray dark:text-amber-400 uppercase">Spesifikasi Lengkap</p>
                            {item.specs.map((spec, i) => (
                              <div key={i} className="flex justify-between text-sm border-b border-gray-100 dark:border-slate-700 pb-1 last:border-0">
                                <span className="text-warm-gray dark:text-gray-400">{spec.label}</span>
                                <span className="font-bold text-dark-brown dark:text-gray-100">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-warm-gray dark:text-gray-400">Kategori: <span className="font-semibold text-dark-brown dark:text-white">{item.category}</span></p>
                        </div>
                        <div className="mt-4">
                          <button onClick={() => setFlippedCard(null)} className="w-full border-2 border-gray-300 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-full py-2 text-sm font-semibold hover:border-dark-brown dark:hover:border-amber-400 hover:text-dark-brown dark:hover:text-amber-400 transition cursor-pointer active:scale-95">
                            ← Kembali
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── DARK CTA SECTION ─── */}
      <div className="mt-16 md:mt-24 bg-dark-section text-white">
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center overflow-hidden">
          <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 items-end gap-[5px] opacity-30">
            {[40, 64, 32, 72, 48, 56, 36, 60, 44].map((h, i) => (
              <span key={i} className="w-[4px] rounded-full bg-amber animate-pulse" style={{ height: h, animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Tidak Menemukan yang Anda Butuhkan?</h3>
          <p className="max-w-lg mx-auto text-white/70 text-sm md:text-base mb-8">
            Inventaris kami terus bertambah. Hubungi kami dan kami akan carikan peralatan yang sempurna untuk sesi Anda berikutnya.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="border-2 border-white text-white rounded-full px-8 py-3 text-sm font-semibold hover:bg-white hover:text-dark-section transition-all cursor-pointer active:scale-95">Tanyakan Peralatan</button>
            <button className="border-2 border-white text-white rounded-full px-8 py-3 text-sm font-semibold hover:bg-white hover:text-dark-section transition-all cursor-pointer active:scale-95">Lihat Spek Studio</button>
          </div>
        </div>
      </div>
    </section>
  );
}
