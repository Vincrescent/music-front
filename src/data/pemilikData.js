export const ownerStats = {
  totalRevenue: "Rp 45.820.000",
  revenueChange: "+12% vs bulan lalu",
  totalBookings: "184 Sesi",
  bookingsChange: "+5.4% vs bulan lalu",
  avgOccupancy: "78.2%",
  occupancyChange: "-2.1% vs bulan lalu",
  activeStudios: "4 / 4",
  activeStudiosNote: "Tingkat Operasional Tinggi",
};

export const studioOccupancy = [
  { name: "Studio 1", pct: 100 },
  { name: "Studio 2", pct: 65 },
  { name: "Studio 3", pct: 48 },
  { name: "Studio 4", pct: 88 },
];

export const recentReports = [
  { id: 1, title: "Laporan Penutupan Harian - 24 Mei 2026", submitter: "Admin Clara", time: "18.45", type: "COCOK", icon: "📊" },
  { id: 2, title: "Pemeliharaan Peralatan: Penggantian Amplifier", submitter: "Teknisi Yoga", time: "14.20", type: "PERBAIKAN", icon: "🔧" },
  { id: 3, title: "Pembatalan Tak Terduga - Studio A", submitter: "Kasir Budi", time: "10.15 pagi", type: "PENGECUALIAN", icon: "⚠️" },
  { id: 4, title: "Laporan Penutupan Harian - 23 Mei 2026", submitter: "Admin Clara", time: "19.02", type: "COCOK", icon: "📊" },
];

export const dataStudio = {
  rackTemp: "24.2°C",
  rackStatus: "Optimal",
  networkLatency: "1.2 ms",
  networkStatus: "Excellent",
  assetValuation: "Rp 1.450M",
  assetBreakdown: [
    { label: "Konsol & Motor Tempel", value: "Rp 820M" },
    { label: "Mikrofon", value: "Rp 410M" },
    { label: "Perlakuan Akustik", value: "Rp 220M" },
  ],
  rateAdjustments: [
    { title: "Kenaikan Tarif Dasar (+8%)", date: "Diajukan: 24 Oktober 2023", desc: "Disesuaikan dengan inflasi dan biaya tambahan energi. Tarif baru: Rp850.000/jam.", active: true },
    { title: "Promo Kilat Tengah Malam", date: "Berakhir: 15 Agustus 2023", desc: "Diskon sementara 15% untuk sesi 00:00 - 06:00.", active: false },
    { title: "Imbalan Anggota Tahunan", date: "Diajukan: 1 Januari 2023", desc: "Diskon tetap 5% bagi pemegang keanggotaan Tier 1.", active: false },
  ],
  hardwareInsight: {
    title: "Performa SSL Origin 32",
    desc: "Sistem inti Studio A saat ini melaporkan integritas jalur sinyal 100% pada seluruh 32 channel. Stabilitas catu daya berada di margin +/- 0,05V. Total jam operasional: 4.210.",
    integrity: "100%",
    power: "Solid",
    dutyCycle: "98%",
  },
};

export const laporanUsaha = {
  monthlyRevenue: { value: "Rp 45.200.000", change: "+12%" },
  totalExpenses: { value: "Rp 12.450.000", change: "+4%" },
  netProfit: { value: "Rp 32.750.000", change: "+18.5%" },
  returningCustomers: { value: "64%", total: "Total 142" },
  profitTrends: [12, 18, 35, 22, 28, 30],
  expenseBreakdown: [
    { label: "Utilitas & Sewa", pct: 45, color: "#E67E22" },
    { label: "Pemeliharaan", pct: 30, color: "#D4A76A" },
    { label: "Pemasaran", pct: 25, color: "#9CA3AF" },
  ],
  financialDetails: [
    { period: "Juni 2026", revenue: "Rp 52.100.000", expense: "Rp 14.200.000", profit: "Rp 37.900.000", growth: "+15.4%" },
    { period: "Mei 2026", revenue: "Rp 48.300.000", expense: "Rp 15.500.000", profit: "Rp 32.800.000", growth: "+2.1%" },
    { period: "April 2026", revenue: "Rp 45.200.000", expense: "Rp 13.100.000", profit: "Rp 32.100.000", growth: "-4.2%" },
    { period: "Maret 2026", revenue: "Rp 49.500.000", expense: "Rp 14.500.000", profit: "Rp 35.000.000", growth: "+11.8%" },
  ],
};

export const performaBooking = {
  totalRevenue: { value: "Rp 48.2M", change: "+12.5%", vs: "vs Rp 42.8M tahun lalu" },
  totalBookings: { value: "1,284", change: "+8.2%", vs: "vs 1,186 tahun lalu" },
  newCustomers: { value: "342", change: "+2.1%", vs: "vs 349 tahun lalu" },
  occupancyRate: { value: "78.4%", change: "+15.0%", vs: "vs 68.2% tahun lalu" },
  retentionRate: 72,
  growthSummary: { revenue: "+12.5%", bookings: "+8.2%" },
  topSlots: [
    { rank: 1, name: "Jumat Malam Rush", time: "19:00 - 22:00", studio: "Studio A", fill: "98%" },
    { rank: 2, name: "Weekend Jam", time: "14:00 - 18:00", studio: "Studio B", fill: "85%" },
    { rank: 3, name: "Early Bird Prod", time: "09:00 - 12:00", studio: "Studio A", fill: "72%" },
  ],
};
