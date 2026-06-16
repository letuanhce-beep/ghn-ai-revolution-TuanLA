"use client";

import { useState, useEffect } from "react";
import { KHOI } from "@/lib/mockData";
import {
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Users,
  CheckCircle,
  Eye,
  Key,
} from "lucide-react";

interface WhitelistItem {
  email: string;
  role: "HR_EX" | "KHOI_LEADER";
  scope?: string;
}

export default function TabPhanQuyen({ userRole = "HR_EX" }: { userRole?: string }) {
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"HR_EX" | "KHOI_LEADER">("HR_EX");
  const [newScope, setNewScope] = useState("");
  const [error, setError] = useState("");

  // Load whitelist on mount
  useEffect(() => {
    const fetchWhitelist = async () => {
      try {
        const response = await fetch("/api/whitelist");
        if (response.ok) {
          const data = await response.json();
          setWhitelist(data);
          localStorage.setItem("ghn-ees-email-whitelist-v2", JSON.stringify(data));
          localStorage.setItem("ghn-ees-email-whitelist", JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.error("Failed to fetch whitelist from server", err);
      }
      
      // Fallback to localStorage if offline
      try {
        const raw = localStorage.getItem("ghn-ees-email-whitelist-v2");
        if (raw) {
          setWhitelist(JSON.parse(raw));
        }
      } catch {}
    };
    fetchWhitelist();
  }, []);

  const handleAdd = async () => {
    setError("");
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không đúng định dạng.");
      return;
    }

    if (!email.endsWith("@ghn.vn") && !email.endsWith("@scommerce.asia")) {
      setError("Chỉ chấp nhận email thuộc tên miền @ghn.vn hoặc @scommerce.asia.");
      return;
    }

    if (whitelist.some((item) => item.email.toLowerCase() === email)) {
      setError("Email này đã có trong danh sách uỷ quyền.");
      return;
    }

    const newItem: WhitelistItem = {
      email,
      role: newRole,
      scope: newRole === "KHOI_LEADER" ? newScope : "",
    };

    try {
      const response = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Lỗi thêm email");
      }

      const resData = await response.json();
      setWhitelist(resData.list);
      localStorage.setItem("ghn-ees-email-whitelist-v2", JSON.stringify(resData.list));
      localStorage.setItem("ghn-ees-email-whitelist", JSON.stringify(resData.list));
      setNewEmail("");
    } catch (err: any) {
      setError(err.message || "Không thể kết nối đến máy chủ.");
    }
  };

  const handleDelete = async (email: string) => {
    try {
      const response = await fetch(`/api/whitelist?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Lỗi xóa email");
      }

      const resData = await response.json();
      setWhitelist(resData.list);
      localStorage.setItem("ghn-ees-email-whitelist-v2", JSON.stringify(resData.list));
      localStorage.setItem("ghn-ees-email-whitelist", JSON.stringify(resData.list));
    } catch (err: any) {
      setError(err.message || "Không thể kết nối đến máy chủ.");
    }
  };

  // Safe Guard check for Admin Role
  if (userRole !== "HR_EX") {
    return (
      <div className="card p-8 text-center flex flex-col items-center justify-center gap-4 border border-red-200 bg-red-50/10 rounded-[24px]">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Cửa sổ bị khóa — Từ chối truy cập</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
            Phân hệ này chứa các tính năng quản trị tối mật. Bạn không có quyền Quản trị viên (Admin) để cấu hình hoặc xem thông tin phân quyền này.
          </p>
        </div>
      </div>
    );
  }

  // Stats
  const totalAdmins = whitelist.filter((i) => i.role === "HR_EX").length;
  const totalLeaders = whitelist.filter((i) => i.role === "KHOI_LEADER").length;

  return (
    <div className="space-y-6">
      
      {/* ── Heading ── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <Shield className="text-[#006FAD]" size={20} />
          Cấu hình Phân quyền Hệ thống EES 2026
        </h2>
        <p className="text-xs text-slate-500">
          Quản lý danh sách email thuộc GHN và Scommerce được phép truy cập và chỉ định vai trò tương ứng.
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5200] flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tổng uỷ quyền</p>
            <p className="text-xl font-extrabold text-slate-700">{whitelist.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#006FAD] flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Quản trị viên (Admin)</p>
            <p className="text-xl font-extrabold text-slate-700">{totalAdmins}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Key size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Người dùng (User)</p>
            <p className="text-xl font-extrabold text-slate-700">{totalLeaders}</p>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Config Panel + Access Matrix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Whitelist Panel */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wide pb-3 border-b border-slate-100">
            Danh sách Email & Quyền hạn
          </h3>

          {/* Form add */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="md:col-span-5">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Địa chỉ Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setError("");
                }}
                placeholder="Nhập email uỷ quyền..."
                className="w-full bg-white text-slate-700 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#FF5200] focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vai trò</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full bg-white text-slate-700 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#FF5200] focus:outline-none cursor-pointer transition-colors"
              >
                <option value="HR_EX">Admin (Quản trị)</option>
                <option value="KHOI_LEADER">User (Người dùng)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Khối áp dụng</label>
              {newRole === "KHOI_LEADER" ? (
                <select
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  className="w-full bg-white text-slate-700 text-xs px-2 py-2 rounded-lg border border-slate-200 focus:border-[#FF5200] focus:outline-none cursor-pointer transition-colors animate-fadeIn"
                >
                  <option value="">Tất cả Khối</option>
                  {KHOI.map((k) => (
                    <option key={k.id} value={k.id}>{k.label.replace("Khối ", "")}</option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-slate-200/50 text-slate-400 text-[11px] rounded-lg border border-slate-200/50 flex items-center justify-center font-semibold py-2">
                  Tất cả Khối
                </div>
              )}
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                onClick={handleAdd}
                className="w-full bg-[#006FAD] hover:bg-[#006FAD]/90 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors shadow-sm h-9"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-100">
              <AlertCircle size={12} />
              {error}
            </p>
          )}

          {/* List Whitelist */}
          <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden max-h-[350px] overflow-y-auto">
            {whitelist.map((item) => {
              const isUserAdmin = item.role === "HR_EX";
              const roleLabel = isUserAdmin ? "ADMIN" : "USER";
              const badgeColor = isUserAdmin
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-teal-50 text-teal-600 border-teal-100";

              const scopeName = item.scope
                ? KHOI.find((k) => k.id === item.scope)?.label || `Khối ${item.scope}`
                : "Toàn doanh nghiệp";

              return (
                <div key={item.email} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0 text-xs">
                      {item.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700">{item.email}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Khối: {scopeName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                      {roleLabel}
                    </span>

                    {/* Cannot delete the master admin to prevent locking yourself out */}
                    {item.email !== "tuanla@ghn.vn" ? (
                      <button
                        onClick={() => handleDelete(item.email)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa uỷ quyền"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-300 font-bold p-1">MASTER</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matrix Panel */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wide pb-3 border-b border-slate-100 flex items-center gap-1.5">
            <Lock size={13} className="text-slate-400" />
            Ma trận Phân quyền (Access Matrix)
          </h3>

          <div className="space-y-3">
            <div className="border border-slate-100 rounded-xl p-3.5 space-y-2 bg-red-50/10">
              <span className="text-[9px] font-extrabold bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                ADMIN (Quản trị viên)
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                • Xem tất cả các Tab dữ liệu và cấu hình.<br />
                • Sử dụng các bộ lọc toàn cục không giới hạn.<br />
                • Quyền upload file Excel/CSV khảo sát mới.<br />
                • Quyền **Quản lý danh sách email phân quyền (Whitelist)**.
              </p>
            </div>

            <div className="border border-slate-100 rounded-xl p-3.5 space-y-2 bg-teal-50/10">
              <span className="text-[9px] font-extrabold bg-teal-100 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                USER (Người dùng)
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                • Xem dữ liệu báo cáo chi tiết theo phân quyền.<br />
                • **Khóa bộ lọc Khối** (nếu được chỉ định khối cụ thể) hoặc xem toàn bộ.<br />
                • Theo dõi hành động khắc phục trong Action Tracker.<br />
                • Không có quyền cấu hình hệ thống & phân quyền.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
