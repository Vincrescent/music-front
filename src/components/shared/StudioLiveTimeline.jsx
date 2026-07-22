import { useState } from "react";
import { Clock, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function StudioLiveTimeline() {
  const [selectedStudio, setSelectedStudio] = useState("Studio A");

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", 
    "20:00", "21:00", "22:00", "23:00"
  ];

  const studiosData = {
    "Studio A": [
      { time: "09:00 - 11:00", status: "booked", customer: "Band Rocker", genre: "Rock" },
      { time: "14:00 - 16:00", status: "booked", customer: "Vincent", genre: "Pop" },
      { time: "19:00 - 21:00", status: "booked", customer: "Jazz Ensemble", genre: "Jazz" },
    ],
    "Studio B": [
      { time: "10:00 - 12:00", status: "booked", customer: "Bakti wibu", genre: "Anime Cover" },
      { time: "16:00 - 18:00", status: "booked", customer: "Indie Project", genre: "Indie" },
    ],
    "Studio C": [
      { time: "13:00 - 15:00", status: "booked", customer: "Acoustic Duo", genre: "Acoustic" },
      { time: "20:00 - 22:00", status: "booked", customer: "Metalcore Squad", genre: "Metal" },
    ]
  };

  const isSlotBooked = (studio, time) => {
    const sessions = studiosData[studio] || [];
    const hour = parseInt(time.split(":")[0]);
    return sessions.find(s => {
      const start = parseInt(s.time.split(":")[0]);
      const end = parseInt(s.time.split(" - ")[1].split(":")[0]);
      return hour >= start && hour < end;
    });
  };

  return (
    <div className="border rounded-2xl bg-white p-5 shadow-xs transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-dark-brown text-base">Timeline Sesi Studio Live (Hari Ini)</h2>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={12} /> Live Monitoring
            </span>
          </div>
          <p className="text-xs text-warm-gray mt-0.5">Pantau ketersediaan jam latihan di seluruh studio secara real-time</p>
        </div>

        {/* Studio Selector Tabs */}
        <div className="flex bg-cream p-1 rounded-xl border border-cream-dark/50 text-xs">
          {["Studio A", "Studio B", "Studio C"].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStudio(s)}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                selectedStudio === s ? "bg-accent text-white shadow-xs" : "text-warm-gray hover:text-dark-brown"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Timeline Matrix */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[650px]">
          <div className="grid grid-cols-8 gap-2">
            {timeSlots.map((slot) => {
              const bookedSession = isSlotBooked(selectedStudio, slot);
              return (
                <div
                  key={slot}
                  className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                    bookedSession
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-900 shadow-xs"
                      : "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 hover:border-emerald-500/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold mb-1">
                    <Clock size={12} className={bookedSession ? "text-amber-600" : "text-emerald-600"} />
                    {slot}
                  </div>
                  {bookedSession ? (
                    <div>
                      <span className="inline-block text-[9px] font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded uppercase">
                        TERISI
                      </span>
                      <p className="text-[10px] font-semibold truncate mt-1">{bookedSession.customer}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="inline-block text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">
                        KOSONG
                      </span>
                      <p className="text-[10px] text-warm-gray mt-1">Siap Sewa</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-gray-100 text-warm-gray">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" /> Slot Kosong (Siap Booking)
          </span>
          <span className="flex items-center gap-1.5">
            <AlertCircle size={14} className="text-amber-500" /> Slot Terisi (Sesi Berjalan)
          </span>
        </div>
        <span className="text-[11px] italic">Update otomatis tiap transaksi baru</span>
      </div>
    </div>
  );
}
