"use client";

import { useState, useMemo } from "react";
import { Bell, X, AlertTriangle, TrendingDown, TrendingUp, Shield, Info } from "lucide-react";
import { kpiData, divisionData, groupEngagement, actionItems, BENCHMARK, riskZones } from "@/lib/mockData";

interface Alert {
  id: string;
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  recommendation: string;
  metric: string;
  value: string;
  timestamp: Date;
}

function generateAlerts(): Alert[] {
  const kpi26 = kpiData.find(d => d.year === 2026)!;
  const kpi25 = kpiData.find(d => d.year === 2025)!;
  const alerts: Alert[] = [];
  const now = new Date();

  // Critical: Attrition risk zones
  riskZones.forEach((zone, i) => {
    if (zone.attrition >= 30) {
      alerts.push({
        id: `crit-attrition-${i}`,
        severity: "critical",
        title: `Attrition nguy hiểm: ${zone.dept}`,
        description: `Tỷ lệ rủi ro nghỉ việc tại ${zone.dept} (${zone.khoi}) đạt ${zone.attrition}%, vượt xa ngưỡng an toàn.`,
        recommendation: `Triển khai ngay retention package & exit interview cho ${zone.dept}. Ưu tiên cải thiện ${zone.pillarWeakest}.`,
        metric: "Attrition Risk",
        value: `${zone.attrition}%`,
        timestamp: new Date(now.getTime() - i * 3600000),
      });
    }
  });

  // Warning: Divisions with low eNPS
  divisionData.forEach(div => {
    if (div.eNPS2026 < 15) {
      alerts.push({
        id: `warn-enps-${div.khoiId}`,
        severity: "warning",
        title: `eNPS thấp: ${div.khoiLabel}`,
        description: `eNPS ${div.khoiLabel} chỉ đạt +${div.eNPS2026}, dưới mức trung bình ngành (${BENCHMARK.eNPS.mid}).`,
        recommendation: `Tổ chức Town Hall & khảo sát nhanh để hiểu nguyên nhân. Tập trung vào nhóm Detractors.`,
        metric: "eNPS",
        value: `+${div.eNPS2026}`,
        timestamp: new Date(now.getTime() - 7200000),
      });
    }
  });

  // Warning: Overdue actions
  const overdueActions = actionItems.filter(a => a.status === "Trễ hạn");
  if (overdueActions.length > 0) {
    alerts.push({
      id: "warn-overdue",
      severity: "warning",
      title: `${overdueActions.length} hành động trễ hạn`,
      description: `Có ${overdueActions.length} hành động trong Action Tracker đã quá deadline: ${overdueActions.map(a => a.id).join(", ")}.`,
      recommendation: `Đôn đốc ngay người phụ trách và cập nhật timeline mới.`,
      metric: "Action Tracker",
      value: `${overdueActions.length} overdue`,
      timestamp: new Date(now.getTime() - 1800000),
    });
  }

  // Warning: Low EI groups
  groupEngagement.forEach(g => {
    if (g.ei2026 < 68) {
      alerts.push({
        id: `warn-ei-${g.group}`,
        severity: "warning",
        title: `EI thấp: Nhóm ${g.label}`,
        description: `Engagement Index nhóm ${g.label} chỉ đạt ${g.ei2026}/100, dưới benchmark ngành (${BENCHMARK.engagementIndex.mid}).`,
        recommendation: `Thiết kế chương trình engagement riêng cho nhóm ${g.label}. Focus vào trụ cột Thu nhập (TC4).`,
        metric: "Engagement Index",
        value: `${g.ei2026}`,
        timestamp: new Date(now.getTime() - 5400000),
      });
    }
  });

  // Success: Improved metrics
  if (kpi26.eNPS - kpi25.eNPS >= 10) {
    alerts.push({
      id: "success-enps",
      severity: "success",
      title: "eNPS tăng vượt trội!",
      description: `eNPS toàn công ty tăng +${kpi26.eNPS - kpi25.eNPS} điểm so với năm trước (${kpi25.eNPS} → ${kpi26.eNPS}).`,
      recommendation: `Duy trì momentum bằng cách tiếp tục các chương trình đã hiệu quả.`,
      metric: "eNPS",
      value: `+${kpi26.eNPS}`,
      timestamp: new Date(now.getTime() - 86400000),
    });
  }

  if (kpi26.responseRate >= BENCHMARK.responseRate.high) {
    alerts.push({
      id: "success-response",
      severity: "success",
      title: "Tỷ lệ phản hồi vượt chuẩn!",
      description: `${kpi26.responseRate}% nhân viên tham gia khảo sát, vượt benchmark ngành (${BENCHMARK.responseRate.high}%).`,
      recommendation: `Ghi nhận và cảm ơn các Khối có tỷ lệ phản hồi cao nhất.`,
      metric: "Response Rate",
      value: `${kpi26.responseRate}%`,
      timestamp: new Date(now.getTime() - 172800000),
    });
  }

  // Info: General
  alerts.push({
    id: "info-cycle",
    severity: "info",
    title: "Chu kỳ khảo sát Q1/2026 hoàn tất",
    description: `Đã thu thập 23,412 phản hồi từ 28,900+ nhân viên. Dữ liệu đã được xử lý và phân tích.`,
    recommendation: `Bắt đầu triển khai Action Plan dựa trên kết quả phân tích.`,
    metric: "Survey",
    value: "23,412 responses",
    timestamp: new Date(now.getTime() - 259200000),
  });

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

const SEVERITY_CONFIG = {
  critical: { bg: "#FEE2E2", border: "#FECACA", text: "#991B1B", icon: AlertTriangle, iconColor: "#DC2626", label: "Nguy hiểm" },
  warning:  { bg: "#FEF3C7", border: "#FDE68A", text: "#92400E", icon: TrendingDown, iconColor: "#D97706", label: "Cảnh báo" },
  info:     { bg: "#DBEAFE", border: "#BFDBFE", text: "#1E40AF", icon: Info, iconColor: "#2563EB", label: "Thông tin" },
  success:  { bg: "#DCFCE7", border: "#BBF7D0", text: "#166534", icon: TrendingUp, iconColor: "#16A34A", label: "Tích cực" },
};

export default function AlertPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const alerts = useMemo(() => generateAlerts(), []);

  const visibleAlerts = alerts.filter(a => !dismissedIds.has(a.id));
  const criticalCount = visibleAlerts.filter(a => a.severity === "critical" || a.severity === "warning").length;

  const dismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all hover:scale-105"
        style={{ background: criticalCount > 0 ? "#FEF3C7" : "#F1F5F9", color: criticalCount > 0 ? "#92400E" : "#64748B", border: `1px solid ${criticalCount > 0 ? "#FDE68A" : "#E2E8F0"}` }}
      >
        <Bell size={13} />
        Cảnh báo
        {criticalCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {criticalCount}
          </span>
        )}
      </button>

      {/* Panel dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-[420px] max-h-[500px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #E4E9F0" }}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FF5200]" />
                <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                  Hệ thống Cảnh báo Tự động
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {visibleAlerts.length} cảnh báo
              </span>
            </div>

            {/* Alerts list */}
            <div className="overflow-y-auto max-h-[420px] p-2 space-y-2">
              {visibleAlerts.map(alert => {
                const config = SEVERITY_CONFIG[alert.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg relative group transition-all hover:shadow-md"
                    style={{ background: config.bg, border: `1px solid ${config.border}` }}
                  >
                    <button
                      onClick={() => dismiss(alert.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-black/5"
                    >
                      <X size={12} style={{ color: config.text }} />
                    </button>
                    <div className="flex gap-2.5">
                      <div className="shrink-0 mt-0.5">
                        <Icon size={16} style={{ color: config.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: config.iconColor + "20", color: config.iconColor }}>
                            {config.label}
                          </span>
                          <span className="text-[10px]" style={{ color: config.text + "99" }}>
                            {alert.timestamp.toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="text-[12px] font-bold mb-1" style={{ color: config.text }}>
                          {alert.title}
                        </div>
                        <div className="text-[11px] mb-2 leading-relaxed" style={{ color: config.text + "CC" }}>
                          {alert.description}
                        </div>
                        <div className="text-[10px] italic pl-2" style={{ borderLeft: `2px solid ${config.iconColor}40`, color: config.text + "AA" }}>
                          💡 {alert.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
