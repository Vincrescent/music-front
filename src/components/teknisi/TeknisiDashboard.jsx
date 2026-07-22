import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../shared/UIHelpers";
import DashboardLayout from "../dashboard/DashboardLayout";
import { teknisiStats, serviceSchedule, equipmentHistory, teknisiPeralatan, jadwalService, riwayatService } from "../../data/teknisiData";
import { Search, Bell, Download, Filter, Eye, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { key: "jadwal", label: "Jadwal Service", icon: "CalendarCheck" },
  { key: "peralatan", label: "Data Peralatan", icon: "Wrench" },
  { key: "riwayat", label: "Riwayat Service", icon: "BarChart3" },
];

const conditionColor = { EXCELLENT: "bg-green-100 text-green-700", GOOD: "bg-green-100 text-green-700", FAIR: "bg-amber-100 text-amber-700", CRITICAL: "bg-red-100 text-red-600" };
const statusColor = { Pending: "text-amber-600", Scheduled: "text-blue-600", Completed: "text-green-600", "In Progress": "text-blue-600" };
const priorityColor = { URGENT: "bg-red-100 text-red-600", ROUTINE: "bg-blue-100 text-blue-600", PERIODIC: "bg-amber-100 text-amber-700" };

/* ══════════════ PAGE: Technician Dashboard ══════════════ */
function PageDashboard({ tickets = [], equipments = [], refresh, user }) {
  const toast = useToast();
  const [formData, setFormData] = useState({ ticket_id: "", actions: "", finishDate: "" });
  
  const myTickets = tickets;
  const pendingTickets = myTickets.filter(t => t.status !== 'Completed');
  const completedTickets = myTickets.filter(t => t.status === 'Completed');
  
  const handleComplete = async (e) => {
    e.preventDefault();
    if(!formData.ticket_id || !formData.actions || !formData.finishDate) {
      toast("Harap lengkapi form", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/api/maintenance/${formData.ticket_id}`, {
        status: 'Completed',
        resolution_notes: formData.actions,
        completed_date: formData.finishDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast("Berhasil memperbarui status pemeliharaan", "success");
      setFormData({ ticket_id: "", actions: "", finishDate: "" });
      if(refresh) refresh();
    } catch (err) {
      toast("Gagal memperbarui tiket", "error");
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-brown">Dashboard Teknisi</h1>
          <p className="text-warm-gray text-sm mt-1">Pantau dan pelihara keunggulan akustik studio.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 border rounded-lg text-warm-gray cursor-pointer"><Bell size={18}/></button>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-dark-brown">{user?.name || "Teknisi"}</p>
              <p className="text-xs text-warm-gray">Teknisi Utama</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-200 border-2 border-white shadow"/>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-xl bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-lg">📋</div>
          <div><p className="text-xs text-warm-gray">Tugas Aktif</p><p className="text-2xl font-bold text-dark-brown">{pendingTickets.length}</p></div>
        </div>
        <div className="border rounded-xl bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-lg">⚠️</div>
          <div><p className="text-xs text-warm-gray">Perbaikan Mendesak</p><p className="text-2xl font-bold text-red-600">{pendingTickets.filter(t => t.issue_description.toLowerCase().includes('mati') || t.issue_description.toLowerCase().includes('rusak')).length}</p></div>
        </div>
        <div className="border rounded-xl bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-lg">✅</div>
          <div><p className="text-xs text-warm-gray">Selesai (Total)</p><p className="text-2xl font-bold text-dark-brown">{completedTickets.length}</p></div>
        </div>
      </div>

      {/* Schedule + Service Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 border rounded-xl bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-bold text-dark-brown">Jadwal Service</h2>
            <button className="text-accent text-sm font-medium hover:underline cursor-pointer">Lihat Kalender ›</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-cream/50">
                {["NAMA PERALATAN","KELUHAN","STATUS","AKSI"].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-warm-gray uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {pendingTickets.map((t)=>(
                  <tr key={t.id} className="border-b last:border-0 hover:bg-cream/30">
                    <td className="px-5 py-3"><span className="font-medium text-dark-brown">{t.equipment?.name || "Peralatan Dihapus"}</span></td>
                    <td className="px-5 py-3 text-warm-gray">{t.issue_description}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.status==="Pending"?"bg-orange-100 text-orange-700":"bg-blue-100 text-blue-600"}`}>
                        {t.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3"><button className="text-accent text-sm font-medium hover:underline cursor-pointer" onClick={() => setFormData({...formData, ticket_id: t.id})}>Selesaikan</button></td>
                  </tr>
                ))}
                {pendingTickets.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-5 text-warm-gray">Tidak ada jadwal aktif</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Entry Form */}
        <div className="border rounded-xl bg-white p-5">
          <h2 className="font-bold text-dark-brown mb-4">Entri Service Selesai</h2>
          <form className="space-y-3" onSubmit={handleComplete}>
            <div>
              <label className="text-xs font-medium text-warm-gray block mb-1">Tiket Service Aktif</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={formData.ticket_id} onChange={e=>setFormData({...formData, ticket_id: e.target.value})}>
                <option value="">Pilih Tiket yang Selesai</option>
                {pendingTickets.map(t => (
                  <option key={t.id} value={t.id}>{t.equipment?.name || "Unknown"} - {t.issue_description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-warm-gray block mb-1">Tindakan yang Dilakukan</label>
              <textarea placeholder="Deskripsikan tindakan pemeliharaan..." rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={formData.actions} onChange={e=>setFormData({...formData, actions: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-warm-gray block mb-1">Tanggal Selesai</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={formData.finishDate} onChange={e=>setFormData({...formData, finishDate: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-dark-brown text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand transition flex items-center justify-center gap-2 cursor-pointer">
              📋 Kirim Catatan
            </button>
          </form>
        </div>
      </div>

      {/* Equipment History */}
      <div className="border rounded-xl bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-dark-brown">Riwayat Peralatan Selesai</h2>
          <div className="flex gap-2">
            <button className="border rounded-lg px-3 py-1.5 text-sm text-warm-gray cursor-pointer">Ekspor PDF</button>
            <button className="border rounded-lg px-3 py-1.5 text-sm text-warm-gray cursor-pointer">Lihat Semua</button>
          </div>
        </div>
        <div className="space-y-0">
          {completedTickets.slice(0, 5).map((h,i)=>(
            <div key={h.id} className="flex gap-4 pb-5">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 bg-green-100`}>✅</div>
                {i<completedTickets.length-1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1"/>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-dark-brown">{h.equipment?.name || "Unknown"}</p>
                  <span className="text-xs text-warm-gray">{h.completed_date || h.updated_at?.split('T')[0]}</span>
                </div>
                <p className="text-sm text-warm-gray mt-1">{h.resolution_notes}</p>
                <p className="text-xs text-green-600 mt-1">Selesai diperbaiki</p>
              </div>
            </div>
          ))}
          {completedTickets.length === 0 && <p className="text-sm text-warm-gray">Belum ada riwayat perbaikan yang selesai.</p>}
        </div>
      </div>
    </>
  );
}

/* ══════════════ DASHBOARD FOOTER ══════════════ */
function DashboardFooter() {
  return (
    <footer className="bg-gray-100/80 border-t border-gray-200 mt-8 rounded-xl px-6 py-5">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-brand font-bold text-base">Studio Musik Lantai Atas</p>
          <p className="text-gray-500 text-sm mt-1">&copy; 2024 Studio Musik Lantai Atas. Rhythmic Precision.</p>
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

/* ══════════════ PAGE: Jadwal Service ══════════════ */
function PageJadwal({ tickets = [] }) {
  const j = jadwalService;
  const pendingTickets = tickets.filter(t => t.status !== 'Completed');
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-dark-brown">Data Peralatan</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-warm-gray">PRIORITY</span>
            <select className="border rounded-lg px-3 py-1.5 text-sm"><option>All Levels</option></select>
          </div>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm text-warm-gray">
            <Calendar size={14}/> Oct 24 - Oct 31
          </div>
          <button className="border rounded-lg p-2 text-warm-gray cursor-pointer"><Filter size={16}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left: Calendar + Efficiency */}
        <div className="space-y-4">
          <div className="border rounded-xl bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-dark-brown">Ringkasan Mingguan</h2>
              <span className="text-xs text-warm-gray uppercase">Oktober</span>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-3">
              {j.weekDays.map((d)=>(
                <div key={d.date} className="text-center">
                  <p className="text-[10px] text-warm-gray">{d.day}</p>
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-medium ${d.active?"bg-accent text-white":"text-dark-brown"}`}>{d.date}</div>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <span className="text-amber-600 shrink-0">⚠️</span>
              <p className="text-xs text-dark-brown">{j.criticalAlert}</p>
            </div>
          </div>

          <div className="border rounded-xl bg-white p-5">
            <h2 className="font-bold text-dark-brown mb-2">Indeks Efisiensi</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-dark-brown">{j.efficiencyIndex.value}</span>
              <span className="text-sm font-bold text-green-600">{j.efficiencyIndex.change}</span>
              <span className="text-xs text-warm-gray">VS BULAN LALU</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-3"><div className="h-2 bg-accent rounded-full" style={{width:"94%"}}/></div>
            <p className="text-xs text-warm-gray mt-2">{j.efficiencyIndex.note}</p>
          </div>
        </div>

        {/* Right: Upcoming Maintenance */}
        <div className="lg:col-span-2 border rounded-xl bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-dark-brown">Pemeliharaan Mendatang</h2>
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase">Daftar Aktif</span>
            </div>
            <div className="flex gap-1">
              <button className="p-1 text-warm-gray cursor-pointer"><Filter size={14}/></button>
              <button className="p-1 text-warm-gray cursor-pointer">⋮</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-cream/50">
                {["PERALATAN","KELUHAN","STATUS"].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-warm-gray uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {pendingTickets.map((m)=>(
                  <tr key={m.id} className="border-b last:border-0 hover:bg-cream/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔧</span>
                        <div><p className="font-medium text-dark-brown">{m.equipment?.name || "Unknown"}</p><p className="text-xs text-warm-gray">ID: {m.equipment_id}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><p className="font-medium text-dark-brown">{m.issue_description}</p><p className="text-xs text-warm-gray">{m.created_at?.split('T')[0]}</p></td>
                    <td className="px-5 py-3"><span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${m.status==="Pending"?"bg-amber-500":"bg-blue-500"}`}/><span className="text-sm">{m.status || "Pending"}</span></span></td>
                  </tr>
                ))}
                {pendingTickets.length === 0 && (
                  <tr><td colSpan="3" className="text-center py-5 text-warm-gray">Tidak ada jadwal pemeliharaan mendatang.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t text-sm text-warm-gray">
            <span>Menampilkan total {pendingTickets.length} tugas hari ini</span>
            <div className="flex gap-2"><button className="border rounded px-3 py-1 text-sm cursor-pointer">Sblm</button><button className="border rounded px-3 py-1 text-sm cursor-pointer">Slnjt</button></div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {j.alerts.map((a,i)=>(
          <div key={i} className="border rounded-xl bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{a.icon}</span>
              <h3 className={`font-bold ${i===0?"text-amber-600":i===1?"text-green-600":"text-blue-600"}`}>{a.title}</h3>
            </div>
            <p className="text-sm text-warm-gray">{a.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ══════════════ PAGE: Data Peralatan ══════════════ */
function PagePeralatan({ equipments = [] }) {
  const d = teknisiPeralatan;
  return (
    <>
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 flex items-center gap-3 border rounded-lg px-3 py-2 bg-white max-w-md">
          <Search size={16} className="text-warm-gray"/>
          <input placeholder="Cari berdasarkan Nama, SN, atau Kategori..." className="flex-1 text-sm outline-none bg-transparent"/>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 border rounded-lg text-warm-gray cursor-pointer"><Bell size={18}/></button>
          <span className="text-sm text-warm-gray">Portal Teknisi</span>
          <div className="w-8 h-8 rounded-full bg-amber-200"/>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-xl bg-white p-4">
          <div className="flex items-center justify-between"><span className="text-xs text-warm-gray uppercase">Total Peralatan</span><span className="text-lg">📦</span></div>
          <p className="text-2xl font-bold text-dark-brown">{equipments.length}</p>
          <p className="text-xs text-green-600">Terdaftar di sistem</p>
        </div>
        <div className="border rounded-xl bg-white p-4">
          <div className="flex items-center justify-between"><span className="text-xs text-warm-gray uppercase">Sedang Rusak</span><span className="text-lg">🔧</span></div>
          <p className="text-2xl font-bold text-dark-brown">{equipments.filter(e => e.status !== 'Good').length}</p>
          <p className="text-xs text-red-500">⚠ Perlu Tindakan</p>
        </div>
        <div className="border rounded-xl bg-white p-4">
          <div className="flex items-center justify-between"><span className="text-xs text-warm-gray uppercase">Kondisi Baik</span><span className="text-lg">✅</span></div>
          <p className="text-2xl font-bold text-dark-brown">{equipments.filter(e => e.status === 'Good').length}</p>
          <p className="text-xs text-warm-gray">Siap digunakan</p>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="border rounded-xl bg-white overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-dark-brown">Database Peralatan</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 border rounded-lg px-3 py-1.5 text-sm text-warm-gray cursor-pointer"><Filter size={14}/>Filter</button>
            <button className="flex items-center gap-1 border rounded-lg px-3 py-1.5 text-sm text-warm-gray cursor-pointer"><Download size={14}/>Ekspor</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-cream/50">
              {["ID","NAMA ITEM","STUDIO","STATUS","KETERANGAN","AKSI"].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-warm-gray uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {equipments.map((eq)=>(
                <tr key={eq.id} className="border-b last:border-0 hover:bg-cream/30">
                  <td className="px-5 py-3 text-warm-gray font-mono text-xs">{eq.id}</td>
                  <td className="px-5 py-3 flex items-center gap-2"><span className="font-medium text-dark-brown">{eq.name}</span></td>
                  <td className="px-5 py-3 text-warm-gray">{eq.studio?.name || "Gudang"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${eq.status === 'Good' ? conditionColor.GOOD : conditionColor.CRITICAL}`}>● {eq.status}</span>
                  </td>
                  <td className="px-5 py-3 text-warm-gray">{eq.notes || "-"}</td>
                  <td className="px-5 py-3"><button className="text-warm-gray hover:text-accent cursor-pointer">⋮</button></td>
                </tr>
              ))}
              {equipments.length === 0 && <tr><td colSpan="6" className="text-center py-5 text-warm-gray">Tidak ada peralatan</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t text-sm text-warm-gray">
          <span>Menampilkan total {equipments.length} entri</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded text-warm-gray cursor-pointer">‹</button>
            <button className="px-2.5 py-1 rounded-lg bg-accent text-white text-xs font-bold">1</button>
            <button className="px-2.5 py-1 rounded text-warm-gray cursor-pointer">2</button>
            <button className="px-2.5 py-1 rounded text-warm-gray cursor-pointer">3</button>
            <button className="px-2 py-1 rounded text-warm-gray cursor-pointer">›</button>
          </div>
        </div>
      </div>

      {/* Health + Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark-brown">Monitor Kesehatan Peralatan</h2>
            <span className="text-lg">🔧</span>
          </div>
          <div className="space-y-4">
            {d.healthMonitor.map((h)=>(
              <div key={h.label}>
                <div className="flex justify-between text-sm mb-1"><span className="text-warm-gray">{h.label}</span><span className="font-bold text-dark-brown">{h.pct}%</span></div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full"><div className={`h-2.5 rounded-full ${h.pct>=80?"bg-green-500":h.pct>=60?"bg-amber-500":"bg-red-500"}`} style={{width:`${h.pct}%`}}/></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-dark-brown text-white p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="font-bold text-lg">Audit Sistem Bulanan</p>
            <p className="text-white/70 text-sm mt-1">Terjadwal berikutnya: 12 Feb 2024</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════ PAGE: Riwayat Service ══════════════ */
function PageRiwayat({ tickets = [] }) {
  const r = riwayatService;
  const completedTickets = tickets.filter(t => t.status === 'Completed');
  const months = ["JUL","AUG","SEP","OCT","NOV","DEC"];
  const maxBar = Math.max(...r.trendData);
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-dark-brown">Riwayat Service</h1>
          <div className="flex-1 flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white max-w-xs">
            <Search size={14} className="text-warm-gray"/>
            <input placeholder="Cari riwayat service..." className="flex-1 text-sm outline-none bg-transparent"/>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2"><span className="text-sm font-medium text-dark-brown">Rizky Ramadhan</span><span className="text-xs text-warm-gray">Senior Technician</span><div className="w-8 h-8 rounded-full bg-amber-200"/></div>
          <button className="border rounded-lg px-3 py-1.5 text-sm text-warm-gray cursor-pointer flex items-center gap-1"><Download size={14}/>Export PDF</button>
          <button className="border rounded-lg px-3 py-1.5 text-sm text-warm-gray cursor-pointer flex items-center gap-1">📊 Export CSV</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border rounded-xl bg-white p-4">
          <p className="text-xs text-warm-gray">Total Perbaikan</p>
          <div className="flex items-center gap-2"><p className="text-2xl font-bold text-dark-brown">{completedTickets.length}</p><span className="text-lg">🔧</span></div>
        </div>
        <div className="border rounded-xl bg-white p-4">
          <p className="text-xs text-warm-gray">Rata-rata Uptime</p>
          <div className="flex items-center gap-2"><p className="text-2xl font-bold text-dark-brown">{r.avgUptime}</p><span className="text-lg text-green-500">✅</span></div>
        </div>
        <div className="border rounded-xl bg-white p-4">
          <p className="text-xs text-warm-gray">Bulan Ini</p>
          <div className="flex items-center gap-2"><p className="text-2xl font-bold text-dark-brown">{completedTickets.length}</p><span className="text-lg">📅</span></div>
        </div>
        <div className="rounded-xl bg-accent text-white p-4">
          <p className="text-xs text-white/70">Status Studio</p>
          <p className="text-xl font-bold">{r.studioStatus}</p>
        </div>
      </div>

      {/* Maintenance Log Table */}
      <div className="border rounded-xl bg-white overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-dark-brown">Log Aktivitas Pemeliharaan</h2>
          <div className="flex gap-1">
            <button className="p-1 text-warm-gray cursor-pointer"><Filter size={14}/></button>
            <button className="p-1 text-warm-gray cursor-pointer">⋮</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-cream/50">
              {["TANGGAL","NAMA PERALATAN","TEKNISI","DESKRIPSI PEKERJAAN","STATUS","LAPORAN"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {completedTickets.map((m,i)=>(
                <tr key={m.id} className="border-b last:border-0 hover:bg-cream/30 align-top">
                  <td className="px-4 py-3"><p className="font-medium text-dark-brown">{m.completed_date || m.updated_at?.split('T')[0]}</p></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span>🔧</span><span className="font-medium text-dark-brown">{m.equipment?.name || "Unknown"}</span></div></td>
                  <td className="px-4 py-3 text-accent font-medium">{m.technician?.name || "-"}</td>
                  <td className="px-4 py-3 max-w-xs"><p className="font-medium text-dark-brown">{m.issue_description}</p><p className="text-xs text-warm-gray mt-0.5">{m.resolution_notes}</p></td>
                  <td className="px-4 py-3"><span className="text-xs font-bold text-green-600">Selesai</span></td>
                  <td className="px-4 py-3"><button className="text-accent text-xs font-medium hover:underline cursor-pointer">Lihat Laporan ↗</button></td>
                </tr>
              ))}
              {completedTickets.length === 0 && (
                <tr><td colSpan="6" className="text-center py-5 text-warm-gray">Belum ada aktivitas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t text-sm text-warm-gray">
          <span>Menampilkan total {completedTickets.length} catatan</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded text-warm-gray cursor-pointer">‹</button>
            <button className="px-2.5 py-1 rounded-lg bg-accent text-white text-xs font-bold">1</button>
            <button className="px-2.5 py-1 rounded text-warm-gray cursor-pointer">2</button>
            <button className="px-2.5 py-1 rounded text-warm-gray cursor-pointer">3</button>
            <button className="px-2 py-1 rounded text-warm-gray cursor-pointer">›</button>
          </div>
        </div>
      </div>

      {/* Bottom: Trends + Audit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border rounded-xl bg-white p-5">
          <h2 className="font-bold text-dark-brown mb-4">Tren Pemeliharaan</h2>
          <div className="flex items-end gap-4 h-40 border-b pt-4">
            {months.map((m,i)=>{
              const h=(r.trendData[i]/maxBar)*100;
              const isMax = r.trendData[i]===maxBar;
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full max-w-12 rounded-t ${isMax?"bg-accent":"bg-amber-200"}`} style={{height:`${h}%`}}/>
                  <span className={`text-[10px] ${isMax?"text-accent font-bold":"text-warm-gray"}`}>{m}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-6 mt-3 text-xs text-warm-gray">
            <span>Suku Cadang Terbanyak: <strong className="text-dark-brown">ECC83 Tubes (14)</strong></span>
            <span>Masalah Umum: <strong className="text-dark-brown">Pergeseran Kalibrasi</strong></span>
          </div>
        </div>

        <div className="rounded-xl bg-accent text-white p-5">
          <h2 className="font-bold mb-1">Audit Terjadwal Berikutnya</h2>
          <p className="text-white/80 text-sm">{r.nextAudit.title}</p>
          <p className="text-3xl font-bold mt-3">{r.nextAudit.date}</p>
          <p className="text-sm text-white/70">{r.nextAudit.day}</p>
          <p className="text-xs text-white/60 mt-2">⏰ Pengingat diatur 2 jam sebelumnya</p>
          <button className="mt-3 bg-white text-accent rounded-lg px-4 py-2 text-sm font-semibold hover:bg-white/90 transition cursor-pointer">Lihat Jadwal Lengkap</button>
        </div>
      </div>
    </>
  );
}

/* ══════════════ MAIN ══════════════ */
export default function TeknisiDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [equipments, setEquipments] = useState([]);
  
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { name: "Eggie" };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [tRes, eRes] = await Promise.all([
        axios.get("http://localhost:8000/api/maintenance", { headers }),
        axios.get("http://localhost:8000/api/equipment", { headers })
      ]);
      if (tRes.data.success) setTickets(tRes.data.data);
      if (eRes.data.success) setEquipments(eRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pages = { 
    dashboard: <PageDashboard tickets={tickets} equipments={equipments} refresh={fetchData} user={user} />, 
    jadwal: <PageJadwal tickets={tickets} />, 
    peralatan: <PagePeralatan equipments={equipments} />, 
    riwayat: <PageRiwayat tickets={tickets} /> 
  };

  return (
    <DashboardLayout menuItems={menuItems} activePage={activePage} onPageChange={setActivePage} onLogout={onLogout}>
      {pages[activePage] || <PageDashboard tickets={tickets} equipments={equipments} refresh={fetchData} user={user} />}
      <DashboardFooter />
    </DashboardLayout>
  );
}
