"use client";

import { useDashboard } from "@/context/DashboardContext";
import {
  kpiData, groupEngagement, divisionData, riskZones, excellenceZones,
  getKpiForYear, BENCHMARK,
} from "@/lib/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList, ReferenceLine, PieChart, Pie, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, AlertTriangle,
  CheckCircle2, Activity, Star, Flame, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";

// ── Gauge Component ───────────────────────────────────────────

function GaugeChart({ value, max = 100, color = "#FF5200" }: { value: number; max?: number; color?: string }) {
  const pct = value / max;
  const radius = 54;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;          // half-circle arc
  const offset = circumference * (1 - pct);
  const cx = 70, cy = 68;

  const getZoneColor = (v: number) =>
    v >= 75 ? "#16A34A" : v >= 65 ? "#FF5200" : "#DC2626";
  const zoneColor = getZoneColor(value);

  return (
    <div className="flex flex-col items-center">
      <svg width={140} height={80} viewBox="0 0 140 80">
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none" stroke="#EEF2F7" strokeWidth={strokeWidth} strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none" stroke={zoneColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
        />
        {/* Benchmark tick */}
        <text x={cx - radius + (BENCHMARK.engagementIndex.mid / max) * circumference * 0.92} y={cy + 18}
              fontSize={8} fill="#94A3B8" textAnchor="middle">
          {BENCHMARK.engagementIndex.mid}
        </text>
        {/* Value */}
        <text x={cx} y={cy - 6} fontSize={22} fontWeight={800} fill={zoneColor} textAnchor="middle"
              style={{ fontFamily: "Inter, sans-serif" }}>
          {value}
        </text>
        <text x={cx} y={cy + 10} fontSize={9} fill="#94A3B8" textAnchor="middle">/ 100</text>
      </svg>
      <div className="flex gap-3 text-[10px] mt-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>{"<65"}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"/>65–74</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block"/>{"≥75"}</span>
      </div>
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const w = 56, h = 24, pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── KPI Card ─────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  delta: number;
  deltaLabel: string;
  icon: React.ReactNode;
  invertDelta?: boolean;
  sparkData?: number[];
  accentColor?: string;
  isGauge?: boolean;
  gaugeValue?: number;
  benchmark?: string;
}

function KpiCard({
  label, value, delta, deltaLabel, icon, invertDelta = false,
  sparkData, accentColor = "#FF5200", isGauge = false, gaugeValue, benchmark,
}: KpiCardProps) {
  const isPositive = invertDelta ? delta < 0 : delta > 0;
  const isNeutral  = delta === 0;

  const deltaColor = isPositive ? "#16A34A" : isNeutral ? "#94A3B8" : "#DC2626";
  const deltaBg    = isPositive ? "#DCFCE7" : isNeutral ? "#F1F5F9" : "#FEE2E2";
  const DeltaIcon  = isPositive ? ArrowUpRight : isNeutral ? Minus : ArrowDownRight;

  return (
    <div className="card p-5 flex flex-col gap-3 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <span className="p-2 rounded-lg" style={{ background: `${accentColor}18`, color: accentColor }}>
          {icon}
        </span>
      </div>

      {isGauge && gaugeValue !== undefined ? (
        <GaugeChart value={gaugeValue} />
      ) : (
        <div className="text-[28px] font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {value}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full"
             style={{ background: deltaBg, color: deltaColor }}>
          <DeltaIcon size={11} strokeWidth={2.5} />
          {delta > 0 ? "+" : ""}{deltaLabel} vs 2025
        </div>
        {sparkData && <Sparkline data={sparkData} color={accentColor} />}
      </div>

      {benchmark && (
        <div className="text-[10px] pt-1 border-t" style={{ color: "var(--text-muted)", borderColor: "var(--ghn-border)" }}>
          🏭 {benchmark}
        </div>
      )}
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl"
           style={{ border: "1px solid rgba(255,255,255,.1)" }}>
        <p className="font-semibold mb-1.5 text-slate-200">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-slate-300">{p.name}:</span>
            <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Zone Card ─────────────────────────────────────────────────

function ZoneCard({ zone, type }: { zone: typeof riskZones[0]; type: "risk" | "excellence" }) {
  const isRisk = type === "risk";
  return (
    <div className={`rounded-xl p-4 border ${isRisk ? "border-red-100 bg-red-50" : "border-green-100 bg-green-50"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-[13px] font-bold ${isRisk ? "text-red-700" : "text-green-700"}`}>{zone.dept}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{zone.khoi}</p>
        </div>
        {isRisk ? <Flame size={16} className="text-red-500 mt-0.5 shrink-0" />
                : <Star  size={16} className="text-yellow-500 mt-0.5 shrink-0" />}
      </div>
      <div className="mt-3 flex gap-4">
        {[
          { label: "EI Score", val: `${zone.engagementIndex}` },
          { label: "eNPS",     val: `${zone.eNPS > 0 ? "+" : ""}${zone.eNPS}` },
          { label: "Attrition",val: `${zone.attrition}%` },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className={`text-[15px] font-bold ${isRisk ? "text-red-600" : "text-green-600"}`}>{val}</p>
          </div>
        ))}
      </div>
      {isRisk && zone.pillarWeakest && (
        <div className="mt-2 text-[11px] text-red-500 font-semibold bg-red-100 rounded-lg px-2 py-1">
          ⚠ Điểm yếu: {zone.pillarWeakest}
        </div>
      )}
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────

const GHN_ORANGE = "#FF5200";
const GHN_NAVY   = "#006FAD";

export default function TabTongQuan() {
  const { filters } = useDashboard();
  const curKpi  = getKpiForYear(filters.year)!;
  const prevKpi = getKpiForYear(filters.year === 2026 ? 2025 : 2026)!;

  const EI_DELTA   = curKpi.engagementIndex - prevKpi.engagementIndex;
  const ENPS_DELTA = curKpi.eNPS - prevKpi.eNPS;
  const ATTR_DELTA = curKpi.attritionRisk - prevKpi.attritionRisk;
  const RR_DELTA   = curKpi.responseRate - prevKpi.responseRate;

  // Chart data
  const groupData = groupEngagement.map((g) => ({
    name: g.group,
    "EI Score": filters.year === 2026 ? g.ei2026 : g.ei2025,
    eNPS:       filters.year === 2026 ? g.eNPS2026 : g.eNPS2025,
  }));

  const divData = [...divisionData]
    .filter((d) => !filters.khoi || d.khoiId === filters.khoi)
    .map((d) => ({
      name: d.khoiLabel.replace("Khối ", ""),
      eNPS: filters.year === 2026 ? d.eNPS2026 : d.eNPS2025,
      ei:   filters.year === 2026 ? d.ei2026   : d.ei2025,
    }))
    .sort((a, b) => b.eNPS - a.eNPS);

  const ENPS_COLORS = divData.map((d) =>
    d.eNPS >= 30 ? "#16A34A" : d.eNPS >= 10 ? "#D97706" : d.eNPS >= 0 ? "#FF5200" : "#DC2626"
  );

  // Engagement segment donut
  const segmentData = [
    { name: "Engaged",    value: 41, fill: "#16A34A" },
    { name: "Passive",    value: 44, fill: "#D97706" },
    { name: "Disengaged", value: 15, fill: "#DC2626" },
  ];

  return (
    <div className="space-y-5 stagger-children">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Engagement Index"
          value={curKpi.engagementIndex}
          delta={EI_DELTA}
          deltaLabel={`${Math.abs(EI_DELTA)} điểm`}
          icon={<Activity size={16} />}
          isGauge
          gaugeValue={curKpi.engagementIndex}
          sparkData={[62, 64, 65, 68, 71, curKpi.engagementIndex]}
          benchmark={BENCHMARK.engagementIndex.label}
        />
        <KpiCard
          label="eNPS (Employee NPS)"
          value={`${curKpi.eNPS > 0 ? "+" : ""}${curKpi.eNPS}`}
          delta={ENPS_DELTA}
          deltaLabel={`${Math.abs(ENPS_DELTA)} điểm`}
          icon={<Users size={16} />}
          sparkData={[5, 8, 10, 12, 18, curKpi.eNPS]}
          accentColor="#006FAD"
          benchmark={BENCHMARK.eNPS.label}
        />
        <KpiCard
          label="Rủi ro Nghỉ việc"
          value={`${curKpi.attritionRisk}%`}
          delta={ATTR_DELTA}
          deltaLabel={`${Math.abs(ATTR_DELTA)}%`}
          icon={<AlertTriangle size={16} />}
          invertDelta
          sparkData={[28, 26, 24, 22, 19, curKpi.attritionRisk]}
          accentColor="#DC2626"
          benchmark={BENCHMARK.attritionRisk.label}
        />
        <KpiCard
          label="Tỷ lệ Phản hồi"
          value={`${curKpi.responseRate}%`}
          delta={RR_DELTA}
          deltaLabel={`${Math.abs(RR_DELTA)}%`}
          icon={<CheckCircle2 size={16} />}
          sparkData={[68, 70, 72, 74, 77, curKpi.responseRate]}
          accentColor="#0EA5E9"
          benchmark={BENCHMARK.responseRate.label}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Engagement Index by Nhóm */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title">Engagement Index theo Nhóm Nhân viên</h3>
          <p className="section-sub mb-4">Năm {filters.year} · Thang điểm 0–100 · Đường đứt là benchmark thị trường</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={groupData} barSize={38} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={BENCHMARK.engagementIndex.mid} stroke="#94A3B8"
                strokeDasharray="5 4" strokeWidth={1.5}
                label={{ value: `Benchmark ${BENCHMARK.engagementIndex.mid}`, position: "right", fontSize: 9, fill: "#94A3B8" }} />
              <Bar dataKey="EI Score" radius={[6, 6, 0, 0]}>
                {groupData.map((entry, i) => (
                  <Cell key={i}
                    fill={entry["EI Score"] >= 75 ? GHN_NAVY : entry["EI Score"] >= 65 ? GHN_ORANGE : "#DC2626"} />
                ))}
                <LabelList dataKey="EI Score" position="top"
                  style={{ fontSize: 11, fontWeight: 700, fill: "#1E293B" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 flex-wrap">
            {[
              { color: GHN_NAVY,    label: "Xuất sắc (≥75)" },
              { color: GHN_ORANGE,  label: "Đạt (65–74)" },
              { color: "#DC2626",   label: "Cần chú ý (<65)" },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Engagement Segments Donut */}
        <div className="card p-5">
          <h3 className="section-title">Phân loại Engagement</h3>
          <p className="section-sub mb-2">Năm {filters.year} · % nhân viên</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={segmentData} cx="50%" cy="50%" innerRadius={52} outerRadius={76}
                dataKey="value" paddingAngle={3} strokeWidth={0}>
                {segmentData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {segmentData.map(({ name, value, fill }) => (
              <div key={name} className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: fill }} />
                  <span style={{ color: "var(--text-secondary)" }}>{name}</span>
                </span>
                <span className="font-bold" style={{ color: fill }}>{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── eNPS by Khối ── */}
      <div className="card p-5">
        <h3 className="section-title">eNPS xếp hạng theo Khối</h3>
        <p className="section-sub mb-4">Năm {filters.year} · Thang điểm -100 → +100 · Benchmark: +18</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={divData} layout="vertical" barSize={20}
                    margin={{ top: 4, right: 48, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[-20, 70]} tick={{ fontSize: 11, fill: "#94A3B8" }}
                   axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }}
                   axisLine={false} tickLine={false} width={88} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={BENCHMARK.eNPS.mid} stroke="#94A3B8" strokeDasharray="5 4" strokeWidth={1.5}
              label={{ value: "Benchmark", position: "top", fontSize: 9, fill: "#94A3B8" }} />
            <Bar dataKey="eNPS" radius={[0, 6, 6, 0]}>
              {divData.map((_, i) => <Cell key={i} fill={ENPS_COLORS[i]} />)}
              <LabelList dataKey="eNPS" position="right"
                style={{ fontSize: 11, fontWeight: 700, fill: "#1E293B" }}
                formatter={(v: number) => v > 0 ? `+${v}` : v} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Risk & Excellence ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-red-500" />
            <h3 className="section-title">🔴 Top 3 Vùng rủi ro cao nhất</h3>
          </div>
          <div className="space-y-3">
            {riskZones.map((zone, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1"><ZoneCard zone={zone} type="risk" /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-green-500" />
            <h3 className="section-title">🌟 Top 3 Vùng xuất sắc – Điểm sáng</h3>
          </div>
          <div className="space-y-3">
            {excellenceZones.map((zone, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1"><ZoneCard zone={zone} type="excellence" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
