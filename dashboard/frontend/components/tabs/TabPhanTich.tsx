"use client";

import { useDashboard } from "@/context/DashboardContext";
import {
  pillarScoresByGroup, companyAvgPillars, divPillarScores,
  sentimentData, PILLARS, NHOM_NV, questionScores,
  demographicGeneration, demographicSeniority, demographicByKhoi,
  eNPSByGeneration,
} from "@/lib/mockData";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  PieChart, Pie, LabelList,
} from "recharts";
import { MessageSquareQuote, TrendingDown, TrendingUp, ChevronDown, ChevronRight, Users2 } from "lucide-react";
import { useState, Fragment } from "react";

// ── Custom Tooltip ────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl"
           style={{ border: "1px solid rgba(255,255,255,.1)" }}>
        <p className="font-semibold mb-1 text-slate-200">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-slate-300">{p.name}:</span>
            <strong>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Radar Chart ───────────────────────────────────────────────

function PillarRadar({ groupId, year }: { groupId: string; year: number }) {
  const groupScores = pillarScoresByGroup.find((p) => p.group === groupId && p.year === year);
  const prev        = pillarScoresByGroup.find((p) => p.group === groupId && p.year === year - 1);
  const companyAvg  = companyAvgPillars[year];

  if (!groupScores) return (
    <div className="flex items-center justify-center h-60 text-slate-400 text-sm">
      Không có dữ liệu cho nhóm này
    </div>
  );

  const data = PILLARS.map((p) => ({
    pillar: p.label,
    "Nhóm đã chọn":  groupScores[p.id as keyof typeof groupScores] as number,
    "Trung bình CT":  companyAvg[p.id as keyof typeof companyAvg],
    ...(prev ? { "Năm trước": prev[p.id as keyof typeof prev] as number } : {}),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: "#64748b" }} />
        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickCount={6} />
        <Radar name="Nhóm đã chọn" dataKey="Nhóm đã chọn"
          stroke="#FF5200" fill="#FF5200" fillOpacity={0.25} strokeWidth={2} />
        <Radar name="Trung bình CT" dataKey="Trung bình CT"
          stroke="#006FAD" fill="#006FAD" fillOpacity={0.08} strokeWidth={2} strokeDasharray="5 5" />
        {prev && (
          <Radar name="Năm trước" dataKey="Năm trước"
            stroke="#94A3B8" fill="none" strokeWidth={1.5} strokeDasharray="3 3" />
        )}
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Question Drill-down ───────────────────────────────────────

function QuestionDrilldown({ pillarId, year }: { pillarId: string; year: number }) {
  const questions = questionScores.filter((q) => q.pillar === pillarId);
  const score2025 = questions.reduce((s, q) => s + q.score2025, 0) / questions.length;
  const score2026 = questions.reduce((s, q) => s + q.score2026, 0) / questions.length;

  return (
    <div className="space-y-2 animate-fadeIn">
      {questions.map((q) => {
        const score = year === 2026 ? q.score2026 : q.score2025;
        const scoreColor = score >= 4.0 ? "#16A34A" : score >= 3.5 ? "#D97706" : "#DC2626";
        const barPct = (score / 5) * 100;
        return (
          <div key={q.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 w-8 shrink-0">{q.id}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-600 truncate" title={q.question}>{q.question}</p>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                <div className="h-full rounded-full transition-all duration-500"
                     style={{ width: `${barPct}%`, background: scoreColor }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[13px] font-bold" style={{ color: scoreColor }}>{score.toFixed(1)}</span>
              {q.delta > 0 ? (
                <TrendingUp size={11} className="text-green-500" />
              ) : (
                <TrendingDown size={11} className="text-red-400" />
              )}
            </div>
          </div>
        );
      })}
      <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px]">
        <span className="text-slate-400">Điểm trung bình trụ cột:</span>
        <span className="font-bold text-slate-700">
          {(year === 2026 ? score2026 : score2025).toFixed(2)} / 5.0
        </span>
      </div>
    </div>
  );
}

// ── Heatmap Table ─────────────────────────────────────────────

function HeatmapTable() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const getColor = (score: number) => {
    if (score >= 4.2) return "bg-green-100 text-green-800 font-bold";
    if (score >= 3.5) return "bg-amber-50 text-amber-800";
    return "bg-red-100 text-red-700 font-bold";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left px-3 py-2.5 bg-slate-50 text-slate-500 text-[11px] font-semibold rounded-tl-lg border-b border-slate-200">
              Khối
            </th>
            {PILLARS.map((p) => (
              <th key={p.id}
                  className="px-3 py-2.5 bg-slate-50 text-slate-500 text-[11px] font-semibold text-center border-b border-slate-200"
                  title={p.label}>
                {p.id}
              </th>
            ))}
            <th className="px-3 py-2.5 bg-slate-50 text-slate-500 text-[11px] font-semibold text-center border-b border-slate-200 rounded-tr-lg">
              Avg
            </th>
          </tr>
        </thead>
        <tbody>
          {divPillarScores.map((row, i) => {
            const scores = PILLARS.map((p) => row[p.id as keyof typeof row] as number);
            const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;
            const isExp  = expanded === row.khoiId;
            return (
              <Fragment key={row.khoiId}>
                <tr
                    className={`border-b border-slate-100 cursor-pointer ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-orange-50/30 transition-colors`}
                    onClick={() => setExpanded(isExp ? null : row.khoiId)}>
                  <td className="px-3 py-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                    {isExp ? <ChevronDown size={13} className="text-orange-500" /> : <ChevronRight size={13} className="text-slate-400" />}
                    {row.khoiLabel.replace("Khối ", "")}
                  </td>
                  {PILLARS.map((p) => {
                    const score = row[p.id as keyof typeof row] as number;
                    return (
                      <td key={p.id} className="px-2 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] ${getColor(score)}`}>
                          {score.toFixed(1)}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold ${getColor(avg)}`}>
                      {avg.toFixed(2)}
                    </span>
                  </td>
                </tr>
                {isExp && (
                  <tr>
                    <td colSpan={PILLARS.length + 2} className="px-4 py-3 bg-orange-50/30 border-b border-orange-100">
                      <p className="text-[11px] font-semibold text-orange-700 mb-2">📊 Chi tiết điểm thấp nhất – {row.khoiLabel}</p>
                      <div className="flex gap-3 flex-wrap">
                        {PILLARS.filter((p) => (row[p.id as keyof typeof row] as number) < 3.7).map((p) => (
                          <span key={p.id} className="text-[11px] bg-white border border-orange-200 text-orange-700 px-2.5 py-1 rounded-full font-medium">
                            {p.label}: {(row[p.id as keyof typeof row] as number).toFixed(1)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 flex-wrap">
        {[
          { color: "bg-green-200", label: "Tốt (≥4.2)" },
          { color: "bg-amber-100 border border-amber-300", label: "Ổn (3.5–4.2)" },
          { color: "bg-red-200", label: "Cần cải thiện (<3.5)" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`w-3 h-3 rounded inline-block ${color}`} />{label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── NLP Sentiment ─────────────────────────────────────────────

function SentimentPanel({ groupId }: { groupId: string }) {
  const data = sentimentData.find((s) => s.group === groupId) ??
               sentimentData.find((s) => s.group === "ALL")!;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-green-600" />
            <h4 className="text-[11px] font-bold text-green-700 uppercase tracking-wide">Từ khóa tích cực</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.positiveKeywords.map((kw, i) => (
              <span key={i} className="bg-green-100 text-green-700 text-[11px] font-medium px-2.5 py-1 rounded-full">
                ✓ {kw}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={14} className="text-red-600" />
            <h4 className="text-[11px] font-bold text-red-700 uppercase tracking-wide">Vấn đề nổi cộm</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.painPoints.map((kw, i) => (
              <span key={i} className="bg-red-100 text-red-600 text-[11px] font-medium px-2.5 py-1 rounded-full">
                ⚠ {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wide mb-2.5 flex items-center gap-2"
            style={{ color: "var(--text-muted)" }}>
          <MessageSquareQuote size={13} /> Trích dẫn thực tế (Verbatim)
        </h4>
        <div className="space-y-2.5">
          {data.quotes.map((q, i) => (
            <div key={i}
                 className={`rounded-xl p-3.5 border-l-4 ${
                   q.sentiment === "positive" ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"
                 }`}>
              <p className={`text-[12px] font-medium leading-relaxed ${
                q.sentiment === "positive" ? "text-green-800" : "text-red-800"
              }`}>
                "{q.text}"
              </p>
              <p className="text-[11px] mt-1.5" style={{ color: "var(--text-muted)" }}>— {q.source}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Demographic Charts ────────────────────────────────────────

const GEN_COLORS = ["#8B5CF6", "#FF5200", "#0EA5E9"];

function DemographicPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Generation Pie */}
      <div>
        <h4 className="text-[12px] font-bold text-slate-700 mb-1">Cơ cấu Thế hệ</h4>
        <p className="text-[10px] text-slate-400 mb-2">% tổng nhân viên</p>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={demographicGeneration} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                 dataKey="value" paddingAngle={3} strokeWidth={0}>
              {demographicGeneration.map((_, i) => <Cell key={i} fill={GEN_COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1 mt-1">
          {demographicGeneration.map(({ name, value }, i) => (
            <div key={name} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: GEN_COLORS[i] }} />
                <span className="text-slate-500">{name}</span>
              </span>
              <span className="font-bold text-slate-700">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seniority Bar */}
      <div>
        <h4 className="text-[12px] font-bold text-slate-700 mb-1">Thâm niên</h4>
        <p className="text-[10px] text-slate-400 mb-2">% phân bổ nhân viên</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={demographicSeniority} barSize={20} layout="vertical"
                    margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={56} />
            <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#FF5200" fillOpacity={0.85}>
              <LabelList dataKey="value" position="right" style={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                         formatter={(v: number) => `${v}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* eNPS by Gen */}
      <div>
        <h4 className="text-[12px] font-bold text-slate-700 mb-1">eNPS theo Thế hệ</h4>
        <p className="text-[10px] text-slate-400 mb-2">So sánh 2025 vs 2026</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={eNPSByGeneration} barSize={14} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="eNPS2025" name="2025" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="eNPS2026" name="2026" fill="#FF5200" radius={[3, 3, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────

export default function TabPhanTich() {
  const { filters } = useDashboard();
  const [selectedGroup, setSelectedGroup] = useState("3A");
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Group Selector */}
      <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: "#F8FAFC", borderColor: "var(--ghn-border)" }}>
        <span className="text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
          Chọn Nhóm:
        </span>
        <div className="flex gap-2 flex-wrap">
          {NHOM_NV.map((n) => (
            <button key={n.id} onClick={() => setSelectedGroup(n.id)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                      selectedGroup === n.id
                        ? "bg-orange-500 text-white shadow-sm scale-105"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600"
                    }`}>
              {n.id}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11px] text-slate-400 hidden md:block">
          {NHOM_NV.find((n) => n.id === selectedGroup)?.label}
        </span>
      </div>

      {/* Radar + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar */}
        <div className="card p-5">
          <h3 className="section-title">Radar 5 Trụ cột – Nhóm {selectedGroup} vs Trung bình CT</h3>
          <p className="section-sub mb-3">Năm {filters.year} · Thang điểm 1–5</p>
          <PillarRadar groupId={selectedGroup} year={filters.year} />
          {/* Quick scores */}
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {PILLARS.map((p) => {
              const gs  = pillarScoresByGroup.find((ps) => ps.group === selectedGroup && ps.year === filters.year);
              const score = gs ? (gs[p.id as keyof typeof gs] as number) : 0;
              const avg   = companyAvgPillars[filters.year][p.id as keyof (typeof companyAvgPillars)[number]];
              const isAbove = score >= avg;
              return (
                <button key={p.id}
                        onClick={() => setExpandedPillar(expandedPillar === p.id ? null : p.id)}
                        className={`text-center rounded-lg p-2 transition-all border cursor-pointer ${
                          expandedPillar === p.id
                            ? "bg-orange-50 border-orange-300"
                            : "bg-slate-50 border-slate-100 hover:border-orange-200"
                        }`}>
                  <p className="text-[10px] font-semibold text-slate-400">{p.id}</p>
                  <p className={`text-[13px] font-bold ${isAbove ? "text-green-600" : "text-red-500"}`}>
                    {score.toFixed(1)}
                  </p>
                </button>
              );
            })}
          </div>
          {expandedPillar && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
              <h4 className="text-[11px] font-bold text-slate-700 mb-2">
                📋 Chi tiết câu hỏi – {PILLARS.find(p => p.id === expandedPillar)?.label}
              </h4>
              <QuestionDrilldown pillarId={expandedPillar} year={filters.year} />
            </div>
          )}
        </div>

        {/* Heatmap */}
        <div className="card p-5">
          <h3 className="section-title">Heatmap 5 Trụ cột theo Khối</h3>
          <p className="section-sub mb-3">Năm {filters.year} · Nhấn vào hàng để xem chi tiết</p>
          <HeatmapTable />
        </div>
      </div>

      {/* Demographic */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users2 size={16} className="text-orange-500" />
          <h3 className="section-title">Phân tích Nhân khẩu học</h3>
        </div>
        <DemographicPanel />
      </div>

      {/* NLP Sentiment */}
      <div className="card p-5">
        <h3 className="section-title">Phân tích Cảm xúc (NLP Sentiment) – Nhóm {selectedGroup}</h3>
        <p className="section-sub mb-4">Dựa trên open-text responses từ khảo sát · Năm {filters.year}</p>
        <SentimentPanel groupId={selectedGroup} />
      </div>
    </div>
  );
}
