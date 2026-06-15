"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Sparkles,
  Mail,
  ClipboardCheck,
  Bot,
  FileDown,
  BellRing,
  Key,
  Rocket,
  Smartphone,
  Plug,
  BarChart3,
} from "lucide-react";

const CHANGELOG = [
  {
    icon: <Key size={14} />,
    title: "Authentication — Google SSO",
    desc: "Xác thực bảo mật qua Google OAuth 2.0",
  },
  {
    icon: <Mail size={14} />,
    title: "Email Whitelist",
    desc: "Kiểm soát truy cập theo danh sách email được phê duyệt",
  },
  {
    icon: <Sparkles size={14} />,
    title: "AI Insights",
    desc: "Phân tích thông minh với AI cho từng phòng ban",
  },
  {
    icon: <ClipboardCheck size={14} />,
    title: "Action Tracker CRUD",
    desc: "Quản lý hành động cải thiện với đầy đủ tạo/sửa/xóa",
  },
  {
    icon: <Bot size={14} />,
    title: "Chatbot Copilot",
    desc: "Trợ lý AI hỗ trợ phân tích dữ liệu EES theo thời gian thực",
  },
  {
    icon: <FileDown size={14} />,
    title: "Auto-Report Export",
    desc: "Xuất báo cáo tự động dạng PDF/Excel",
  },
  {
    icon: <BellRing size={14} />,
    title: "Smart Alert",
    desc: "Cảnh báo thông minh khi chỉ số vượt ngưỡng rủi ro",
  },
];

const ROADMAP = [
  {
    icon: <Rocket size={14} />,
    title: "Real-time Data Sync",
    desc: "Đồng bộ dữ liệu khảo sát theo thời gian thực",
  },
  {
    icon: <Smartphone size={14} />,
    title: "Mobile App",
    desc: "Ứng dụng di động cho quản lý xem dashboard mọi lúc",
  },
  {
    icon: <Plug size={14} />,
    title: "API Integration",
    desc: "Tích hợp API với hệ thống HRIS & ERP nội bộ",
  },
  {
    icon: <BarChart3 size={14} />,
    title: "Advanced Analytics",
    desc: "Phân tích nâng cao: dự đoán nghỉ việc, sentiment analysis",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#111621] text-white">
      {/* ── Header ── */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Quay lại Dashboard
        </Link>

        {/* Title Block */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#006FAD]" />
            <span className="bg-gradient-to-r from-[#FF5200] to-[#006FAD] text-transparent bg-clip-text text-xs font-bold uppercase tracking-widest">
              Internal Tool
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            GHN EES Dashboard
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Thông tin Phiên bản & Lộ trình phát triển
          </p>
        </div>

        {/* ── Version Badge ── */}
        <div className="bg-[#1C2331] rounded-2xl border border-white/5 p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
                Phiên bản hiện tại
              </p>
              <p className="text-3xl font-black tracking-tight">
                <span className="text-[#FF5200]">v</span>3.1.0
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
                Cập nhật lần cuối
              </p>
              <p className="text-sm text-slate-300 font-medium">
                Tháng 6, 2026
              </p>
            </div>
          </div>
        </div>

        {/* ── Changelog ── */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-[#FF5200]" />
            Tính năng — v3.1.0
          </h2>
          <div className="space-y-3">
            {CHANGELOG.map((item) => (
              <div
                key={item.title}
                className="bg-[#1C2331] border border-white/5 rounded-xl px-5 py-4 flex items-start gap-4 hover:border-[#FF5200]/30 transition-colors"
              >
                <div className="bg-[#FF5200]/10 text-[#FF5200] p-2 rounded-lg mt-0.5 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Roadmap ── */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-[#006FAD]" />
            Lộ trình — v4.0
          </h2>
          <div className="space-y-3">
            {ROADMAP.map((item) => (
              <div
                key={item.title}
                className="bg-[#1C2331] border border-white/5 rounded-xl px-5 py-4 flex items-start gap-4 hover:border-[#006FAD]/30 transition-colors"
              >
                <div className="bg-[#006FAD]/10 text-[#006FAD] p-2 rounded-lg mt-0.5 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Credits ── */}
        <div className="bg-gradient-to-br from-[#1C2331] to-[#111621] border border-white/5 rounded-2xl p-6 text-center shadow-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">
            Phát triển bởi
          </p>
          <p className="text-base font-bold bg-gradient-to-r from-[#FF5200] to-[#006FAD] bg-clip-text text-transparent">
            GHN HR & EX Team × AI
          </p>
          <p className="text-xs text-slate-500 mt-2">
            © 2026 GiaoHangNhanh — Tài liệu nội bộ
          </p>
        </div>
      </div>
    </div>
  );
}
