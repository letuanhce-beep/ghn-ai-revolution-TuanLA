"use client";

import { useDashboard } from "@/context/DashboardContext";
import { KHOI, NHOM_NV, PHONG_BAN, YEARS } from "@/lib/mockData";
import { RefreshCcw } from "lucide-react";

export default function GlobalFilters({ userRole = "HR_EX", userScope = "" }: { userRole?: "HR_EX" | "KHOI_LEADER"; userScope?: string }) {
  const { filters, setFilter, resetFilters } = useDashboard();

  const phongBanOptions = filters.khoi ? PHONG_BAN[filters.khoi] ?? [] : [];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Year */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
          Năm khảo sát
        </label>
        <select
          value={filters.year}
          onChange={(e) => setFilter("year", Number(e.target.value) as 2025 | 2026)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="h-5 w-px bg-slate-200" />

      {/* Khối */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
          Khối
        </label>
        <select
          value={filters.khoi}
          onChange={(e) => setFilter("khoi", e.target.value)}
          disabled={userRole === "KHOI_LEADER" && !!userScope}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <option value="">Tất cả Khối</option>
          {KHOI.map((k) => (
            <option key={k.id} value={k.id}>{k.label}</option>
          ))}
        </select>
      </div>

      {/* Phòng ban */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
          Phòng ban
        </label>
        <select
          value={filters.phongBan}
          onChange={(e) => setFilter("phongBan", e.target.value)}
          disabled={!filters.khoi}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="">Tất cả Phòng ban</option>
          {phongBanOptions.map((pb) => (
            <option key={pb.id} value={pb.id}>{pb.label}</option>
          ))}
        </select>
      </div>

      {/* Nhóm NV */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
          Nhóm NV
        </label>
        <select
          value={filters.nhomNV}
          onChange={(e) => setFilter("nhomNV", e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        >
          <option value="">Tất cả Nhóm</option>
          {NHOM_NV.map((n) => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:text-orange-600 hover:border-orange-300 transition shadow-sm"
      >
        <RefreshCcw size={13} />
        Reset
      </button>
    </div>
  );
}
