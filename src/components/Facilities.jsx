import { useState, useEffect, useRef } from "react";
import { facilities } from "../data/facilities";

/* ── Scroll-reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealDiv({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Facilities({ onBookSession }) {
  const { hero, recordingBooths, sideCards, mixingRoom, lounge, featureCards, cta } = facilities;
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [imageHover, setImageHover] = useState(null);

  return (
    <section id="facilities" className="bg-cream py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">

        {/* ── Section Header ── */}
        <RevealDiv className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-brown mb-4">{hero.title}</h2>
          <p className="text-warm-gray max-w-2xl mx-auto mb-6">{hero.subtitle}</p>
          <div className="flex items-end justify-center gap-1">
            {[12, 20, 28, 20, 12].map((h, i) => (
              <span key={i} className="inline-block w-1 rounded-full bg-gradient-to-t from-accent to-amber animate-pulse" style={{ height: h, animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </RevealDiv>

        {/* ── Block 1: Recording Booths ── */}
        <div className="grid md:grid-cols-5 gap-6 mb-16">
          <RevealDiv className="md:col-span-3 flex flex-col">
            <div
              className="rounded-xl overflow-hidden aspect-[4/3] relative group cursor-pointer"
              onMouseEnter={() => setImageHover("booth")}
              onMouseLeave={() => setImageHover(null)}
            >
              <img src={recordingBooths.image} alt={recordingBooths.title} className={`w-full h-full object-cover transition-transform duration-500 ${imageHover === "booth" ? "scale-110" : "scale-100"}`} loading="lazy" />
              <div className={`absolute inset-0 bg-gradient-to-t from-dark-brown/70 via-transparent to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 ${imageHover === "booth" ? "opacity-100" : "opacity-0"}`}>
                <span className="bg-white/90 text-dark-brown text-sm font-semibold px-4 py-2 rounded-full">🔍 Lihat Detail</span>
              </div>
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <span className="inline-block bg-peach text-brand text-xs font-semibold uppercase px-3 py-1 rounded-full mb-3">{recordingBooths.badge}</span>
                <h3 className="text-xl font-bold text-dark-brown mb-2">{recordingBooths.title}</h3>
                <p className="text-warm-gray text-sm leading-relaxed mb-3">{recordingBooths.description}</p>
                <div className="flex flex-wrap gap-2">
                  {recordingBooths.specs.map((spec, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 border border-warm-gray-light/40 rounded-full px-3 py-1 text-sm text-dark-brown hover:border-accent hover:text-accent transition-colors cursor-default">
                      <span>{spec.icon}</span>{spec.label}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-3xl shrink-0 mt-1 hover:scale-125 transition-transform cursor-default">🎧</span>
            </div>
          </RevealDiv>

          <div className="md:col-span-2 flex flex-col gap-6">
            {sideCards.map((card, i) => (
              <RevealDiv key={i} delay={i * 150} className="flex-1">
                <div className={`rounded-xl p-6 flex-1 flex flex-col justify-center h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default ${card.variant === "orange" ? "bg-accent text-white hover:shadow-accent/30" : "bg-white border border-gray-200 text-dark-brown hover:shadow-amber-200/50"}`}>
                  <span className="text-3xl mb-3 block hover:scale-125 transition-transform duration-300">{card.icon}</span>
                  <h4 className="font-semibold text-lg mb-1">{card.title}</h4>
                  <p className={`text-sm leading-relaxed ${card.variant === "orange" ? "text-white/80" : "text-warm-gray"}`}>{card.description}</p>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>

        {/* ── Block 2: Mixing Control Room ── */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <RevealDiv>
            <span className="inline-block bg-peach text-brand text-xs font-semibold uppercase px-3 py-1 rounded-full mb-4">{mixingRoom.badge}</span>
            <h3 className="text-xl font-bold text-dark-brown mb-3">{mixingRoom.title}</h3>
            <p className="text-warm-gray text-sm leading-relaxed mb-5">{mixingRoom.description}</p>
            <ul className="space-y-3">
              {mixingRoom.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-dark-brown group cursor-default">
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">✓</span>
                  <span className="group-hover:text-accent transition-colors duration-300">{feat}</span>
                </li>
              ))}
            </ul>
          </RevealDiv>
          <RevealDiv delay={200}>
            <div className="rounded-xl overflow-hidden aspect-[4/3] relative group cursor-pointer"
              onMouseEnter={() => setImageHover("mix")} onMouseLeave={() => setImageHover(null)}>
              <img src={mixingRoom.image} alt={mixingRoom.title} className={`w-full h-full object-cover transition-transform duration-500 ${imageHover === "mix" ? "scale-110" : "scale-100"}`} loading="lazy" />
              <div className={`absolute inset-0 bg-gradient-to-t from-dark-brown/70 via-transparent to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 ${imageHover === "mix" ? "opacity-100" : "opacity-0"}`}>
                <span className="bg-white/90 text-dark-brown text-sm font-semibold px-4 py-2 rounded-full">🔍 Lihat Detail</span>
              </div>
            </div>
          </RevealDiv>
        </div>

        {/* ── Block 3: Lounge + Feature Cards ── */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <RevealDiv>
            <div className="rounded-xl overflow-hidden aspect-[4/3] relative group cursor-pointer mb-5"
              onMouseEnter={() => setImageHover("lounge")} onMouseLeave={() => setImageHover(null)}>
              <img src={lounge.image} alt={lounge.title} className={`w-full h-full object-cover transition-transform duration-500 ${imageHover === "lounge" ? "scale-110" : "scale-100"}`} loading="lazy" />
              <div className={`absolute inset-0 bg-gradient-to-t from-dark-brown/70 via-transparent to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 ${imageHover === "lounge" ? "opacity-100" : "opacity-0"}`}>
                <span className="bg-white/90 text-dark-brown text-sm font-semibold px-4 py-2 rounded-full">🔍 Lihat Detail</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-dark-brown mb-2">{lounge.title}</h3>
            <p className="text-warm-gray text-sm leading-relaxed">{lounge.description}</p>
          </RevealDiv>

          <div className="grid grid-cols-2 gap-4 content-center">
            {featureCards.map((card, i) => (
              <RevealDiv key={i} delay={i * 100}>
                <div
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`border rounded-xl p-4 text-center bg-white transition-all duration-300 cursor-default ${hoveredFeature === i ? "shadow-lg -translate-y-2 border-accent/30 bg-amber-50/50" : "border-gray-200"}`}
                >
                  <span className={`text-2xl block mb-2 transition-transform duration-300 ${hoveredFeature === i ? "scale-130 animate-bounce" : ""}`}>{card.icon}</span>
                  <h4 className="font-semibold text-dark-brown text-sm mb-1">{card.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>

        {/* ── CTA Bar ── */}
        <RevealDiv>
          <div className="bg-cream-dark rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-dark-brown mb-1">{cta.title}</h3>
              <p className="text-warm-gray text-sm">{cta.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onBookSession} className="bg-accent hover:bg-accent-dark text-white rounded-lg px-6 py-3 font-semibold text-sm transition-all cursor-pointer hover:shadow-lg hover:shadow-accent/30 active:scale-95">
                Pesan Sesi
              </button>
              <a href="#studios" className="border-2 border-dark-brown text-dark-brown hover:bg-dark-brown hover:text-white rounded-lg px-6 py-3 font-semibold text-sm transition-all active:scale-95">
                Lihat Studio
              </a>
            </div>
          </div>
        </RevealDiv>

      </div>
    </section>
  );
}
