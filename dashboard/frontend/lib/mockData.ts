// ============================================================
// GHN EES 2026 Dashboard – Mock Data (Enhanced)
// ============================================================

export const YEARS = [2025, 2026];

export const NHOM_NV = [
  { id: "1A", label: "1A – Shipper" },
  { id: "1B", label: "1B – Tài xế" },
  { id: "2A", label: "2A – NV Kho" },
  { id: "2B", label: "2B – QL Tuyến đầu" },
  { id: "3A", label: "3A – NV Văn phòng" },
  { id: "3B", label: "3B – Manager/Dir" },
];

export const KHOI = [
  { id: "TT", label: "Khối Thị Trường" },
  { id: "VH", label: "Khối Vận Hành" },
  { id: "KH", label: "Khối Khách Hàng" },
  { id: "TC", label: "Khối Tech" },
  { id: "NL", label: "Khối Nhân Lực" },
  { id: "TCS", label: "Khối Tài Chính" },
];

export const PHONG_BAN: Record<string, { id: string; label: string }[]> = {
  TT: [
    { id: "TT_KD", label: "Kinh Doanh Vùng" },
    { id: "TT_MKT", label: "Marketing & Thương Hiệu" },
    { id: "TT_SPTT", label: "Phát triển Sản phẩm TT" },
  ],
  VH: [
    { id: "VH_VH", label: "Vận Hành Mạng Lưới" },
    { id: "VH_KHO", label: "Quản lý Kho & Hub" },
    { id: "VH_CUOI", label: "Giao Hàng Chặng Cuối" },
  ],
  KH: [
    { id: "KH_CSKH", label: "Chăm Sóc Khách Hàng" },
    { id: "KH_KAM", label: "Key Account Management" },
    { id: "KH_KHKN", label: "Khiếu Nại & Chất Lượng" },
  ],
  TC: [
    { id: "TC_SE", label: "Software Engineering" },
    { id: "TC_DATA", label: "Data & Analytics" },
    { id: "TC_INFRA", label: "Infrastructure & DevOps" },
  ],
  NL: [
    { id: "NL_TA", label: "Tuyển dụng & TA" },
    { id: "NL_LND", label: "L&D / Đào tạo" },
    { id: "NL_HRBP", label: "HRBP & EX" },
  ],
  TCS: [
    { id: "TCS_KT", label: "Kế Toán & Kiểm Soát" },
    { id: "TCS_TC", label: "Tài Chính Doanh Nghiệp" },
  ],
};

// 5 Pillars
export const PILLARS = [
  { id: "TC1", label: "TC1 – Niềm tin LĐ" },
  { id: "TC2", label: "TC2 – Quản lý" },
  { id: "TC3", label: "TC3 – Công việc" },
  { id: "TC4", label: "TC4 – Thu nhập" },
  { id: "TC5", label: "TC5 – Môi trường" },
];

// ── KPI Data ────────────────────────────────────────────────

export interface KpiData {
  year: number;
  engagementIndex: number;
  eNPS: number;
  attritionRisk: number;
  responseRate: number;
}

export const kpiData: KpiData[] = [
  { year: 2025, engagementIndex: 68, eNPS: 12, attritionRisk: 22, responseRate: 74 },
  { year: 2026, engagementIndex: 73, eNPS: 24, attritionRisk: 17, responseRate: 81 },
];

// ── Benchmark (Logistics VN thị trường) ──────────────────────

export const BENCHMARK = {
  engagementIndex: { low: 62, mid: 68, high: 74, label: "Logistics VN: 62–74" },
  eNPS:            { low: 8,  mid: 18, high: 28, label: "Logistics VN: 8–28" },
  attritionRisk:   { low: 16, mid: 20, high: 26, label: "Logistics VN: 16–26%" },
  responseRate:    { low: 65, mid: 72, high: 78, label: "Logistics VN: 65–78%" },
  pillar:          { low: 3.4, mid: 3.7, high: 4.0, label: "Logistics VN: 3.4–4.0" },
};

// ── Engagement Index by Nhóm NV ─────────────────────────────

export interface GroupEngagement {
  group: string;
  label: string;
  ei2025: number;
  ei2026: number;
  eNPS2025: number;
  eNPS2026: number;
  attrition2025: number;
  attrition2026: number;
}

export const groupEngagement: GroupEngagement[] = [
  { group: "1A", label: "1A – Shipper",       ei2025: 61, ei2026: 66, eNPS2025: -5,  eNPS2026: 8,  attrition2025: 31, attrition2026: 25 },
  { group: "1B", label: "1B – Tài xế",        ei2025: 65, ei2026: 70, eNPS2025: 5,   eNPS2026: 18, attrition2025: 26, attrition2026: 20 },
  { group: "2A", label: "2A – NV Kho",        ei2025: 63, ei2026: 68, eNPS2025: 0,   eNPS2026: 12, attrition2025: 28, attrition2026: 21 },
  { group: "2B", label: "2B – QL TĐ",         ei2025: 70, ei2026: 74, eNPS2025: 15,  eNPS2026: 26, attrition2025: 18, attrition2026: 14 },
  { group: "3A", label: "3A – NV VP",         ei2025: 72, ei2026: 77, eNPS2025: 22,  eNPS2026: 35, attrition2025: 16, attrition2026: 12 },
  { group: "3B", label: "3B – Manager/Dir",   ei2025: 78, ei2026: 82, eNPS2025: 40,  eNPS2026: 48, attrition2025: 9,  attrition2026: 7  },
];

// ── eNPS by Khối ─────────────────────────────────────────────

export interface DivisionENPS {
  khoiId: string;
  khoiLabel: string;
  eNPS2025: number;
  eNPS2026: number;
  ei2025: number;
  ei2026: number;
  attrition2025: number;
  attrition2026: number;
  mei2025: number;
  mei2026: number;
}

export const divisionData: DivisionENPS[] = [
  { khoiId: "TC",  khoiLabel: "Khối Tech",        eNPS2025: 38, eNPS2026: 52, ei2025: 76, ei2026: 80, attrition2025: 12, attrition2026: 9,  mei2025: 4.2, mei2026: 4.5 },
  { khoiId: "TCS", khoiLabel: "Khối Tài Chính",   eNPS2025: 32, eNPS2026: 42, ei2025: 74, ei2026: 78, attrition2025: 10, attrition2026: 8,  mei2025: 4.0, mei2026: 4.2 },
  { khoiId: "NL",  khoiLabel: "Khối Nhân Lực",    eNPS2025: 28, eNPS2026: 36, ei2025: 73, ei2026: 77, attrition2025: 14, attrition2026: 11, mei2025: 3.9, mei2026: 4.1 },
  { khoiId: "KH",  khoiLabel: "Khối Khách Hàng",  eNPS2025: 10, eNPS2026: 20, ei2025: 67, ei2026: 71, attrition2025: 20, attrition2026: 16, mei2025: 3.6, mei2026: 3.8 },
  { khoiId: "TT",  khoiLabel: "Khối Thị Trường",  eNPS2025: 8,  eNPS2026: 16, ei2025: 65, ei2026: 70, attrition2025: 24, attrition2026: 19, mei2025: 3.5, mei2026: 3.7 },
  { khoiId: "VH",  khoiLabel: "Khối Vận Hành",    eNPS2025: -4, eNPS2026: 8,  ei2025: 60, ei2026: 65, attrition2025: 32, attrition2026: 26, mei2025: 3.2, mei2026: 3.5 },
];

// ── Top Risk / Excellence Zones ──────────────────────────────

export interface ZoneData {
  dept: string;
  khoi: string;
  attrition: number;
  engagementIndex: number;
  eNPS: number;
  pillarWeakest: string;
}

export const riskZones: ZoneData[] = [
  { dept: "Giao Hàng Chặng Cuối",   khoi: "Khối Vận Hành",   attrition: 35, engagementIndex: 58, eNPS: -10, pillarWeakest: "TC4 – Thu nhập" },
  { dept: "Quản lý Kho & Hub",      khoi: "Khối Vận Hành",   attrition: 30, engagementIndex: 62, eNPS: -2,  pillarWeakest: "TC2 – Quản lý" },
  { dept: "Kinh Doanh Vùng",        khoi: "Khối Thị Trường", attrition: 28, engagementIndex: 63, eNPS: 4,   pillarWeakest: "TC4 – Thu nhập" },
];

export const excellenceZones: ZoneData[] = [
  { dept: "Software Engineering",   khoi: "Khối Tech",       attrition: 8,  engagementIndex: 83, eNPS: 58, pillarWeakest: "" },
  { dept: "Data & Analytics",       khoi: "Khối Tech",       attrition: 9,  engagementIndex: 81, eNPS: 54, pillarWeakest: "" },
  { dept: "Kế Toán & Kiểm Soát",   khoi: "Khối Tài Chính",  attrition: 7,  engagementIndex: 80, eNPS: 46, pillarWeakest: "" },
];

// ── Pillar Scores by Group (2025 & 2026) ─────────────────────

export interface PillarScore {
  group: string;
  year: number;
  TC1: number; TC2: number; TC3: number; TC4: number; TC5: number;
}

export const pillarScoresByGroup: PillarScore[] = [
  { group: "1A", year: 2025, TC1: 3.1, TC2: 3.2, TC3: 3.5, TC4: 2.9, TC5: 3.3 },
  { group: "1A", year: 2026, TC1: 3.4, TC2: 3.5, TC3: 3.7, TC4: 3.1, TC5: 3.6 },
  { group: "1B", year: 2025, TC1: 3.3, TC2: 3.4, TC3: 3.6, TC4: 3.1, TC5: 3.4 },
  { group: "1B", year: 2026, TC1: 3.6, TC2: 3.7, TC3: 3.8, TC4: 3.3, TC5: 3.7 },
  { group: "2A", year: 2025, TC1: 3.2, TC2: 3.3, TC3: 3.5, TC4: 3.0, TC5: 3.4 },
  { group: "2A", year: 2026, TC1: 3.5, TC2: 3.6, TC3: 3.8, TC4: 3.2, TC5: 3.7 },
  { group: "2B", year: 2025, TC1: 3.6, TC2: 3.7, TC3: 3.8, TC4: 3.4, TC5: 3.8 },
  { group: "2B", year: 2026, TC1: 3.8, TC2: 3.9, TC3: 4.0, TC4: 3.6, TC5: 4.0 },
  { group: "3A", year: 2025, TC1: 3.8, TC2: 3.8, TC3: 4.0, TC4: 3.5, TC5: 3.9 },
  { group: "3A", year: 2026, TC1: 4.0, TC2: 4.1, TC3: 4.2, TC4: 3.8, TC5: 4.2 },
  { group: "3B", year: 2025, TC1: 4.1, TC2: 4.2, TC3: 4.3, TC4: 3.9, TC5: 4.2 },
  { group: "3B", year: 2026, TC1: 4.4, TC2: 4.5, TC3: 4.5, TC4: 4.1, TC5: 4.4 },
];

// Company average pillars
export const companyAvgPillars: Record<number, { TC1: number; TC2: number; TC3: number; TC4: number; TC5: number }> = {
  2025: { TC1: 3.52, TC2: 3.60, TC3: 3.78, TC4: 3.30, TC5: 3.67 },
  2026: { TC1: 3.78, TC2: 3.88, TC3: 4.00, TC4: 3.52, TC5: 3.93 },
};

// ── Pillar Scores by Division (2026) ─────────────────────────

export interface DivPillarScore {
  khoiId: string;
  khoiLabel: string;
  TC1: number; TC2: number; TC3: number; TC4: number; TC5: number;
}

export const divPillarScores: DivPillarScore[] = [
  { khoiId: "TT",  khoiLabel: "Khối Thị Trường", TC1: 3.5, TC2: 3.6, TC3: 3.8, TC4: 3.2, TC5: 3.7 },
  { khoiId: "VH",  khoiLabel: "Khối Vận Hành",   TC1: 3.2, TC2: 3.3, TC3: 3.5, TC4: 2.9, TC5: 3.4 },
  { khoiId: "KH",  khoiLabel: "Khối Khách Hàng", TC1: 3.6, TC2: 3.7, TC3: 3.9, TC4: 3.4, TC5: 3.8 },
  { khoiId: "TC",  khoiLabel: "Khối Tech",        TC1: 4.1, TC2: 4.2, TC3: 4.3, TC4: 3.9, TC5: 4.3 },
  { khoiId: "NL",  khoiLabel: "Khối Nhân Lực",    TC1: 3.9, TC2: 4.0, TC3: 4.1, TC4: 3.7, TC5: 4.1 },
  { khoiId: "TCS", khoiLabel: "Khối Tài Chính",   TC1: 4.0, TC2: 4.1, TC3: 4.2, TC4: 3.8, TC5: 4.1 },
];

// ── Question-level Scores (26 câu) ───────────────────────────

export interface QuestionScore {
  id: string;
  pillar: string;
  question: string;
  score2025: number;
  score2026: number;
  delta: number;
}

export const questionScores: QuestionScore[] = [
  // TC1 – Niềm tin lãnh đạo
  { id: "Q01", pillar: "TC1", question: "Tôi tin tưởng vào Ban lãnh đạo cấp cao của GHN.",              score2025: 3.4, score2026: 3.7, delta: 0.3 },
  { id: "Q02", pillar: "TC1", question: "Ban lãnh đạo truyền đạt định hướng chiến lược rõ ràng.",        score2025: 3.3, score2026: 3.6, delta: 0.3 },
  { id: "Q03", pillar: "TC1", question: "GHN thực hiện đúng những điều đã cam kết với nhân viên.",       score2025: 3.5, score2026: 3.9, delta: 0.4 },
  { id: "Q04", pillar: "TC1", question: "Tôi tự hào khi được làm việc tại GHN.",                        score2025: 3.8, score2026: 4.1, delta: 0.3 },
  { id: "Q05", pillar: "TC1", question: "Tôi hiểu rõ chiến lược và mục tiêu dài hạn của GHN.",          score2025: 3.6, score2026: 3.8, delta: 0.2 },
  // TC2 – Quản lý
  { id: "Q06", pillar: "TC2", question: "Quản lý trực tiếp của tôi hỗ trợ và phát triển tôi.",          score2025: 3.5, score2026: 3.9, delta: 0.4 },
  { id: "Q07", pillar: "TC2", question: "Tôi nhận được phản hồi thường xuyên và có giá trị.",            score2025: 3.2, score2026: 3.7, delta: 0.5 },
  { id: "Q08", pillar: "TC2", question: "Quản lý của tôi công nhận đóng góp của tôi kịp thời.",         score2025: 3.4, score2026: 3.8, delta: 0.4 },
  { id: "Q09", pillar: "TC2", question: "Quản lý của tôi xử lý các vấn đề của nhóm một cách công bằng.",score2025: 3.6, score2026: 4.0, delta: 0.4 },
  { id: "Q10", pillar: "TC2", question: "Tôi cảm thấy được lắng nghe bởi quản lý của mình.",            score2025: 3.7, score2026: 4.0, delta: 0.3 },
  // TC3 – Công việc
  { id: "Q11", pillar: "TC3", question: "Công việc của tôi có ý nghĩa và tôi thấy được đóng góp.",      score2025: 3.9, score2026: 4.2, delta: 0.3 },
  { id: "Q12", pillar: "TC3", question: "Tôi có đủ nguồn lực để hoàn thành công việc hiệu quả.",        score2025: 3.4, score2026: 3.8, delta: 0.4 },
  { id: "Q13", pillar: "TC3", question: "Kỳ vọng công việc của tôi được truyền đạt rõ ràng.",           score2025: 3.7, score2026: 4.0, delta: 0.3 },
  { id: "Q14", pillar: "TC3", question: "Tôi có cơ hội phát triển kỹ năng và thăng tiến.",              score2025: 3.5, score2026: 3.9, delta: 0.4 },
  { id: "Q15", pillar: "TC3", question: "Khối lượng công việc của tôi ở mức hợp lý và bền vững.",       score2025: 3.3, score2026: 3.7, delta: 0.4 },
  { id: "Q16", pillar: "TC3", question: "Tôi có quyền tự chủ phù hợp trong công việc.",                 score2025: 3.6, score2026: 3.9, delta: 0.3 },
  // TC4 – Thu nhập
  { id: "Q17", pillar: "TC4", question: "Mức lương của tôi phản ánh đúng đóng góp và năng lực.",        score2025: 3.0, score2026: 3.4, delta: 0.4 },
  { id: "Q18", pillar: "TC4", question: "Hệ thống khen thưởng và phúc lợi của GHN cạnh tranh.",         score2025: 3.2, score2026: 3.6, delta: 0.4 },
  { id: "Q19", pillar: "TC4", question: "Tôi hiểu rõ cách thu nhập của mình được tính toán.",           score2025: 3.4, score2026: 3.7, delta: 0.3 },
  { id: "Q20", pillar: "TC4", question: "GHN đối xử công bằng trong việc trao thưởng và ghi nhận.",     score2025: 3.5, score2026: 3.8, delta: 0.3 },
  // TC5 – Môi trường
  { id: "Q21", pillar: "TC5", question: "Môi trường làm việc của tôi an toàn và thoải mái.",            score2025: 3.7, score2026: 4.0, delta: 0.3 },
  { id: "Q22", pillar: "TC5", question: "Văn hóa GHN khuyến khích sự hợp tác và hỗ trợ lẫn nhau.",     score2025: 3.8, score2026: 4.1, delta: 0.3 },
  { id: "Q23", pillar: "TC5", question: "GHN tôn trọng sự đa dạng và hòa nhập (D&I).",                  score2025: 3.9, score2026: 4.2, delta: 0.3 },
  { id: "Q24", pillar: "TC5", question: "Tôi có thể cân bằng tốt giữa công việc và cuộc sống cá nhân.",score2025: 3.5, score2026: 3.8, delta: 0.3 },
  { id: "Q25", pillar: "TC5", question: "GHN quan tâm đến sức khỏe thể chất và tinh thần của nhân viên.",score2025: 3.6, score2026: 3.9, delta: 0.3 },
  // eNPS
  { id: "Q26", pillar: "eNPS", question: "Bạn có sẵn sàng giới thiệu GHN là nơi làm việc tốt? (0–10)", score2025: 3.1, score2026: 3.6, delta: 0.5 },
];

// ── NLP / Sentiment Data ─────────────────────────────────────

export interface SentimentData {
  group: string;
  positiveKeywords: string[];
  painPoints: string[];
  quotes: { text: string; source: string; sentiment: "positive" | "negative" }[];
}

export const sentimentData: SentimentData[] = [
  {
    group: "1A",
    positiveKeywords: ["đồng nghiệp thân thiện", "hỗ trợ kịp thời", "công việc ổn định"],
    painPoints: ["thu nhập thấp", "áp lực KPI", "thiếu trang thiết bị", "ca làm việc dài"],
    quotes: [
      { text: "Tôi yêu thích tinh thần đồng đội ở đây nhưng KPI mỗi tháng một khác khiến tôi căng thẳng.", source: "Shipper – Hà Nội", sentiment: "negative" },
      { text: "Cần tăng phụ cấp xăng xe, giá xăng tăng mà phụ cấp chưa được điều chỉnh.", source: "Shipper – TP.HCM", sentiment: "negative" },
    ],
  },
  {
    group: "1B",
    positiveKeywords: ["lịch linh hoạt", "đồng nghiệp tốt", "môi trường an toàn"],
    painPoints: ["áp lực giao hàng", "thiếu chỗ nghỉ ngơi", "xe cũ hay hỏng"],
    quotes: [
      { text: "Xe tải được bảo dưỡng tốt hơn năm ngoái, tôi cảm thấy an toàn hơn khi chạy đường dài.", source: "Tài xế – Bình Dương", sentiment: "positive" },
      { text: "Cần có khu vực nghỉ ngơi tại hub cho tài xế, hiện giờ không có chỗ nào phù hợp.", source: "Tài xế – Đồng Nai", sentiment: "negative" },
    ],
  },
  {
    group: "3A",
    positiveKeywords: ["cơ hội học hỏi", "văn hóa cởi mở", "lãnh đạo minh bạch", "phúc lợi tốt"],
    painPoints: ["quy trình phê duyệt chậm", "họp nhiều", "thiếu công cụ làm việc"],
    quotes: [
      { text: "Chương trình đào tạo năm nay rất chất lượng, tôi đã học được nhiều kỹ năng mới.", source: "NV Văn phòng – HO", sentiment: "positive" },
      { text: "Quy trình phê duyệt còn nhiều tầng lớp, mất nhiều thời gian để ra quyết định.", source: "NV Văn phòng – HO", sentiment: "negative" },
    ],
  },
  {
    group: "ALL",
    positiveKeywords: ["đồng nghiệp", "ổn định", "phúc lợi", "môi trường", "lãnh đạo"],
    painPoints: ["thu nhập", "KPI áp lực", "quy trình", "trang thiết bị", "cơ hội thăng tiến"],
    quotes: [
      { text: "GHN đang phát triển rất tốt, tôi tự hào được là một phần của công ty.", source: "NV Văn phòng – TP.HCM", sentiment: "positive" },
      { text: "Cần cải thiện cơ hội thăng tiến rõ ràng hơn, tôi cảm thấy chưa có lộ trình rõ ràng.", source: "NV Kho – Hà Nội", sentiment: "negative" },
    ],
  },
];

// ── Action Tracker Data ──────────────────────────────────────

export type ActionStatus = "Chưa bắt đầu" | "Đang làm" | "Hoàn thành" | "Trễ hạn";

export interface ActionItem {
  id: string;
  insight: string;
  actionName: string;
  khoi: string;
  owner: string;
  deadline: string;
  status: ActionStatus;
  progress: number;
  impact: "Cao" | "Trung bình" | "Thấp";
  effort: "Cao" | "Trung bình" | "Thấp";
}

export const actionItems: ActionItem[] = [
  { id: "ACT-001", insight: "Thu nhập nhóm 1A thấp hơn thị trường 15%",            actionName: "Review & tái cơ cấu bảng lương nhóm Shipper",           khoi: "Khối Nhân Lực",    owner: "Nguyễn Minh Tuấn",  deadline: "2026-07-31", status: "Đang làm",       progress: 60, impact: "Cao",       effort: "Cao" },
  { id: "ACT-002", insight: "KPI áp lực, thiếu minh bạch về tiêu chí đánh giá",    actionName: "Xây dựng KPI Cascade rõ ràng & workshop giải thích",     khoi: "Khối Vận Hành",    owner: "Trần Thị Lan",      deadline: "2026-06-30", status: "Hoàn thành",     progress: 100, impact: "Cao",       effort: "Trung bình" },
  { id: "ACT-003", insight: "Thiếu trang thiết bị bảo hộ cho NV Kho",              actionName: "Cấp phát đồng phục & thiết bị bảo hộ toàn bộ NV Kho",   khoi: "Khối Vận Hành",    owner: "Lê Văn Hùng",       deadline: "2026-05-15", status: "Trễ hạn",        progress: 40, impact: "Trung bình", effort: "Thấp" },
  { id: "ACT-004", insight: "Cơ hội phát triển & đào tạo chưa rõ ràng",            actionName: "Ra mắt Learning Hub & lộ trình phát triển cá nhân",      khoi: "Khối Nhân Lực",    owner: "Phạm Thu Hà",       deadline: "2026-08-31", status: "Đang làm",       progress: 45, impact: "Cao",       effort: "Cao" },
  { id: "ACT-005", insight: "Điểm TC2 (Quản lý) Khối Vận Hành thấp nhất toàn CT", actionName: "Chương trình coaching 360° cho QL Tuyến đầu",             khoi: "Khối Vận Hành",    owner: "Nguyễn Đức Thành",  deadline: "2026-09-30", status: "Chưa bắt đầu",  progress: 0,  impact: "Cao",       effort: "Trung bình" },
  { id: "ACT-006", insight: "eNPS Khối Thị Trường cải thiện chậm",                 actionName: "Town Hall hàng quý & kênh phản hồi Anonymous",            khoi: "Khối Thị Trường",  owner: "Võ Thị Mai",        deadline: "2026-06-30", status: "Hoàn thành",     progress: 100, impact: "Trung bình", effort: "Thấp" },
  { id: "ACT-007", insight: "Nhóm Gen Z thiếu kết nối với văn hóa GHN",            actionName: "GHN Culture Camp & Onboarding Experience redesign",       khoi: "Khối Nhân Lực",    owner: "Đặng Quốc Bảo",    deadline: "2026-08-15", status: "Đang làm",       progress: 35, impact: "Cao",       effort: "Trung bình" },
  { id: "ACT-008", insight: "Tài xế thiếu cơ sở vật chất nghỉ ngơi tại hub",       actionName: "Nâng cấp phòng nghỉ tại 20 hub trọng điểm",              khoi: "Khối Vận Hành",    owner: "Lê Văn Hùng",       deadline: "2026-10-31", status: "Chưa bắt đầu",  progress: 0,  impact: "Trung bình", effort: "Cao" },
  { id: "ACT-009", insight: "Quy trình phê duyệt quá nhiều tầng lớp",              actionName: "Streamline approval workflow – áp dụng D&I Toolkit",      khoi: "Khối Tech",        owner: "Bùi Thanh Long",    deadline: "2026-07-15", status: "Đang làm",       progress: 70, impact: "Trung bình", effort: "Trung bình" },
  { id: "ACT-010", insight: "Retention risk nhóm Senior Engineer cao",              actionName: "Retention package & Career Path rõ ràng cho Tech",        khoi: "Khối Tech",        owner: "Nguyễn Việt Cường", deadline: "2026-06-15", status: "Hoàn thành",     progress: 100, impact: "Cao",       effort: "Trung bình" },
];

// ── Waterfall eNPS Bridge 2025 → 2026 ───────────────────────

export interface WaterfallItem {
  name: string;
  value: number;
  type: "start" | "positive" | "negative" | "end";
}

export const eNPSWaterfall: WaterfallItem[] = [
  { name: "eNPS 2025",            value: 12,  type: "start" },
  { name: "Cải thiện Quản lý",   value: 5,   type: "positive" },
  { name: "Tăng thu nhập",       value: 4,   type: "positive" },
  { name: "Văn hóa & EX",        value: 3,   type: "positive" },
  { name: "Đào tạo & PT",        value: 2,   type: "positive" },
  { name: "Áp lực KPI cao",      value: -2,  type: "negative" },
  { name: "eNPS 2026",           value: 24,  type: "end" },
];

// ── Demographic Data ─────────────────────────────────────────

export const demographicSeniority = [
  { name: "< 1 năm",   value: 28 },
  { name: "1–3 năm",   value: 35 },
  { name: "3–5 năm",   value: 22 },
  { name: "5–10 năm",  value: 11 },
  { name: "> 10 năm",  value: 4  },
];

export const demographicGeneration = [
  { name: "Gen Z (1997–2012)", value: 38 },
  { name: "Gen Y (1981–1996)", value: 45 },
  { name: "Gen X (1965–1980)", value: 17 },
];

// Demographic by Khối
export const demographicByKhoi = [
  { khoiId: "VH",  genZ: 45, genY: 42, genX: 13, avgTenure: 1.8, headcount: 9200 },
  { khoiId: "TT",  genZ: 40, genY: 48, genX: 12, avgTenure: 2.1, headcount: 5600 },
  { khoiId: "KH",  genZ: 36, genY: 50, genX: 14, avgTenure: 2.5, headcount: 3100 },
  { khoiId: "TC",  genZ: 55, genY: 38, genX: 7,  avgTenure: 2.0, headcount: 1800 },
  { khoiId: "NL",  genZ: 32, genY: 52, genX: 16, avgTenure: 3.2, headcount: 1400 },
  { khoiId: "TCS", genZ: 28, genY: 54, genX: 18, avgTenure: 3.8, headcount: 1900 },
];

// eNPS by Generation
export const eNPSByGeneration = [
  { name: "Gen Z",   eNPS2025: 5,  eNPS2026: 18 },
  { name: "Gen Y",   eNPS2025: 15, eNPS2026: 28 },
  { name: "Gen X",   eNPS2025: 22, eNPS2026: 32 },
];

// ── Quick Wins Impact/Effort Matrix ──────────────────────────

export interface QuickWin {
  id: string;
  name: string;
  impact: number;   // 1–5
  effort: number;   // 1–5 (5 = very hard)
  timeline: "0–1 tháng" | "1–3 tháng" | "3–6 tháng";
  owner: string;
  status: ActionStatus;
}

export const quickWins: QuickWin[] = [
  { id: "QW-01", name: "Điều chỉnh phụ cấp xăng xe Shipper",      impact: 4, effort: 2, timeline: "0–1 tháng",  owner: "HR C&B",    status: "Đang làm" },
  { id: "QW-02", name: "Town Hall quý 2 – kênh anonymous",         impact: 3, effort: 1, timeline: "0–1 tháng",  owner: "Comm",      status: "Hoàn thành" },
  { id: "QW-03", name: "Cấp phát thiết bị bảo hộ NV Kho",         impact: 3, effort: 2, timeline: "0–1 tháng",  owner: "Ops",       status: "Trễ hạn" },
  { id: "QW-04", name: "Workshop KPI Cascade Vận Hành",            impact: 4, effort: 2, timeline: "1–3 tháng",  owner: "L&D",       status: "Hoàn thành" },
  { id: "QW-05", name: "Retention package Senior Engineer",         impact: 5, effort: 3, timeline: "1–3 tháng",  owner: "HRBP",      status: "Hoàn thành" },
  { id: "QW-06", name: "Ra mắt Learning Hub nội bộ",               impact: 4, effort: 4, timeline: "3–6 tháng",  owner: "L&D",       status: "Đang làm" },
  { id: "QW-07", name: "Redesign onboarding Gen Z",                 impact: 4, effort: 3, timeline: "3–6 tháng",  owner: "TA & EX",   status: "Đang làm" },
  { id: "QW-08", name: "Coaching 360° QL Tuyến đầu",               impact: 5, effort: 4, timeline: "3–6 tháng",  owner: "L&D",       status: "Chưa bắt đầu" },
  { id: "QW-09", name: "Nâng cấp phòng nghỉ 20 hub",               impact: 3, effort: 5, timeline: "3–6 tháng",  owner: "Ops",       status: "Chưa bắt đầu" },
  { id: "QW-10", name: "Streamline approval workflow",              impact: 3, effort: 3, timeline: "1–3 tháng",  owner: "Tech",      status: "Đang làm" },
];

// ── 26-Question Framework ─────────────────────────────────────

export interface Question {
  id: string;
  pillar: string;
  question: string;
}

export const questionFramework: Question[] = questionScores.map(q => ({
  id: q.id, pillar: q.pillar, question: q.question,
}));

// ── Helper Functions ──────────────────────────────────────────

export function getKpiForYear(year: number): KpiData | undefined {
  return kpiData.find((d) => d.year === year);
}

export function getPillarScores(group: string, year: number): PillarScore | undefined {
  return pillarScoresByGroup.find((p) => p.group === group && p.year === year);
}

export function getQuestionsByPillar(pillarId: string): QuestionScore[] {
  return questionScores.filter((q) => q.pillar === pillarId);
}

export function calcEngagementCategory(score: number): "Engaged" | "Passive" | "Disengaged" {
  if (score >= 75) return "Engaged";
  if (score >= 60) return "Passive";
  return "Disengaged";
}
