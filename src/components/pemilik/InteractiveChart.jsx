import { useState } from "react";
import { TrendingUp, BarChart2, LineChart, Info } from "lucide-react";

export default function InteractiveChart() {
  const [chartType, setChartType] = useState("area");
  const [activeHover, setActiveHover] = useState(null);

  const chartData = [
    { month: "Jan", revenue: 42.5, lastYear: 31.0, bookings: 120 },
    { month: "Feb", revenue: 48.0, lastYear: 35.5, bookings: 142 },
    { month: "Mar", revenue: 45.2, lastYear: 33.0, bookings: 135 },
    { month: "Apr", revenue: 58.6, lastYear: 41.2, bookings: 178 },
    { month: "Mei", revenue: 64.0, lastYear: 46.0, bookings: 195 },
    { month: "Jun", revenue: 60.5, lastYear: 44.0, bookings: 184 },
    { month: "Jul", revenue: 72.8, lastYear: 50.5, bookings: 215 },
  ];

  const maxVal = 80;

  const getSvgPoints = (key) => {
    const width = 500;
    const height = 160;
    const padding = 20;
    const step = (width - padding * 2) / (chartData.length - 1);

    const points = chartData.map((d, i) => {
      const x = padding + i * step;
      const y = height - padding - (d[key] / maxVal) * (height - padding * 2);
      return { x, y, data: d };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX = (curr.x + next.x) / 2;
      pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${160 - 20} L ${points[0].x} ${160 - 20} Z`;

    return { pathD, areaD, points };
  };

  const currentPoints = getSvgPoints("revenue");
  const lastYearPoints = getSvgPoints("lastYear");

  return (
    <div className="border rounded-2xl bg-white p-5 shadow-xs transition-all duration-300">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-dark-brown text-base">Tren Pendapatan Bulanan 2026</h2>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp size={12} /> +18.4% YoY
            </span>
          </div>
          <p className="text-xs text-warm-gray mt-0.5">Arahkan kursor pada titik data untuk detail nominal</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Chart Type Toggle */}
          <div className="flex bg-cream p-1 rounded-xl border border-cream-dark/50 text-xs">
            <button
              onClick={() => setChartType("area")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                chartType === "area" ? "bg-accent text-white shadow-xs" : "text-warm-gray hover:text-dark-brown"
              }`}
            >
              <LineChart size={14} /> Kurva
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                chartType === "bar" ? "bg-accent text-white shadow-xs" : "text-warm-gray hover:text-dark-brown"
              }`}
            >
              <BarChart2 size={14} /> Batang
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-dark-brown">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" /> 2026
            </span>
            <span className="flex items-center gap-1.5 text-warm-gray">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> 2025
            </span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Area */}
      {chartType === "area" ? (
        <div className="relative w-full h-52">
          <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B6914" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8B6914" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Lines */}
            {[40, 80, 120].map((y, idx) => (
              <line key={idx} x1="20" y1={y} x2="480" y2={y} stroke="#f3f4f6" strokeDasharray="4 4" strokeWidth="1" />
            ))}

            {/* Last Year Area & Line */}
            <path d={lastYearPoints.pathD} fill="none" stroke="#d1d5db" strokeWidth="2" strokeDasharray="3 3" />

            {/* Current Year Area & Line */}
            <path d={currentPoints.areaD} fill="url(#revenueGrad)" />
            <path d={currentPoints.pathD} fill="none" stroke="#8B6914" strokeWidth="3" className="transition-all duration-300" />

            {/* Interactive Points */}
            {currentPoints.points.map((pt, i) => (
              <g key={i} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activeHover?.month === pt.data.month ? "6" : "4"}
                  className={`transition-all duration-200 ${
                    activeHover?.month === pt.data.month ? "fill-accent stroke-white stroke-[3px]" : "fill-white stroke-accent stroke-2 hover:r-6"
                  }`}
                  onMouseEnter={() => setActiveHover(pt.data)}
                />
              </g>
            ))}
          </svg>

          {/* Month Labels Axis */}
          <div className="flex justify-between px-4 mt-2 text-xs font-semibold text-warm-gray">
            {chartData.map((d) => (
              <span
                key={d.month}
                onMouseEnter={() => setActiveHover(d)}
                className={`cursor-pointer transition ${activeHover?.month === d.month ? "text-accent font-bold scale-110" : "hover:text-dark-brown"}`}
              >
                {d.month}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* Animated Bar Chart View */
        <div className="h-52 flex items-end gap-3 pt-6 border-b border-gray-100">
          {chartData.map((d) => (
            <div
              key={d.month}
              onMouseEnter={() => setActiveHover(d)}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
            >
              <div className="w-full flex gap-1 items-end justify-center h-36 relative">
                {/* Last Year Bar */}
                <div
                  className="w-2.5 bg-gray-200 rounded-t transition-all duration-300 group-hover:bg-gray-300"
                  style={{ height: `${(d.lastYear / maxVal) * 100}%` }}
                />
                {/* Current Year Bar */}
                <div
                  className={`w-3.5 rounded-t transition-all duration-300 ${
                    activeHover?.month === d.month ? "bg-accent-dark shadow-md scale-y-105" : "bg-accent group-hover:bg-accent-dark"
                  }`}
                  style={{ height: `${(d.revenue / maxVal) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-semibold transition ${activeHover?.month === d.month ? "text-accent font-bold" : "text-warm-gray"}`}>
                {d.month}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Tooltip Card Footer */}
      <div className="mt-4 p-3 rounded-xl bg-amber-50/60 border border-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-dark-brown font-semibold">
          <Info size={16} className="text-accent" />
          <span>
            {activeHover
              ? `Bulan ${activeHover.month} 2026: Pendapatan Rp ${activeHover.revenue} Juta (${activeHover.bookings} Reservasi)`
              : "Sorot grafik untuk melihat rincian angka bulanan secara mendalam."}
          </span>
        </div>
        {activeHover && (
          <div className="flex gap-3 text-[11px]">
            <span className="text-emerald-700 font-bold">
              Pertumbuhan: +{((activeHover.revenue - activeHover.lastYear) / activeHover.lastYear * 100).toFixed(1)}% vs 2025
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
