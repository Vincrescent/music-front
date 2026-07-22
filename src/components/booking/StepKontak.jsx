import {
  User,
  Phone,
  Mail,
  StickyNote,
  CalendarDays,
  Clock,
  Settings,
  ChevronLeft,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function StepKontak({
  contactData,
  onChange,
  selectedStudio,
  selectedDate,
  selectedSlot,
  onNext,
  onBack,
  errors,
}) {
  /* ── helpers ───────────────────────────────────────────── */
  const formatDate = (d) => {
    if (!d) return "-";
    const dateMap = {
      14: "Senin, 14 Okt 2024",
      15: "Selasa, 15 Okt 2024",
      16: "Rabu, 16 Okt 2024",
      17: "Kamis, 17 Okt 2024",
      18: "Jumat, 18 Okt 2024",
      19: "Sabtu, 19 Okt 2024",
      20: "Minggu, 20 Okt 2024",
    };
    return dateMap[d] || `${d} Okt 2024`;
  };

  const slotLabel = selectedSlot
    ? `${selectedSlot} (2 Jam)`
    : "-";

  /* ── input wrapper ─────────────────────────────────────── */
  const inputClass = (field) =>
    `border ${
      errors[field] ? "border-red-400" : "border-gray-300"
    } rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition`;

  /* ── render ────────────────────────────────────────────── */
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ─── LEFT: Form Card ──────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">
          <div className="border rounded-xl p-6 md:p-8 bg-white">
            {/* Row 1 – Name + WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nama Lengkap */}
              <div>
                <label className="text-sm font-medium text-warm-gray flex items-center gap-2 mb-1.5">
                  <User size={16} /> Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={contactData.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  className={inputClass("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="text-sm font-medium text-warm-gray flex items-center gap-2 mb-1.5">
                  <Phone size={16} /> Nomor WhatsApp
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-sm text-gray-500 select-none">
                    +62
                  </span>
                  <input
                    type="tel"
                    placeholder="812 3456 7890"
                    value={contactData.phone}
                    onChange={(e) => onChange("phone", e.target.value)}
                    className={`${inputClass("phone")} rounded-l-none`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Row 2 – Email */}
            <div className="mt-5">
              <label className="text-sm font-medium text-warm-gray flex items-center gap-2 mb-1.5">
                <Mail size={16} /> Alamat Email
              </label>
              <input
                type="email"
                placeholder="budi@email.com"
                value={contactData.email}
                onChange={(e) => onChange("email", e.target.value)}
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Row 3 – Notes */}
            <div className="mt-5">
              <label className="text-sm font-medium text-warm-gray flex items-center gap-2 mb-1.5">
                <StickyNote size={16} /> Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={4}
                placeholder="Sebutkan kebutuhan khusus seperti jenis amplifier, jumlah mic, dll..."
                value={contactData.notes}
                onChange={(e) => onChange("notes", e.target.value)}
                className={inputClass("notes")}
              />
            </div>

            {/* Row 4 – Terms */}
            <div className="mt-5">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contactData.agreed}
                  onChange={(e) => onChange("agreed", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-accent"
                />
                <span className="text-sm text-warm-gray leading-relaxed">
                  Saya setuju dengan{" "}
                  <a href="#" className="text-accent hover:underline font-medium">
                    Syarat &amp; Ketentuan
                  </a>{" "}
                  Studio Musik Lantai Atas serta kebijakan pembatalan yang berlaku.
                </span>
              </label>
              {errors.agreed && (
                <p className="text-red-500 text-xs mt-1 ml-7">{errors.agreed}</p>
              )}
            </div>
          </div>

          {/* Back link */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-brand transition"
          >
            <ChevronLeft size={16} />
            Kembali ke Pilih Jadwal
          </button>
        </div>

        {/* ─── RIGHT: Booking Summary ───────────────────── */}
        <div className="lg:col-span-2">
          <div className="border rounded-xl overflow-hidden bg-white sticky top-24">
            {/* Studio image + name overlay */}
            <div className="relative">
              <img
                src={selectedStudio?.image || "/images/studio-hero.png"}
                alt={selectedStudio?.name || "Studio"}
                className="w-full aspect-[3/2] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h3 className="absolute bottom-4 left-5 text-white font-bold text-lg">
                {selectedStudio?.name || "Studio"}
              </h3>
            </div>

            {/* Info rows */}
            <div className="p-5 space-y-4">
              {/* Tanggal */}
              <div className="flex items-start gap-3">
                <CalendarDays size={18} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-warm-gray-light">Tanggal</p>
                  <p className="text-sm font-bold text-dark-brown">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>

              {/* Jam & Durasi */}
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-warm-gray-light">Jam &amp; Durasi</p>
                  <p className="text-sm font-bold text-dark-brown">{slotLabel}</p>
                </div>
              </div>

              {/* Fasilitas */}
              <div className="flex items-start gap-3">
                <Settings size={18} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-warm-gray-light">Fasilitas</p>
                  <p className="text-sm font-bold text-dark-brown">
                    {selectedStudio?.facilities || "Backline Lengkap + AC + Air Minum"}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-warm-gray">
                  Total Estimasi
                </span>
                <span className="text-xl font-bold text-accent">
                  Rp{" "}
                  {selectedStudio
                    ? selectedStudio.priceMin.toLocaleString("id-ID")
                    : "85.000"}
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={onNext}
                className="bg-accent hover:bg-accent-dark text-white w-full rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                Lanjut ke Pembayaran
                <ArrowRight size={16} />
              </button>

              {/* Security badge */}
              <p className="text-xs text-warm-gray-light text-center flex items-center justify-center gap-1">
                <Lock size={12} /> Enkripsi Keamanan 256-bit
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
