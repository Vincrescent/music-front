export default function Hero() {
  return (
    <section
      id="studios"
      className="relative w-full mt-16 overflow-hidden"
      aria-label="Tampilan studio"
    >
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[75vh] lg:h-[80vh] w-full">
        <img
          src="/images/studio-hero.png"
          alt="Studio Musik Lantai Atas — Drum Pearl, mikrofon, gitar, speaker, dan mixing board di ruang latihan profesional"
          className="h-full w-full object-cover object-center"
          loading="eager"
        />

        {/* Subtle bottom gradient fade into page background */}
        <div className="absolute bottom-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-t from-cream dark:from-slate-900 to-transparent pointer-events-none transition-colors duration-300" />
      </div>
    </section>
  );
}
