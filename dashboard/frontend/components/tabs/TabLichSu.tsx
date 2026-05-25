"use client";

import {
  pillarScoresByGroup,
  divisionData,
  eNPSWaterfall,
  PILLARS,
  companyAvgPillars,
} from "@/lib/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
  BarChart, Bar, Cell, LabelList,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Slope / Dual-Line Chart for 5 Pillars ────────────────────

function PillarTrendChart() {
  // Company average pillar trend 2025 → 2026
  const data = [
    {
      year: "2025",
      ...companyAvgPillars[2025],
    },
    {
      year: "2026",
      ...companyAvgPillars[2026],
    },
  ];

  const PILLAR_COLORS = ["#FF5200", "#006FAD", "#16A34A", "#D97706", "#7C3AED"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 40, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} />
        <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, fontSize: 12 }}
          formatter={(v: number) => v.toFixed(2)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {PILLARS.map((p, i) => (
          <Line
            key={p.id}
            type="monotone"
            dataKey={p.id}
            name={p.label}
            stroke={PILLAR_COLORS[i]}
            strokeWidth={2.5}
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 7 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Waterfall Chart for eNPS ──────────────────────────────────

function WaterfallChart() {
  // Build stacked waterfall data
  let running = 0;
  const data = eNPSWaterfall.map((item) => {
    if (item.type === "start") {
      running = item.value;
      return { name: item.name, base: 0, value: item.value, type: item.type, total: running };
    } else if (item.type === "end") {
      return { name: item.name, base: 0, value: running, type: item.type, total: running };
    } else {
      const base = item.value < 0 ? running + item.value : running;
      running += item.value;
      return { name: item.name, base, value: Math.abs(item.value), type: item.type, total: running };
    }
  });

  const getColor = (type: string) => {
    if (type === "start" || type === "end") return "#006FAD";
    if (type === "positive") return "#16A34A";
    return "#DC2626";
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barSize={44} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis
          domain={[-10, 35]}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
        <Tooltip
          contentStyle={{ borderRadius: 12, fontSize: 12 }}
          formatter={(v: any, name: string) =>
            name === "value" ? [`${v} điểm`, "Thay đổi"] : [v, name]
          }
        />
        {/* Invisible base bar */}
        <Bar dataKey="base" stackId="a" fill="transparent" radius={0} />
        {/* Visible change bar */}
        <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.type)} />
          ))}
          <LabelList
            dataKey="total"
            position="top"
            style={{ fontSize: 11, fontWeight: 700, fill: "#1e293b" }}
            formatter={(v: number) => (v > 0 ? `+${v}` : v)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── YoY Variance Table ────────────────────────────────────────

function VarianceTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Khối</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">EI 2025</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">EI 2026</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Δ EI</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">eNPS 2025</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">eNPS 2026</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Δ eNPS</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Attrition 2025</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Attrition 2026</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Δ Attrition</th>
          </tr>
        </thead>
        <tbody>
          {divisionData.map((d, i) => {
            const deltaEI = d.ei2026 - d.ei2025;
            const deltaENPS = d.eNPS2026 - d.eNPS2025;
            const deltaAttr = d.attrition2026 - d.attrition2025;
            return (
              <tr
                key={d.khoiId}
                className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
              >
                <td className="px-4 py-3 font-semibold text-slate-700 text-sm">{d.khoiLabel}</td>
                <td className="px-4 py-3 text-center text-sm text-slate-600">{d.ei2025}</td>
                <td className="px-4 py-3 text-center text-sm font-bold text-slate-800">{d.ei2026}</td>
                <td className="px-4 py-3 text-center">
                  <DeltaBadge value={deltaEI} suffix=" đ" />
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-600">{d.eNPS2025 > 0 ? "+" : ""}{d.eNPS2025}</td>
                <td className="px-4 py-3 text-center text-sm font-bold text-slate-800">{d.eNPS2026 > 0 ? "+" : ""}{d.eNPS2026}</td>
                <td className="px-4 py-3 text-center">
                  <DeltaBadge value={deltaENPS} suffix=" đ" />
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-600">{d.attrition2025}%</td>
                <td className="px-4 py-3 text-center text-sm font-bold text-slate-800">{d.attrition2026}%</td>
                <td className="px-4 py-3 text-center">
                  <DeltaBadge value={deltaAttr} suffix="%" invertColor />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DeltaBadge({
  value,
  suffix = "",
  invertColor = false,
}: {
  value: number;
  suffix?: string;
  invertColor?: boolean;
}) {
  const isGood = invertColor ? value < 0 : value > 0;
  const isNeutral = value === 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
        isNeutral
          ? "bg-slate-100 text-slate-400"
          : isGood
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-600"
      }`}
    >
      {isNeutral ? (
        <Minus size={10} />
      ) : isGood ? (
        <TrendingUp size={10} />
      ) : (
        <TrendingDown size={10} />
      )}
      {value > 0 ? "+" : ""}{value}{suffix}
    </span>
  );
}

// ── Main Tab ──────────────────────────────────────────────────

export default function TabLichSu() {
  return (
    <div className="space-y-6">
      {/* Trend Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-0.5">
          Xu hướng 5 Trụ cột – 2025 vs 2026
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Trung bình toàn công ty · Thang điểm 1–5 · Mũi tên cho thấy chiều cải thiện
        </p>
        <PillarTrendChart />

        {/* Delta Summary */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          {PILLARS.map((p) => {
            const delta =
              (companyAvgPillars[2026][p.id as keyof typeof companyAvgPillars[2026]] -
               companyAvgPillars[2025][p.id as keyof typeof companyAvgPillars[2025]]).toFixed(2);
            const isPositive = parseFloat(delta) > 0;
            return (
              <div key={p.id} className="text-center bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-500">{p.id}</p>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  {companyAvgPillars[2026][p.id as keyof typeof companyAvgPillars[2026]].toFixed(2)}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${isPositive ? "text-green-600" : "text-red-500"}`}>
                  {isPositive ? "▲" : "▼"} {Math.abs(parseFloat(delta))} vs 2025
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-0.5">
          Waterfall Bridge – eNPS 2025 → 2026
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Phân tích cầu nối từng yếu tố đóng góp vào sự thay đổi eNPS
        </p>
        <WaterfallChart />
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded bg-navy-700 inline-block" style={{ background: "#006FAD" }} />Điểm neo (Start/End)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded bg-green-600 inline-block" />Tác động tích cực
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded bg-red-500 inline-block" />Tác động tiêu cực
          </span>
        </div>
      </div>

      {/* YoY Variance Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700">
            Bảng Biến động năm-over-năm (YoY Variance) theo Khối
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            So sánh toàn diện các chỉ số EI, eNPS, Attrition Risk giữa 2025 và 2026
          </p>
        </div>
        <VarianceTable />
      </div>
    </div>
  );
}
