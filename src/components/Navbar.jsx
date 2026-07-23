import { useState, useEffect } from 'react';
import { Moon, Sun, History } from 'lucide-react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import CustomerHistoryModal from './booking/CustomerHistoryModal';

const NAV_LINKS = [
  { label: 'Studio', href: '#studios' },
  { label: 'Fasilitas', href: '#facilities' },
  { label: 'Peralatan', href: '#equipment' },
  { label: 'Testimoni', href: '#testimonials' },
];

export default function Navbar({ onBookNow, onLogin }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('app_theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      } else {
        setUser(null);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [loginOpen, registerOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /* Track scroll position to add shadow and detect active section */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);

      const sections = NAV_LINKS.map((l) => l.href.slice(1));
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) current = `#${id}`;
        }
      }
      setActiveLink(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on anchor click */
  const handleNavClick = (href) => {
    setActiveLink(href);
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 ${
        darkMode ? 'bg-gray-900/95 text-gray-100 border-b border-gray-800 backdrop-blur-md' : 'bg-cream/95 backdrop-blur-sm border-b border-cream-dark/60'
      } ${scrolled ? 'shadow-md' : ''}`}
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Left: Logo ── */}
        <a
          href="#"
          className="flex items-center gap-2 shrink-0"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setMobileOpen(false);
          }}
        >
          {/* Custom Studio Logo */}
          <img src="/favicon.svg" alt="Studio Logo" className="w-8 h-8 rounded-lg shadow-sm object-cover" />
          <span className={`text-lg font-bold tracking-tight leading-tight ${darkMode ? 'text-amber-400' : 'text-brand'}`}>
            Studio Musik<span className="hidden sm:inline"> Lantai Atas</span>
          </span>
        </a>

        {/* ── Center: Desktop nav links ── */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => handleNavClick(href)}
                className={`relative text-sm font-medium transition-colors duration-200 py-1 ${
                  activeLink === href
                    ? darkMode ? 'text-amber-400 font-bold' : 'text-brand after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-accent after:rounded-full'
                    : darkMode ? 'text-gray-300 hover:text-amber-300' : 'text-warm-gray hover:text-brand'
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* ── Right: Auth + Theme Switcher + CTA (desktop) ── */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              darkMode ? 'bg-gray-800 border-gray-700 text-amber-300 hover:bg-gray-750' : 'bg-white border-gray-200 text-warm-gray hover:bg-gray-100'
            }`}
            title="Ganti Tema (Light/Dark Mode)"
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-amber-600" />}
            <span>{darkMode ? 'Dark' : 'Light'}</span>
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition cursor-pointer border border-accent/30"
                title="Lihat Riwayat Pemesanan Studio Anda"
              >
                <History size={14} />
                Riwayat Booking
              </button>
              <span className={`text-sm font-medium ${darkMode ? 'text-amber-300' : 'text-brand'}`}>Halo, {user.name || user.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className={`text-sm font-medium transition-colors cursor-pointer ${darkMode ? 'text-gray-300 hover:text-white' : 'text-warm-gray hover:text-brand'}`}
            >
              Masuk
            </button>
          )}
          <button
            onClick={onBookNow}
            className={`inline-flex items-center justify-center text-sm font-semibold rounded-full px-6 py-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${
              darkMode ? 'bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold' : 'bg-accent hover:bg-accent-dark text-white'
            }`}
          >
            Pesan Sekarang
          </button>
        </div>

        {/* ── Hamburger (mobile) ── */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border cursor-pointer ${
              darkMode ? 'bg-gray-800 border-gray-700 text-amber-400' : 'bg-white border-gray-200 text-warm-gray'
            }`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-warm-gray hover:text-brand hover:bg-cream-dark transition-colors"
            aria-label="Buka/Tutup menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              /* X icon */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-cream border-cream-dark'
        } ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <ul className="flex flex-col gap-1 px-4 pt-2 pb-4">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => handleNavClick(href)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeLink === href
                    ? 'bg-accent-light text-brand'
                    : 'text-warm-gray hover:bg-cream-dark hover:text-brand'
                }`}
              >
                {label}
              </a>
            </li>
          ))}

          {/* Divider */}
          <li className="my-1 border-t border-cream-dark" />

          <li>
            {user ? (
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full block rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Keluar ({user.name || user.username})
              </button>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); setLoginOpen(true); }}
                className="w-full block rounded-lg px-3 py-2.5 text-left text-sm font-medium text-warm-gray hover:bg-cream-dark hover:text-brand transition-colors cursor-pointer"
              >
                Masuk
              </button>
            )}
          </li>
          <li>
            <button
              onClick={() => { setMobileOpen(false); onBookNow?.(); }}
              className="block w-full text-center bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-full px-6 py-2.5 transition-colors shadow-sm cursor-pointer"
            >
              Pesan Sekarang
            </button>
          </li>
        </ul>
      </div>
      <LoginModal 
        isOpen={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onLoginSuccess={(role, user) => {
          setLoginOpen(false);
          onLogin?.(role, user);
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        onRegisterSuccess={(role, user) => {
          setRegisterOpen(false);
          onLogin?.(role, user);
        }}
      />
      <CustomerHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onNewBooking={onBookNow}
      />
    </header>
  );
}
