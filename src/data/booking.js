export const studios = [
  {
    id: 1,
    name: "Studio 1",
    image: "/images/studio-hero.png",
    capacity: 10,
    features: ["Full Head Cabinet"],
    status: "Tersedia",
    priceRange: "Rp 75.000 - 100.000",
    priceMin: 75000,
    priceMax: 100000,
    facilities: "Backline Lengkap + AC + Air Minum",
  },
  {
    id: 2,
    name: "Studio 2",
    image: "/images/studio-hero.png",
    capacity: 6,
    features: ["Half Backline"],
    status: "Tersedia",
    priceRange: "Rp 50.000 - 75.000",
    priceMin: 50000,
    priceMax: 75000,
    facilities: "Setengah Backline + AC + Air Minum",
  },
  {
    id: 3,
    name: "Studio 3",
    image: "/images/studio-hero.png",
    capacity: 15,
    features: ["Full Head Cabinet", "Recording"],
    status: "Tersedia",
    priceRange: "Rp 100.000 - 150.000",
    priceMin: 100000,
    priceMax: 150000,
    facilities: "Backline Lengkap + Rekaman + AC + Air Minum",
  },
  {
    id: 4,
    name: "Studio 4",
    image: "/images/studio-hero.png",
    capacity: 4,
    features: ["Acoustic"],
    status: "Penuh",
    priceRange: "Rp 40.000 - 60.000",
    priceMin: 40000,
    priceMax: 60000,
    facilities: "Setup Akustik + AC + Air Minum",
  },
];

export const timeSlots = {
  pagi: {
    label: "Pagi (09:00 - 11:00)",
    icon: "🌅",
    slots: [{ start: "09:00", end: "11:00", available: true }],
  },
  siang: {
    label: "Siang (11:00 - 17:00)",
    icon: "☀️",
    slots: [
      { start: "11:00", end: "13:00", available: true },
      { start: "13:00", end: "15:00", available: true },
      { start: "15:00", end: "17:00", available: true },
    ],
  },
  malam: {
    label: "Sore & Malam (17:00 - 01:00)",
    icon: "🌙",
    slots: [
      { start: "17:00", end: "19:00", available: true },
      { start: "19:00", end: "21:00", available: true },
      { start: "21:00", end: "23:00", available: true },
      { start: "23:00", end: "01:00", available: false },
    ],
  },
};

export const paymentMethods = [
  { id: "bank", label: "Transfer Bank", icon: "🏦" },
  { id: "ewallet", label: "E-Wallet", icon: "📱" },
  { id: "qris", label: "QRIS", icon: "📲" },
];

export const paymentInstructions = [
  "Pilih Bank tujuan (BCA / Mandiri / BNI).",
  "Salin nomor Virtual Account yang muncul setelah tombol 'Konfirmasi' ditekan.",
  "Lakukan transfer sesuai total nominal hingga digit terakhir.",
  "Simpan bukti transaksi untuk keperluan verifikasi otomatis.",
];
