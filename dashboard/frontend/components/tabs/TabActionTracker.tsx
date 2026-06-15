"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { actionItems as defaultActionItems, ActionItem, ActionStatus, KHOI } from "@/lib/mockData";
import {
  CheckCircle2, Clock, AlertCircle, ListTodo,
  Plus, Trash2, Download, X,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────

const STORAGE_KEY = "ghn-ees-action-items";

const STATUS_CYCLE: ActionStatus[] = [
  "Chưa bắt đầu", "Đang làm", "Hoàn thành", "Trễ hạn",
];

const KHOI_OPTIONS = [
  "Khối Thị Trường", "Khối Vận Hành", "Khối Khách Hàng",
  "Khối Tech", "Khối Nhân Lực", "Khối Tài Chính",
];

const IMPACT_EFFORT_OPTIONS = ["Cao", "Trung bình", "Thấp"] as const;

// ── Helpers ───────────────────────────────────────────────────

function loadItems(): ActionItem[] {
  if (typeof window === "undefined") return defaultActionItems;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ActionItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return defaultActionItems;
}

function saveItems(items: ActionItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function nextId(items: ActionItem[]): string {
  const nums = items
    .map((a) => parseInt(a.id.replace("ACT-", ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `ACT-${String(max + 1).padStart(3, "0")}`;
}

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

function StatusBadge({
  status,
  onClick,
}: {
  status: ActionStatus;
  onClick?: () => void;
}) {
  const cfg = statusConfig[status];
  return (
    <span
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      title={onClick ? "Nhấn để chuyển trạng thái" : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} ${
        onClick ? "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-orange-300 transition-all" : ""
      }`}
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

// ── Progress Slider (inline edit) ─────────────────────────────

function ProgressSlider({
  value,
  onChange,
  status,
}: {
  value: number;
  onChange: (v: number) => void;
  status: ActionStatus;
}) {
  const colorMap: Record<ActionStatus, string> = {
    "Chưa bắt đầu": "accent-slate-400",
    "Đang làm": "accent-blue-500",
    "Hoàn thành": "accent-green-500",
    "Trễ hạn": "accent-red-500",
  };
  return (
    <div className="flex items-center gap-2 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`flex-1 h-1.5 cursor-pointer ${colorMap[status]}`}
      />
      <span className="text-xs font-bold text-slate-700 w-9 text-right">{value}%</span>
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

// ── Donut Ring Chart (SVG) ────────────────────────────────────

function DonutChart({
  segments,
  centerLabel,
  centerSub,
}: {
  segments: { value: number; color: string; label: string }[];
  centerLabel: string;
  centerSub: string;
}) {
  const size = 140;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const currentOffset = offset;
    offset += dash;
    return { ...seg, dash, gap, offset: currentOffset, pct };
  });

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f1f5f9" strokeWidth={stroke}
        />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="round"
            className="transition-all duration-700"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        ))}
        <text x="50%" y="46%" textAnchor="middle" className="text-xl font-bold fill-slate-800" fontSize="22">
          {centerLabel}
        </text>
        <text x="50%" y="62%" textAnchor="middle" className="fill-slate-400" fontSize="10">
          {centerSub}
        </text>
      </svg>
      <div className="space-y-1.5">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="text-xs text-slate-600">
              {arc.label}: <strong>{arc.value}</strong> ({total > 0 ? Math.round(arc.pct * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Add Action Modal ──────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Omit<ActionItem, "id">) => void;
}

function AddActionModal({ open, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    insight: "",
    actionName: "",
    khoi: KHOI_OPTIONS[0],
    owner: "",
    deadline: "",
    impact: "Cao" as ActionItem["impact"],
    effort: "Trung bình" as ActionItem["effort"],
  });

  const overlayRef = useRef<HTMLDivElement>(null);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.insight || !form.actionName || !form.owner || !form.deadline) return;
    onSave({
      ...form,
      status: "Chưa bắt đầu",
      progress: 0,
    });
    // Reset
    setForm({
      insight: "",
      actionName: "",
      khoi: KHOI_OPTIONS[0],
      owner: "",
      deadline: "",
      impact: "Cao",
      effort: "Trung bình",
    });
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Thêm hành động mới</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Insight gốc */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Insight gốc <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              value={form.insight}
              onChange={(e) => set("insight", e.target.value)}
              placeholder="Mô tả insight từ khảo sát..."
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          {/* Tên hành động */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tên hành động <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              value={form.actionName}
              onChange={(e) => set("actionName", e.target.value)}
              placeholder="Mô tả hành động cụ thể..."
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          {/* Khối + Người phụ trách */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Khối áp dụng</label>
              <select
                value={form.khoi}
                onChange={(e) => set("khoi", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {KHOI_OPTIONS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Người phụ trách <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                value={form.owner}
                onChange={(e) => set("owner", e.target.value)}
                placeholder="Tên người phụ trách..."
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Deadline + Impact + Effort */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Deadline <span className="text-red-400">*</span></label>
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Impact</label>
              <select
                value={form.impact}
                onChange={(e) => set("impact", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {IMPACT_EFFORT_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Effort</label>
              <select
                value={form.effort}
                onChange={(e) => set("effort", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {IMPACT_EFFORT_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Plus size={14} className="inline -mt-0.5 mr-1" />
              Thêm hành động
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────

function DeleteConfirm({
  actionName,
  onConfirm,
  onCancel,
}: {
  actionName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Xoá hành động?</h3>
            <p className="text-xs text-slate-500 mt-0.5">Hành động này không thể hoàn tác.</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 mb-5 leading-relaxed">
          &ldquo;{actionName}&rdquo;
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-8 px-4 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="h-8 px-4 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CSV Export ─────────────────────────────────────────────────

function exportCSV(items: ActionItem[]) {
  const BOM = "\uFEFF";
  const headers = ["ID", "Insight gốc", "Tên hành động", "Khối áp dụng", "Người phụ trách", "Deadline", "Trạng thái", "Tiến độ (%)", "Impact", "Effort"];
  const rows = items.map((a) => [
    a.id,
    `"${a.insight.replace(/"/g, '""')}"`,
    `"${a.actionName.replace(/"/g, '""')}"`,
    a.khoi,
    a.owner,
    a.deadline,
    a.status,
    String(a.progress),
    a.impact,
    a.effort,
  ]);

  const csv = BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `GHN_EES_ActionTracker_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Tab ──────────────────────────────────────────────────

export default function TabActionTracker() {
  const [items, setItems] = useState<ActionItem[]>(defaultActionItems);
  const [hydrated, setHydrated] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "">("");
  const [khoiFilter, setKhoiFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActionItem | null>(null);

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setItems(loadItems());
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (hydrated) saveItems(items);
  }, [items, hydrated]);

  // ── CRUD handlers ─────────────────────────────────────────

  const handleAdd = useCallback((data: Omit<ActionItem, "id">) => {
    setItems((prev) => {
      const newItem: ActionItem = { id: nextId(prev), ...data };
      return [...prev, newItem];
    });
    setModalOpen(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((a) => a.id !== id));
    setDeleteTarget(null);
  }, []);

  const handleStatusToggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const idx = STATUS_CYCLE.indexOf(a.status);
        const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        const nextProgress = nextStatus === "Hoàn thành" ? 100 : nextStatus === "Chưa bắt đầu" ? 0 : a.progress;
        return { ...a, status: nextStatus, progress: nextProgress };
      }),
    );
  }, []);

  const handleProgressChange = useCallback((id: string, progress: number) => {
    setItems((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const status: ActionStatus = progress === 100 ? "Hoàn thành" : progress === 0 ? "Chưa bắt đầu" : a.status === "Chưa bắt đầu" || a.status === "Hoàn thành" ? "Đang làm" : a.status;
        return { ...a, progress, status };
      }),
    );
  }, []);

  // ── Computed stats ────────────────────────────────────────

  const total = items.length;
  const completed = items.filter((a) => a.status === "Hoàn thành").length;
  const inProgress = items.filter((a) => a.status === "Đang làm").length;
  const notStarted = items.filter((a) => a.status === "Chưa bắt đầu").length;
  const overdue = items.filter((a) => a.status === "Trễ hạn").length;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgProgress = total > 0 ? Math.round(items.reduce((s, a) => s + a.progress, 0) / total) : 0;

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const statusOk = !statusFilter || a.status === statusFilter;
      const khoiOk = !khoiFilter || a.khoi.includes(khoiFilter);
      return statusOk && khoiOk;
    });
  }, [statusFilter, khoiFilter, items]);

  const statusOptions: ActionStatus[] = [
    "Chưa bắt đầu", "Đang làm", "Hoàn thành", "Trễ hạn",
  ];

  const donutSegments = [
    { value: completed, color: "#22c55e", label: "Hoàn thành" },
    { value: inProgress, color: "#3b82f6", label: "Đang làm" },
    { value: notStarted, color: "#94a3b8", label: "Chưa bắt đầu" },
    { value: overdue, color: "#ef4444", label: "Trễ hạn" },
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
          value={inProgress}
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

      {/* Progress Overview with Donut Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Left: Progress bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-700">Tiến độ tổng thể chương trình hành động</h3>
              <span className="text-lg font-bold text-orange-500">{avgProgress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
            <div className="flex gap-6 mt-3 flex-wrap">
              {statusOptions.map((s) => {
                const count = items.filter((a) => a.status === s).length;
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

          {/* Right: Donut chart */}
          <div className="flex-shrink-0">
            <DonutChart
              segments={donutSegments}
              centerLabel={`${completedPct}%`}
              centerSub="hoàn thành"
            />
          </div>
        </div>
      </div>

      {/* Toolbar: Filters + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(items)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download size={13} />
            Tải CSV
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition-colors"
          >
            <Plus size={14} />
            Thêm hành động
          </button>
        </div>
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
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-14"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((action) => {
                const isEditing = editingId === action.id;
                return (
                  <tr
                    key={action.id}
                    onClick={() => setEditingId(isEditing ? null : action.id)}
                    className={`border-b border-slate-50 transition-colors cursor-pointer ${
                      action.status === "Trễ hạn" ? "bg-red-50/30" : ""
                    } ${isEditing ? "bg-orange-50/50 ring-1 ring-inset ring-orange-200" : "hover:bg-slate-50/80"}`}
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
                      <StatusBadge
                        status={action.status}
                        onClick={() => handleStatusToggle(action.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <ProgressSlider
                          value={action.progress}
                          onChange={(v) => handleProgressChange(action.id, v)}
                          status={action.status}
                        />
                      ) : (
                        <ProgressBar value={action.progress} status={action.status} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(action); }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Xoá hành động"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            Không tìm thấy hành động phù hợp với bộ lọc đã chọn.
          </div>
        )}
      </div>

      {/* Modals */}
      <AddActionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAdd} />
      {deleteTarget && (
        <DeleteConfirm
          actionName={deleteTarget.actionName}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
