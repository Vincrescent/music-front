export default function Footer() {
  const links = [
    { label: "Kebijakan Privasi", href: "#" },
    { label: "Syarat & Ketentuan", href: "#" },
    { label: "Hubungi Kami", href: "#" },
    { label: "Karir", href: "#" },
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <img src="/favicon.svg" alt="Studio Logo" className="w-6 h-6 rounded-md shadow-xs object-cover" />
            <p className="text-brand dark:text-amber-400 font-bold text-lg">Studio Musik Lantai Atas</p>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">&copy; 2026 Studio Musik Lantai Atas. Dibuat oleh King Vincent 2026.</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {links.map((link, idx) => (
            <a key={idx} href={link.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand dark:hover:text-amber-400 transition">{link.label}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
