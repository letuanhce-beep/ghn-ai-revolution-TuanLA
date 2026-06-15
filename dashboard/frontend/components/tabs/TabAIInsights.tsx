"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  kpiData, getKpiForYear, divisionData, riskZones, actionItems,
  companyAvgPillars, BENCHMARK, quickWins, eNPSWaterfall,
  PILLARS, divPillarScores,
} from "@/lib/mockData";
import {
  Sparkles, AlertTriangle, TrendingUp, Target, Lightbulb,
  ChevronRight, CheckCircle2, Clock, Zap, BarChart2,
  RefreshCw, Shield, ArrowRight, CalendarClock, Users,
} from "lucide-react";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ReferenceLine,
} from "recharts";

// ── Analytics Engine Functions (from /dashboard/analytics_engine/scoring.ts) ──
// Re-exported here because the analytics_engine module uses a different
// import base path that is not resolvable from the Next.js frontend bundle.

const PILLAR_WEIGHTS = { TC1: 0.20, TC2: 0.20, TC3: 0.25, TC4: 0.20, TC5: 0.15 };

function calcEXIndex(scores: { TC1: number; TC2: number; TC3: number; TC4: number; TC5: number }): number {
  const raw =
    scores.TC1 * PILLAR_WEIGHTS.TC1 +
    scores.TC2 * PILLAR_WEIGHTS.TC2 +
    scores.TC3 * PILLAR_WEIGHTS.TC3 +
    scores.TC4 * PILLAR_WEIGHTS.TC4 +
    scores.TC5 * PILLAR_WEIGHTS.TC5;
  return Math.round(((raw - 1) / 4) * 100);
}

function classifyENPS(eNPS: number): { label: string; color: string; description: string } {
  if (eNPS >= 50) return { label: "Xuất sắc",     color: "#16A34A", description: "Đại đa số NV sẵn sàng giới thiệu GHN" };
  if (eNPS >= 30) return { label: "Tốt",          color: "#65A30D", description: "Đội ngũ gắn kết, cần duy trì đà tăng" };
  if (eNPS >= 10) return { label: "Cần cải thiện", color: "#D97706", description: "Số Passives cao, cần chuyển thành Promoters" };
  if (eNPS >= 0)  return { label: "Rủi ro",        color: "#EA580C", description: "Cân bằng mỏng, dễ chuyển sang âm" };
  return             { label: "Khủng hoảng",    color: "#DC2626", description: "Detractors vượt Promoters – cần can thiệp ngay" };
}

interface PillarGap {
  pillarId: string;
  pillarLabel: string;
  score: number;
  benchmark: number;
  gap: number;
  status: "Xuất sắc" | "Đạt" | "Cần cải thiện" | "Nghiêm trọng";
}

function calcPillarGaps(scores: { TC1: number; TC2: number; TC3: number; TC4: number; TC5: number }): PillarGap[] {
  const pillars = ["TC1", "TC2", "TC3", "TC4", "TC5"] as const;
  const labels: Record<string, string> = {
    TC1: "Niềm tin LĐ", TC2: "Quản lý", TC3: "Công việc", TC4: "Thu nhập", TC5: "Môi trường",
  };
  return pillars.map((id) => {
    const score     = scores[id];
    const benchmark = BENCHMARK.pillar.mid;
    const gap       = +(score - benchmark).toFixed(2);
    const status: PillarGap["status"] =
      score >= 4.2 ? "Xuất sắc" :
      score >= 3.7 ? "Đạt" :
      score >= 3.2 ? "Cần cải thiện" : "Nghiêm trọng";
    return { pillarId: id, pillarLabel: labels[id], score, benchmark, gap, status };
  });
}

function calcDisengagementRisk(kpi: { engagementIndex: number; eNPS: number; attritionRisk: number }) {
  const eiRisk     = Math.max(0, (70 - kpi.engagementIndex) / 70 * 40);
  const enpsRisk   = Math.max(0, (20 - kpi.eNPS) / 120 * 30);
  const attrRisk   = Math.min(30, (kpi.attritionRisk / 40) * 30);
  const riskScore  = Math.round(eiRisk + enpsRisk + attrRisk);
  const level = riskScore >= 60 ? "Khẩn cấp" : riskScore >= 40 ? "Cao" : riskScore >= 20 ? "Trung bình" : "Thấp";
  const color = riskScore >= 60 ? "#DC2626" : riskScore >= 40 ? "#EA580C" : riskScore >= 20 ? "#D97706" : "#16A34A";
  return { riskScore, level, color };
}

// ── Typing Animation Component ───────────────────────────────

function TypingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fadeIn">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
             style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" }}>
          <Sparkles size={20} className="text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-400"
             style={{ animation: "pulse-ring 1.2s ease-out infinite" }} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] font-semibold text-purple-700">AI đang phân tích dữ liệu</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i}
                  className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block"
                  style={{
                    animation: "typingDot 1.4s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }} />
          ))}
        </span>
      </div>
      <div className="flex gap-3 mt-2">
        {["Xử lý 23,412 phản hồi", "Phân tích 5 trụ cột", "Tổng hợp insight"].map((step, i) => (
          <span key={i}
                className="text-[10px] font-medium px-2 py-1 rounded-full"
                style={{
                  background: "#EDE9FE", color: "#6D28D9",
                  animation: "fadeInUp 0.4s ease-out forwards",
                  animationDelay: `${0.5 + i * 0.3}s`,
                  opacity: 0,
                }}>
            {step}
          </span>
        ))}
      </div>
      {/* Inline keyframes for typing dots */}
      <style jsx>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Summary Text Variations (data-driven) ─────────────────────

interface SummaryVariation {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function generateSummaryVariations(year: number, variant: number): SummaryVariation[] {
  const cur  = getKpiForYear(year)!;
  const prev = getKpiForYear(year === 2026 ? 2025 : 2026)!;
  const EI_DELTA   = cur.engagementIndex - prev.engagementIndex;
  const ENPS_DELTA = cur.eNPS - prev.eNPS;
  const ATTR_DELTA = cur.attritionRisk - prev.attritionRisk;

  const topRisk     = riskZones[0];
  const doneCnt     = actionItems.filter((a) => a.status === "Hoàn thành").length;
  const lateCnt     = actionItems.filter((a) => a.status === "Trễ hạn").length;
  const inProgress  = actionItems.filter((a) => a.status === "Đang làm").length;
  const bestKhoi    = [...divisionData].sort((a, b) =>
    (year === 2026 ? b.ei2026 - a.ei2026 : b.ei2025 - a.ei2025))[0];
  const worstKhoi   = [...divisionData].sort((a, b) =>
    (year === 2026 ? a.ei2026 - b.ei2026 : a.ei2025 - b.ei2025))[0];

  // Analytics engine calculations
  const pillarScores = companyAvgPillars[year] || companyAvgPillars[2026];
  const exIndex = calcEXIndex(pillarScores);
  const enpsClass = classifyENPS(cur.eNPS);
  const pillarGaps = calcPillarGaps(pillarScores);
  const weakestPillar = [...pillarGaps].sort((a, b) => a.score - b.score)[0];
  const strongestPillar = [...pillarGaps].sort((a, b) => b.score - a.score)[0];
  const riskProfile = calcDisengagementRisk(cur);

  const variants: SummaryVariation[][] = [
    // ── Variant 0 (original style, enhanced with scoring) ──
    [
      {
        icon: <BarChart2 size={14} className="text-orange-500" />,
        title: "Kết quả tổng thể",
        text: `Khảo sát EES ${year} ghi nhận Engagement Index đạt ${cur.engagementIndex}/100, tăng ${EI_DELTA} điểm so với ${year - 1}. EX Index (trọng số 5 trụ cột) đạt ${exIndex}/100. Tỷ lệ phản hồi ${cur.responseRate}%, vượt benchmark Logistics (${BENCHMARK.responseRate.label}). eNPS +${cur.eNPS} – phân loại "${enpsClass.label}": ${enpsClass.description}.`,
      },
      {
        icon: <TrendingUp size={14} className="text-green-600" />,
        title: "Điểm sáng đáng ghi nhận",
        text: `${bestKhoi.khoiLabel} dẫn đầu với EI ${year === 2026 ? bestKhoi.ei2026 : bestKhoi.ei2025}/100 và eNPS +${year === 2026 ? bestKhoi.eNPS2026 : bestKhoi.eNPS2025}. Trụ cột ${strongestPillar.pillarLabel} (${strongestPillar.pillarId}) đạt ${strongestPillar.score}/5 – xếp loại "${strongestPillar.status}". Tỷ lệ nghỉ việc giảm ${Math.abs(ATTR_DELTA)}% YoY. ${doneCnt}/${actionItems.length} action đã hoàn thành.`,
      },
      {
        icon: <AlertTriangle size={14} className="text-red-500" />,
        title: "Vùng ưu tiên can thiệp",
        text: `${worstKhoi.khoiLabel} có EI thấp nhất (${year === 2026 ? worstKhoi.ei2026 : worstKhoi.ei2025}) và attrition ${year === 2026 ? worstKhoi.attrition2026 : worstKhoi.attrition2025}%. Trụ cột yếu nhất: ${weakestPillar.pillarLabel} (${weakestPillar.score}/5, gap ${weakestPillar.gap > 0 ? "+" : ""}${weakestPillar.gap} vs benchmark). ${topRisk.dept} ghi nhận EI ${topRisk.engagementIndex} – cần can thiệp trọng điểm. ${lateCnt} action đang trễ tiến độ.`,
      },
      {
        icon: <Zap size={14} className="text-purple-500" />,
        title: "Khuyến nghị Ban lãnh đạo",
        text: `Mức rủi ro disengage tổng thể: ${riskProfile.riskScore}/100 ("${riskProfile.level}"). Ưu tiên 1: Điều chỉnh chính sách lương thưởng nhóm Frontline (${weakestPillar.pillarId} thấp nhất ${weakestPillar.score}/5). Ưu tiên 2: Coaching 360° cho Quản lý tuyến đầu Q3/${year}. Ưu tiên 3: Redesign onboarding Gen Z – giữ chân NV <1 năm (28% lực lượng).`,
      },
    ],
    // ── Variant 1 (insight-focused, deeper analytics) ──
    [
      {
        icon: <BarChart2 size={14} className="text-orange-500" />,
        title: "Bức tranh toàn cảnh",
        text: `EES ${year} cho thấy xu hướng cải thiện rõ rệt: EI ${cur.engagementIndex} (+${EI_DELTA} YoY), EX Index ${exIndex}/100. So với benchmark ngành Logistics VN (${BENCHMARK.engagementIndex.label}), GHN đang ở mức ${cur.engagementIndex >= BENCHMARK.engagementIndex.high ? "vượt trội" : cur.engagementIndex >= BENCHMARK.engagementIndex.mid ? "ngang bằng" : "cần cải thiện"}. eNPS tăng mạnh ${ENPS_DELTA} điểm lên +${cur.eNPS}, phản ánh niềm tin tổ chức đang phục hồi.`,
      },
      {
        icon: <TrendingUp size={14} className="text-green-600" />,
        title: "Động lực tăng trưởng",
        text: `Đà tăng đến từ 3 trụ cột chính: ${strongestPillar.pillarLabel} dẫn đầu (${strongestPillar.score}/5), kéo theo MEI của ${bestKhoi.khoiLabel} đạt ${year === 2026 ? bestKhoi.mei2026 : bestKhoi.mei2025}. Attrition risk giảm mạnh từ ${prev.attritionRisk}% xuống ${cur.attritionRisk}%, tiết kiệm ước tính chi phí tuyển dụng đáng kể. ${doneCnt} action hoàn thành và ${inProgress} đang triển khai đúng tiến độ.`,
      },
      {
        icon: <AlertTriangle size={14} className="text-red-500" />,
        title: "Rủi ro cần kiểm soát",
        text: `Disengagement Risk Score: ${riskProfile.riskScore}/100 – mức "${riskProfile.level}". Điểm nóng tập trung tại ${worstKhoi.khoiLabel} (EI ${year === 2026 ? worstKhoi.ei2026 : worstKhoi.ei2025}, attrition ${year === 2026 ? worstKhoi.attrition2026 : worstKhoi.attrition2025}%) và ${topRisk.dept} (EI ${topRisk.engagementIndex}). ${weakestPillar.pillarLabel} là trụ cột có gap lớn nhất so với benchmark (${weakestPillar.gap > 0 ? "+" : ""}${weakestPillar.gap}). ${lateCnt} action trễ hạn cần escalation ngay.`,
      },
      {
        icon: <Zap size={14} className="text-purple-500" />,
        title: "Hành động chiến lược",
        text: `Focus Q3-Q4/${year}: (1) Triển khai Job Grading Framework giải quyết gốc rễ ${weakestPillar.pillarLabel} cho nhóm Frontline. (2) Tăng tầng Team Lead tại ${worstKhoi.khoiLabel} – giảm tỷ lệ QL/NV từ 1:30 xuống 1:15. (3) Đẩy mạnh GHN Culture Camp cho 38% nhân sự Gen Z – nhóm có eNPS cải thiện nhanh nhất (+13 điểm).`,
      },
    ],
    // ── Variant 2 (executive-brief, numbers-forward) ──
    [
      {
        icon: <BarChart2 size={14} className="text-orange-500" />,
        title: "Chỉ số cốt lõi",
        text: `EI: ${cur.engagementIndex}/100 (+${EI_DELTA}) · EX Index: ${exIndex}/100 · eNPS: +${cur.eNPS} (+${ENPS_DELTA}) · Response Rate: ${cur.responseRate}% · Attrition: ${cur.attritionRisk}% (${ATTR_DELTA > 0 ? "+" : ""}${ATTR_DELTA}pp). So với benchmark ${BENCHMARK.engagementIndex.label}: GHN đạt percentile ${cur.engagementIndex >= BENCHMARK.engagementIndex.high ? "top 25%" : cur.engagementIndex >= BENCHMARK.engagementIndex.mid ? "50%" : "dưới 50%"} ngành Logistics.`,
      },
      {
        icon: <TrendingUp size={14} className="text-green-600" />,
        title: "Top performers",
        text: `${bestKhoi.khoiLabel}: EI ${year === 2026 ? bestKhoi.ei2026 : bestKhoi.ei2025}, eNPS +${year === 2026 ? bestKhoi.eNPS2026 : bestKhoi.eNPS2025} (phân loại "${classifyENPS(year === 2026 ? bestKhoi.eNPS2026 : bestKhoi.eNPS2025).label}"). Trụ cột mạnh nhất: ${strongestPillar.pillarLabel} = ${strongestPillar.score}/5. Completion rate action items: ${Math.round(doneCnt / actionItems.length * 100)}%. Xu hướng: tất cả 5 trụ cột đều tăng so với ${year - 1}.`,
      },
      {
        icon: <AlertTriangle size={14} className="text-red-500" />,
        title: "Điểm yếu hệ thống",
        text: `Bottom 1: ${worstKhoi.khoiLabel} – EI ${year === 2026 ? worstKhoi.ei2026 : worstKhoi.ei2025}, gap ${(year === 2026 ? worstKhoi.ei2026 : worstKhoi.ei2025) - cur.engagementIndex} vs company avg. Trụ cột ${weakestPillar.pillarLabel}: ${weakestPillar.score}/5 (gap ${weakestPillar.gap} vs BM ${weakestPillar.benchmark}). Phòng ban rủi ro nhất: ${topRisk.dept} (EI ${topRisk.engagementIndex}, eNPS ${topRisk.eNPS}, attrition ${topRisk.attrition}%). Disengagement risk: ${riskProfile.riskScore}pts.`,
      },
      {
        icon: <Zap size={14} className="text-purple-500" />,
        title: "Roadmap hành động",
        text: `Sprint 1 (0-30 ngày): Điều chỉnh phụ cấp & compensation nhóm 1A-2A. Sprint 2 (30-90 ngày): Coaching program + Team Lead expansion tại ${worstKhoi.khoiLabel}. Sprint 3 (Q4/${year}): Onboarding Experience v2.0 cho Gen Z. KPI theo dõi: target EI ≥${cur.engagementIndex + 3}, eNPS ≥+${cur.eNPS + 5}, attrition ≤${Math.max(cur.attritionRisk - 2, 10)}%.`,
      },
    ],
  ];

  return variants[variant % variants.length];
}

// ── Priority Recommendations Component ────────────────────────

interface Recommendation {
  priority: "P1" | "P2" | "P3";
  title: string;
  impact: string;
  timeline: string;
  khoi: string;
  pillarId: string;
}

function generateRecommendations(year: number): Recommendation[] {
  const pillarScores = companyAvgPillars[year] || companyAvgPillars[2026];
  const gaps = calcPillarGaps(pillarScores);
  const sorted = [...gaps].sort((a, b) => a.score - b.score);

  const worstKhoi = [...divisionData].sort((a, b) =>
    (year === 2026 ? a.ei2026 - b.ei2026 : a.ei2025 - b.ei2025))[0];

  const recommendationMap: Record<string, Recommendation> = {
    TC4: {
      priority: "P1",
      title: "Tái cơ cấu chính sách lương thưởng nhóm Frontline",
      impact: `Tăng TC4 từ ${sorted.find(p => p.pillarId === "TC4")?.score}/5 lên ≥3.8/5, giảm attrition 5-8%`,
      timeline: "Q3/2026 (0-3 tháng)",
      khoi: worstKhoi.khoiLabel,
      pillarId: "TC4",
    },
    TC1: {
      priority: "P2",
      title: "Chương trình Town Hall & Transparent Leadership",
      impact: `Nâng TC1 lên ≥4.0/5, cải thiện eNPS +5-8 điểm`,
      timeline: "Q3-Q4/2026 (1-3 tháng)",
      khoi: "Toàn công ty",
      pillarId: "TC1",
    },
    TC2: {
      priority: "P2",
      title: "Coaching 360° & Team Lead Expansion tại Vận Hành",
      impact: `Tăng TC2 tại ${worstKhoi.khoiLabel} +0.4 điểm, giảm span-of-control`,
      timeline: "Q3-Q4/2026 (3-6 tháng)",
      khoi: worstKhoi.khoiLabel,
      pillarId: "TC2",
    },
    TC3: {
      priority: "P3",
      title: "Ra mắt Learning Hub & Career Path Framework",
      impact: `Tăng TC3 lên ≥4.2/5, tăng retention nhóm Gen Z`,
      timeline: "Q4/2026 (3-6 tháng)",
      khoi: "Khối Nhân Lực",
      pillarId: "TC3",
    },
    TC5: {
      priority: "P3",
      title: "Nâng cấp cơ sở vật chất & Work-Life Balance Policy",
      impact: `Tăng TC5 lên ≥4.0/5, giảm burnout risk 10-15%`,
      timeline: "Q4/2026 (3-6 tháng)",
      khoi: worstKhoi.khoiLabel,
      pillarId: "TC5",
    },
  };

  // Pick top 3 weakest pillars → recommendations
  const result: Recommendation[] = [];
  const priorities: Array<"P1" | "P2" | "P3"> = ["P1", "P2", "P3"];
  for (let i = 0; i < 3 && i < sorted.length; i++) {
    const rec = recommendationMap[sorted[i].pillarId];
    if (rec) {
      result.push({ ...rec, priority: priorities[i] });
    }
  }
  return result;
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  P1: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" },
  P2: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
  P3: { bg: "#DBEAFE", text: "#2563EB", border: "#BFDBFE" },
};

function PriorityRecommendations({ year }: { year: number }) {
  const recommendations = useMemo(() => generateRecommendations(year), [year]);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
             style={{ background: "linear-gradient(135deg, #FF5200 0%, #FF8A50 100%)" }}>
          <Target size={12} className="text-white" />
        </div>
        <h4 className="text-[13px] font-bold text-slate-700">Khuyến nghị ưu tiên</h4>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#FFF0E8", color: "#FF5200" }}>
          Từ phân tích trụ cột
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendations.map((rec, i) => {
          const pColor = PRIORITY_COLORS[rec.priority];
          return (
            <div key={i}
                 className="rounded-xl border p-4 bg-white hover:shadow-md transition-all animate-fadeInUp"
                 style={{
                   borderColor: pColor.border,
                   animationDelay: `${i * 0.1}s`,
                 }}>
              {/* Priority badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg"
                      style={{ background: pColor.bg, color: pColor.text }}>
                  {rec.priority}
                </span>
                <span className="text-[10px] font-medium text-slate-400">{rec.pillarId}</span>
              </div>
              {/* Title */}
              <h5 className="text-[12px] font-bold text-slate-800 mb-3 leading-snug">{rec.title}</h5>
              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <TrendingUp size={11} className="text-green-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">{rec.impact}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarClock size={11} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500">{rec.timeline}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Users size={11} className="text-purple-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500">{rec.khoi}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Executive Summary ─────────────────────────────────────────

function ExecutiveSummary({ year }: { year: number }) {
  const cur  = getKpiForYear(year)!;
  const prev = getKpiForYear(year === 2026 ? 2025 : 2026)!;
  const EI_DELTA   = cur.engagementIndex - prev.engagementIndex;
  const ENPS_DELTA = cur.eNPS - prev.eNPS;
  const ATTR_DELTA = cur.attritionRisk - prev.attritionRisk;

  // Analytics engine scores
  const pillarScores = companyAvgPillars[year] || companyAvgPillars[2026];
  const exIndex = calcEXIndex(pillarScores);
  const enpsClass = classifyENPS(cur.eNPS);
  const riskProfile = calcDisengagementRisk(cur);

  // Re-analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [variant, setVariant] = useState(0);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  const handleReanalyze = useCallback(() => {
    setIsAnalyzing(true);
    const delay = 2000 + Math.random() * 1500; // 2-3.5s
    setTimeout(() => {
      setVariant((prev) => prev + 1);
      setLastAnalyzed(new Date());
      setIsAnalyzing(false);
    }, delay);
  }, []);

  const paragraphs = useMemo(
    () => generateSummaryVariations(year, variant),
    [year, variant]
  );

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #1A2332 0%, #006FAD 100%)" }}>
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-orange-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-white mb-1">Executive Summary – GHN EES {year}</h3>
            <p className="text-[12px] text-slate-300 leading-relaxed">
              Tóm tắt tự động từ dữ liệu khảo sát · 23,412 respondents · Q1/{year}
            </p>
            {/* KPI strip */}
            <div className="flex gap-4 mt-3 flex-wrap">
              {[
                { label: "Engagement Index", val: `${cur.engagementIndex}`, delta: `+${EI_DELTA}`, good: true },
                { label: "EX Index",          val: `${exIndex}`,            delta: `—`,             good: true },
                { label: "eNPS",              val: `+${cur.eNPS}`,          delta: `+${ENPS_DELTA}`, good: true },
                { label: "Attrition Risk",    val: `${cur.attritionRisk}%`, delta: `${ATTR_DELTA}%`, good: ATTR_DELTA < 0 },
                { label: "Response Rate",     val: `${cur.responseRate}%`,  delta: `+${cur.responseRate - prev.responseRate}%`, good: true },
              ].map(({ label, val, delta, good }) => (
                <div key={label} className="text-center">
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className="text-[18px] font-extrabold text-white">{val}</p>
                  <p className={`text-[10px] font-semibold ${good ? "text-green-400" : "text-red-400"}`}>{delta} YoY</p>
                </div>
              ))}
            </div>
          </div>
          {/* Scoring badges */}
          <div className="hidden md:flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full text-center"
                  style={{ background: `${enpsClass.color}20`, color: enpsClass.color }}>
              eNPS: {enpsClass.label}
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full text-center"
                  style={{ background: `${riskProfile.color}20`, color: riskProfile.color }}>
              Risk: {riskProfile.level}
            </span>
          </div>
        </div>
      </div>

      {/* Re-analyze button + timestamp */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleReanalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all border disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-[0.98]"
          style={{
            background: isAnalyzing
              ? "linear-gradient(135deg, #E9D5FF, #DDD6FE)"
              : "linear-gradient(135deg, #7C3AED, #5B21B6)",
            color: isAnalyzing ? "#6D28D9" : "#FFFFFF",
            borderColor: "transparent",
          }}>
          <RefreshCw size={13} className={isAnalyzing ? "animate-spin" : ""} />
          🤖 Phân tích lại
        </button>
        {lastAnalyzed && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock size={11} />
            <span>
              Phân tích lần cuối:{" "}
              {lastAnalyzed.toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        )}
        {variant > 0 && !isAnalyzing && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "#DCFCE7", color: "#16A34A" }}>
            ✓ Đã cập nhật lần {variant}
          </span>
        )}
      </div>

      {/* Content: typing animation or paragraphs */}
      {isAnalyzing ? (
        <TypingAnimation />
      ) : (
        <>
          {/* Paragraphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paragraphs.map(({ icon, title, text }, idx) => (
              <div key={`${title}-${variant}`}
                   className="p-4 rounded-xl border bg-white animate-fadeInUp"
                   style={{
                     borderColor: "var(--ghn-border)",
                     animationDelay: `${idx * 0.08}s`,
                   }}>
                <div className="flex items-center gap-2 mb-2">
                  {icon}
                  <h4 className="text-[12px] font-bold text-slate-700">{title}</h4>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Pillar Gap Analysis strip */}
          <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "var(--ghn-border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={13} className="text-blue-500" />
              <h4 className="text-[12px] font-bold text-slate-700">Pillar Gap Analysis</h4>
              <span className="text-[10px] text-slate-400 ml-auto">Benchmark: {BENCHMARK.pillar.label}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {calcPillarGaps(pillarScores).map((gap) => {
                const statusColors: Record<string, { bg: string; text: string }> = {
                  "Xuất sắc":       { bg: "#DCFCE7", text: "#16A34A" },
                  "Đạt":            { bg: "#DBEAFE", text: "#2563EB" },
                  "Cần cải thiện":  { bg: "#FEF3C7", text: "#D97706" },
                  "Nghiêm trọng":  { bg: "#FEE2E2", text: "#DC2626" },
                };
                const sc = statusColors[gap.status];
                return (
                  <div key={gap.pillarId}
                       className="flex-1 min-w-[100px] p-2.5 rounded-lg border text-center"
                       style={{ borderColor: sc.text + "30", background: sc.bg + "60" }}>
                    <p className="text-[10px] font-bold text-slate-500">{gap.pillarId}</p>
                    <p className="text-[16px] font-extrabold" style={{ color: sc.text }}>{gap.score}</p>
                    <p className="text-[9px] font-semibold" style={{ color: sc.text }}>
                      {gap.gap > 0 ? "+" : ""}{gap.gap} · {gap.status}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Recommendations */}
          <PriorityRecommendations year={year} />
        </>
      )}
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
                         style={{ background: "#FFF0E8", color: "#FF5200" }}>
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
