export default function Footer() {
  const links = [
    { label: "Kebijakan Privasi", href: "#" },
    { label: "Syarat & Ketentuan", href: "#" },
    { label: "Hubungi Kami", href: "#" },
    { label: "Karir", href: "#" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-brand font-bold text-lg">Studio Musik Lantai Atas</p>
          <p className="text-gray-500 text-sm mt-1">&copy; 2024 Studio Musik Lantai Atas. Presisi Ritmis.</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {links.map((link, idx) => (
            <a key={idx} href={link.href} className="text-sm text-gray-500 hover:text-brand transition">{link.label}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
