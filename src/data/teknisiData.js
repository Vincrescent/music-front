export const teknisiStats = {
  serviceToday: 8,
  urgentRepair: 3,
  completedMTD: 42,
};

export const serviceSchedule = [
  { id: 1, name: "Neumann U87 AI", studio: "Recording A", date: "Hari Ini, 14:00", status: "Pending", icon: "🎤" },
  { id: 2, name: "Yamaha HS8 (Pair)", studio: "Mixing Room 2", date: "Hari Ini, 16:30", status: "Scheduled", icon: "🔊" },
  { id: 3, name: "Nord Stage 3 88", studio: "Rehearsal 1", date: "25 Okt, 09:00", status: "Completed", icon: "🎹" },
];

export const serviceEntry = {
  fields: ["Peralatan", "Jenis Masalah", "Tindakan yang Dilakukan", "Tanggal Selesai"],
};

export const equipmentHistory = [
  { id: 1, title: "Pembersihan Sirkuit & Rekalibrasi", date: "12 Sep 2024", desc: "Melakukan pembersihan mendalam pada kontak internal dan rekalibrasi respons frekuensi. Tidak ada komponen diganti.", icon: "🔧" },
  { id: 2, title: "Penggantian Kapsul (Mendesak)", date: "04 Jun 2024", desc: "Mengganti diafragma yang rusak dengan kapsul Neumann K87 asli. Unit diuji selama 48 jam.", certified: true, icon: "🔴" },
  { id: 3, title: "Kalibrasi & Setup Awal", date: "10 Jan 2024", desc: "Inspeksi awal, registrasi serial, dan pengujian performa dasar.", icon: "📋" },
];

export const teknisiPeralatan = {
  totalGear: 1248,
  totalAdded: "12 ditambahkan bulan ini",
  actionRequired: 14,
  actionNote: "5 status kritis",
  recentlyServiced: 42,
  recentNote: "7 hari terakhir",
  equipmentDb: [
    { id: "#MIC-X99201", name: "Neumann U87 Ai", category: "MIC", lastService: "12 Okt 2023", condition: "EXCELLENT", studio: "Studio 1", icon: "🎤" },
    { id: "#AMP-M2011", name: "Marshall JCM800 Head", category: "AMP", lastService: "05 Jan 2024", condition: "FAIR", studio: "Studio 1", icon: "🎸" },
    { id: "#INS-S4402", name: "Yamaha C7 Grand Piano", category: "INSTRUMENT", lastService: "22 Agu 2023", condition: "CRITICAL", studio: "Studio 1", icon: "🎹" },
    { id: "#MIC-SM7B-01", name: "Shure SM7B", category: "MIC", lastService: "15 Des 2023", condition: "GOOD", studio: "Studio 1", icon: "🎤" },
  ],
  healthMonitor: [
    { label: "Peralatan Elektronik", pct: 92 },
    { label: "Instrumen Akustik", pct: 78 },
    { label: "Kabel & Aksesori", pct: 64 },
  ],
};

export const jadwalService = {
  weekDays: [
    { day: "S", date: 21 }, { day: "S", date: 22 }, { day: "R", date: 23 },
    { day: "K", date: 24, active: true }, { day: "J", date: 25 }, { day: "S", date: 26 }, { day: "M", date: 27 },
  ],
  criticalAlert: "Kritis: Kalibrasi Mixer di Studio B besok pukul 09:00",
  efficiencyIndex: { value: "94%", change: "↑12%", note: "Tugas selesai dalam jendela waktu terjadwal." },
  upcomingMaintenance: [
    { id: 1, name: "Neumann U87 Ai", location: "Studio A • Rak 04", time: "10:00", dateLabel: "Hari Ini", priority: "URGENT", status: "Pending", icon: "🎤" },
    { id: 2, name: "Genelec 8361A Monitors", location: "Ruang Kontrol • Studio B", time: "09:30", dateLabel: "Sedang Berjalan", priority: "ROUTINE", status: "In Progress", icon: "🔊" },
    { id: 3, name: "Moog One Synthesizer", location: "Synth Suite • Ruang 2", time: "13:00", dateLabel: "Hari Ini", priority: "PERIODIC", status: "Pending", icon: "🎹" },
    { id: 4, name: "Avid Carbon Interface", location: "Studio A • Ruang Server", time: "15:30", dateLabel: "Hari Ini", priority: "ROUTINE", status: "Pending", icon: "💻" },
  ],
  alerts: [
    { title: "Stok Suku Cadang Rendah", desc: "Konektor XLR dan pembersih DeoxIT di bawah ambang batas. Perlu pemesanan ulang untuk pemeliharaan Studio B.", icon: "⚠️" },
    { title: "Kesehatan Sistem", desc: "Studio C terkalibrasi penuh per 08:00 pagi. Pengecekan berkala berikutnya dalam 30 hari.", icon: "🛡️" },
    { title: "Buletin Teknologi Baru", desc: "Pembaruan pabrikan untuk preamp Neve 1073 telah dirilis. Tinjau prosedur sebelum service berikutnya.", icon: "ℹ️" },
  ],
};

export const riwayatService = {
  totalRepairs: 124,
  avgUptime: "99.8%",
  thisMonth: 12,
  studioStatus: "Semua Operasional",
  maintenanceLog: [
    { date: "24 Okt 2023", time: "09:15", equipment: "Neumann U87 Ai", technician: "Eggie", work: "Pembersihan & Uji Kapsul", workDesc: "Membersihkan permukaan kapsul dari akumulasi debu. Melakukan uji respons frekuensi.", parts: "Isopropil 99%", status: "SELESAI" },
    { date: "22 Okt 2023", time: "14:45", equipment: "Vox AC30 Amplifier", technician: "Eggie", work: "Penggantian Tabung", workDesc: "Mengganti 3x tabung preamp ECC83 karena mikrofoni dan masalah noise floor.", parts: "3x Mullard ECC83", status: "SELESAI" },
    { date: "18 Okt 2023", time: "11:00", equipment: "Yamaha C7 Grand", technician: "Eggie", work: "Tuning & Regulasi Tahunan", workDesc: "Tuning penuh ke A440, regulasi aksi, dan voicing hammer.", parts: "N/A", status: "SELESAI" },
    { date: "15 Okt 2023", time: "17:20", equipment: "Genelec 8040B", technician: "Dimas", work: "Inspeksi Port", workDesc: "Memeriksa kebocoran udara pada kabinet. Memverifikasi pengaturan crossover.", parts: "Sealant Tape", status: "SELESAI" },
  ],
  trendData: [8, 12, 15, 22, 10, 6],
  nextAudit: { title: "Kalibrasi Konsol Studio B & Verifikasi Jalur Sinyal", date: "31 Okt", day: "KAMIS • 10:00" },
};

export const kasirData = {
  stats: { totalBookingToday: 24, dailyRevenue: "Rp 4.2M", activeStudios: "6/8", pendingValidation: 12 },
  recentBookings: [
    { id: 1, initials: "RK", name: "Randi Kurniawan", studio: "Studio 1", date: "Hari Ini", time: "13:00 - 15:00", status: "Pending" },
    { id: 2, initials: "ML", name: "Maya Larasati", studio: "Studio 1", date: "Hari Ini", time: "15:00 - 17:00", status: "Validated" },
    { id: 3, initials: "DS", name: "The Soundwaves", studio: "Studio 1", date: "Hari Ini", time: "09:00 - 11:00", status: "Done" },
  ],
  equipmentStatus: [
    { name: "Neumann U87 Mic", status: "GOOD" },
    { name: "SSL Console", status: "GOOD" },
    { name: "Marshall JCM800", status: "SERVICE" },
  ],
  studioLive: { name: "Studio 1", session: "Latihan", status: "Sedang Sesi" },
};
