import { useState, useMemo } from "react";

/* ── Inline Icons ─────────────────────────────────────────────── */
function PersonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

/* ── Capacity filter options ──────────────────────────────────── */
const capacityOptions = [
  { label: "Semua Kapasitas", value: "" },
  { label: "1 – 5 Pax", min: 1, max: 5, value: "1-5" },
  { label: "6 – 10 Pax", min: 6, max: 10, value: "6-10" },
  { label: "11 – 20 Pax", min: 11, max: 20, value: "11-20" },
];

/* ── Feature filter options ───────────────────────────────────── */
const featureOptions = [
  { label: "Semua Fitur", value: "" },
  { label: "Full Head Cabinet", value: "Full Head Cabinet" },
  { label: "Half Backline", value: "Half Backline" },
  { label: "Rekaman", value: "Recording" },
  { label: "Akustik", value: "Acoustic" },
];

/* ── Studio Card ──────────────────────────────────────────────── */
function StudioCard({ studio, isSelected, onSelect }) {
  const isAvailable = studio.status === "Tersedia";

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => isAvailable && onSelect(studio)}
      className={`
        text-left w-full border rounded-xl overflow-hidden bg-white shadow-sm
        transition-all duration-200
        ${isAvailable ? "hover:shadow-md cursor-pointer" : "opacity-50 cursor-not-allowed"}
        ${isSelected ? "ring-2 ring-accent border-accent" : "border-gray-200"}
      `}
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={studio.image}
          alt={studio.name}
          className="w-full h-full object-cover rounded-t-xl"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + Badge */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-dark-brown">{studio.name}</h3>
          <span
            className={`text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full ${
              isAvailable
                ? "bg-peach text-brand"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {studio.status}
          </span>
        </div>

        {/* Features line */}
        <div className="flex items-center gap-3 text-sm text-warm-gray mb-1">
          <span className="flex items-center gap-1">
            <PersonIcon />
            {studio.capacity} Pax
          </span>
          <span className="flex items-center gap-1">
            <AudioIcon />
            {studio.features[0]}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-3" />

        {/* Price + Arrow */}
        <div className="flex items-center justify-between">
          <span className="text-accent font-semibold text-sm">
            {studio.priceRange}/Sesi
          </span>
          <span className={isAvailable ? "text-accent" : "text-gray-300"}>
            <ArrowRightIcon />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── StepStudio ───────────────────────────────────────────────── */
export default function StepStudio({ studios = [], selectedStudio, onSelect }) {
  const [capacityFilter, setCapacityFilter] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");

  const filteredStudios = useMemo(() => {
    return studios.filter((studio) => {
      if (capacityFilter) {
        const opt = capacityOptions.find((o) => o.value === capacityFilter);
        if (opt && (studio.capacity < opt.min || studio.capacity > opt.max)) {
          return false;
        }
      }
      if (featureFilter) {
        if (!studio.features.includes(featureFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [studios, capacityFilter, featureFilter]);

  return (
    <section className="w-full">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        {/* Title */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-dark-brown">
            Pilih Studio
          </h2>
          <p className="text-warm-gray mt-1">
            Temukan ruang yang sesuai dengan kebutuhan produksi Anda.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Capacity dropdown */}
          <div className="relative">
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-9
                         text-sm bg-white text-dark-brown focus:outline-none focus:ring-2
                         focus:ring-accent/30 focus:border-accent cursor-pointer"
            >
              {capacityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>

          {/* Feature dropdown */}
          <div className="relative">
            <select
              value={featureFilter}
              onChange={(e) => setFeatureFilter(e.target.value)}
              className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-9
                         text-sm bg-white text-dark-brown focus:outline-none focus:ring-2
                         focus:ring-accent/30 focus:border-accent cursor-pointer"
            >
              {featureOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      </div>

      {/* Studio grid */}
      {filteredStudios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudios.map((studio) => (
            <StudioCard
              key={studio.id}
              studio={studio}
              isSelected={selectedStudio?.id === studio.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-warm-gray">
          <p className="text-lg font-medium mb-1">Tidak ada studio yang cocok</p>
          <p className="text-sm">Coba ubah filter untuk melihat studio lainnya.</p>
        </div>
      )}
    </section>
  );
}
