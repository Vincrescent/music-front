import { useState } from "react";
import {
  Wallet,
  Info,
  Lock,
  ArrowRight,
  CalendarDays,
  Clock,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { paymentMethods, paymentInstructions } from "../../data/booking";

export default function StepBayar({
  selectedStudio,
  selectedDate,
  selectedSlot,
  contactData,
  paymentMethod,
  onPaymentMethodChange,
  onConfirm,
}) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  const validPromos = {
    STUDIO2026: { discount: 20000, label: "Promo Spesial 2026 (-Rp 20.000)" },
    DISKON10: { discount: 10000, label: "Diskon Member (-Rp 10.000)" },
    LANTAIATAS: { discount: 15000, label: "Voucher Studio (-Rp 15.000)" },
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (validPromos[code]) {
      setAppliedPromo({ code, ...validPromos[code] });
      setPromoError("");
    } else {
      setPromoError("Kode promo tidak valid! (Coba: STUDIO2026 atau DISKON10)");
      setAppliedPromo(null);
    }
  };

  /* ── helpers ───────────────────────────────────────────── */
  const formatDate = (d) => {
    if (!d) return "-";
    if (typeof d === "object" && d !== null) {
      return d.full || d.iso || "-";
    }
    return String(d);
  };

  const slotLabel = selectedSlot ? selectedSlot : "-";

  const basePrice = selectedStudio?.priceMin || 85000;
  const equipmentFee = 5000;
  const serviceFee = 3000;
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const total = Math.max(0, basePrice + equipmentFee + serviceFee - discountAmount);
  const fmt = (n) => (Number(n) || 0).toLocaleString("id-ID");

  /* ── render ────────────────────────────────────────────── */
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ─── LEFT Column ──────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Payment methods card */}
          <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-6 md:p-8 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-amber-400/20 flex items-center justify-center">
                <Wallet size={20} className="text-accent dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-dark-brown dark:text-white">
                Metode Pembayaran
              </h2>
            </div>

            {/* Method cards */}
            <div className="grid grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => onPaymentMethodChange(method.id)}
                  className={`rounded-xl p-4 text-center cursor-pointer transition ${
                    paymentMethod === method.id
                      ? "border-2 border-accent dark:border-amber-400 bg-accent/10 dark:bg-amber-400/10 font-bold"
                      : "border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-accent dark:hover:border-amber-400"
                  }`}
                >
                  <span className="text-3xl block mb-2">{method.icon}</span>
                  <span className="text-sm font-medium text-dark-brown dark:text-gray-200">
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Voucher & Promo Code Section */}
          <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={18} className="text-accent dark:text-amber-400" />
              <h3 className="font-bold text-dark-brown dark:text-white text-base">Gunakan Kode Promo / Voucher</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan Kode (e.g. STUDIO2026)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-accent/30 dark:focus:ring-amber-400/30"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="bg-accent dark:bg-amber-500 text-white dark:text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-accent-dark dark:hover:bg-amber-400 transition cursor-pointer shadow-sm"
              >
                Gunakan
              </button>
            </div>
            {appliedPromo && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 size={16} /> Kode "{appliedPromo.code}" Berhasil Dipasang: {appliedPromo.label}
              </div>
            )}
            {promoError && (
              <p className="mt-2 text-xs text-red-500 dark:text-red-400 font-medium">{promoError}</p>
            )}
          </div>

          {/* Payment instructions */}
          <div className="border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 bg-amber-50 dark:bg-amber-950/30">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                <Info size={14} className="text-white" />
              </div>
              <h3 className="font-semibold text-dark-brown dark:text-amber-200 text-sm">
                Instruksi Pembayaran
              </h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-warm-gray dark:text-gray-300 leading-relaxed ml-10">
              {paymentInstructions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* ─── RIGHT Column: Ringkasan Pesanan ──────────── */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold text-dark-brown dark:text-white mb-5">
              Ringkasan Pesanan
            </h2>

            {/* Studio card mini */}
            <div className="flex items-center gap-4 mb-5">
              <img
                src={selectedStudio?.image || "/images/studio-hero.png"}
                alt={selectedStudio?.name || "Studio"}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-dark-brown dark:text-white text-sm">
                  {selectedStudio?.name || "Studio 1"}
                </p>
                <p className="text-xs text-warm-gray-light dark:text-gray-400 mt-0.5">
                  {formatDate(selectedDate)}
                </p>
                <p className="text-xs font-semibold text-accent dark:text-amber-400 mt-0.5">
                  {slotLabel}
                </p>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-slate-800 mb-4" />

            {/* Price breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-warm-gray dark:text-gray-400">Harga Sewa (2 Jam)</span>
                <span className="text-dark-brown dark:text-gray-200 font-medium">
                  Rp {fmt(basePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-gray dark:text-gray-400">Peralatan Tambahan</span>
                <span className="text-dark-brown dark:text-gray-200 font-medium">
                  Rp {fmt(equipmentFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-gray dark:text-gray-400">Biaya Layanan</span>
                <span className="text-dark-brown dark:text-gray-200 font-medium">
                  Rp {fmt(serviceFee)}
                </span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Diskon Promo ({appliedPromo.code})</span>
                  <span>- Rp {fmt(appliedPromo.discount)}</span>
                </div>
              )}
            </div>

            <hr className="border-gray-200 dark:border-slate-800 my-4" />

            {/* Total */}
            <div className="flex items-center justify-between mb-5">
              <span className="font-semibold text-dark-brown dark:text-gray-200">
                Total Pembayaran
              </span>
              <span className="text-xl font-bold text-accent dark:text-amber-400">
                Rp {fmt(total)}
              </span>
            </div>

            {/* Ref ID badge */}
            <div className="bg-gray-100 dark:bg-slate-800 rounded-lg px-4 py-2 mb-5">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                REF ID: BK-TXN-2026-001 &bull; RELATION 1:1 BOOKING/TXN
              </p>
            </div>

            {/* Confirm button */}
            <button
              onClick={onConfirm}
              className="bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 w-full rounded-xl py-3.5 font-bold text-base flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              Konfirmasi &amp; Bayar
              <ArrowRight size={16} />
            </button>

            {/* Security badge */}
            <p className="text-xs text-warm-gray-light dark:text-gray-400 text-center flex items-center justify-center gap-1 mt-3">
              <Lock size={12} /> Pembayaran Aman &amp; Terenkripsi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
