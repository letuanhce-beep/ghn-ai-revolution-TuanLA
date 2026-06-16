"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import GlobalFilters from "@/components/GlobalFilters";
import TabTongQuan from "@/components/tabs/TabTongQuan";
import TabPhanTich from "@/components/tabs/TabPhanTich";
import TabActionTracker from "@/components/tabs/TabActionTracker";
import TabLichSu from "@/components/tabs/TabLichSu";
import TabPhuLuc from "@/components/tabs/TabPhuLuc";
import TabPhanQuyen from "@/components/tabs/TabPhanQuyen";
import TabAIInsights from "@/components/tabs/TabAIInsights";
import AlertPanel from "@/components/AlertPanel";
import AutoReport from "@/components/AutoReport";
import DataUpload from "@/components/DataUpload";
import ChatBotCopilot from "@/components/ChatBotCopilot";
import {
  BarChart2, Search, CheckSquare, Clock, BookOpen, Sparkles, Info, Bot, LogOut, Shield,
} from "lucide-react";

const TABS = [
  { id: "tongquan", label: "Tổng quan",      icon: <BarChart2 size={14} /> },
  { id: "phantich", label: "Phân tích",      icon: <Search size={14} /> },
  { id: "insights", label: "AI Insights",    icon: <Sparkles size={14} /> },
  { id: "action",   label: "Thực thi",       icon: <CheckSquare size={14} /> },
  { id: "lichsu",   label: "Lịch sử",        icon: <Clock size={14} /> },
  { id: "copilot",  label: "Trợ lý Copilot", icon: <Bot size={14} /> },
  { id: "phanquyen", label: "Phân quyền",    icon: <Shield size={14} />, adminOnly: true },
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
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

function DashboardContent() {
  const { filters, setFilter, resetFilters } = useDashboard();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("tongquan");
  const [userRole, setUserRole] = useState<"HR_EX" | "KHOI_LEADER">("HR_EX");
  const [userScope, setUserScope] = useState<string>("");

  // Map email from NextAuth session to Role and Scope
  useEffect(() => {
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      
      // 1. Check client-side dynamic whitelist (localStorage)
      let savedWhitelist = [];
      try {
        const raw = localStorage.getItem("ghn-ees-email-whitelist-v2") || localStorage.getItem("ghn-ees-email-whitelist");
        if (raw) {
          savedWhitelist = JSON.parse(raw);
        }
      } catch (e) {}

      // Fallback default list if empty
      if (savedWhitelist.length === 0) {
        savedWhitelist = [
          { email: "tuanla@ghn.vn", role: "HR_EX", scope: "" },
          { email: "admin.ees@ghn.vn", role: "KHOI_LEADER", scope: "" },
          { email: "ex-executives@scommerce.asia", role: "KHOI_LEADER", scope: "" },
          { email: "ops.leader@ghn.vn", role: "KHOI_LEADER", scope: "VH" }
        ];
      }

      // Find matched item
      const matched = savedWhitelist.find((item: any) => {
        if (typeof item === "string") return item.toLowerCase() === email;
        return item && item.email && item.email.toLowerCase() === email;
      });

      if (matched) {
        if (typeof matched === "object" && matched.role) {
          // Map CEO or KHOI_LEADER to KHOI_LEADER
          const resolvedRole = (matched.role === "CEO" || matched.role === "KHOI_LEADER") ? "KHOI_LEADER" : matched.role;
          setUserRole(resolvedRole as any);
          setUserScope(matched.scope || "");
          return;
        }
      }

      // 2. Default hardcoded fallback mappings if not found in custom Whitelist
      if (email === "tuanla@ghn.vn") {
        setUserRole("HR_EX"); // Admin
        setUserScope("");
        return;
      }
      
      if (email === "admin.ees@ghn.vn" || email === "ex-executives@scommerce.asia") {
        setUserRole("KHOI_LEADER"); // User
        setUserScope("");
        return;
      }
      
      if (email === "ops.leader@ghn.vn") {
        setUserRole("KHOI_LEADER"); // User
        setUserScope("VH");
        return;
      }

      // 3. Reject login if not in Whitelist and not fallback master
      signOut({ callbackUrl: "/login?error=NotAuthorized" });
    }
  }, [session]);

  // Synchronize division filter automatically when role is KHOI_LEADER and scope is set
  useEffect(() => {
    if (userRole === "KHOI_LEADER" && userScope) {
      setFilter("khoi", userScope);
    }
  }, [userRole, userScope]);

  const handleConversationalCommand = (type: string, payload: any) => {
    if (type === "switch_tab") {
      setActiveTab(payload as TabId);
    } else if (type === "filter_khoi") {
      setFilter("khoi", payload);
    } else if (type === "reset_filters") {
      resetFilters();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--ghn-bg)" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md"
              style={{ borderBottom: "1px solid var(--ghn-border)", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
        <div className="max-w-[1440px] mx-auto px-6 py-3">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <GHNLogo />
              <div>
                <div className="flex items-baseline gap-2.5">
                  <h1 className="text-[15px] font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    GHN EES 2026
                  </h1>
                  <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                    Employee Engagement Survey Dashboard
                  </span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  GiaoHangNhanh · 23,000+ nhân viên · Chu kỳ khảo sát Q1/2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* User profile & Sign Out */}
              {session?.user && (
                <div className="flex items-center gap-2 border-r border-slate-200 pr-2 mr-1">
                  <div className="hidden md:flex items-center gap-1.5 mr-1 text-[11px] font-semibold">
                    <span className="font-extrabold text-slate-700">
                      {session.user.name || session.user.email?.split("@")[0].toUpperCase()}
                    </span>
                    <span className="text-slate-400">-</span>
                    <span className="text-slate-400 font-medium">
                      {session.user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF5200] hover:bg-orange-50 transition-colors shrink-0"
                    title="Đăng xuất"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              )}

              {/* Role Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 rounded-xl px-2.5 py-1.5 shadow-sm shrink-0">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider hidden lg:block">Vai trò:</span>
                <select
                  value={userRole}
                  onChange={(e) => {
                    const nextRole = e.target.value as any;
                    setUserRole(nextRole);
                    if (nextRole === "KHOI_LEADER") {
                      setUserScope("");
                    } else {
                      setUserScope("");
                    }
                  }}
                  className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="HR_EX">Admin (Quản trị)</option>
                  <option value="KHOI_LEADER">User (Người dùng)</option>
                </select>
              </div>

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
            </div>
          </div>

          {/* Filters row */}
          <GlobalFilters userRole={userRole} userScope={userScope} />
        </div>
      </header>

      {/* ── Main Layout (Sidebar + Content) ── */}
      <div className="max-w-[1440px] mx-auto px-6 py-6 flex gap-6 items-start">
        {/* Left Sidebar Wrapper (Sticky & Relative for Popout Chatbot) */}
        <div className="w-[280px] shrink-0 sticky top-[135px] relative z-30">
          <aside className="w-full flex flex-col gap-6 max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-hide">
            {/* Vertical Navigation Card (Gradient Xanh dương GHN) */}
            <div className="bg-gradient-to-b from-[#006FAD] to-[#002D4B] rounded-[24px] p-4 shadow-xl border border-white/10 flex flex-col gap-1 transition-all duration-150">
              <div className="text-[10px] font-extrabold text-white/50 px-3 uppercase tracking-wider mb-2">
                Danh mục điều hướng
              </div>
              <nav className="flex flex-col gap-1.5">
                {TABS.filter((tab) => !("adminOnly" in tab && tab.adminOnly) || userRole === "HR_EX").map((tab) => {
                  const isActive = activeTab === tab.id;
                  const isAI = tab.id === "insights";
                  const isSpecial = tab.id === "insights" || tab.id === "phanquyen" || tab.id === "copilot";
                  return (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all duration-150 border-l-4 ${
                        isActive
                          ? isSpecial
                            ? tab.id === "insights"
                              ? "border-[#FF5200] text-purple-600 bg-white shadow-md font-bold"
                              : "border-[#FF5200] text-[#006FAD] bg-white shadow-md font-bold"
                            : "border-[#FF5200] text-[#006FAD] bg-white shadow-md font-bold"
                          : "border-transparent text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive
                          ? isSpecial
                            ? tab.id === "insights" ? "text-purple-500" : "text-[#FF5200]"
                            : "text-[#FF5200]"
                          : "text-white/60"}>
                          {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                      </div>
                      {(isAI || tab.id === "copilot") && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive 
                            ? tab.id === "copilot" ? "bg-orange-100 text-orange-600" : "bg-purple-100 text-purple-600" 
                            : "bg-white/15 text-white"
                        }`}>
                          {tab.id === "copilot" ? "AI" : "NEW"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>

        {/* Right Main Content Panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <main className="animate-fadeInUp">
            {activeTab === "tongquan" && <TabTongQuan userRole={userRole} userScope={userScope} />}
            {activeTab === "phantich" && <TabPhanTich />}
            {activeTab === "insights" && <TabAIInsights />}
            {activeTab === "action"   && <TabActionTracker />}
            {activeTab === "lichsu"   && <TabLichSu />}
            {activeTab === "copilot"  && (
              <div className="card p-5 flex flex-col h-[calc(100vh-210px)] min-h-[580px] animate-fadeInUp">
                <div className="flex flex-col gap-1 mb-4 shrink-0">
                  <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                    <Bot className="text-[#006FAD]" size={20} />
                    Trợ lý Copilot — GHN EES 2026
                  </h2>
                  <p className="text-xs text-slate-500">
                    Hỏi đáp thông minh, phân tích dữ liệu và tư vấn giải pháp cải thiện trải nghiệm nhân sự (EX).
                  </p>
                </div>
                <div className="flex-1 min-h-0 bg-[#090D16] rounded-2xl overflow-hidden border border-[#006FAD]/20 shadow-md">
                  <ChatBotCopilot isEmbedded={true} onCommand={handleConversationalCommand} />
                </div>
              </div>
            )}
            {activeTab === "phanquyen" && <TabPhanQuyen userRole={userRole} />}
            {activeTab === "phuluc"   && <TabPhuLuc userRole={userRole} />}
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
  );
}
