"use client";

import { useState } from "react";
import { DashboardProvider } from "@/context/DashboardContext";
import GlobalFilters from "@/components/GlobalFilters";
import TabTongQuan from "@/components/tabs/TabTongQuan";
import TabPhanTich from "@/components/tabs/TabPhanTich";
import TabActionTracker from "@/components/tabs/TabActionTracker";
import TabLichSu from "@/components/tabs/TabLichSu";
import TabPhuLuc from "@/components/tabs/TabPhuLuc";
import TabAIInsights from "@/components/tabs/TabAIInsights";
import {
  BarChart2, Search, CheckSquare, Clock, BookOpen, Sparkles,
} from "lucide-react";

const TABS = [
  { id: "tongquan", label: "Tổng quan",      icon: <BarChart2 size={14} /> },
  { id: "phantich", label: "Phân tích",      icon: <Search size={14} /> },
  { id: "insights", label: "AI Insights",    icon: <Sparkles size={14} /> },
  { id: "action",   label: "Thực thi",       icon: <CheckSquare size={14} /> },
  { id: "lichsu",   label: "Lịch sử",        icon: <Clock size={14} /> },
  { id: "phuluc",   label: "Phụ lục",        icon: <BookOpen size={14} /> },
] as const;

type TabId = typeof TABS[number]["id"];

// ── GHN SVG Logo ─────────────────────────────────────────────

function GHNLogo() {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-xl shadow-md overflow-hidden shrink-0 bg-white">
      <img src="/logo.png" alt="GHN Logo" className="w-full h-full object-cover" />
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("tongquan");

  return (
    <DashboardProvider>
      <div className="min-h-screen" style={{ background: "var(--ghn-bg)" }}>

        {/* ── Header ── */}
        <header className="bg-white sticky top-0 z-40"
                style={{ borderBottom: "1px solid var(--ghn-border)", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
          <div className="max-w-[1440px] mx-auto px-6 py-3">
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <GHNLogo />
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <h1 className="text-[15px] font-extrabold tracking-tight"
                        style={{ color: "var(--text-primary)" }}>
                      GHN EES 2026
                    </h1>
                    <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                      Employee Engagement Survey Dashboard
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    GiaoHangNhanh · 23,000+ nhân viên · Chu kỳ khảo sát Q1/2026
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Live badge */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "#DCFCE7", color: "#15803D", border: "1px solid #BBF7D0" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
                {/* Date */}
                <span className="text-[11px] hidden sm:block" style={{ color: "var(--text-muted)" }}>
                  Cập nhật: 21/05/2026
                </span>
                {/* Confidential */}
                <span className="text-[10px] font-semibold px-2 py-1 rounded-md hidden md:block"
                      style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
                  🔒 NỘI BỘ
                </span>
              </div>
            </div>

            {/* Filters row */}
            <GlobalFilters />
          </div>
        </header>

        {/* ── Tab Navigation ── */}
        <div className="bg-white sticky z-30"
             style={{ top: "97px", borderBottom: "1px solid var(--ghn-border)" }}>
          <div className="max-w-[1440px] mx-auto px-6">
            <nav className="flex gap-0.5 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const isAI = tab.id === "insights";
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-all duration-150 ${
                      isActive
                        ? isAI
                          ? "border-purple-500 text-purple-600 bg-purple-50/60"
                          : "border-orange-500 text-orange-600 bg-orange-50/50"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                    style={{ color: isActive ? undefined : "var(--text-secondary)" }}
                  >
                    <span className={isActive
                      ? isAI ? "text-purple-500" : "text-orange-500"
                      : "opacity-60"}>
                      {tab.icon}
                    </span>
                    {tab.label}
                    {isAI && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: isActive ? "#EDE9FE" : "#F3F4F6", color: isActive ? "#7C3AED" : "#6B7280" }}>
                        NEW
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Main Content ── */}
        <main className="max-w-[1440px] mx-auto px-6 py-6">
          <div className="animate-fadeInUp">
            {activeTab === "tongquan" && <TabTongQuan />}
            {activeTab === "phantich" && <TabPhanTich />}
            {activeTab === "insights" && <TabAIInsights />}
            {activeTab === "action"   && <TabActionTracker />}
            {activeTab === "lichsu"   && <TabLichSu />}
            {activeTab === "phuluc"   && <TabPhuLuc />}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="mt-8 py-4 bg-white" style={{ borderTop: "1px solid var(--ghn-border)" }}>
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between text-[11px]"
               style={{ color: "var(--text-muted)" }}>
            <span>© 2026 GiaoHangNhanh · Bộ phận Nhân lực & EX · Bảo mật nội bộ</span>
            <span>EES Dashboard v3.0 · Dữ liệu khảo sát Q1/2026 · 23,412 respondents</span>
          </div>
        </footer>
      </div>
    </DashboardProvider>
  );
}
