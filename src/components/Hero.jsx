import AudioVisualizer from './AudioVisualizer';

export default function Hero({ onBookNow }) {
  return (
    <section
      id="studios"
      className="relative w-full mt-16 overflow-hidden"
      aria-label="Tampilan studio"
    >
      <div className="relative h-[55vh] sm:h-[65vh] md:h-[80vh] lg:h-[85vh] w-full">
        {/* Background Image */}
        <img
          src="/images/studio-hero.png"
          alt="Studio Musik Lantai Atas — Drum Pearl, mikrofon, gitar, speaker, dan mixing board di ruang latihan profesional"
          className="h-full w-full object-cover object-center"
          loading="eager"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/90 text-xs sm:text-sm font-medium tracking-wide">Studio Tersedia Hari Ini</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 tracking-tight animate-fade-in-up">
            Studio Musik
            <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Lantai Atas
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-xl mb-8 leading-relaxed animate-fade-in-up-delay font-light">
            Ruang kreativitas profesional untuk latihan, rekaman, dan mixing.
            <span className="hidden sm:inline"> Peralatan premium, akustik terbaik, harga terjangkau.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-in-up-delay-2">
            <button
              onClick={() => {
                onBookNow?.();
              }}
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm sm:text-base rounded-full px-8 py-3.5 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 cursor-pointer hover:scale-105"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Pesan Sekarang
            </button>
            <a
              href="#facilities"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm sm:text-base font-medium transition-colors duration-200 px-6 py-3 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 backdrop-blur-sm cursor-pointer"
            >
              Lihat Fasilitas
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Audio Visualizer at bottom */}
        <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none">
          <AudioVisualizer className="h-28 sm:h-36 md:h-44 lg:h-52 opacity-60" />
        </div>

        {/* Bottom gradient fade into page */}
        <div className="absolute bottom-0 inset-x-0 h-20 sm:h-28 bg-gradient-to-t from-cream dark:from-slate-900 to-transparent pointer-events-none z-20 transition-colors duration-300" />
      </div>
    </section>
  );
}
