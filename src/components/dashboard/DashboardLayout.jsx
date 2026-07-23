import { useState, useEffect } from "react";
import { LayoutDashboard, CalendarCheck, ShieldCheck, Building2, Wrench, BarChart3, Plus, Settings, LogOut, Menu, X, Music, Download, Bell, Moon, Sun, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";

import api from "../../utils/axiosConfig";

const iconMap = { LayoutDashboard, CalendarCheck, ShieldCheck, Building2, Wrench, BarChart3 };

export default function DashboardLayout({ menuItems, activePage, onPageChange, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("app_theme") === "dark");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("app_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("app_theme", "light");
    }
  }, [darkMode]);

  const fetchLiveNotifications = async () => {
    try {
      const res = await api.get("/bookings");
      if (res.data.success && Array.isArray(res.data.data)) {
        const liveBookings = res.data.data.slice(0, 6).map((b) => ({
          id: `bk-${b.id}`,
          title: `Booking #${b.id} (${b.status})`,
          desc: `${b.user?.name || b.customer_name || 'Pelanggan'} - ${b.studio?.name || 'Studio 1'} (${b.start_time} - ${b.end_time})`,
          time: b.booking_date || "Baru Saja",
          type: b.status === "Validated" ? "success" : b.status === "Pending" ? "warning" : "info",
          unread: b.status === "Pending" || b.status === "Validated",
        }));

        const savedReports = JSON.parse(localStorage.getItem("generated_reports") || "[]");
        const reportNotes = savedReports.slice(0, 3).map((r) => ({
          id: `rep-${r.id}`,
          title: r.title || "Laporan Masuk",
          desc: `Diserahkan oleh: ${r.submitter || "Kasir Vincent"}`,
          time: r.time || "Baru saja",
          type: "success",
          unread: true,
        }));

        setNotifications([...reportNotes, ...liveBookings]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 8000);
    window.addEventListener("storage", fetchLiveNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", fetchLiveNotifications);
    };
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const clearNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? "bg-gray-950 text-gray-100" : "bg-cream text-dark-brown"}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-60 border-r flex flex-col transition-all duration-300 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Brand */}
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${darkMode ? "bg-amber-500 text-gray-950" : "bg-accent text-white"}`}>
              <Music size={18} />
            </div>
            <span className={`font-bold text-sm leading-tight ${darkMode ? "text-amber-400" : "text-brand"}`}>
              Studio Musik<br />Lantai Atas
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { onPageChange(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? darkMode ? "bg-amber-500 text-gray-950 font-bold shadow-md" : "bg-accent text-white font-bold"
                    : darkMode ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-warm-gray hover:bg-cream"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-4 space-y-2">
          {/* Dark Mode Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              darkMode ? "bg-gray-800 border-gray-700 text-amber-300 hover:bg-gray-750" : "bg-gray-50 border-gray-200 text-warm-gray hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Moon size={14} className="text-amber-400" /> : <Sun size={14} className="text-amber-500" />}
              {darkMode ? "Dark Neon Theme" : "Light Cream Theme"}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${darkMode ? "bg-amber-400/20 text-amber-300" : "bg-amber-100 text-amber-800"}`}>
              {darkMode ? "ON" : "OFF"}
            </span>
          </button>

          <button 
            onClick={() => window.location.hash = "#booking"}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition cursor-pointer shadow-sm ${
              darkMode ? "bg-amber-500 hover:bg-amber-400 text-gray-950" : "bg-accent hover:bg-accent-dark text-white"
            }`}
          >
            <Plus size={16} /> New Booking
          </button>
          
          <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${darkMode ? "text-gray-400 hover:bg-red-950/40 hover:text-red-400" : "text-warm-gray hover:bg-red-50 hover:text-red-500"}`}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Notification & Controls */}
        <header className={`sticky top-0 z-30 border-b px-4 md:px-8 h-16 flex items-center justify-between transition-colors ${darkMode ? "bg-gray-900/90 border-gray-800 backdrop-blur-md" : "bg-white/90 border-gray-200 backdrop-blur-md"}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              <Menu size={20} className={darkMode ? "text-gray-300" : "text-warm-gray"} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${darkMode ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "bg-cream text-brand border border-accent/20"}`}>
                Live Operating System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-xl border relative transition-colors cursor-pointer ${
                  darkMode ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                title="Pusat Notifikasi"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Panel */}
              {notificationsOpen && (
                <div className={`absolute right-0 mt-3 w-80 md:w-96 rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in zoom-in duration-150 ${darkMode ? "bg-gray-900 border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-800"}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      <h4 className="font-bold text-sm">Pusat Notifikasi Realtime</h4>
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[11px] font-semibold text-accent hover:underline cursor-pointer">
                        Tandai dibaca
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto my-2">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className={`py-3 flex items-start gap-3 relative group ${n.unread ? "opacity-100" : "opacity-60"}`}>
                          <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${n.type === "success" ? "bg-emerald-500/10 text-emerald-500" : n.type === "warning" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
                            {n.type === "success" ? <CheckCircle2 size={16} /> : n.type === "warning" ? <AlertCircle size={16} /> : <Info size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold flex items-center justify-between">
                              <span>{n.title}</span>
                              <span className="text-[10px] font-normal text-warm-gray">{n.time}</span>
                            </p>
                            <p className="text-xs mt-0.5 text-warm-gray leading-snug">{n.desc}</p>
                          </div>
                          <button onClick={() => clearNotification(n.id)} className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400">
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-center py-6 text-warm-gray">Tidak ada notifikasi baru</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                    <button onClick={() => setNotificationsOpen(false)} className="text-xs font-semibold text-warm-gray hover:text-accent cursor-pointer">
                      Tutup Panel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto relative">
          {children}

          {/* Floating Action Quick Export / Print */}
          <button 
            onClick={() => window.print()} 
            className={`fixed bottom-6 right-6 w-12 h-12 rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer z-20 ${
              darkMode ? "bg-amber-500 hover:bg-amber-400 text-gray-950" : "bg-accent hover:bg-accent-dark"
            }`} 
            title="Cetak Halaman (Print Layout)"
          >
            <Download size={20} />
          </button>
        </main>
      </div>
    </div>
  );
}
