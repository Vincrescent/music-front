export const adminStats = {
  totalBookingToday: 24,
  dailyRevenue: "Rp 4.2M",
  activeStudios: "6/8",
  pendingValidation: 12,
};

export const recentBookings = [
  { id: 1, initials: "RK", name: "Randi Kurniawan", studio: "Studio 1", date: "Hari Ini", time: "13:00 - 15:00", status: "Pending" },
  { id: 2, initials: "ML", name: "Maya Larasati", studio: "Studio 1", date: "Hari Ini", time: "15:00 - 17:00", status: "Validated" },
  { id: 3, initials: "DS", name: "The Soundwaves", studio: "Studio 1", date: "Hari Ini", time: "09:00 - 11:00", status: "Done" },
];

export const bookingManagement = [
  { id: 1, name: "Alex Thompson", email: "alex.t@vibe-records.com", avatar: null, studio: "Studio A", studioSub: "Sesi Rekaman Live", date: "28 Okt 2024", time: "14:00 - 18:00 (4 jam)", status: "CONFIRMED" },
  { id: 2, name: "Luna Marigold", email: "booking@luna-artist.com", avatar: null, studio: "Vocal Booth", studioSub: "Rekaman Vokal Utama", date: "29 Okt 2024", time: "10:00 - 13:00 (3 jam)", status: "PENDING" },
  { id: 3, name: "Jordan S.", email: "jordan.mix@studio.com", avatar: null, studio: "Studio B", studioSub: "Mixing & Mastering Akhir", date: "29 Okt 2024", time: "14:00 - 20:00 (6 jam)", status: "CONFIRMED" },
  { id: 4, name: "Sarah Lee", email: "sarah@podcast-central.io", avatar: null, studio: "Podcast Room", studioSub: "Rekaman Episode #42", date: "30 Okt 2024", time: "09:00 - 11:00", status: "CANCELLED" },
];

export const paymentValidations = [
  { id: 1, name: "Adrian Mahardika", bookingId: "#SLA-88291", studio: "Studio 1", duration: "4 Jam", amount: 170000, avatar: null },
  { id: 2, name: "Siska Widya", bookingId: "#SLA-88304", studio: "Studio 1", duration: "2 Jam", amount: 100000, avatar: null },
  { id: 3, name: "Reno Prasetyo", bookingId: "#SLA-88312", studio: "Studio 1", duration: "4 Jam", amount: 190000, avatar: null },
];

export const adminStudioData = {
  name: "Studio 1",
  status: "Tersedia",
  priceRange: "RP 75.000 – RP 100.000",
  priceUnit: "per Jam",
  capacity: 12,
  features: ["Analog Gear", "Vocal Booth"],
  image: "/images/studio-hero.png",
  inventoryOverview: { totalStudios: "01", avgRate: "Rp 87.500" },
  rateAdjustments: [
    { room: "Studio 1", prevRate: "70k - 90k/jam", newRate: "75k - 100k/jam", date: "12 Nov 2023", by: "Admin_Rudi" },
  ],
};

export const gearInventory = [
  { id: 1, name: "Neumann U87 Ai", serial: "SN: NU-8722019", category: "Mikrofon", studio: "Studio 1", condition: "Good", lastService: "14 Okt 2023", icon: "🎤" },
  { id: 2, name: "Marshall JCM800 Head", serial: "SN: MSH-2022-800", category: "Amplifier", studio: "Studio 1", condition: "Service", lastService: "02 Mei 2023", icon: "🎸" },
  { id: 3, name: "Ludwig Classic Maple Kit", serial: "SN: LDW-CM-001", category: "Drum", studio: "Studio 1", condition: "Good", lastService: "28 Jan 2024", icon: "🥁" },
  { id: 4, name: "Yamaha C7 Grand Piano", serial: "SN: YAM-GR-PNO-7", category: "Keyboard", studio: "Studio 1", condition: "Broken", lastService: "11 Agu 2023", icon: "🎹" },
];

export const financialReport = {
  totalRevenue: "Rp 128.4 Juta",
  revenueGrowth: "+12.5%",
  topUnit: "Studio 1",
  topUtilization: "92%",
  equipmentHealth: "94.8%",
  studioDistribution: [{ name: "Studio 1", pct: 100 }],
  recentTransactions: [
    { id: "#TRX-99201", client: "The Rizky Band", studio: "Studio 1", status: "Completed", amount: "Rp 100.000" },
    { id: "#TRX-99198", client: "Melody Records", studio: "Studio 1", status: "Completed", amount: "Rp 75.000" },
    { id: "#TRX-99195", client: "Ahmad Sulaiman", studio: "Studio 1", status: "In Progress", amount: "Rp 90.000" },
    { id: "#TRX-99190", client: "Indie Fusion", studio: "Studio 1", status: "Pending", amount: "Rp 85.000" },
  ],
  monthlyRevenue: [18, 22, 20, 28, 32, 30, 35, 38, 36, 40, 42, 45],
};

export const equipmentStatus = [
  { name: "Neumann U87 Mic", status: "GOOD" },
  { name: "SSL Console", status: "GOOD" },
  { name: "Marshall JCM800", status: "SERVICE" },
];

export const reportGenerator = {
  periods: ["Laporan Harian (Hari Ini)", "Mingguan", "Bulanan"],
  content: ["Pendapatan & Penjualan", "Status Peralatan", "Catatan Pelanggan"],
};
