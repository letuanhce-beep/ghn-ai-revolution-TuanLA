"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import { Suspense, useState } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const [localError, setLocalError] = useState("");

  const verifyEmailAndSignIn = (email: string) => {
    setLocalError("");
    const targetEmail = email.trim().toLowerCase();
    
    // 1. Get whitelist from localStorage
    let savedWhitelist = [];
    try {
      const raw = localStorage.getItem("ghn-ees-email-whitelist-v2") || localStorage.getItem("ghn-ees-email-whitelist");
      if (raw) {
        savedWhitelist = JSON.parse(raw);
      }
    } catch {}

    // Fallback default list if empty
    if (savedWhitelist.length === 0) {
      savedWhitelist = [
        { email: "tuanla@ghn.vn", role: "HR_EX", scope: "" },
        { email: "admin.ees@ghn.vn", role: "KHOI_LEADER", scope: "" },
        { email: "ex-executives@scommerce.asia", role: "KHOI_LEADER", scope: "" },
        { email: "ops.leader@ghn.vn", role: "KHOI_LEADER", scope: "VH" }
      ];
    }

    // 2. Check if email is whitelisted
    const matched = savedWhitelist.some((item: any) => {
      if (typeof item === "string") return item.toLowerCase() === targetEmail;
      return item && item.email && item.email.toLowerCase() === targetEmail;
    });

    // Hardcoded master fallbacks
    const isMasterFallback = 
      targetEmail === "tuanla@ghn.vn" || 
      targetEmail === "admin.ees@ghn.vn" || 
      targetEmail === "ops.leader@ghn.vn";

    if (!matched && !isMasterFallback) {
      setLocalError("Email này chưa được phân quyền để vào báo cáo. Vui lòng liên hệ Admin (tuanla@ghn.vn).");
      return;
    }

    // 3. Trigger sign in
    signIn("credentials", { email: targetEmail, callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111621] p-6">
      <div className="w-full max-w-md bg-[#1C2331] rounded-2xl p-10 flex flex-col items-center text-center shadow-2xl border border-white/5">
        
        {/* Shield Icon */}
        <div className="mb-6">
          <Shield className="w-12 h-12 text-[#006FAD]" strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF5200] to-[#006FAD]">
          Dữ liệu nội bộ GHN
        </h1>

        {/* Description */}
        <p className="text-[15px] text-slate-400 mb-8 leading-relaxed px-4">
          Để đảm bảo tính bảo mật, Bạn vui lòng đăng nhập bằng tài khoản email <strong className="text-[#FF5200] font-bold">@ghn.vn</strong> hoặc <strong className="text-[#006FAD] font-bold">@scommerce.asia</strong> đã được cấp quyền để xem dữ liệu. Cảm ơn Bạn!
        </p>

        {/* Error Message */}
        {(error === "AccessDenied" || error === "NotAuthorized" || localError) && (
          <div className="w-full mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
            <p className="text-red-400 text-xs font-semibold leading-relaxed">
              {localError || "Tài khoản của bạn chưa được cấp quyền xem dữ liệu báo cáo EES này. Vui lòng liên hệ Quản trị viên (tuanla@ghn.vn) để được phân quyền."}
            </p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors duration-200 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Đăng nhập bằng Google
        </button>

        {/* Divider */}
        <div className="w-full my-6 flex items-center justify-between text-slate-500 text-xs">
          <span className="w-full h-px bg-slate-700/40" />
          <span className="px-3 whitespace-nowrap text-slate-400">hoặc</span>
          <span className="w-full h-px bg-slate-700/40" />
        </div>

        {/* Email login input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem("loginEmail") as HTMLInputElement;
            const email = input.value.trim();
            if (email) {
              verifyEmailAndSignIn(email);
            }
          }}
          className="w-full flex flex-col gap-3"
        >
          <input
            name="loginEmail"
            type="email"
            required
            placeholder="Nhập địa chỉ email GHN..."
            className="w-full bg-[#151b27] text-white text-xs px-4 py-3 rounded-xl border border-slate-700/60 focus:border-[#006FAD] focus:outline-none transition-colors placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="w-full bg-[#006FAD] hover:bg-[#006FAD]/90 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md"
          >
            Đăng nhập
          </button>
        </form>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111621]" />}>
      <LoginContent />
    </Suspense>
  );
}
