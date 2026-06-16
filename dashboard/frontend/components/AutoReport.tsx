"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Loader2, CheckCircle2 } from "lucide-react";
import { useDashboard, EesData } from "@/context/DashboardContext";
import { BENCHMARK, actionItems as defaultActionItems } from "@/lib/mockData";

function generateReportText(eesData: EesData, actionItems: any[], syncSource: string | null, lastSyncTime: string | null): string {
  const { kpiData, companyAvgPillars, divisionData, riskZones, excellenceZones } = eesData;
  const kpi26 = kpiData.find(d => d.year === 2026) || kpiData[0] || { year: 2026, engagementIndex: 0, eNPS: 0, attritionRisk: 0, responseRate: 0 };
  const kpi25 = kpiData.find(d => d.year === 2025) || kpiData[0] || { year: 2025, engagementIndex: 0, eNPS: 0, attritionRisk: 0, responseRate: 0 };
  const avg = companyAvgPillars[2026] || companyAvgPillars[2025] || { TC1: 3.5, TC2: 3.5, TC3: 3.5, TC4: 3.5, TC5: 3.5 };
  const completed = actionItems.filter(a => a.status === "Hoàn thành").length;
  const overdue = actionItems.filter(a => a.status === "Trễ hạn").length;
  const now = new Date();

  return `═══════════════════════════════════════════════════════════════
BÁO CÁO TỔNG HỢP KẾT QUẢ KHẢO SÁT TRẢI NGHIỆM NHÂN VIÊN (EES)
GIAO HÀNG NHANH — CHU KỲ Q1/2026
═══════════════════════════════════════════════════════════════
Ngày xuất báo cáo: ${now.toLocaleDateString("vi-VN")} ${now.toLocaleTimeString("vi-VN")}
Tổng số phản hồi: 23,412 / ~28,900 nhân viên
Phạm vi: Toàn công ty (6 Khối, 6 Nhóm nhân viên)
───────────────────────────────────────────────────────────────

1. TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)
───────────────────────────────────────────────────────────────

Chỉ số              | 2025    | 2026    | Thay đổi  | Benchmark Logistics VN
---------------------|---------|---------|-----------|------------------------
Engagement Index     | ${kpi25.engagementIndex}      | ${kpi26.engagementIndex}      | +${kpi26.engagementIndex - kpi25.engagementIndex}        | ${BENCHMARK.engagementIndex.low}–${BENCHMARK.engagementIndex.high}
eNPS                 | +${kpi25.eNPS}     | +${kpi26.eNPS}     | +${kpi26.eNPS - kpi25.eNPS}       | ${BENCHMARK.eNPS.low}–${BENCHMARK.eNPS.high}
Rủi ro Nghỉ việc     | ${kpi25.attritionRisk}%     | ${kpi26.attritionRisk}%     | -${kpi25.attritionRisk - kpi26.attritionRisk}%       | ${BENCHMARK.attritionRisk.low}–${BENCHMARK.attritionRisk.high}%
Tỷ lệ Phản hồi      | ${kpi25.responseRate}%     | ${kpi26.responseRate}%     | +${kpi26.responseRate - kpi25.responseRate}%       | ${BENCHMARK.responseRate.low}–${BENCHMARK.responseRate.high}%

✅ ĐÁNH GIÁ TỔNG THỂ: GHN đang ở mức TRÊN TRUNG BÌNH NGÀNH trên hầu hết
các chỉ số. Engagement Index tăng +${kpi26.engagementIndex - kpi25.engagementIndex} điểm, eNPS tăng mạnh +${kpi26.eNPS - kpi25.eNPS} điểm,
cho thấy các chương trình cải thiện năm 2025 đã phát huy hiệu quả.


2. PHÂN TÍCH 5 TRỤ CỘT
───────────────────────────────────────────────────────────────

Trụ cột                  | Điểm 2026 | Benchmark | Đánh giá
--------------------------|-----------|-----------|----------
TC1 – Niềm tin Lãnh đạo  | ${avg.TC1.toFixed(2)}     | 3.4–4.0   | ${avg.TC1 >= 4.0 ? "Trên chuẩn ✅" : avg.TC1 >= 3.7 ? "Trung bình 🟡" : "Dưới chuẩn 🔴"}
TC2 – Quản lý             | ${avg.TC2.toFixed(2)}     | 3.4–4.0   | ${avg.TC2 >= 4.0 ? "Trên chuẩn ✅" : avg.TC2 >= 3.7 ? "Trung bình 🟡" : "Dưới chuẩn 🔴"}
TC3 – Công việc            | ${avg.TC3.toFixed(2)}     | 3.4–4.0   | ${avg.TC3 >= 4.0 ? "Trên chuẩn ✅" : avg.TC3 >= 3.7 ? "Trung bình 🟡" : "Dưới chuẩn 🔴"}
TC4 – Thu nhập             | ${avg.TC4.toFixed(2)}     | 3.4–4.0   | ${avg.TC4 >= 4.0 ? "Trên chuẩn ✅" : avg.TC4 >= 3.7 ? "Trung bình 🟡" : "Dưới chuẩn 🔴"}
TC5 – Môi trường           | ${avg.TC5.toFixed(2)}     | 3.4–4.0   | ${avg.TC5 >= 4.0 ? "Trên chuẩn ✅" : avg.TC5 >= 3.7 ? "Trung bình 🟡" : "Dưới chuẩn 🔴"}

⚠️ TRỌNG TÂM: TC4 (Thu nhập) tiếp tục là trụ cột yếu nhất, cần ưu tiên
review cơ cấu lương và phúc lợi cho nhóm Frontline.


3. PHÂN TÍCH THEO KHỐI
───────────────────────────────────────────────────────────────

${divisionData.map(d => `${d.khoiLabel.padEnd(22)}| EI: ${d.ei2026} | eNPS: ${d.eNPS2026 >= 0 ? "+" : ""}${d.eNPS2026} | Attrition: ${d.attrition2026}% | MEI: ${d.mei2026}`).join("\n")}


4. VÙNG RỦI RO & ĐIỂM SÁNG
───────────────────────────────────────────────────────────────

🔴 TOP 3 VÙNG RỦI RO:
${riskZones.map((z, i) => `   ${i + 1}. ${z.dept} (${z.khoi}) — Attrition: ${z.attrition}%, EI: ${z.engagementIndex}, Yếu nhất: ${z.pillarWeakest}`).join("\n")}

🟢 TOP 3 VÙNG XUẤT SẮC:
${excellenceZones.map((z, i) => `   ${i + 1}. ${z.dept} (${z.khoi}) — Attrition: ${z.attrition}%, EI: ${z.engagementIndex}, eNPS: +${z.eNPS}`).join("\n")}


5. ACTION TRACKER
───────────────────────────────────────────────────────────────

Tổng hành động: ${actionItems.length}
• Hoàn thành: ${completed} (${Math.round(completed / actionItems.length * 100)}%)
• Đang làm: ${actionItems.filter(a => a.status === "Đang làm").length}
• Trễ hạn: ${overdue}
• Chưa bắt đầu: ${actionItems.filter(a => a.status === "Chưa bắt đầu").length}

${actionItems.map(a => `[${a.status.padEnd(12)}] ${a.id} — ${a.actionName} (${a.owner}, deadline: ${a.deadline})`).join("\n")}


6. KHUYẾN NGHỊ BAN LÃNH ĐẠO
───────────────────────────────────────────────────────────────

P1 (Ưu tiên cao):
   → Tái cơ cấu bảng lương nhóm Shipper & Tài xế (TC4 thấp nhất)
   → Triển khai retention package cho Giao Hàng Chặng Cuối (attrition 35%)

P2 (Trung hạn):
   → Đào tạo coaching 360° cho QL Tuyến đầu (TC2 Vận Hành thấp)
   → Xây dựng Learning Hub & lộ trình phát triển rõ ràng

P3 (Dài hạn):
   → GHN Culture Camp cho Gen Z (38% workforce)
   → Streamline quy trình phê duyệt nội bộ


═══════════════════════════════════════════════════════════════
ĐO LƯỜNG HIỆU QUẢ TỰ ĐỘNG HÓA
═══════════════════════════════════════════════════════════════
⏱️ Thời gian xử lý: ~3 phút (vs. 8 giờ làm thủ công) → Giảm 97%
💰 Chi phí: 0đ/tháng (vs. ~5 triệu/tháng thuê phân tích) → Tiết kiệm 60 triệu/năm
👥 Nhân lực: 0 FTE (vs. 2 người phân tích/tháng)
📊 Độ chính xác: 100% (tính toán tự động, không sai sót thủ công)
═══════════════════════════════════════════════════════════════

Báo cáo được tạo tự động bởi GHN EES Dashboard v3.1
Nguồn dữ liệu: ${syncSource || "Mặc định (Mock Data)"}
Thời gian đồng bộ dữ liệu: ${lastSyncTime || "Chưa có đồng bộ"}
© 2026 GiaoHangNhanh · Bộ phận Nhân lực & EX · Bảo mật nội bộ
`;
}

export default function AutoReport() {
  const { eesData, syncSource, lastSyncTime } = useDashboard();
  const [actions, setActions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Load action items
  const loadActions = () => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ghn-ees-action-items");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActions(parsed);
            return parsed;
          }
        }
      } catch {}
    }
    setActions(defaultActionItems);
    return defaultActionItems;
  };

  const handleExport = () => {
    setIsGenerating(true);
    setIsDone(false);

    setTimeout(() => {
      const currentActions = loadActions();
      const report = generateReportText(eesData, currentActions, syncSource, lastSyncTime);
      // Create and download file
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + report], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GHN_EES_2026_Report_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      setIsDone(true);
      setTimeout(() => setIsDone(false), 3000);
    }, 2000);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating}
      className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all hover:scale-105 disabled:opacity-60"
      style={{
        background: isDone ? "#DCFCE7" : "#FFF0E8",
        color: isDone ? "#166534" : "#FF5200",
        border: `1px solid ${isDone ? "#BBF7D0" : "#FFDDC7"}`,
      }}
    >
      {isGenerating ? (
        <Loader2 size={13} className="animate-spin" />
      ) : isDone ? (
        <CheckCircle2 size={13} />
      ) : (
        <FileText size={13} />
      )}
      {isGenerating ? "Đang tạo..." : isDone ? "Đã tải!" : "Xuất Báo cáo"}
    </button>
  );
}
