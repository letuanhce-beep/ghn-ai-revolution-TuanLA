// ============================================================
// GHN EES 2026 – Analytics Engine / Scoring Functions
// ============================================================

import {
  PillarScore,
  KpiData,
  BENCHMARK,
  calcEngagementCategory,
} from "../lib/mockData";

// ── EX Index Calculation ─────────────────────────────────────
// Weighted composite: TC1(20%) TC2(20%) TC3(25%) TC4(20%) TC5(15%)

export const PILLAR_WEIGHTS = {
  TC1: 0.20,
  TC2: 0.20,
  TC3: 0.25,
  TC4: 0.20,
  TC5: 0.15,
};

export function calcEXIndex(scores: Pick<PillarScore, "TC1"|"TC2"|"TC3"|"TC4"|"TC5">): number {
  const raw =
    scores.TC1 * PILLAR_WEIGHTS.TC1 +
    scores.TC2 * PILLAR_WEIGHTS.TC2 +
    scores.TC3 * PILLAR_WEIGHTS.TC3 +
    scores.TC4 * PILLAR_WEIGHTS.TC4 +
    scores.TC5 * PILLAR_WEIGHTS.TC5;
  // Normalise to 0–100 (pillar scale is 1–5)
  return Math.round(((raw - 1) / 4) * 100);
}

// ── eNPS Segmentation ────────────────────────────────────────
// eNPS = % Promoters (9–10) – % Detractors (0–6)

export function calcENPS(promoterPct: number, detractorPct: number): number {
  return Math.round(promoterPct - detractorPct);
}

export function classifyENPS(eNPS: number): {
  label: string;
  color: string;
  description: string;
} {
  if (eNPS >= 50) return { label: "Xuất sắc",    color: "#16A34A", description: "Đại đa số NV sẵn sàng giới thiệu GHN" };
  if (eNPS >= 30) return { label: "Tốt",         color: "#65A30D", description: "Đội ngũ gắn kết, cần duy trì đà tăng" };
  if (eNPS >= 10) return { label: "Cần cải thiện",color: "#D97706", description: "Số Passives cao, cần chuyển thành Promoters" };
  if (eNPS >= 0)  return { label: "Rủi ro",       color: "#EA580C", description: "Cân bằng mỏng, dễ chuyển sang âm" };
  return             { label: "Khủng hoảng",   color: "#DC2626", description: "Detractors vượt Promoters – cần can thiệp ngay" };
}

// ── Disengagement Risk Score ─────────────────────────────────
// Score 0–100, càng cao càng rủi ro

export interface RiskProfile {
  riskScore: number;
  level: "Thấp" | "Trung bình" | "Cao" | "Khẩn cấp";
  color: string;
  drivers: string[];
}

export function calcDisengagementRisk(
  kpi: Pick<KpiData, "engagementIndex" | "eNPS" | "attritionRisk">
): RiskProfile {
  const eiRisk     = Math.max(0, (70 - kpi.engagementIndex) / 70 * 40);
  const enpsRisk   = Math.max(0, (20 - kpi.eNPS) / 120 * 30);
  const attrRisk   = Math.min(30, (kpi.attritionRisk / 40) * 30);
  const riskScore  = Math.round(eiRisk + enpsRisk + attrRisk);

  const drivers: string[] = [];
  if (kpi.engagementIndex < 65) drivers.push("EI dưới ngưỡng Logistics benchmark");
  if (kpi.eNPS < 10)            drivers.push("eNPS ở vùng rủi ro");
  if (kpi.attritionRisk > 20)   drivers.push("Tỷ lệ nghỉ việc cao hơn thị trường");

  if (riskScore >= 60) return { riskScore, level: "Khẩn cấp",    color: "#DC2626", drivers };
  if (riskScore >= 40) return { riskScore, level: "Cao",         color: "#EA580C", drivers };
  if (riskScore >= 20) return { riskScore, level: "Trung bình",  color: "#D97706", drivers };
  return                      { riskScore, level: "Thấp",        color: "#16A34A", drivers };
}

// ── Pillar Gap Analysis ───────────────────────────────────────

export interface PillarGap {
  pillarId: string;
  score: number;
  benchmark: number;
  gap: number;
  status: "Xuất sắc" | "Đạt" | "Cần cải thiện" | "Nghiêm trọng";
}

export function calcPillarGaps(
  scores: Pick<PillarScore, "TC1"|"TC2"|"TC3"|"TC4"|"TC5">
): PillarGap[] {
  const pillars = ["TC1", "TC2", "TC3", "TC4", "TC5"] as const;
  return pillars.map((id) => {
    const score     = scores[id];
    const benchmark = BENCHMARK.pillar.mid;
    const gap       = score - benchmark;
    const status =
      score >= 4.2 ? "Xuất sắc" :
      score >= 3.7 ? "Đạt" :
      score >= 3.2 ? "Cần cải thiện" : "Nghiêm trọng";
    return { pillarId: id, score, benchmark, gap, status };
  });
}

// ── Population Segmentation ───────────────────────────────────

export interface EngagementSegment {
  segment: "Engaged" | "Passive" | "Disengaged";
  pct: number;
  color: string;
  description: string;
}

export function calcEngagementSegments(
  groups: { ei: number; headcount: number }[]
): EngagementSegment[] {
  const total = groups.reduce((s, g) => s + g.headcount, 0);
  let engaged = 0, passive = 0, disengaged = 0;

  groups.forEach(({ ei, headcount }) => {
    const cat = calcEngagementCategory(ei);
    if (cat === "Engaged")    engaged    += headcount;
    else if (cat === "Passive")  passive  += headcount;
    else                         disengaged += headcount;
  });

  return [
    { segment: "Engaged",    pct: Math.round(engaged    / total * 100), color: "#16A34A", description: "Gắn kết cao, advocate của GHN" },
    { segment: "Passive",    pct: Math.round(passive    / total * 100), color: "#D97706", description: "Ổn định nhưng chưa fully committed" },
    { segment: "Disengaged", pct: Math.round(disengaged / total * 100), color: "#DC2626", description: "Rủi ro nghỉ việc, ảnh hưởng năng suất" },
  ];
}

// ── Benchmark Comparison ─────────────────────────────────────

export type BenchmarkStatus = "above" | "at" | "below";

export function compareToBenchmark(
  value: number,
  metric: keyof typeof BENCHMARK
): BenchmarkStatus {
  const bm = BENCHMARK[metric] as { low: number; mid: number; high: number };
  if (value >= bm.high) return "above";
  if (value >= bm.mid)  return "at";
  return "below";
}

// ── Helper: Format Delta ──────────────────────────────────────

export function formatDelta(delta: number, unit = ""): string {
  return `${delta > 0 ? "+" : ""}${delta}${unit}`;
}
