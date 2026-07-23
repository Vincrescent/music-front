import { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import { X, Calendar, Clock, MapPin, CheckCircle, AlertCircle, RefreshCw, Plus } from "lucide-react";

export default function CustomerHistoryModal({ isOpen, onClose, onNewBooking }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await api.get("/bookings");
      if (res.data.success && Array.isArray(res.data.data)) {
        let userBookings = res.data.data;
        if (user) {
          userBookings = userBookings.filter((b) => {
            const isSameUserId = user.id && (String(b.user_id) === String(user.id) || (b.user && String(b.user.id) === String(user.id)));
            const isSameEmail = user.email && (
              (b.user && b.user.email && b.user.email.toLowerCase() === user.email.toLowerCase()) ||
              (b.customer_email && b.customer_email.toLowerCase() === user.email.toLowerCase())
            );
            const isSameName = user.name && b.customer_name && b.customer_name.toLowerCase() === user.name.toLowerCase();
            return isSameUserId || isSameEmail || isSameName;
          });
        } else {
          userBookings = [];
        }
        setBookings(userBookings);
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat booking", err);
      setError("Gagal memuat riwayat booking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserBookings();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "COMPLETED" || s === "SELESAI") {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle size={12} /> Selesai</span>;
    }
    if (s === "VALIDATED" || s === "CONFIRMED" || s === "TERVERIFIKASI") {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><CheckCircle size={12} /> Terverifikasi</span>;
    }
    if (s === "CANCELLED" || s === "DIBATALKAN") {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Dibatalkan</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><AlertCircle size={12} /> Menunggu Validasi</span>;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-cream-dark/30">
          <div>
            <h2 className="text-xl font-bold text-dark-brown flex items-center gap-2">
              <Calendar className="text-accent" size={22} />
              Riwayat Booking Saya
            </h2>
            <p className="text-xs text-warm-gray mt-0.5">Daftar pemesanan studio musik Anda terbaru</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-warm-gray hover:text-dark-brown hover:bg-cream-dark transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-warm-gray flex flex-col items-center gap-2">
              <RefreshCw className="animate-spin text-accent" size={28} />
              <p className="text-sm font-medium">Memuat data booking Anda...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500 bg-red-50 rounded-xl p-4">
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchUserBookings}
                className="mt-3 text-xs bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-warm-gray bg-cream/40 rounded-xl p-8 border border-dashed border-gray-200">
              <Calendar className="mx-auto text-warm-gray/40 mb-3" size={40} />
              <h3 className="font-bold text-dark-brown text-base">Belum Ada Riwayat Booking</h3>
              <p className="text-xs text-warm-gray mt-1 max-w-sm mx-auto">
                Anda belum pernah memesan studio. Pilih studio favorit Anda dan lakukan pemesanan sekarang!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNewBooking?.();
                }}
                className="mt-5 inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-full px-6 py-2.5 transition shadow-sm"
              >
                <Plus size={16} /> Pesan Studio Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white hover:border-accent/40 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-dark-brown text-base">
                        {item.studio ? item.studio.name : `Studio #${item.studio_id || 1}`}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-warm-gray flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-accent" />
                        {item.booking_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-accent" />
                        {item.start_time} - {item.end_time}
                      </span>
                    </div>

                    <p className="text-xs text-warm-gray-light">
                      Pemesan: <span className="font-medium text-dark-brown">{item.customer_name || item.user?.name || "Pelanggan"}</span>
                    </p>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <span className="text-xs text-warm-gray">Total Biaya</span>
                    <span className="text-lg font-bold text-accent">
                      Rp {Number(item.total_price || 85000).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onNewBooking?.();
            }}
            className="text-sm font-semibold text-accent hover:text-accent-dark flex items-center gap-1 cursor-pointer"
          >
            <Plus size={16} /> Pesan Studio Baru
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-xl text-warm-gray hover:bg-gray-100 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
