import { useState } from "react";
import { timeSlots } from "../../data/booking";

/* ── Inline Icons ─────────────────────────────────────────────── */
function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

/* ── Static week data ─────────────────────────────────────────── */
const weekDays = [
  { day: "SEN", date: 14, full: "Senin, 14 Okt 2024" },
  { day: "SEL", date: 15, full: "Selasa, 15 Okt 2024" },
  { day: "RAB", date: 16, full: "Rabu, 16 Okt 2024" },
  { day: "KAM", date: 17, full: "Kamis, 17 Okt 2024" },
  { day: "JUM", date: 18, full: "Jumat, 18 Okt 2024" },
  { day: "SAB", date: 19, full: "Sabtu, 19 Okt 2024" },
  { day: "MIN", date: 20, full: "Minggu, 20 Okt 2024" },
];

/* ── Calendar Component ───────────────────────────────────────── */
function WeekCalendar({ selectedDate, onDateSelect }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 md:p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-dark-brown">
          <CalendarIcon />
          <span className="font-semibold text-lg">Oktober 2024</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-cream-dark transition text-warm-gray"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-cream-dark transition text-warm-gray"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((wd) => {
          const isSelected = selectedDate === wd.date;
          return (
            <button
              key={wd.date}
              type="button"
              onClick={() => onDateSelect(wd.date)}
              className={`
                flex flex-col items-center rounded-xl p-2 md:p-3 transition-all
                ${isSelected
                  ? "border-2 border-accent text-accent bg-accent/5"
                  : "border border-gray-200 text-dark-brown hover:border-accent/40 hover:bg-cream-dark"}
              `}
            >
              <span className={`text-[10px] md:text-xs font-medium uppercase ${isSelected ? "text-accent" : "text-warm-gray"}`}>
                {wd.day}
              </span>
              <span className={`text-base md:text-lg font-bold mt-0.5 ${isSelected ? "text-accent" : ""}`}>
                {wd.date}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Time Slot Section ────────────────────────────────────────── */
function TimeSlotGroup({ groupKey, group, selectedSlot, onSlotSelect }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{group.icon}</span>
        <span className="font-semibold text-dark-brown text-sm">{group.label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.slots.map((slot) => {
          const label = `${slot.start} - ${slot.end}`;
          const isSelected = selectedSlot === label;
          const isAvailable = slot.available;

          return (
            <button
              key={label}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSlotSelect(label)}
              className={`
                rounded-lg px-4 py-2 text-sm font-medium transition-all
                ${isSelected
                  ? "bg-[#8B6914] text-white shadow-md"
                  : isAvailable
                  ? "border border-accent text-accent hover:bg-accent hover:text-white cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"}
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Legend ────────────────────────────────────────────────────── */
function SlotLegend() {
  return (
    <div className="flex items-center gap-5 mt-6 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 text-xs text-warm-gray">
        <span className="w-6 h-6 rounded-md border border-accent" />
        Tersedia
      </div>
      <div className="flex items-center gap-2 text-xs text-warm-gray">
        <span className="w-6 h-6 rounded-md bg-[#8B6914]" />
        Terpilih
      </div>
      <div className="flex items-center gap-2 text-xs text-warm-gray">
        <span className="w-6 h-6 rounded-md bg-gray-100" />
        Penuh
      </div>
    </div>
  );
}

/* ── Booking Summary Sidebar ──────────────────────────────────── */
function BookingSummary({
  selectedStudio,
  selectedDate,
  selectedSlot,
  onNext,
  onBack,
}) {
  const dateLabel = selectedDate
    ? weekDays.find((w) => w.date === selectedDate)?.full ?? "—"
    : "—";

  const estimatedPrice = selectedStudio
    ? `Rp ${selectedStudio.priceMin?.toLocaleString("id-ID") ?? "—"}`
    : "—";

  const canProceed = selectedDate && selectedSlot;

  return (
    <div className="border border-gray-200 rounded-xl p-5 md:p-6 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-accent">
          <CartIcon />
        </span>
        <h3 className="font-bold text-lg text-dark-brown">Ringkasan Booking</h3>
      </div>

      {/* Studio info */}
      {selectedStudio && (
        <div className="flex items-center gap-3 mb-4">
          <img
            src={selectedStudio.image}
            alt={selectedStudio.name}
            className="w-14 h-14 rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold text-dark-brown text-sm">
              {selectedStudio.name}
            </p>
            <p className="text-xs text-warm-gray">{selectedStudio.priceRange}/Sesi</p>
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 my-4" />

      {/* Detail rows */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-warm-gray">Tanggal</span>
          <span className="font-semibold text-dark-brown">{dateLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-warm-gray">Durasi</span>
          <span className="font-semibold text-dark-brown">2 Jam</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-warm-gray">Sesi</span>
          <span className="font-semibold text-dark-brown">
            {selectedSlot ?? "—"}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 my-4" />

      {/* Total */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-warm-gray">Total Estimasi</span>
        <span className="text-xl font-bold text-accent">{estimatedPrice}</span>
      </div>

      {/* Actions */}
      <button
        type="button"
        disabled={!canProceed}
        onClick={onNext}
        className={`
          w-full rounded-xl py-3 font-semibold text-sm transition-all
          ${canProceed
            ? "bg-accent text-white hover:bg-accent-dark shadow-md hover:shadow-lg cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"}
        `}
      >
        Lanjut ke Pembayaran
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-warm-gray
                   hover:text-accent transition py-2 cursor-pointer"
      >
        <ArrowLeftIcon />
        Kembali Pilih Studio
      </button>
    </div>
  );
}

/* ── Main StepJadwal Component ────────────────────────────────── */
export default function StepJadwal({
  selectedStudio,
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect,
  onNext,
  onBack,
}) {
  const activeDateNum =
    typeof selectedDate === "number"
      ? selectedDate
      : selectedDate instanceof Date
      ? selectedDate.getDate()
      : null;

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-dark-brown">
          Pilih Jadwal Latihan
        </h2>
        <p className="text-warm-gray mt-1">
          Tentukan tanggal dan waktu sesi latihan Anda.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Calendar + Time Slots (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <WeekCalendar
            selectedDate={activeDateNum}
            onDateSelect={onDateSelect}
          />

          {/* Time Slots */}
          <div className="border border-gray-200 rounded-xl p-5 md:p-6 bg-white space-y-5">
            <h3 className="font-bold text-dark-brown">Pilih Waktu</h3>

            {Object.entries(timeSlots).map(([key, group]) => (
              <TimeSlotGroup
                key={key}
                groupKey={key}
                group={group}
                selectedSlot={selectedSlot}
                onSlotSelect={onSlotSelect}
              />
            ))}

            <SlotLegend />
          </div>
        </div>

        {/* Right: Summary Sidebar (1 col) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <BookingSummary
              selectedStudio={selectedStudio}
              selectedDate={activeDateNum}
              selectedSlot={selectedSlot}
              onNext={onNext}
              onBack={onBack}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
