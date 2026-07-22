import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../shared/UIHelpers";
import DashboardLayout from "../dashboard/DashboardLayout";
import { ownerStats, studioOccupancy, recentReports, dataStudio, laporanUsaha, performaBooking } from "../../data/pemilikData";
import { Download, Calendar, Eye, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, FileText, X, Search, SlidersHorizontal } from "lucide-react";
import InteractiveChart from "./InteractiveChart";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { key: "laporan", label: "Laporan Usaha", icon: "BarChart3" },
  { key: "dataStudio", label: "Data Studio", icon: "Building2" },
  { key: "performa", label: "Performa Booking", icon: "CalendarCheck" },
];

const typeBadge = { COCOK: "bg-green-100 text-green-700", PERBAIKAN: "bg-amber-100 text-amber-700", PENGECUALIAN: "bg-red-100 text-red-600" };

function StatCard({ label, value, change, negative, note, icon }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-xs">
      {icon && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg">{icon}</span>
          {change && <span className={`text-xs font-bold ${negative ? "text-red-500" : "text-green-600"}`}>{change}</span>}
        </div>
      )}
      <p className="text-xs text-warm-gray uppercase tracking-wide mb-1 font-medium">{label}</p>
      <p className="text-xl md:text-2xl font-bold text-dark-brown">{value}</p>
      {!icon && change && <p className={`text-xs mt-1 ${negative ? "text-red-500" : "text-green-600"}`}>📈 {change}</p>}
      {note && <p className="text-xs text-warm-gray mt-1">{note}</p>}
    </div>
  );
}

/* ═══════════ DOWNLOAD NOTIFICATION MODAL ═══════════ */
function DownloadModal({ open, onClose, type }) {
  if (!open) return null;
  const isPDF = type === "pdf";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: isPDF ? "#FEE2E2" : "#DCFCE7" }}>
          {isPDF ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#DC2626"/><text x="12" y="15" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">PDF</text></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#16A34A"/><text x="12" y="15" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">XLSX</text></svg>
          )}
        </div>

        {/* Text */}
        <h3 className="text-lg font-bold text-dark-brown mb-2">
          {isPDF ? "PDF Laporan Usaha Berhasil Diunduh" : "Excel Laporan Usaha Berhasil Diunduh"}
        </h3>
        <p className="text-sm text-warm-gray mb-6">
          {isPDF
            ? "Dokumen PDF ringkasan finansial periode ini telah tersimpan. Silakan periksa folder unduhan perangkat Anda."
            : "Data detail laporan keuangan dalam format .xlsx telah berhasil diunduh."}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full bg-accent text-white rounded-xl py-3 text-sm font-semibold hover:bg-accent-dark transition cursor-pointer"
        >
          Tutup
        </button>
      </div>
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

/* ══════════════ PAGE: Dashboard Owner ══════════════ */
function PageDashboard({ stats = {} }) {
  const toast = useToast();
  const [reports, setReports] = useState(recentReports);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const loadReports = () => {
      const savedReports = JSON.parse(localStorage.getItem("generated_reports") || "[]");
      if (savedReports.length > 0) {
        setReports([...savedReports, ...recentReports]);
      }
    };
    loadReports();

    window.addEventListener("storage", loadReports);
    return () => window.removeEventListener("storage", loadReports);
  }, []);
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-brown">Dashboard Pemilik</h1>
          <p className="text-warm-gray text-sm mt-1">Wawasan tingkat tinggi & pelacakan kinerja studio Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm text-warm-gray bg-white shadow-xs"><Calendar size={14}/>Bulan Ini</span>
          <button onClick={() => {
            const el = document.createElement('a');
            el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('Laporan PDF Dashboard Pemilik 2026'));
            el.setAttribute('download', 'Laporan_Dashboard_2026.pdf');
            el.click();
            toast("Laporan PDF berhasil diunduh!", "success");
          }} className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-accent-dark transition cursor-pointer flex items-center gap-2 shadow-xs"><Download size={14}/>Download Laporan</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="TOTAL PENDAPATAN HARI INI" value={stats.dailyRevenue || ownerStats.totalRevenue} />
        <StatCard label="TOTAL BOOKING HARI INI" value={stats.totalBookingToday || ownerStats.totalBookings} />
        <StatCard label="STUDIO AKTIF" value={stats.activeStudios || ownerStats.activeStudios} note={ownerStats.activeStudiosNote}/>
        <StatCard label="MENUNGGU VALIDASI" value={stats.pendingValidation || 0} />
      </div>

      {/* Chart & Occupancy Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Interactive Animated SVG Revenue Chart */}
        <div className="lg:col-span-2">
          <InteractiveChart />
        </div>

        {/* Studio Occupancy */}
        <div className="border rounded-2xl bg-white p-5 shadow-xs">
          <h2 className="font-bold text-dark-brown mb-4">Okupansi Studio</h2>
          <div className="space-y-4">
            {(stats.studioDistribution || studioOccupancy).map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-warm-gray font-medium">{s.name}</span>
                  <span className="font-bold text-dark-brown">{s.pct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-2 rounded-full bg-accent transition-all duration-500" style={{ width: `${s.pct}%` }}/>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => toast("Membuka statistik terperinci...", "info")} className="text-accent text-xs font-semibold mt-6 hover:underline cursor-pointer flex items-center gap-1">
            Lihat Statistik Terperinci →
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="border rounded-2xl bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="font-bold text-dark-brown">Laporan Terbaru Staf & Kasir</h2>
            <p className="text-xs text-warm-gray">Laporan tervalidasi yang diserahkan oleh staf Admin & Kasir Vincent.</p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded-lg px-3 py-1.5 text-xs bg-white"><option>Semua Tipe</option></select>
          </div>
        </div>
        <div className="divide-y mt-3">
          {reports.length > 0 ? reports.map((r) => (
            <div key={r.id} className="flex items-center gap-4 py-3">
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-lg shrink-0">{r.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-brown truncate">{r.title}</p>
                <p className="text-xs text-warm-gray">Diserahkan oleh: {r.submitter} • {r.time}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${typeBadge[r.type] || "bg-gray-100 text-gray-700"}`}>{r.type}</span>
              <button onClick={() => setSelectedReport(r)} className="text-accent text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap">Lihat Detail</button>
            </div>
          )) : <p className="text-sm text-warm-gray py-4 text-center">Belum ada laporan.</p>}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-cream p-6 text-center relative border-b border-gray-100">
              <button onClick={() => setSelectedReport(null)} className="absolute right-4 top-4 text-warm-gray hover:text-dark-brown p-1 rounded-full hover:bg-gray-200 transition">
                <X size={20} />
              </button>
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-xs flex items-center justify-center text-3xl mb-4 border border-gray-100">
                {selectedReport.icon}
              </div>
              <h3 className="text-xl font-bold text-dark-brown">{selectedReport.title}</h3>
              <span className={`inline-block mt-3 text-[10px] font-bold px-3 py-1 rounded-full uppercase ${typeBadge[selectedReport.type] || "bg-gray-100 text-gray-700"}`}>
                Status: {selectedReport.type}
              </span>
            </div>
            
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between border-b pb-3 border-gray-100">
                <span className="text-warm-gray">Dikirim Oleh</span>
                <span className="font-semibold text-dark-brown flex items-center gap-2">👤 {selectedReport.submitter}</span>
              </div>
              <div className="flex justify-between border-b pb-3 border-gray-100">
                <span className="text-warm-gray">Waktu Validasi</span>
                <span className="font-semibold text-dark-brown">{selectedReport.time}</span>
              </div>
              <div className="flex justify-between pb-2 border-gray-100">
                <span className="text-warm-gray">Keterangan</span>
                <span className="font-semibold text-dark-brown text-right max-w-[200px]">Data operasional telah divalidasi dan tersinkronisasi.</span>
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <button onClick={() => setSelectedReport(null)} className="w-full bg-accent text-white py-2.5 rounded-xl text-xs font-bold hover:bg-accent-dark transition cursor-pointer">
                Tutup Ringkasan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════ PAGE: Laporan Usaha ══════════════ */
function PageLaporan() {
  const toast = useToast();
  const [downloadModalType, setDownloadModalType] = useState(null);

  const listData = laporanUsaha.financialDetails || [
    { period: "Juni 2026", revenue: "Rp 52.100.000", expense: "Rp 14.200.000", profit: "Rp 37.900.000", growth: "+15.4%" },
    { period: "Mei 2026", revenue: "Rp 48.300.000", expense: "Rp 15.500.000", profit: "Rp 32.800.000", growth: "+2.1%" },
    { period: "April 2026", revenue: "Rp 45.200.000", expense: "Rp 13.100.000", profit: "Rp 32.100.000", growth: "-4.2%" },
  ];

  const handleDownloadPDF = () => {
    const csvContent = "Periode,Pendapatan,Biaya,Laba Bersih,Pertumbuhan\n" +
      listData.map(row => `${row.period},${row.revenue},${row.expense},${row.profit},${row.growth}`).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Usaha_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadModalType("pdf");
    toast("Berkas PDF Laporan Usaha 2026 berhasil diunduh!", "success");
  };

  const handleDownloadExcel = () => {
    const csvContent = "Periode,Pendapatan,Biaya,Laba Bersih,Pertumbuhan\n" +
      listData.map(row => `${row.period},${row.revenue},${row.expense},${row.profit},${row.growth}`).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Usaha_2026.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadModalType("excel");
    toast("Berkas Excel Laporan Usaha 2026 berhasil diunduh!", "success");
  };

  return (
    <div className="space-y-6">
      <DownloadModal open={!!downloadModalType} onClose={() => setDownloadModalType(null)} type={downloadModalType} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-brown">Laporan Usaha</h1>
          <p className="text-warm-gray text-sm mt-1">Ringkasan finansial dan performa bisnis tahun 2026.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition cursor-pointer shadow-xs">
            📄 Unduh PDF
          </button>
          <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer shadow-xs">
            📊 Unduh Excel
          </button>
        </div>
      </div>

      <div className="border rounded-2xl bg-white p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-cream/50">
              <th className="text-left p-3 text-xs font-semibold text-warm-gray uppercase">Periode</th>
              <th className="text-left p-3 text-xs font-semibold text-warm-gray uppercase">Pendapatan</th>
              <th className="text-left p-3 text-xs font-semibold text-warm-gray uppercase">Biaya Operasional</th>
              <th className="text-left p-3 text-xs font-semibold text-warm-gray uppercase">Laba Bersih</th>
              <th className="text-left p-3 text-xs font-semibold text-warm-gray uppercase">Pertumbuhan</th>
            </tr>
          </thead>
          <tbody>
            {listData.map((row, idx) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-cream/30">
                <td className="p-3 font-semibold text-dark-brown">{row.period}</td>
                <td className="p-3 font-medium text-emerald-600">{row.revenue}</td>
                <td className="p-3 text-warm-gray">{row.expense}</td>
                <td className="p-3 font-bold text-dark-brown">{row.profit}</td>
                <td className="p-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase">
                    {row.growth}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════ PAGE: Data Studio ══════════════ */
function PageDataStudio() {
  const studios = [
    { id: 1, name: "Studio A (Premium)", description: "Ruangan utama recording & latihan skala konser dengan konsol SSL Origin 32.", price: 150000, status: "Operasional 100%" },
    { id: 2, name: "Studio B (Standard)", description: "Ruang latihan akustik kedap suara tingkat tinggi untuk latihan band reguler.", price: 100000, status: "Operasional 100%" },
    { id: 3, name: "Studio C (Jamming)", description: "Studio akrab ekonomis cocok untuk sesi latihan santai & rehearsal duo/solo.", price: 75000, status: "Operasional 100%" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Data Studio</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {studios.map((s) => (
          <div key={s.id} className="border rounded-2xl bg-white p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-dark-brown text-lg">{s.name}</h3>
            <p className="text-xs text-warm-gray">{s.description}</p>
            <div className="text-xs space-y-1 bg-cream/40 p-3 rounded-xl border border-cream-dark/30">
              <div className="flex justify-between"><span className="text-warm-gray">Tarif/Jam:</span><span className="font-bold text-dark-brown">Rp {s.price.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span className="text-warm-gray">Status:</span><span className="font-bold text-emerald-600">{s.status}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════ PAGE: Performa Booking ══════════════ */
function PagePerforma() {
  const slots = performaBooking.topSlots || [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Performa Booking Studio</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Pendapatan" value={performaBooking.totalRevenue?.value} change={performaBooking.totalRevenue?.change} icon="💰" />
        <StatCard label="Total Reservasi" value={performaBooking.totalBookings?.value} change={performaBooking.totalBookings?.change} icon="📋" />
        <StatCard label="Pelanggan Baru" value={performaBooking.newCustomers?.value} change={performaBooking.newCustomers?.change} icon="👥" />
        <StatCard label="Tingkat Okupansi" value={performaBooking.occupancyRate?.value} change={performaBooking.occupancyRate?.change} icon="📈" />
      </div>

      <div className="border rounded-2xl bg-white p-5 shadow-xs">
        <h2 className="font-bold text-dark-brown text-base mb-4">Jam Sesi Paling Ramai (Top Slots)</h2>
        <div className="space-y-3">
          {slots.map((s) => (
            <div key={s.rank} className="flex items-center justify-between p-3 border rounded-xl bg-cream/20">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center">#{s.rank}</span>
                <div>
                  <p className="font-bold text-dark-brown text-sm">{s.name} ({s.studio})</p>
                  <p className="text-xs text-warm-gray">Jam Sesi: {s.time}</p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Okupansi {s.fill}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════ MAIN PEMILIK DASHBOARD ══════════════ */
export default function PemilikDashboard({ onLogout, user }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
        const res = await axios.get("http://localhost:8000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdminStats();
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <PageDashboard stats={stats} />;
      case "laporan":
        return <PageLaporan />;
      case "dataStudio":
        return <PageDataStudio />;
      case "performa":
        return <PagePerforma />;
      default:
        return <PageDashboard stats={stats} />;
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} activePage={activePage} onPageChange={setActivePage} onLogout={onLogout}>
      {renderPage()}
      <DashboardFooter />
    </DashboardLayout>
  );
}
