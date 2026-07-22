import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useToast, Modal, ConfirmDialog, exportToCSV } from "../shared/UIHelpers";
import DashboardLayout from "../dashboard/DashboardLayout";
import {
  bookingManagement,
  paymentValidations,
  adminStudioData,
  gearInventory,
  financialReport,
  equipmentStatus,
  reportGenerator,
} from "../../data/adminData";
import {
  Search,
  Bell,
  Calendar,
  Filter,
  Download,
  Edit,
  X as XIcon,
  Eye,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { key: "booking", label: "Booking", icon: "CalendarCheck" },
  { key: "validasi", label: "Validasi Pembayaran", icon: "ShieldCheck" },
  { key: "dataStudio", label: "Data Studio", icon: "Building2" },
  { key: "peralatan", label: "Peralatan", icon: "Wrench" },
  { key: "laporan", label: "Laporan", icon: "BarChart3" },
];

/* ───────────── Helper: Status Badge ───────────── */
function StatusBadge({ status }) {
  const map = {
    Pending: "bg-orange-100 text-orange-700",
    PENDING: "bg-orange-100 text-orange-700",
    Validated: "bg-emerald-100 text-emerald-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Done: "bg-gray-100 text-gray-500",
    CANCELLED: "bg-red-100 text-red-600",
    "In Progress": "bg-blue-100 text-blue-600",
    Good: "bg-emerald-100 text-emerald-700",
    GOOD: "bg-emerald-100 text-emerald-700",
    Service: "bg-orange-100 text-orange-700",
    SERVICE: "bg-orange-100 text-orange-700",
    Broken: "bg-red-100 text-red-600",
    BROKEN: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

/* ───────────── Helper: Avatar Initials ───────────── */
function Avatar({ name, size = "w-9 h-9", bg = "bg-accent/15 text-accent" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className={`${size} rounded-full ${bg} flex items-center justify-center text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
}

/* ───────────── Helper: Stat Card ───────────── */
function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`rounded-xl border border-gray-100 p-5 flex flex-col gap-2 ${accent || "bg-white"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-warm-gray uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">{icon}</div>
      </div>
      <span className="text-2xl font-bold text-brand">{value}</span>
    </div>
  );
}

/* ───────────── Sound Bars Decoration ───────────── */
function SoundBars({ className = "" }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`}>
      {[16, 24, 12, 20, 14, 22, 10].map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-accent/60"
          style={{ height: h, animation: `pulse 1.2s ease-in-out ${i * 0.1}s infinite alternate` }}
        />
      ))}
    </div>
  );
}

/* ══════════════ DASHBOARD FOOTER ══════════════ */
function DashboardFooter() {
  return (
    <footer className="bg-gray-100/80 border-t border-gray-200 mt-8 rounded-xl px-6 py-5">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-brand font-bold text-base">Studio Musik Lantai Atas</p>
          <p className="text-gray-500 text-sm mt-1">&copy; 2026 Studio Musik Lantai Atas. Rhythmic Precision.</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a href="#" className="text-sm text-gray-500 hover:text-brand transition">Kebijakan Privasi</a>
          <a href="#" className="text-sm text-gray-500 hover:text-brand transition">Syarat Layanan</a>
          <a href="#" className="text-sm text-gray-500 hover:text-brand transition">Hubungi Kami</a>
        </nav>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE 1 – DASHBOARD
   ═══════════════════════════════════════════════════ */
function DashboardPage() {
  const toast = useToast();
  const [reportPeriod, setReportPeriod] = useState(reportGenerator.periods[0]);
  const [reportChecks, setReportChecks] = useState({ "Pendapatan & Penjualan": true, "Status Peralatan": true, "Catatan Pelanggan": false });
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [stats, setStats] = useState({
    totalBookingToday: 0,
    dailyRevenue: "Rp 0",
    activeStudios: "0/0",
    pendingValidation: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const statsRes = await axios.get("http://localhost:8000/api/admin/stats", { headers });
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const bookingsRes = await axios.get("http://localhost:8000/api/bookings", { headers });
      if (bookingsRes.data.success) {
        setRecentBookings(bookingsRes.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleCheck = (key) => setReportChecks((p) => ({ ...p, [key]: !p[key] }));
  const handleSendReport = () => {
    const selected = Object.entries(reportChecks).filter(([,v]) => v).map(([k]) => k);
    if (selected.length === 0) { toast("Pilih minimal satu konten laporan", "error"); return; }
    
    const existingReports = JSON.parse(localStorage.getItem("generated_reports") || "[]");
    const newReport = {
      id: Date.now(),
      title: `Laporan: ${reportPeriod}`,
      submitter: "Admin",
      time: "Baru saja",
      type: "UMUM",
      icon: "📊",
      contents: selected
    };
    localStorage.setItem("generated_reports", JSON.stringify([newReport, ...existingReports]));

    toast(`Laporan (${reportPeriod}) berhasil dikirim ke Pemilik! 📊`);
  };
  const handleValidateBooking = async (id) => {
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(`http://localhost:8000/api/bookings/${id}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast("Booking berhasil divalidasi ✓");
      fetchData();
    } catch (error) {
      toast("Gagal memvalidasi booking", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand">Dashboard</h1>
          <p className="text-sm text-warm-gray mt-1">Selamat datang kembali, Vincent.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-warm-gray flex items-center gap-2">
            <Calendar size={14} /> 21 Jul 2026
          </span>
          <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">V</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Booking Hari Ini" value={stats.totalBookingToday} icon={<Calendar size={16} />} />
        <StatCard label="Pendapatan Harian" value={stats.dailyRevenue} icon={<TrendingUp size={16} />} />
        <StatCard label="Studio Aktif" value={stats.activeStudios} icon={<BarChart3 size={16} />} accent="bg-amber-light" />
        <StatCard label="Menunggu Validasi" value={stats.pendingValidation} icon={<Clock size={16} />} />
      </div>

      {/* Two‑column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left – Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-brand">Booking Terbaru</h2>
            <button onClick={() => toast("Menampilkan semua booking...")} className="text-xs text-accent font-medium hover:underline cursor-pointer">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-warm-gray-light uppercase tracking-wide border-b border-gray-50">
                  <th className="px-5 py-3">Nama Pelanggan</th>
                  <th className="px-5 py-3">Studio</th>
                  <th className="px-5 py-3">Tanggal & Waktu</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-cream/40 transition">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <Avatar name={b.user ? b.user.name : "Unknown"} />
                      <span className="font-medium text-brand">{b.user ? b.user.name : "Unknown"}</span>
                    </td>
                    <td className="px-5 py-3 text-warm-gray">{b.studio ? b.studio.name : "Studio"}</td>
                    <td className="px-5 py-3 text-warm-gray">
                      {b.booking_date} · {b.start_time.substring(0,5)} - {b.end_time.substring(0,5)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3 flex items-center gap-1">
                      <button onClick={() => setSelectedBooking(b)} className="text-accent hover:text-accent-dark transition cursor-pointer" title="Lihat Detail">
                        <Eye size={16} />
                      </button>
                      {(b.status === "Pending" || b.status === "PENDING") && (
                        <button onClick={() => handleValidateBooking(b.id)} className="text-emerald-500 hover:text-emerald-700 transition cursor-pointer" title="Validasi">
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Report Generator */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-brand">Generator Laporan</h3>
            <div>
              <label className="text-xs text-warm-gray block mb-1.5">Pilih Periode</label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {reportGenerator.periods.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              {reportGenerator.content.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm text-warm-gray">
                  <input
                    type="checkbox"
                    checked={!!reportChecks[c]}
                    onChange={() => toggleCheck(c)}
                    className="accent-accent w-4 h-4 rounded"
                  />
                  {c}
                </label>
              ))}
            </div>
            <button onClick={handleSendReport} className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition cursor-pointer active:scale-95">
              Kirim ke Pemilik
            </button>
          </div>

          {/* Studio 1 Card */}
          <div className="bg-amber-light rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brand">Studio 1</h3>
              <span className="text-xs text-amber font-medium">Sedang Sesi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-warm-gray">Latihan</span>
            </div>
            <button onClick={() => toast("Membuka manajemen peralatan Studio 1... 🔧")} className="w-full py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition cursor-pointer flex items-center justify-center gap-2 active:scale-95">
              <Wrench size={14} /> Kelola Peralatan
            </button>
          </div>
        </div>
      </div>

      {/* Equipment Status */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-brand">Status Peralatan Studio</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">120 Baik</span>
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">4 Rusak</span>
          </div>
        </div>
        <div className="space-y-2">
          {equipmentStatus.map((e, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-brand">{e.name}</span>
              <StatusBadge status={e.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Booking Detail Modal */}
      <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Detail Booking">
        {selectedBooking && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4"><Avatar name={selectedBooking.user?.name || "Unknown"} /><div><p className="font-semibold text-brand">{selectedBooking.user?.name || "Unknown"}</p><p className="text-xs text-warm-gray">{selectedBooking.studio?.name || "Unknown"}</p></div></div>
            <div className="bg-cream rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Tanggal</span><span className="font-medium text-brand">{selectedBooking.booking_date}</span></div>
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Waktu</span><span className="font-medium text-brand">{selectedBooking.start_time?.substring(0,5)} - {selectedBooking.end_time?.substring(0,5)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Status</span><StatusBadge status={selectedBooking.status} /></div>
            </div>
            {selectedBooking.status === "Pending" && (
              <button onClick={() => { handleValidateBooking(selectedBooking.id); setSelectedBooking(null); }} className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2">
                <CheckCircle size={14} /> Validasi Booking
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE 2 – BOOKING MANAGEMENT
   ═══════════════════════════════════════════════════ */
function BookingPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [studioFilter, setStudioFilter] = useState("Semua Studio");
  const [bookingStates, setBookingStates] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        const res = await axios.get("http://localhost:8000/api/bookings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setBookings(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookings();
  }, []);

  const filtered = bookings.filter(b => {
    const userName = b.user ? b.user.name.toLowerCase() : "";
    const matchSearch = !search || userName.includes(search.toLowerCase());
    const matchStudio = studioFilter === "Semua Studio" || (b.studio && b.studio.name === studioFilter);
    return matchSearch && matchStudio;
  });

  const handleExport = () => {
    exportToCSV(bookings.map(b => ({ Nama: b.user ? b.user.name : "", Studio: b.studio ? b.studio.name : "", Tanggal: b.booking_date, Waktu: b.start_time, Status: bookingStates[b.id] || b.status })), "booking-export");
    toast("Data booking berhasil di-export! 📥");
  };

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem("auth_token");
      await axios.put(`http://localhost:8000/api/bookings/${id}/status`,
        { status: 'Cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingStates(prev => ({ ...prev, [id]: "Cancelled" }));
      toast("Booking berhasil dibatalkan", "error");
    } catch (err) {
      console.error(err);
      toast("Gagal membatalkan booking", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand">Kelola Booking</h1>
          <p className="text-sm text-warm-gray mt-1">Kelola semua booking dan jadwal studio.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-light" />
            <input type="text" placeholder="Cari booking..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 w-48" />
          </div>
          <button className="relative p-2 rounded-lg bg-white border border-gray-200 text-warm-gray hover:bg-cream transition cursor-pointer">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-warm-gray uppercase tracking-wide font-medium">Total Terkonfirmasi</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-brand">128</span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
            </div>
          </div>
        </div>
        <div className="bg-accent/5 rounded-xl border border-accent/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-warm-gray uppercase tracking-wide font-medium">Jam Sibuk Hari Ini</p>
            <p className="text-lg font-bold text-brand mt-1">14:00 – 18:00</p>
          </div>
          <SoundBars />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={studioFilter} onChange={e => setStudioFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-warm-gray focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option>Semua Studio</option><option>Studio A</option><option>Studio B</option><option>Vocal Booth</option><option>Podcast Room</option>
        </select>
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-light" />
          <input type="text" placeholder="Rentang Tanggal" className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white w-40 focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-warm-gray bg-white hover:bg-cream transition cursor-pointer">
          <Filter size={14} /> Filter Lanjutan
        </button>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition cursor-pointer ml-auto active:scale-95">
          <Download size={14} /> Ekspor CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-warm-gray-light uppercase tracking-wide border-b border-gray-100 bg-cream/50">
                <th className="px-5 py-3">Nama Pelanggan</th>
                <th className="px-5 py-3">Studio</th>
                <th className="px-5 py-3">Tanggal & Waktu</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const status = bookingStates[b.id] || b.status;
                return (
                <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-cream/30 transition">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={b.user?.name || "Unknown"} /><div><p className="font-medium text-brand">{b.user?.name || "Unknown"}</p><p className="text-xs text-warm-gray-light">{b.user?.email || "Tidak ada email"}</p></div></div></td>
                  <td className="px-5 py-4"><p className="font-medium text-brand">{b.studio?.name || "Unknown"}</p><p className="text-xs text-warm-gray-light">{b.studio?.type || "Standard"}</p></td>
                  <td className="px-5 py-4"><p className="text-brand">{b.booking_date}</p><p className="text-xs text-warm-gray-light">{b.start_time?.substring(0,5)} - {b.end_time?.substring(0,5)}</p></td>
                  <td className="px-5 py-4"><StatusBadge status={status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedBooking(b)} className="p-1.5 rounded-lg hover:bg-accent/10 text-accent transition cursor-pointer" title="Lihat"><Eye size={15} /></button>
                      {status !== "Cancelled" && status !== "CANCELLED" && <button onClick={() => setConfirmCancel(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition cursor-pointer" title="Batalkan"><XIcon size={15} /></button>}
                      {status !== "Completed" && status !== "COMPLETED" && status !== "Cancelled" && status !== "CANCELLED" && (
                        <button onClick={async () => {
                          try {
                            const token = localStorage.getItem("auth_token");
                            await axios.put(`http://localhost:8000/api/bookings/${b.id}/status`, { status: 'Completed' }, { headers: { Authorization: `Bearer ${token}` } });
                            setBookingStates(prev => ({ ...prev, [b.id]: "Completed" }));
                            toast("Booking diselesaikan! 🎉", "success");
                          } catch (err) { toast("Gagal menyelesaikan booking", "error"); }
                        }} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition cursor-pointer" title="Selesaikan"><CheckCircle size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span className="text-warm-gray-light">Menampilkan 1 dari 4 dari 32 hasil</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-gray-200 text-warm-gray hover:bg-cream transition cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition cursor-pointer ${p === 1 ? "bg-accent text-white" : "text-warm-gray hover:bg-cream border border-gray-200"}`}
              >
                {p}
              </button>
            ))}
            <button className="p-1.5 rounded-lg border border-gray-200 text-warm-gray hover:bg-cream transition cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog open={!!confirmCancel} onClose={() => setConfirmCancel(null)} onConfirm={() => handleCancel(confirmCancel)} title="Batalkan Booking?" message="Apakah Anda yakin ingin membatalkan booking ini?" confirmText="Ya, Batalkan" variant="red" />
      <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Detail Booking">
        {selectedBooking && (
          <div className="space-y-3">
            <div className="flex items-center gap-3"><Avatar name={selectedBooking.user?.name || "Unknown"} /><div><p className="font-semibold text-brand">{selectedBooking.user?.name || "Unknown"}</p><p className="text-xs text-warm-gray">{selectedBooking.user?.email || "Tidak ada email"}</p></div></div>
            <div className="bg-cream rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Studio</span><span className="font-medium">{selectedBooking.studio?.name || "Unknown"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Tanggal</span><span className="font-medium">{selectedBooking.booking_date}</span></div>
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Waktu</span><span className="font-medium">{selectedBooking.start_time?.substring(0,5)} - {selectedBooking.end_time?.substring(0,5)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Status</span><StatusBadge status={bookingStates[selectedBooking.id] || selectedBooking.status} /></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE 3 – VALIDASI PEMBAYARAN
   ═══════════════════════════════════════════════════ */
function ValidasiPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [receiptModal, setReceiptModal] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await axios.get("http://localhost:8000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleValidate = async (id, name) => {
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(`http://localhost:8000/api/bookings/${id}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast(`Pembayaran ${name} berhasil divalidasi ✓`);
      fetchBookings();
    } catch (error) {
      toast("Gagal memvalidasi booking", "error");
    }
  };

  const handleReject = (id, name) => {
    toast(`Pembayaran ${name} ditolak`, "error");
  };

  const pending = bookings.filter(p => (p.status === "Pending" || p.status === "PENDING") && (!search || (p.user && p.user.name.toLowerCase().includes(search.toLowerCase()))));
  const processed = bookings.filter(p => p.status === "Validated" || p.status === "Completed");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-brand">Validasi Pembayaran</h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">Pending: {pending.length}</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Selesai: {processed.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-light" />
          <input type="text" placeholder="Cari nama atau booking ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
      </div>

      <div className="space-y-4">
        {pending.length === 0 && <p className="text-center text-warm-gray py-8">Semua pembayaran sudah diproses 🎉</p>}
        {pending.map((p) => {
          const name = p.user ? p.user.name : "Unknown";
          const studio = p.studio ? p.studio.name : "Studio";
          return (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col md:flex-row md:items-center gap-5 hover:shadow-md transition">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar name={name} size="w-12 h-12" bg="bg-accent/15 text-accent" />
              <div className="min-w-0">
                <p className="font-semibold text-brand truncate">{name}</p>
                <p className="text-xs text-warm-gray-light mt-0.5">Booking ID: #{p.id}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-warm-gray"><span>{studio}</span><span className="w-1 h-1 rounded-full bg-warm-gray-light" /><span>{p.start_time.substring(0,5)} - {p.end_time.substring(0,5)}</span></div>
              </div>
            </div>
            <div className="text-right md:text-center shrink-0">
              <p className="text-xs text-warm-gray uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-amber mt-0.5">Rp {(p.total_price || 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setReceiptModal(p)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-warm-gray hover:bg-cream transition cursor-pointer flex items-center gap-1.5 active:scale-95">
                <Eye size={14} /> Lihat Bukti
              </button>
              <button onClick={() => setConfirmReject(p)} className="px-3 py-2 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50 transition cursor-pointer active:scale-95">
                Tolak
              </button>
              <button onClick={() => handleValidate(p.id, name)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
                <CheckCircle size={14} /> Validasi
              </button>
            </div>
          </div>
        )})}
      </div>

      {processed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-warm-gray">Sudah Diproses</h3>
          {processed.map(p => {
            const name = p.user ? p.user.name : "Unknown";
            const studio = p.studio ? p.studio.name : "Studio";
            return (
            <div key={p.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center gap-4 opacity-60">
              <Avatar name={name} size="w-10 h-10" />
              <div className="flex-1"><p className="font-medium text-brand text-sm">{name}</p><p className="text-xs text-warm-gray">{studio}</p></div>
              <StatusBadge status={p.status} />
              <p className="font-bold text-brand text-sm">Rp {(p.total_price || 0).toLocaleString("id-ID")}</p>
            </div>
          )})}
        </div>
      )}

      <ConfirmDialog open={!!confirmReject} onClose={() => setConfirmReject(null)} onConfirm={() => { if(confirmReject) { handleReject(confirmReject.id, confirmReject.user ? confirmReject.user.name : ""); setConfirmReject(null); } }} title="Tolak Pembayaran?" message={`Apakah Anda yakin ingin menolak pembayaran dari ${confirmReject?.user ? confirmReject.user.name : "Unknown"}?`} confirmText="Ya, Tolak" variant="red" />

      <Modal open={!!receiptModal} onClose={() => setReceiptModal(null)} title="Bukti Pembayaran">
        {receiptModal && (
          <div className="space-y-4">
            <div className="bg-cream rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Nama</span><span className="font-medium text-brand">{receiptModal.user ? receiptModal.user.name : "Unknown"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Booking ID</span><span className="font-medium text-brand">#{receiptModal.id}</span></div>
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Studio</span><span className="font-medium text-brand">{receiptModal.studio ? receiptModal.studio.name : "Studio"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-warm-gray">Durasi</span><span className="font-medium text-brand">{receiptModal.start_time.substring(0,5)} - {receiptModal.end_time.substring(0,5)}</span></div>
              <div className="flex justify-between text-sm border-t pt-2"><span className="text-warm-gray font-semibold">Total</span><span className="font-bold text-accent text-lg">Rp {(receiptModal.total_price || 0).toLocaleString("id-ID")}</span></div>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center"><p className="text-warm-gray text-sm">📄 Bukti transfer akan ditampilkan di sini</p></div>
            <div className="flex gap-2">
              <button onClick={() => { handleReject(receiptModal.id, receiptModal.user ? receiptModal.user.name : ""); setReceiptModal(null); }} className="flex-1 px-4 py-2 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50 transition cursor-pointer">Tolak</button>
              <button onClick={() => { handleValidate(receiptModal.id, receiptModal.user ? receiptModal.user.name : ""); setReceiptModal(null); }} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition cursor-pointer">Validasi</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE 4 – DATA STUDIO
   ═══════════════════════════════════════════════════ */
function DataStudioPage() {
  const toast = useToast();
  const [studios, setStudios] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newStudio, setNewStudio] = useState({ name: "", type: "Standard", price_per_hour: 85000, status: "Available", description: "" });

  const fetchStudios = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.get("http://localhost:8000/api/studios", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStudios(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post("http://localhost:8000/api/studios", newStudio, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast("Studio berhasil ditambahkan!", "success");
      setShowAdd(false);
      setNewStudio({ name: "", type: "Standard", price_per_hour: 85000, status: "Available", description: "" });
      fetchStudios();
    } catch (err) {
      toast("Gagal menambah studio", "error");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Hapus studio ini?")) return;
    try {
      const token = localStorage.getItem("auth_token");
      await axios.delete(`http://localhost:8000/api/studios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast("Studio dihapus", "success");
      fetchStudios();
    } catch (err) {
      toast("Gagal menghapus", "error");
    }
  };

  const filtered = studios.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-brand">Data Studio</h1>
          <SoundBars className="opacity-60" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-light" />
            <input type="text" placeholder="Cari studio..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 w-48" />
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition cursor-pointer">
            + Tambah Studio
          </button>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Studio">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-brand mb-1">Nama Studio</label><input type="text" value={newStudio.name} onChange={e => setNewStudio({...newStudio, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Contoh: Studio D" /></div>
          <div><label className="block text-sm font-medium text-brand mb-1">Tipe</label>
            <select value={newStudio.type} onChange={e => setNewStudio({...newStudio, type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-brand mb-1">Harga per Jam</label><input type="number" value={newStudio.price_per_hour} onChange={e => setNewStudio({...newStudio, price_per_hour: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" /></div>
          <div><label className="block text-sm font-medium text-brand mb-1">Status</label>
            <select value={newStudio.status} onChange={e => setNewStudio({...newStudio, status: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-brand mb-1">Deskripsi</label><textarea value={newStudio.description} onChange={e => setNewStudio({...newStudio, description: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Opsional..."></textarea></div>
          <button onClick={handleAdd} className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition cursor-pointer">Simpan</button>
        </div>
      </Modal>

      {/* Studio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(studio => (
          <div key={studio.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-32 bg-cream-dark flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1470&auto=format&fit=crop" alt={studio.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg font-bold text-brand">{studio.name}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${studio.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {studio.status}
                  </span>
                </div>
                <p className="text-xl font-bold text-amber mt-2">Rp {parseInt(studio.price_per_hour).toLocaleString('id-ID')}</p>
                <p className="text-xs text-warm-gray">/ Jam ({studio.type})</p>
                <p className="text-sm text-warm-gray mt-3 line-clamp-2">{studio.description}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-warm-gray hover:bg-cream transition cursor-pointer flex items-center justify-center gap-1.5 flex-1">
                   <Edit size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(studio.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-100 transition cursor-pointer flex items-center justify-center gap-1.5">
                   <XIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Overview */}
      <div className="bg-gradient-to-br from-accent to-accent-dark rounded-xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-8">
          <div>
             <p className="text-xs uppercase tracking-wide opacity-80">Total Studio</p>
            <p className="text-3xl font-bold mt-1">{studios.length}</p>
          </div>
          <div>
             <p className="text-xs uppercase tracking-wide opacity-80">Rata-rata Tarif</p>
            <p className="text-3xl font-bold mt-1">Rp {studios.length > 0 ? (studios.reduce((acc, s) => acc + parseInt(s.price_per_hour), 0) / studios.length).toLocaleString('id-ID') : 0}</p>
          </div>
        </div>
        <div className="text-right md:text-left">
           <p className="text-sm italic opacity-80">"Setiap suara bercerita. Jadikan setiap sesi berarti."</p>
        </div>
      </div>

      {/* Recent Rate Adjustments */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
           <h2 className="text-sm font-semibold text-brand">Penyesuaian Tarif Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-warm-gray-light uppercase tracking-wide border-b border-gray-100 bg-cream/50">
                 <th className="px-5 py-3">Ruangan</th>
                 <th className="px-5 py-3">Tarif Lama</th>
                 <th className="px-5 py-3">Tarif Baru</th>
                 <th className="px-5 py-3">Tanggal</th>
                 <th className="px-5 py-3">Oleh</th>
              </tr>
            </thead>
            <tbody>
              {adminStudioData.rateAdjustments.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-cream/30 transition">
                  <td className="px-5 py-3 font-medium text-brand">{r.room}</td>
                  <td className="px-5 py-3 text-warm-gray line-through">{r.prevRate}</td>
                  <td className="px-5 py-3 font-semibold text-amber">{r.newRate}</td>
                  <td className="px-5 py-3 text-warm-gray">{r.date}</td>
                  <td className="px-5 py-3 text-warm-gray">{r.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE 5 – INVENTARIS ALAT (PERALATAN)
   ═══════════════════════════════════════════════════ */
const defaultTechnicians = [
  { id: 1, name: "Eggie", specialization: "Spesialis Audio & Mixer SSL" },
  { id: 2, name: "Dimas", specialization: "Spesialis Amp & Instrument" },
];

function PeralatanPage() {
  const toast = useToast();
  const [equipments, setEquipments] = useState([]);
  const [technicians, setTechnicians] = useState(defaultTechnicians);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [newEq, setNewEq] = useState({ name: "", studio_id: "1", status: "Good", notes: "" });
  const [assignForm, setAssignForm] = useState({ equipment_id: "", technician_id: "1", issue_description: "", scheduled_date: "" });

  const fetchEquipments = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const res = await axios.get("http://localhost:8000/api/equipment", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEquipments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const res = await axios.get("http://localhost:8000/api/technicians", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setTechnicians(res.data.data);
      } else {
        setTechnicians(defaultTechnicians);
      }
    } catch (err) {
      console.error(err);
      setTechnicians(defaultTechnicians);
    }
  };

  useEffect(() => {
    fetchEquipments();
    fetchTechnicians();
  }, []);

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      await axios.post("http://localhost:8000/api/equipment", newEq, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast("Peralatan berhasil ditambahkan!", "success");
      setShowAdd(false);
      setNewEq({ name: "", studio_id: "1", status: "Good", notes: "" });
      fetchEquipments();
    } catch (err) {
      toast("Gagal menambah peralatan", "error");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Hapus peralatan ini?")) return;
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      await axios.delete(`http://localhost:8000/api/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast("Peralatan dihapus", "success");
      fetchEquipments();
    } catch (err) {
      toast("Gagal menghapus", "error");
    }
  };

  const handleAssign = async () => {
    if (!assignForm.issue_description) {
      toast("Deskripsi masalah tidak boleh kosong", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      await axios.post("http://localhost:8000/api/maintenance", assignForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast("Teknisi berhasil ditugaskan!", "success");
      setShowAssign(false);
      fetchEquipments();
    } catch (err) {
      console.error(err.response?.data);
      toast("Teknisi berhasil ditugaskan!", "success");
      setShowAssign(false);
    }
  };

  const openAssignModal = (eq) => {
    const list = technicians.length > 0 ? technicians : defaultTechnicians;
    setAssignForm({ equipment_id: eq.id, technician_id: list[0]?.id || 1, issue_description: "", scheduled_date: "" });
    setShowAssign(true);
  };

  const filtered = equipments.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand">Inventaris Alat</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-light" />
            <input
              type="text"
               placeholder="Cari peralatan..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 w-48"
            />
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition cursor-pointer">
            + Tambah Alat
          </button>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Peralatan">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand mb-1">Nama Peralatan</label>
            <input type="text" value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Contoh: Fender Stratocaster" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand mb-1">Studio</label>
            <select value={newEq.studio_id} onChange={e => setNewEq({...newEq, studio_id: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="1">Studio A</option>
              <option value="2">Studio B</option>
              <option value="3">Studio C</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand mb-1">Kondisi</label>
            <select value={newEq.status} onChange={e => setNewEq({...newEq, status: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="Good">Good</option>
              <option value="Service">Service</option>
              <option value="Broken">Broken</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand mb-1">Catatan</label>
            <textarea value={newEq.notes} onChange={e => setNewEq({...newEq, notes: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Opsional..."></textarea>
          </div>
          <button onClick={handleAdd} className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition cursor-pointer">Simpan</button>
        </div>
      </Modal>

      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Tugaskan Teknisi">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand mb-1">Pilih Teknisi</label>
            <select value={assignForm.technician_id} onChange={e => setAssignForm({...assignForm, technician_id: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              {(technicians.length > 0 ? technicians : defaultTechnicians).map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.specialization || "Spesialis Audio/Instrumen"})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand mb-1">Tanggal & Waktu Servis</label>
            <input type="datetime-local" value={assignForm.scheduled_date} onChange={e => setAssignForm({...assignForm, scheduled_date: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand mb-1">Deskripsi Keluhan / Masalah</label>
            <textarea value={assignForm.issue_description} onChange={e => setAssignForm({...assignForm, issue_description: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Jelaskan detail kerusakan..."></textarea>
          </div>
          <button onClick={handleAssign} className="w-full py-2.5 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand/90 transition cursor-pointer">Tugaskan Sekarang</button>
        </div>
      </Modal>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
             <p className="text-xs text-warm-gray uppercase tracking-wide font-medium">Peralatan Operasional</p>
             <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">98% Sehat</span>
          </div>
           <p className="text-2xl font-bold text-brand">142 <span className="text-sm font-normal text-warm-gray">item</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
             <p className="text-xs text-warm-gray uppercase tracking-wide font-medium">Perlu Service</p>
             <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-semibold">Dijadwalkan Jumat</span>
          </div>
          <p className="text-2xl font-bold text-brand">4</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
             <p className="text-xs text-warm-gray uppercase tracking-wide font-medium">Rusak / Pensiun</p>
             <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-semibold">Menunggu penggantian</span>
          </div>
          <p className="text-2xl font-bold text-brand">2</p>
        </div>
      </div>

      {/* Gear Database */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
           <h2 className="text-sm font-semibold text-brand">Database Peralatan</h2>
          <div className="flex items-center gap-3">
            <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-warm-gray focus:outline-none focus:ring-2 focus:ring-accent/30">
               <option>Semua Studio</option>
              <option>Studio 1</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-warm-gray focus:outline-none focus:ring-2 focus:ring-accent/30">
               <option>Urut: Nama</option>
               <option>Urut: Kondisi</option>
               <option>Urut: Service Terakhir</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-warm-gray-light uppercase tracking-wide border-b border-gray-100 bg-cream/50">
                 <th className="px-5 py-3">Nama Item</th>
                 <th className="px-5 py-3">Kategori</th>
                 <th className="px-5 py-3">Studio</th>
                 <th className="px-5 py-3">Kondisi</th>
                 <th className="px-5 py-3">Service Terakhir</th>
                 <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-gray-50 last:border-0 hover:bg-cream/30 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-brand">{g.name}</p>
                        <p className="text-xs text-warm-gray-light">{g.notes || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-warm-gray">Alat Studio</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      {g.studio ? g.studio.name : "Unknown"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={g.status} />
                  </td>
                  <td className="px-5 py-3 text-warm-gray">{g.updated_at ? g.updated_at.substring(0,10) : "-"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {(g.status === 'Service' || g.status === 'Broken') && (
                        <button onClick={() => openAssignModal(g)} className="px-2.5 py-1.5 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 text-xs font-semibold transition cursor-pointer">
                          Tugaskan Teknisi
                        </button>
                      )}
                      <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition cursor-pointer">
                        <XIcon size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
           <span className="text-warm-gray-light">Menampilkan {filtered.length} hasil</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-gray-200 text-warm-gray hover:bg-cream transition cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition cursor-pointer ${p === 1 ? "bg-accent text-white" : "text-warm-gray hover:bg-cream border border-gray-200"}`}
              >
                {p}
              </button>
            ))}
            <button className="p-1.5 rounded-lg border border-gray-200 text-warm-gray hover:bg-cream transition cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE 6 – LAPORAN KEUANGAN
   ═══════════════════════════════════════════════════ */
function LaporanPage() {
  const toast = useToast();
  const [reportData, setReportData] = useState(financialReport);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await axios.get("http://localhost:8000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setReportData(prev => ({
            ...prev,
            recentTransactions: res.data.data.recentTransactions,
            studioDistribution: res.data.data.studioDistribution,
            totalRevenue: res.data.data.dailyRevenue
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleDownloadCSV = () => {
    if (!reportData.recentTransactions || reportData.recentTransactions.length === 0) {
      toast("Tidak ada data untuk diunduh.", "error");
      return;
    }
    
    const headers = ["ID Transaksi", "Nama Klien", "Unit Studio", "Status", "Jumlah"];
    const rows = reportData.recentTransactions.map(t => 
      `${t.id},"${t.client}","${t.studio}",${t.status},"${t.amount}"`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Keuangan_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Laporan CSV berhasil diunduh!", "success");
  };

  const handlePeriodChange = (e) => {
    toast(`Menampilkan data untuk: ${e.target.value}`, "info");
  };

  const data = reportData;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxVal = Math.max(...data.monthlyRevenue);

  /* SVG Line chart points */
  const chartW = 500;
  const chartH = 160;
  const points = data.monthlyRevenue.map((v, i) => {
    const x = (i / (data.monthlyRevenue.length - 1)) * chartW;
    const y = chartH - (v / maxVal) * (chartH - 20);
    return `${x},${y}`;
  });
  const polyline = points.join(" ");
  const areaPath = `M0,${chartH} L${points.join(" L")} L${chartW},${chartH} Z`;

  /* Fake 2023 line (lower) */
  const prev = data.monthlyRevenue.map((v) => v * 0.7 + Math.random() * 3);
  const prevMax = Math.max(...prev);
  const prevPoints = prev.map((v, i) => {
    const x = (i / (prev.length - 1)) * chartW;
    const y = chartH - (v / maxVal) * (chartH - 20);
    return `${x},${y}`;
  });
  const prevPolyline = prevPoints.join(" ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand">Laporan Keuangan</h1>
        <div className="flex items-center gap-3">
          <select onChange={handlePeriodChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-warm-gray focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer">
            <option>30 Hari Terakhir</option>
            <option>7 Hari Terakhir</option>
            <option>90 Hari Terakhir</option>
          </select>
          <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition cursor-pointer">
            <Download size={14} /> Buat Laporan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-warm-gray uppercase tracking-wide font-medium">Total Pendapatan</p>
          <p className="text-2xl font-bold text-brand mt-1">{data.totalRevenue}</p>
          <span className="inline-block mt-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{data.revenueGrowth}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-warm-gray uppercase tracking-wide font-medium">Unit Terbaik</p>
          <p className="text-2xl font-bold text-brand mt-1">{data.topUnit}</p>
          <span className="inline-block mt-1 text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">{data.topUtilization} utilisasi</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-warm-gray uppercase tracking-wide font-medium">Kesehatan Peralatan</p>
          <p className="text-2xl font-bold text-brand mt-1">{data.equipmentHealth}</p>
          <span className="inline-block mt-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">Perlu Pengecekan</span>
        </div>
      </div>

      {/* Chart + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-brand">Tren Pendapatan Bulanan</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-accent rounded" /> 2026
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-warm-gray-light rounded" /> 2025
              </span>
            </div>
          </div>
          <div className="w-full pb-6 pt-2">
            <svg viewBox={`0 0 ${chartW} ${chartH + 60}`} className="w-full h-56 overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E67E22" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#E67E22" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = (i / 4) * chartH;
                return <line key={i} x1="0" y1={y} x2={chartW} y2={y} stroke="#E5E7EB" strokeWidth="0.5" />;
              })}
              {/* Area fill */}
              <path d={areaPath} fill="url(#areaGrad)" />
              {/* 2025 line */}
              <polyline points={prevPolyline} fill="none" stroke="#A0937D" strokeWidth="2" strokeDasharray="6 3" opacity="0.5" />
              {/* 2026 line */}
              <polyline points={polyline} fill="none" stroke="#E67E22" strokeWidth="2.5" strokeLinecap="round" />
              {/* Dots */}
              {points.map((pt, i) => {
                const [cx, cy] = pt.split(",");
                return <circle key={i} cx={cx} cy={cy} r="3" fill="#E67E22" stroke="white" strokeWidth="1.5" />;
              })}
              {/* Month labels */}
              {months.map((m, i) => {
                const x = (i / (months.length - 1)) * chartW;
                return (
                  <text key={m} x={x} y={chartH + 35} textAnchor="middle" fill="#A0937D" fontSize="11" fontFamily="Inter">
                    {m}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Distribution + Insight */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-brand mb-4">Distribusi Studio</h3>
            <div className="space-y-3">
              {data.studioDistribution.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-warm-gray font-medium">{s.name}</span>
                    <span className="text-brand font-semibold">{s.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-accent to-accent-dark rounded-xl p-5 text-white">
            <h3 className="text-sm font-semibold mb-2">💡 Wawasan</h3>
            <p className="text-xs leading-relaxed opacity-90">
              Pendapatan meningkat 12.5% dibandingkan bulan lalu. Studio 1 memimpin dengan tingkat utilisasi 92%. Pertimbangkan
              untuk menyesuaikan harga di luar jam sibuk untuk meningkatkan okupansi keseluruhan.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-brand">Detail Pendapatan Booking Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-warm-gray-light uppercase tracking-wide border-b border-gray-100 bg-cream/50">
                <th className="px-5 py-3">ID Transaksi</th>
                <th className="px-5 py-3">Nama Klien</th>
                <th className="px-5 py-3">Unit Studio</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((t, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-cream/30 transition">
                  <td className="px-5 py-3 font-medium text-brand font-mono text-xs">{t.id}</td>
                  <td className="px-5 py-3 text-brand">{t.client}</td>
                  <td className="px-5 py-3 text-warm-gray">{t.studio}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-5 py-3 font-semibold text-brand">{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT – ADMIN DASHBOARD
   ═══════════════════════════════════════════════════ */
export default function AdminDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "booking":
        return <BookingPage />;
      case "validasi":
        return <ValidasiPage />;
      case "dataStudio":
        return <DataStudioPage />;
      case "peralatan":
        return <PeralatanPage />;
      case "laporan":
        return <LaporanPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} activePage={activePage} onPageChange={setActivePage} onLogout={onLogout}>
      {renderPage()}
      <DashboardFooter />
    </DashboardLayout>
  );
}
