import { useState } from "react";
import api from "../../utils/axiosConfig";
import { X, CheckCircle, PartyPopper, Lock } from "lucide-react";
import { studios } from "../../data/booking";
import Stepper from "./Stepper";
import StepStudio from "./StepStudio";
import StepJadwal from "./StepJadwal";
import StepKontak from "./StepKontak";
import StepBayar from "./StepBayar";
import Footer from "../Footer";
import LoginModal from "../LoginModal";

const STEP_LABELS = [
  "Pilih Studio",
  "Pilih Jadwal",
  "Kontak & Detail",
  "Pembayaran",
];

export default function BookingFlow({ onClose }) {
  /* ── state ─────────────────────────────────────────────── */
  const [currentStep, setCurrentStep] = useState(1);
  const [showLoginNotice, setShowLoginNotice] = useState(() => !localStorage.getItem("token") && !localStorage.getItem("auth_token"));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [contactData, setContactData] = useState(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        return {
          name: u.name || u.username || "",
          phone: u.phone || u.whatsapp || "081234567890",
          email: u.email || "",
          notes: "",
          agreed: true,
          isAutoFilled: true
        };
      } catch (e) {}
    }
    return { name: "", phone: "", email: "", notes: "", agreed: false, isAutoFilled: false };
  });
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [errors, setErrors] = useState({});
  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ── handlers ──────────────────────────────────────────── */

  const handleStudioSelect = (studio) => {
    setSelectedStudio(studio);
    setCurrentStep(2);
  };

  const handleJadwalNext = () => {
    setCurrentStep(3);
  };

  const handleKontakNext = () => {
    const newErrors = {};
    if (!contactData.name.trim()) newErrors.name = "Nama lengkap wajib diisi.";
    if (!contactData.phone.trim())
      newErrors.phone = "Nomor WhatsApp wajib diisi.";
    if (!contactData.email.trim())
      newErrors.email = "Alamat email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(contactData.email))
      newErrors.email = "Format email tidak valid.";
    if (!contactData.agreed)
      newErrors.agreed = "Anda harus menyetujui syarat & ketentuan.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setCurrentStep(4);
    }
  };

  const [bookingError, setBookingError] = useState("");

  const handleConfirm = async () => {
    setBookingError("");
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      if (!token) {
        setShowLoginNotice(true);
        return;
      }
      
      const startTime = selectedSlot.split(" - ")[0];
      const endTime = selectedSlot.split(" - ")[1];
      const totalPrice = selectedStudio?.priceMin || 75000;
      
      const todayIso = new Date().toISOString().split("T")[0];
      const formattedDate = typeof selectedDate === "string" && selectedDate.includes("-") 
        ? selectedDate 
        : (selectedDate?.iso || todayIso);

      const studioId = (selectedStudio?.id && selectedStudio.id <= 3) ? selectedStudio.id : 1;

      await api.post("/bookings", {
        studio_id: studioId,
        booking_date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        total_price: totalPrice,
        customer_name: contactData.name || "",
        customer_phone: contactData.phone || "",
        customer_email: contactData.email || "",
      });
      
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.data?.message === "Unauthenticated.") {
        setBookingError("Sesi login Anda telah berakhir. Silakan login ulang untuk melanjutkan booking.");
      } else if (err.response?.data?.errors) {
        setBookingError("Gagal: " + JSON.stringify(err.response.data.errors));
      } else {
        setBookingError("Gagal membuat booking: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (onClose) {
      onClose();
    }
  };

  const handleContactChange = (field, value) => {
    setContactData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleStepClick = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleCancel = () => {
    setShowCancel(true);
  };

  const confirmCancel = () => {
    setShowCancel(false);
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  /* ── render step content ───────────────────────────────── */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepStudio studios={studios} onSelect={handleStudioSelect} />
        );
      case 2:
        return (
          <StepJadwal
            selectedStudio={selectedStudio}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            selectedSlot={selectedSlot}
            onSlotSelect={setSelectedSlot}
            onNext={handleJadwalNext}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <StepKontak
            contactData={contactData}
            onChange={handleContactChange}
            selectedStudio={selectedStudio}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onNext={handleKontakNext}
            onBack={() => setCurrentStep(2)}
            errors={errors}
          />
        );
      case 4:
        return (
          <StepBayar
            selectedStudio={selectedStudio}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            contactData={contactData}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onConfirm={handleConfirm}
          />
        );
      default:
        return null;
    }
  };

  /* ── layout ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* ─── Simplified Navbar ──────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-brand font-bold text-lg tracking-tight">
            Studio Musik Lantai Atas
          </span>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-red-500 transition cursor-pointer"
          >
            <X size={16} />
            Batalkan
          </button>
        </div>
      </header>

      {/* Error Notification Banner */}
      {bookingError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-center text-red-700 text-sm font-semibold flex items-center justify-center gap-2">
          <span>⚠️ {bookingError}</span>
          <button onClick={() => setBookingError("")} className="text-xs text-red-500 underline ml-2 cursor-pointer">Tutup</button>
        </div>
      )}

      {/* ─── Stepper ────────────────────────────────────── */}
      <Stepper
        steps={STEP_LABELS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* ─── Main Content ───────────────────────────────── */}
      <main className="flex-1">{renderStep()}</main>

      {/* ─── Footer ─────────────────────────────────────── */}
      <Footer />

      {/* ─── Cancel Confirm Dialog ──────────────────────── */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 mx-auto mb-4 flex items-center justify-center">
              <X size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-dark-brown mb-2">
              Batalkan Booking?
            </h3>
            <p className="text-sm text-warm-gray mb-6 leading-relaxed">
              Semua data yang sudah diisi akan hilang. Apakah Anda yakin ingin
              membatalkan proses booking?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-warm-gray hover:bg-gray-50 transition cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium transition cursor-pointer"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Success Popup ────────────────────────────── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          {/* Decorative floating notes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {['🎵', '🎶', '🎸', '🥁', '🎤', '🎹'].map((emoji, i) => (
              <span
                key={i}
                className="absolute text-2xl animate-bounce opacity-60"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${20 + (i % 3) * 20}%`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: `${1500 + i * 300}ms`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden animate-slide-up">
            {/* Top gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-amber to-accent" />

            {/* Success icon */}
            <div className="relative mx-auto mb-5">
              <div className="w-20 h-20 rounded-full bg-green-50 mx-auto flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
              </div>
              {/* Small sparkles */}
              <span className="absolute -top-1 -right-1 text-lg animate-ping">✨</span>
              <span className="absolute -bottom-1 -left-1 text-sm animate-pulse">🎉</span>
            </div>

            <h3 className="text-2xl font-bold text-dark-brown mb-2">
              Booking Berhasil! 🎉
            </h3>
            <p className="text-warm-gray text-sm leading-relaxed mb-2">
              Terima kasih telah melakukan reservasi di Studio Musik Lantai Atas.
            </p>
            <p className="text-warm-gray text-sm leading-relaxed mb-6">
              Detail booking dan instruksi pembayaran telah dikirim ke email Anda.
              Silakan lakukan pembayaran sebelum batas waktu yang ditentukan.
            </p>

            {/* Booking reference */}
            <div className="bg-cream rounded-xl px-4 py-3 mb-6">
              <p className="text-xs text-warm-gray-light mb-1">Referensi Booking</p>
              <p className="text-lg font-bold text-accent tracking-wider">BK-TXN-2024-001</p>
            </div>

            {/* Action button */}
            <button
              onClick={handleSuccessClose}
              className="w-full bg-accent hover:bg-accent-dark text-white rounded-xl py-3.5 font-semibold text-base transition-all cursor-pointer hover:shadow-lg hover:shadow-accent/30 active:scale-95"
            >
              Kembali ke Beranda
            </button>

            <p className="text-xs text-warm-gray-light mt-4">
              📞 Butuh bantuan? Hubungi kami di 0812-3456-7890
            </p>
          </div>
        </div>
      )}

      {/* ─── Centered Login Required Modal ──────────────────────── */}
      {showLoginNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center relative overflow-hidden border border-amber-200">
            {/* Top Warning Strip */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-accent to-amber-400" />
            
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto mb-4 flex items-center justify-center shadow-inner">
              <Lock size={32} />
            </div>

            <h3 className="text-xl font-bold text-dark-brown mb-2">
              Silakan Login Terlebih Dahulu
            </h3>

            <p className="text-sm text-warm-gray mb-6 leading-relaxed">
              Untuk melakukan pemesanan studio dan menyimpan riwayat pemesanan Anda, silakan masuk ke akun Anda terlebih dahulu.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowLoginNotice(false);
                  setShowLoginModal(true);
                }}
                className="w-full bg-accent hover:bg-accent-dark text-white rounded-xl py-3 font-semibold text-sm transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
              >
                Masuk / Login Akun
              </button>
              <button
                onClick={() => setShowLoginNotice(false)}
                className="w-full border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-warm-gray hover:bg-gray-50 transition cursor-pointer"
              >
                Lanjut Lihat-Lihat Dulu
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          setShowLoginNotice(false);
        }}
      />
    </div>
  );
}
