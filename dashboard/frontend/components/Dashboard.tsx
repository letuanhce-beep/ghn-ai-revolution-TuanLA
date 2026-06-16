"use client";

import { useState, useEffect } from "react";
import { DashboardProvider } from "@/context/DashboardContext";
import GlobalFilters from "@/components/GlobalFilters";
import TabTongQuan from "@/components/tabs/TabTongQuan";
import TabPhanTich from "@/components/tabs/TabPhanTich";
import TabActionTracker from "@/components/tabs/TabActionTracker";
import TabLichSu from "@/components/tabs/TabLichSu";
import TabPhuLuc from "@/components/tabs/TabPhuLuc";
import TabAIInsights from "@/components/tabs/TabAIInsights";
import AlertPanel from "@/components/AlertPanel";
import AutoReport from "@/components/AutoReport";
import DataUpload from "@/components/DataUpload";
import ChatBotCopilot from "@/components/ChatBotCopilot";
import {
  BarChart2, Search, CheckSquare, Clock, BookOpen, Sparkles, Info,
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

// ── Real-time clock ─────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time}</span>;
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
                {/* Upload Data */}
                <DataUpload />
                {/* Auto Report */}
                <AutoReport />
                {/* Alert System */}
                <AlertPanel />
                {/* Live badge */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "#DCFCE7", color: "#15803D", border: "1px solid #BBF7D0" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live · <LiveClock />
                </span>
                {/* Confidential */}
                <span className="text-[10px] font-semibold px-2 py-1 rounded-md hidden md:block"
                      style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
                  🔒 NỘI BỘ
                </span>
                {/* About */}
                <a href="/about" className="text-[11px] p-1.5 rounded-full hover:bg-slate-100 transition-colors" title="Thông tin">
                  <Info size={14} className="text-slate-400" />
                </a>
              </div>
            </div>

            {/* Filters row */}
            <GlobalFilters />
          </div>
        </header>

        {/* ── Main Layout (Sidebar + Content) ── */}
        <div className="max-w-[1440px] mx-auto px-6 py-6 flex gap-6 items-start">
          {/* Left Sidebar */}
          <aside className="w-[280px] shrink-0 sticky top-[135px] flex flex-col gap-6 max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-hide">
            {/* Vertical Navigation Card */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/80 flex flex-col gap-1">
              <div className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-2">
                Danh mục điều hướng
              </div>
              <nav className="flex flex-col gap-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const isAI = tab.id === "insights";
                  return (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150 border-l-2 ${
                        isActive
                          ? isAI
                            ? "border-purple-500 text-purple-600 bg-purple-50/60"
                            : "border-orange-500 text-orange-600 bg-orange-50/50"
                          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive
                          ? isAI ? "text-purple-500" : "text-orange-500"
                          : "text-slate-400"}>
                          {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                      </div>
                      {isAI && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-500"
                        }`}>
                          NEW
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Embedded Chatbot Copilot Widget */}
            <div className="shrink-0 rounded-xl overflow-hidden shadow-sm">
              <ChatBotCopilot isEmbedded={true} />
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <main className="animate-fadeInUp">
              {activeTab === "tongquan" && <TabTongQuan />}
              {activeTab === "phantich" && <TabPhanTich />}
              {activeTab === "insights" && <TabAIInsights />}
              {activeTab === "action"   && <TabActionTracker />}
              {activeTab === "lichsu"   && <TabLichSu />}
              {activeTab === "phuluc"   && <TabPhuLuc />}
            </main>

            {/* ── ROI Banner ── */}
            <div className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-4"
                 style={{ background: "linear-gradient(135deg, #FF520010 0%, #006FAD10 100%)", border: "1px solid #FF520020" }}>
              <div>
                <div className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                  📊 Hiệu quả Tự động hóa Dashboard
                </div>
                <div className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>
                  So với quy trình phân tích EES thủ công truyền thống
                </div>
              </div>
              <div className="flex gap-6 flex-wrap">
                <div className="text-center">
                  <div className="text-[18px] font-extrabold text-[#FF5200]">97%</div>
                  <div className="text-[9px] text-slate-500 font-medium">Giảm thời gian</div>
                  <div className="text-[9px] text-slate-400">3 phút vs 8 giờ</div>
                </div>
                <div className="text-center">
                  <div className="text-[18px] font-extrabold text-[#006FAD]">60M₫</div>
                  <div className="text-[9px] text-slate-500 font-medium">Tiết kiệm/năm</div>
                  <div className="text-[9px] text-slate-400">0đ vs 5M/tháng</div>
                </div>
                <div className="text-center">
                  <div className="text-[18px] font-extrabold text-[#16A34A]">100%</div>
                  <div className="text-[9px] text-slate-500 font-medium">Độ chính xác</div>
                  <div className="text-[9px] text-slate-400">Tự động, không sai sót</div>
                </div>
                <div className="text-center">
                  <div className="text-[18px] font-extrabold text-[#7C3AED]">0 FTE</div>
                  <div className="text-[9px] text-slate-500 font-medium">Nhân lực cần</div>
                  <div className="text-[9px] text-slate-400">vs 2 người/tháng</div>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <footer className="py-4 bg-white rounded-xl border border-slate-200/80 px-6 flex items-center justify-between text-[11px] shadow-sm"
                    style={{ color: "var(--text-muted)" }}>
              <span>© 2026 GiaoHangNhanh · Bộ phận Nhân lực & EX · Bảo mật nội bộ</span>
              <span>EES Dashboard v3.1 · Dữ liệu khảo sát Q1/2026 · 23,412 respondents</span>
            </footer>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}
