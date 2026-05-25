"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  kpiData, getKpiForYear, divisionData, riskZones, actionItems,
  companyAvgPillars, BENCHMARK, quickWins, eNPSWaterfall,
} from "@/lib/mockData";
import {
  Sparkles, AlertTriangle, TrendingUp, Target, Lightbulb,
  ChevronRight, CheckCircle2, Clock, Zap, BarChart2,
} from "lucide-react";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ReferenceLine,
} from "recharts";

// ── Executive Summary ─────────────────────────────────────────

function ExecutiveSummary({ year }: { year: number }) {
  const cur  = getKpiForYear(year)!;
  const prev = getKpiForYear(year === 2026 ? 2025 : 2026)!;
  const EI_DELTA   = cur.engagementIndex - prev.engagementIndex;
  const ENPS_DELTA = cur.eNPS - prev.eNPS;
  const ATTR_DELTA = cur.attritionRisk - prev.attritionRisk;

  const topRisk     = riskZones[0];
  const doneCnt     = actionItems.filter((a) => a.status === "Hoàn thành").length;
  const lateCnt     = actionItems.filter((a) => a.status === "Trễ hạn").length;
  const bestKhoi    = [...divisionData].sort((a, b) =>
    (year === 2026 ? b.ei2026 - a.ei2026 : b.ei2025 - a.ei2025))[0];
  const worstKhoi   = [...divisionData].sort((a, b) =>
    (year === 2026 ? a.ei2026 - b.ei2026 : a.ei2025 - b.ei2025))[0];

  const paragraphs = [
    {
      icon: <BarChart2 size={14} className="text-orange-500" />,
      title: "Kết quả tổng thể",
      text: `Khảo sát EES ${year} ghi nhận Engagement Index đạt ${cur.engagementIndex}/100, tăng ${EI_DELTA} điểm so với ${year - 1}. Tỷ lệ phản hồi đạt ${cur.responseRate}%, vượt benchmark thị trường Logistics (65–78%). eNPS đạt +${cur.eNPS}, cải thiện ${ENPS_DELTA} điểm – tín hiệu tích cực về trải nghiệm nhân viên.`,
    },
    {
      icon: <TrendingUp size={14} className="text-green-600" />,
      title: "Điểm sáng đáng ghi nhận",
      text: `${bestKhoi.khoiLabel} dẫn đầu với EI ${year === 2026 ? bestKhoi.ei2026 : bestKhoi.ei2025}/100 và eNPS +${year === 2026 ? bestKhoi.eNPS2026 : bestKhoi.eNPS2025}. Tỷ lệ nghỉ việc giảm ${Math.abs(ATTR_DELTA)}% so với năm trước, tiết kiệm đáng kể chi phí tuyển dụng. ${doneCnt}/${actionItems.length} action từ kỳ trước đã hoàn thành.`,
    },
    {
      icon: <AlertTriangle size={14} className="text-red-500" />,
      title: "Vùng ưu tiên can thiệp",
      text: `${worstKhoi.khoiLabel} có EI thấp nhất (${year === 2026 ? worstKhoi.ei2026 : worstKhoi.ei2025}) và attrition ${year === 2026 ? worstKhoi.attrition2026 : worstKhoi.attrition2025}%, cần can thiệp sớm. ${topRisk.dept} ghi nhận EI ${topRisk.engagementIndex} – điểm yếu tập trung ở trụ cột ${topRisk.pillarWeakest}. ${lateCnt} action đang trễ tiến độ cần được leo thang.`,
    },
    {
      icon: <Zap size={14} className="text-purple-500" />,
      title: "Khuyến nghị Ban lãnh đạo",
      text: `Ưu tiên số 1: Điều chỉnh chính sách lương thưởng nhóm Frontline (TC4 thấp nhất hệ thống, 3.52/5). Ưu tiên số 2: Triển khai coaching 360° cho Quản lý tuyến đầu trong Q3/2026. Ưu tiên số 3: Thiết kế lại chương trình onboarding Gen Z để giữ chân nhóm nhân viên <1 năm (28% lực lượng, tỷ lệ nghỉ cao nhất).`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #1A2332 0%, #003366 100%)" }}>
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[15px] font-bold text-white mb-1">Executive Summary – GHN EES {year}</h3>
            <p className="text-[12px] text-slate-300 leading-relaxed">
              Tóm tắt tự động từ dữ liệu khảo sát · 23,412 respondents · Q1/{year}
            </p>
            {/* KPI strip */}
            <div className="flex gap-4 mt-3 flex-wrap">
              {[
                { label: "Engagement Index", val: `${cur.engagementIndex}`, delta: `+${EI_DELTA}`, good: true },
                { label: "eNPS",             val: `+${cur.eNPS}`,          delta: `+${ENPS_DELTA}`, good: true },
                { label: "Attrition Risk",   val: `${cur.attritionRisk}%`, delta: `${ATTR_DELTA}%`, good: ATTR_DELTA < 0 },
                { label: "Response Rate",    val: `${cur.responseRate}%`,  delta: `+${cur.responseRate - prev.responseRate}%`, good: true },
              ].map(({ label, val, delta, good }) => (
                <div key={label} className="text-center">
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className="text-[18px] font-extrabold text-white">{val}</p>
                  <p className={`text-[10px] font-semibold ${good ? "text-green-400" : "text-red-400"}`}>{delta} YoY</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Paragraphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paragraphs.map(({ icon, title, text }) => (
          <div key={title} className="p-4 rounded-xl border bg-white animate-fadeInUp"
               style={{ borderColor: "var(--ghn-border)" }}>
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <h4 className="text-[12px] font-bold text-slate-700">{title}</h4>
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Root Cause 5-Why ──────────────────────────────────────────

interface WhyNode {
  why: string;
  answer: string;
  children?: WhyNode[];
}

const ROOT_CAUSES: { problem: string; color: string; chain: WhyNode[] }[] = [
  {
    problem: "Nhóm Frontline (1A) có EI thấp nhất: 66/100",
    color: "#DC2626",
    chain: [
      {
        why: "Tại sao EI thấp?",
        answer: "eNPS âm, điểm TC4 (Thu nhập) chỉ 3.1/5",
        children: [
          {
            why: "Tại sao thu nhập bị đánh giá thấp?",
            answer: "Mức lương cơ bản chưa điều chỉnh sau 18 tháng, phụ cấp xăng không theo kịp giá thị trường",
            children: [
              {
                why: "Tại sao chưa điều chỉnh?",
                answer: "Quy trình review lương của C&B phức tạp, cần phê duyệt nhiều tầng",
                children: [
                  {
                    why: "Tại sao quy trình phức tạp?",
                    answer: "Chưa có Compensation Framework chuẩn cho nhóm Frontline, từng case xử lý ad-hoc",
                    children: [
                      {
                        why: "Giải pháp gốc rễ:",
                        answer: "✅ Xây dựng Job Grading Framework & Salary Band cho toàn bộ nhóm 1A–2B",
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    problem: "TC2 (Quản lý) Khối Vận Hành thấp nhất: 3.3/5",
    color: "#EA580C",
    chain: [
      {
        why: "Tại sao điểm Quản lý thấp?",
        answer: "NV cảm thấy không được feedback đủ, không được công nhận kịp thời",
        children: [
          {
            why: "Tại sao thiếu feedback?",
            answer: "Quản lý tuyến đầu quá tải vận hành (1 QL : 25–30 NV), không đủ thời gian 1-on-1",
            children: [
              {
                why: "Tại sao tỷ lệ quản lý/NV cao?",
                answer: "Thiếu Middle Management layer, QL trực tiếp từ Director xuống NV",
                children: [
                  {
                    why: "Giải pháp gốc rễ:",
                    answer: "✅ Tăng tầng Team Lead + coaching 360° cho QL hiện tại về Servant Leadership",
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
];

function WhyTree({ node, depth = 0 }: { node: WhyNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const isLeaf = !node.children;
  return (
    <div className={`${depth > 0 ? "ml-5 mt-2" : ""}`}>
      <div className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
        isLeaf ? "bg-green-50 border border-green-200" : "hover:bg-slate-50"
      }`} onClick={() => !isLeaf && setOpen(!open)}>
        {!isLeaf && (
          <span className="mt-0.5 shrink-0 text-orange-400">
            {open ? <ChevronRight size={13} className="rotate-90" /> : <ChevronRight size={13} />}
          </span>
        )}
        {isLeaf && <CheckCircle2 size={13} className="text-green-600 mt-0.5 shrink-0" />}
        <div>
          <p className={`text-[11px] font-semibold ${isLeaf ? "text-green-700" : "text-orange-600"}`}>{node.why}</p>
          <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">{node.answer}</p>
        </div>
      </div>
      {open && node.children && (
        <div className="border-l-2 border-orange-200 ml-3 animate-fadeIn">
          {node.children.map((child, i) => <WhyTree key={i} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

function RootCausePanel() {
  const [selected, setSelected] = useState(0);
  const rc = ROOT_CAUSES[selected];
  return (
    <div>
      {/* Selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {ROOT_CAUSES.map(({ problem, color }, i) => (
          <button key={i} onClick={() => setSelected(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all border ${
                    selected === i ? "text-white" : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
                  }`}
                  style={selected === i ? { background: color, borderColor: color } : {}}>
            <AlertTriangle size={11} />
            {`Vấn đề ${i + 1}`}
          </button>
        ))}
      </div>
      {/* Problem */}
      <div className="p-3 rounded-xl mb-4" style={{ background: `${rc.color}12`, border: `1px solid ${rc.color}40` }}>
        <p className="text-[12px] font-bold" style={{ color: rc.color }}>⚡ {rc.problem}</p>
      </div>
      {/* Why chain */}
      <div className="space-y-1">
        {rc.chain.map((node, i) => <WhyTree key={i} node={node} />)}
      </div>
    </div>
  );
}

// ── Quick Wins Matrix ─────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  "Hoàn thành":    { label: "Hoàn thành",    color: "#16A34A", bg: "#DCFCE7" },
  "Đang làm":      { label: "Đang làm",      color: "#D97706", bg: "#FEF3C7" },
  "Chưa bắt đầu": { label: "Chưa bắt đầu", color: "#6B7280", bg: "#F3F4F6" },
  "Trễ hạn":       { label: "Trễ hạn",       color: "#DC2626", bg: "#FEE2E2" },
};

function QuickWinsMatrix() {
  const plotData = quickWins.map((w) => ({
    x: w.effort,
    y: w.impact,
    name: w.name,
    status: w.status,
    timeline: w.timeline,
    id: w.id,
  }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const meta = STATUS_META[payload.status];
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill={meta.color} fillOpacity={0.2} />
        <circle cx={cx} cy={cy} r={6} fill={meta.color} />
      </g>
    );
  };

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      const meta = STATUS_META[d.status];
      return (
        <div className="bg-white border rounded-xl shadow-lg p-3 text-xs max-w-[200px]"
             style={{ borderColor: "var(--ghn-border)" }}>
          <p className="font-bold text-slate-800 mb-1">{d.name}</p>
          <p className="text-slate-500">Impact: <strong>{d.y}/5</strong></p>
          <p className="text-slate-500">Effort: <strong>{d.x}/5</strong></p>
          <p className="text-slate-500">Timeline: <strong>{d.timeline}</strong></p>
          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: meta.bg, color: meta.color }}>
            {d.status}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 mb-3 text-center">
            Ma trận Impact vs Effort · Kích thước = Độ ưu tiên
          </p>
          <div className="relative">
            {/* Quadrant labels */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-2 right-8 text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                🚀 Quick Wins
              </div>
              <div className="absolute top-2 left-8 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                📋 Major Projects
              </div>
              <div className="absolute bottom-8 right-8 text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                ⚡ Fill-ins
              </div>
              <div className="absolute bottom-8 left-8 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                🗑 Thankless
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" domain={[0, 6]} name="Effort"
                       label={{ value: "Effort →", position: "insideBottom", offset: -4, fontSize: 10, fill: "#94A3B8" }}
                       tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <YAxis type="number" dataKey="y" domain={[0, 6]} name="Impact"
                       label={{ value: "Impact →", angle: -90, position: "insideLeft", offset: 8, fontSize: 10, fill: "#94A3B8" }}
                       tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <ReferenceLine x={3} stroke="#CBD5E1" strokeDasharray="4 4" />
                <ReferenceLine y={3} stroke="#CBD5E1" strokeDasharray="4 4" />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter data={plotData} shape={<CustomDot />} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* List */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 mb-3">Danh sách Quick Wins ưu tiên</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {quickWins
              .sort((a, b) => b.impact - a.impact)
              .map((w) => {
                const meta = STATUS_META[w.status];
                return (
                  <div key={w.id} className="flex items-start gap-3 p-2.5 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                       style={{ borderColor: "var(--ghn-border)" }}>
                    <div className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold"
                         style={{ background: "#FFF0E8", color: "#F26522" }}>
                      {w.id.split("-")[1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-700 leading-snug">{w.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{w.timeline} · {w.owner}</p>
                    </div>
                    <span className="inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: meta.bg, color: meta.color }}>
                      {w.status}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {Object.entries(STATUS_META).map(([key, { color, bg }]) => (
          <span key={key} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {key}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────

const SECTIONS = [
  { id: "summary",   label: "Executive Summary", icon: <Sparkles size={14} /> },
  { id: "rootcause", label: "Root Cause (5-Why)", icon: <Target size={14} /> },
  { id: "quickwins", label: "Quick Wins Matrix",  icon: <Lightbulb size={14} /> },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export default function TabAIInsights() {
  const { filters } = useDashboard();
  const [section, setSection] = useState<SectionId>("summary");

  return (
    <div className="space-y-5">
      {/* AI Banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl border"
           style={{ background: "linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%)", borderColor: "#DDD6FE" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" }}>
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold" style={{ color: "#4C1D95" }}>AI Insights – Phân tích thông minh</p>
          <p className="text-[11px]" style={{ color: "#6D28D9" }}>
            Tổng hợp tự động từ dữ liệu EES {filters.year} · 26 câu hỏi · 23,412 NV
          </p>
        </div>
        <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ background: "#EDE9FE", color: "#7C3AED" }}>
          BETA
        </span>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2">
        {SECTIONS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setSection(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all border ${
                    section === id
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"
                  }`}
                  style={section === id ? { background: "linear-gradient(135deg, #7C3AED, #5B21B6)", borderColor: "transparent" } : {}}>
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="card p-6 animate-fadeInUp">
        {section === "summary"   && <ExecutiveSummary year={filters.year} />}
        {section === "rootcause" && (
          <>
            <div className="flex items-center gap-2 mb-5">
              <Target size={16} className="text-purple-600" />
              <h3 className="section-title">Root Cause Analysis – Phương pháp 5-Why</h3>
            </div>
            <RootCausePanel />
          </>
        )}
        {section === "quickwins" && (
          <>
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb size={16} className="text-yellow-500" />
              <h3 className="section-title">Quick Wins Scorecard – Ma trận Impact × Effort</h3>
            </div>
            <QuickWinsMatrix />
          </>
        )}
      </div>
    </div>
  );
}
