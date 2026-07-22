import { useState, useEffect } from "react";
import { Search, Bell, Calendar, Eye, MoreVertical, CheckCircle, Send, Wrench as WrenchIcon, Clock, ShieldCheck, BarChart3, Building2, LayoutDashboard, CalendarCheck, Download } from "lucide-react";
import DashboardLayout from "../dashboard/DashboardLayout";
import { kasirData } from "../../data/teknisiData";
import api from "../../utils/axiosConfig";
import { useToast } from "../shared/UIHelpers";
import StudioLiveTimeline from "../shared/StudioLiveTimeline";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { key: "booking", label: "Booking", icon: "CalendarCheck" },
  { key: "validasi", label: "Validasi Pembayaran", icon: "ShieldCheck" },
  { key: "dataStudio", label: "Data Studio", icon: "Building2" },
  { key: "peralatan", label: "Peralatan", icon: "Wrench" },
  { key: "laporan", label: "Laporan", icon: "BarChart3" },
];

const statusColor = {
  Pending: "bg-orange-100 text-orange-700",
  PENDING: "bg-orange-100 text-orange-700",
  Validated: "bg-green-100 text-green-700",
  VALIDATED: "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  Done: "bg-gray-100 text-gray-500",
  GOOD: "bg-green-100 text-green-700",
  SERVICE: "bg-orange-100 text-orange-700",
};

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

export default function KasirDashboard({ onLogout, user }) {
  const toast = useToast();
  const [activePage, setActivePage] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({});
  const [equipments, setEquipments] = useState([]);
  const [selectedBookingAction, setSelectedBookingAction] = useState(null);
  const [reportPeriod, setReportPeriod] = useState("Laporan Harian (Hari Ini)");
  const [reportChecks, setReportChecks] = useState({ "Pendapatan & Penjualan": true, "Status Peralatan": true, "Catatan Pelanggan": false });
  const { studioLive } = kasirData;

  const toggleCheck = (key) => setReportChecks((p) => ({ ...p, [key]: !p[key] }));

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data booking", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data?.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil stats kasir", err);
    }
  };

  const fetchEquipments = async () => {
    try {
      const res = await api.get('/equipment');
      if (res.data?.success) {
        setEquipments(res.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data peralatan", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchStats();
    fetchEquipments();
  }, []);

  const handleValidate = async (id) => {
    try {
      await api.post(`/bookings/${id}/validate`);
      toast("Booking berhasil divalidasi ✓", "success");
      fetchBookings();
      fetchStats();
    } catch (err) {
      console.error("Gagal memvalidasi booking", err);
      toast("Gagal memvalidasi booking", "error");
    }
  };

  const handleSendReport = () => {
    const selected = Object.entries(reportChecks).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) {
      toast("Pilih minimal satu konten laporan", "error");
      return;
    }
    
    const existingReports = JSON.parse(localStorage.getItem("generated_reports") || "[]");
    const kasirName = user?.name ? `Kasir ${user.name}` : "Kasir Vincent";
    const newReport = {
      id: Date.now(),
      title: `Laporan Kasir (${reportPeriod})`,
      submitter: kasirName,
      time: "Baru saja",
      type: "COCOK",
      icon: "📊",
      contents: selected
    };
    localStorage.setItem("generated_reports", JSON.stringify([newReport, ...existingReports]));
    window.dispatchEvent(new Event("storage"));

    toast(`Laporan (${reportPeriod}) berhasil dikirim ke Pemilik! 📊`, "success");
  };

  /* ════════════ PAGE: DASHBOARD (HOME POS) ════════════ */
  const PageDashboard = () => (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-brown">Dashboard Kasir</h1>
          <p className="text-warm-gray text-sm mt-1">Selamat datang kembali, {user?.name || 'Vincent Kasir'}. Berikut aktivitas kasir hari ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm text-warm-gray bg-white">
            <Calendar size={14} /> 2026-10-14
          </span>
          <div className="w-9 h-9 rounded-full bg-amber-200 border-2 border-white shadow flex items-center justify-center font-bold text-amber-800 text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: "📋", label: "Total Booking Hari Ini", value: statsData.totalBookingToday || "24 Sesi" },
          { icon: "💰", label: "Pendapatan Harian", value: statsData.dailyRevenue || "Rp 4.2M" },
          { icon: "🏢", label: "Studio Aktif", value: statsData.activeStudios || "3/4 Studio", amber: true },
          { icon: "🔔", label: "Menunggu Validasi", value: statsData.pendingValidation || bookings.filter(b => b.status === "Pending").length },
        ].map((s, i) => (
          <div key={i} className={`border rounded-xl p-4 ${s.amber ? "bg-amber-50 border-amber-200" : "bg-white"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-warm-gray uppercase tracking-wide font-medium">{s.label}</span>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-dark-brown">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Live Studio Timeline Matrix */}
      <div className="mb-6">
        <StudioLiveTimeline />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 border rounded-xl bg-white overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-bold text-dark-brown">Booking Terbaru</h2>
            <button onClick={() => setActivePage("booking")} className="text-accent text-sm font-medium hover:underline cursor-pointer">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-cream/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-warm-gray uppercase">Nama Pelanggan</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Studio</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Tanggal & Waktu</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Status</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-warm-gray">Memuat data booking...</td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-warm-gray">Belum ada booking aktif.</td>
                  </tr>
                ) : (
                  bookings.slice(0, 5).map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-cream/30">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {b.user?.name ? b.user.name.charAt(0).toUpperCase() : "P"}
                        </div>
                        <span className="font-medium text-dark-brown">{b.user?.name || b.customer_name || "Pelanggan"}</span>
                      </td>
                      <td className="px-3 py-3 text-warm-gray">{b.studio?.name || `Studio ${b.studio_id || 1}`}</td>
                      <td className="px-3 py-3">
                        <span className="text-dark-brown font-medium">{b.booking_date}</span>
                        <br />
                        <span className="text-xs text-warm-gray">{b.start_time} - {b.end_time}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[b.status] || "bg-gray-100 text-gray-700"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {b.status === "Pending" ? (
                          <button 
                            onClick={() => handleValidate(b.id)}
                            className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent-dark transition cursor-pointer"
                          >
                            Validasi
                          </button>
                        ) : (
                          <button 
                            onClick={() => setSelectedBookingAction(b)} 
                            className="text-warm-gray hover:text-dark-brown cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition"
                            title="Menu Aksi Booking"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Report Generator */}
          <div className="border rounded-xl bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-accent">✨</span>
              <h3 className="font-bold text-dark-brown">Generator Laporan Kasir</h3>
            </div>
            <label className="text-xs font-medium text-warm-gray block mb-1">Pilih Periode</label>
            <select 
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option>Laporan Harian (Hari Ini)</option>
              <option>Mingguan</option>
              <option>Bulanan</option>
            </select>
            <p className="text-xs font-medium text-warm-gray mb-2">Konten Laporan</p>
            <div className="space-y-2 mb-4">
              {Object.keys(reportChecks).map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-dark-brown cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={reportChecks[item]} 
                    onChange={() => toggleCheck(item)} 
                    className="accent-accent" 
                  />
                  {item}
                </label>
              ))}
            </div>
            <button 
              onClick={handleSendReport}
              className="w-full bg-accent text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-accent-dark transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send size={14} /> Kirim ke Pemilik
            </button>
          </div>

          {/* Studio Live */}
          <div className="rounded-xl bg-accent text-white p-5 relative overflow-hidden shadow-xs">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full border-4 border-white/10" />
            <h3 className="font-bold text-lg">{studioLive.name}</h3>
            <p className="text-white/70 text-sm mb-2">Sedang Sesi Aktif</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span className="text-sm font-semibold">Latihan Band</span>
            </div>
            <button onClick={() => setActivePage("peralatan")} className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-lg transition cursor-pointer font-medium">
              Kelola Peralatan Studio
            </button>
          </div>
        </div>
      </div>

      {/* Equipment Status Overview */}
      <div className="border rounded-xl bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <WrenchIcon size={18} className="text-accent" />
            <h2 className="font-bold text-dark-brown">Status Peralatan Studio</h2>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Baik</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Perbaikan</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(equipments.length > 0 ? equipments.slice(0, 6) : kasirData.equipmentStatus).map((eq, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition">
              <span className="text-sm font-medium text-dark-brown">{eq.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColor[eq.status] || "bg-gray-100 text-gray-700"}`}>
                {eq.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  /* ════════════ PAGE: BOOKING ════════════ */
  const PageBooking = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-brown">Manajemen Booking Kasir</h1>
          <p className="text-warm-gray text-sm">Kelola seluruh reservasi studio musik.</p>
        </div>
        <button onClick={() => window.location.hash = "#booking"} className="bg-accent text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-accent-dark transition cursor-pointer">
          + Booking Baru
        </button>
      </div>

      <div className="border rounded-xl bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-dark-brown">Daftar Reservasi Aktif</h2>
          <button onClick={fetchBookings} className="text-xs text-accent font-semibold hover:underline cursor-pointer">Refresh Data</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-cream/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-warm-gray uppercase">Pelanggan</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Studio</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Waktu</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Status</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-cream/20">
                <td className="px-5 py-3 font-medium text-dark-brown">{b.user?.name || "Pelanggan"}</td>
                <td className="px-3 py-3 text-warm-gray">{b.studio?.name || `Studio ${b.studio_id || 1}`}</td>
                <td className="px-3 py-3">{b.booking_date} ({b.start_time} - {b.end_time})</td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[b.status] || "bg-gray-100 text-gray-700"}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {b.status === "Pending" ? (
                    <button onClick={() => handleValidate(b.id)} className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-lg">
                      Validasi
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold">Tervalidasi ✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ════════════ PAGE: VALIDASI PEMBAYARAN ════════════ */
  const PageValidasi = () => {
    const pendingBookings = bookings.filter(b => b.status === "Pending");
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-brown">Validasi Pembayaran</h1>
          <p className="text-warm-gray text-sm">Konfirmasi pembayaran kasir & transaksi pelanggan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((b) => (
              <div key={b.id} className="border rounded-2xl p-5 bg-white shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-dark-brown text-base">{b.user?.name || "Pelanggan"}</h3>
                    <p className="text-xs text-warm-gray">ID Transaksi: BK-{b.id}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">Pending</span>
                </div>
                <div className="text-xs space-y-1 text-warm-gray">
                  <p>Studio: <strong className="text-dark-brown">{b.studio?.name || "Studio 1"}</strong></p>
                  <p>Tanggal: <strong className="text-dark-brown">{b.booking_date}</strong> ({b.start_time} - {b.end_time})</p>
                  <p>Total: <strong className="text-accent">Rp {(b.total_price || 75000).toLocaleString('id-ID')}</strong></p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleValidate(b.id)} className="flex-1 bg-accent text-white py-2 rounded-xl text-xs font-bold hover:bg-accent-dark transition">
                    Konfirmasi Lunas ✓
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-8 border rounded-2xl bg-white text-center text-warm-gray">
              <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-dark-brown">Semua Pembayaran Telah Tervalidasi!</p>
              <p className="text-xs mt-1">Tidak ada antrean pembayaran pending saat ini.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ════════════ PAGE: DATA STUDIO ════════════ */
  const PageDataStudio = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Data & Okupansi Studio</h1>
        <p className="text-warm-gray text-sm">Status operasional ruangan studio musik.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((num) => (
          <div key={num} className="border rounded-2xl p-5 bg-white shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-dark-brown">Studio {num}</h3>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">OPERASIONAL</span>
            </div>
            <p className="text-xs text-warm-gray">Spesifikasi: Soundproof, SSL Mixer, Neumann Mics, Studio Monitor Yamaha HS8</p>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-warm-gray">Tarif Sewa:</span>
              <span className="font-bold text-accent">Rp 75.000 / Jam</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ════════════ PAGE: PERALATAN ════════════ */
  const PagePeralatan = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Inventaris Peralatan Studio</h1>
        <p className="text-warm-gray text-sm">Daftar alat musik dan peralatan audio yang tersedia.</p>
      </div>

      <div className="border rounded-2xl bg-white overflow-hidden shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-cream/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-warm-gray uppercase">Nama Alat</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Kategori</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-warm-gray uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {(equipments.length > 0 ? equipments : kasirData.equipmentStatus).map((eq, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-cream/20">
                <td className="px-5 py-3 font-medium text-dark-brown">{eq.name}</td>
                <td className="px-3 py-3 text-warm-gray">{eq.category || "Alat Studio"}</td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[eq.status] || "bg-gray-100 text-gray-700"}`}>
                    {eq.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ════════════ PAGE: LAPORAN ════════════ */
  const PageLaporan = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Laporan Kasir & Penutupan Harian</h1>
        <p className="text-warm-gray text-sm">Buat dan serahkan laporan keuangan/kasir langsung ke Pemilik.</p>
      </div>

      <div className="max-w-xl border rounded-2xl bg-white p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-dark-brown text-lg">Generator Laporan Ke Pemilik</h3>
        <div>
          <label className="text-xs font-medium text-warm-gray block mb-1">Pilih Periode Laporan</label>
          <select 
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="w-full border rounded-xl px-4 py-2.5 text-sm"
          >
            <option>Laporan Harian (Hari Ini)</option>
            <option>Mingguan</option>
            <option>Bulanan</option>
          </select>
        </div>
        <div>
          <p className="text-xs font-medium text-warm-gray mb-2">Pilih Komponen Data yang Dilaporkan</p>
          <div className="space-y-2">
            {Object.keys(reportChecks).map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-dark-brown cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={reportChecks[item]} 
                  onChange={() => toggleCheck(item)} 
                  className="accent-accent" 
                />
                {item}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button 
            onClick={handleSendReport}
            className="w-full bg-accent text-white rounded-xl py-3 text-sm font-bold hover:bg-accent-dark transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Send size={16} /> Kirim ke Dashboard Pemilik
          </button>
          
          <button 
            onClick={() => {
              const headers = "ID_Transaksi,Pelanggan,Studio,Tanggal,Jam_Sesi,Status,Total_Harga\n";
              const rows = bookings.map(b => `${b.id},"${b.customer_name || b.user?.name || 'Pelanggan'}","${b.studio?.name || 'Studio A'}",${b.booking_date},"${b.start_time}-${b.end_time}",${b.status},${b.total_price || 75000}`).join("\n");
              const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
              const link = document.createElement("a");
              link.setAttribute("href", csvContent);
              link.setAttribute("download", `Laporan_Keuangan_Studio_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast("Laporan Keuangan CSV/Excel berhasil diunduh! 📊", "success");
            }}
            className="w-full bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download size={16} /> Unduh CSV / Excel
          </button>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <PageDashboard />;
      case "booking":
        return <PageBooking />;
      case "validasi":
        return <PageValidasi />;
      case "dataStudio":
        return <PageDataStudio />;
      case "peralatan":
        return <PagePeralatan />;
      case "laporan":
        return <PageLaporan />;
      default:
        return <PageDashboard />;
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} activePage={activePage} onPageChange={setActivePage} onLogout={onLogout}>
      {renderPage()}

      {/* Booking Action Modal / Popover */}
      {selectedBookingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedBookingAction(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-dark-brown text-base">Aksi Transaksi #{selectedBookingAction.id}</h3>
                <p className="text-xs text-warm-gray">{selectedBookingAction.user?.name || selectedBookingAction.customer_name || "Pelanggan"}</p>
              </div>
              <button onClick={() => setSelectedBookingAction(null)} className="p-1 text-gray-400 hover:text-dark-brown rounded-lg">✕</button>
            </div>

            <div className="text-xs space-y-2 bg-cream/40 p-3 rounded-xl border border-cream-dark/40">
              <div className="flex justify-between"><span className="text-warm-gray">Studio:</span><span className="font-bold text-dark-brown">{selectedBookingAction.studio?.name || `Studio ${selectedBookingAction.studio_id || 1}`}</span></div>
              <div className="flex justify-between"><span className="text-warm-gray">Tanggal & Waktu:</span><span className="font-bold text-dark-brown">{selectedBookingAction.booking_date} ({selectedBookingAction.start_time} - {selectedBookingAction.end_time})</span></div>
              <div className="flex justify-between"><span className="text-warm-gray">Status Transaksi:</span><span className="font-bold text-emerald-600 uppercase">{selectedBookingAction.status}</span></div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => {
                  const el = document.createElement('a');
                  el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`STRUK KASIR - STUDIO MUSIK LANTAI ATAS\nID: BK-${selectedBookingAction.id}\nPelanggan: ${selectedBookingAction.customer_name || selectedBookingAction.user?.name || "Pelanggan"}\nTanggal: ${selectedBookingAction.booking_date}\nJam: ${selectedBookingAction.start_time} - ${selectedBookingAction.end_time}\nStatus: LUNAS (${selectedBookingAction.status})\nTotal: Rp ${(selectedBookingAction.total_price || 75000).toLocaleString('id-ID')}`));
                  el.setAttribute('download', `Struk_Kasir_BK${selectedBookingAction.id}.txt`);
                  el.click();
                  toast(`Struk transaksi #${selectedBookingAction.id} berhasil dicetak! 🖨️`, "success");
                  setSelectedBookingAction(null);
                }}
                className="w-full bg-accent text-white py-2.5 rounded-xl text-xs font-bold hover:bg-accent-dark transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                🖨️ Cetak Struk POS Kasir
              </button>

              <button 
                onClick={() => {
                  toast(`Tanda bukti dikirim ke email ${selectedBookingAction.customer_email || selectedBookingAction.user?.email || "pelanggan"}`, "info");
                  setSelectedBookingAction(null);
                }}
                className="w-full border border-gray-200 text-warm-gray py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                📧 Kirim Struk Digital (Email)
              </button>
            </div>

            <button onClick={() => setSelectedBookingAction(null)} className="w-full text-center text-xs text-warm-gray hover:text-dark-brown pt-1 cursor-pointer">
              Tutup Menu
            </button>
          </div>
        </div>
      )}

      <DashboardFooter />
    </DashboardLayout>
  );
}
