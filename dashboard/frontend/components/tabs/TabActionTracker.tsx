"use client";

import { useState, useMemo } from "react";
import { actionItems, ActionStatus, KHOI } from "@/lib/mockData";
import {
  CheckCircle2, Clock, AlertCircle, ListTodo,
  ChevronDown,
} from "lucide-react";

// ── Status Badge ──────────────────────────────────────────────

const statusConfig: Record<
  ActionStatus,
  { color: string; bg: string; icon: React.ReactNode; dot: string }
> = {
  "Chưa bắt đầu": {
    color: "text-slate-500",
    bg: "bg-slate-100",
    icon: <Clock size={11} />,
    dot: "bg-slate-400",
  },
  "Đang làm": {
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: <ListTodo size={11} />,
    dot: "bg-blue-500",
  },
  "Hoàn thành": {
    color: "text-green-600",
    bg: "bg-green-50",
    icon: <CheckCircle2 size={11} />,
    dot: "bg-green-500",
  },
  "Trễ hạn": {
    color: "text-red-600",
    bg: "bg-red-50",
    icon: <AlertCircle size={11} />,
    dot: "bg-red-500",
  },
};

function StatusBadge({ status }: { status: ActionStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
    >
      {cfg.icon}
      {status}
    </span>
  );
}

// ── Progress Bar ──────────────────────────────────────────────

function ProgressBar({ value, status }: { value: number; status: ActionStatus }) {
  const colorMap: Record<ActionStatus, string> = {
    "Chưa bắt đầu": "bg-slate-300",
    "Đang làm": "bg-blue-500",
    "Hoàn thành": "bg-green-500",
    "Trễ hạn": "bg-red-500",
  };
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorMap[status]}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 font-medium w-8 text-right">{value}%</span>
    </div>
  );
}

// ── Summary Card ──────────────────────────────────────────────

function SummaryCard({
  label, value, sub, color,
}: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────

export default function TabActionTracker() {
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "">("");
  const [khoiFilter, setKhoiFilter] = useState("");

  const total = actionItems.length;
  const completed = actionItems.filter((a) => a.status === "Hoàn thành").length;
  const overdue = actionItems.filter((a) => a.status === "Trễ hạn").length;
  const completedPct = Math.round((completed / total) * 100);

  const filtered = useMemo(() => {
    return actionItems.filter((a) => {
      const statusOk = !statusFilter || a.status === statusFilter;
      const khoiOk = !khoiFilter || a.khoi.includes(khoiFilter);
      return statusOk && khoiOk;
    });
  }, [statusFilter, khoiFilter]);

  const statusOptions: ActionStatus[] = [
    "Chưa bắt đầu", "Đang làm", "Hoàn thành", "Trễ hạn",
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Tổng số hành động"
          value={total}
          sub="Khởi động từ EES 2026"
          color="text-slate-800"
        />
        <SummaryCard
          label="Đã hoàn thành"
          value={`${completedPct}%`}
          sub={`${completed}/${total} hành động`}
          color="text-green-600"
        />
        <SummaryCard
          label="Đang thực thi"
          value={actionItems.filter((a) => a.status === "Đang làm").length}
          sub="hành động đang triển khai"
          color="text-blue-600"
        />
        <SummaryCard
          label="Trễ hạn"
          value={overdue}
          sub="cần xử lý ngay"
          color="text-red-500"
        />
      </div>

      {/* Progress Bar Overall */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-700">Tiến độ tổng thể chương trình hành động</h3>
          <span className="text-lg font-bold text-orange-500">{completedPct}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${completedPct}%` }}
          />
        </div>
        <div className="flex gap-6 mt-3 flex-wrap">
          {statusOptions.map((s) => {
            const count = actionItems.filter((a) => a.status === s).length;
            const cfg = statusConfig[s];
            return (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-xs text-slate-500">{s}: <strong>{count}</strong></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lọc:</span>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ActionStatus | "")}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Tất cả Trạng thái</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={khoiFilter}
          onChange={(e) => setKhoiFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Tất cả Khối</option>
          {KHOI.map((k) => (
            <option key={k.id} value={k.label}>{k.label}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400">
          Hiển thị <strong className="text-slate-600">{filtered.length}</strong> / {total} hành động
        </span>
      </div>

      {/* Action Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Insight gốc</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tên hành động</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Khối áp dụng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Người phụ trách</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tiến độ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((action, i) => (
                <tr
                  key={action.id}
                  className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${
                    action.status === "Trễ hạn" ? "bg-red-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-slate-400">{action.id}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="text-xs text-slate-600 leading-relaxed">{action.insight}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{action.actionName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-navy-50 text-slate-600 px-2 py-0.5 rounded-lg bg-slate-100">
                      {action.khoi}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-700">{action.owner}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className={`text-xs font-medium ${
                      action.status === "Trễ hạn" ? "text-red-600" : "text-slate-600"
                    }`}>
                      {new Date(action.deadline).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={action.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ProgressBar value={action.progress} status={action.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            Không tìm thấy hành động phù hợp với bộ lọc đã chọn.
          </div>
        )}
      </div>
    </div>
  );
}
