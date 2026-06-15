"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function DataUpload() {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [".csv", ".xlsx", ".xls"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validTypes.includes(ext)) {
      setStatus("error");
      setFileName(file.name);
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    setFileName(file.name);
    setStatus("uploading");

    // Simulate processing
    setTimeout(() => {
      setStatus("success");
      setLastSync(new Date());
      setTimeout(() => setStatus("idle"), 3000);
    }, 2000);

    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  return (
    <div className="relative flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={status === "uploading"}
        className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all hover:scale-105 disabled:opacity-60"
        style={{
          background: status === "success" ? "#DCFCE7" : status === "error" ? "#FEE2E2" : "#EFF6FF",
          color: status === "success" ? "#166534" : status === "error" ? "#991B1B" : "#006FAD",
          border: `1px solid ${status === "success" ? "#BBF7D0" : status === "error" ? "#FECACA" : "#BFDBFE"}`,
        }}
      >
        {status === "uploading" ? (
          <RefreshCw size={13} className="animate-spin" />
        ) : status === "success" ? (
          <CheckCircle2 size={13} />
        ) : status === "error" ? (
          <AlertCircle size={13} />
        ) : (
          <Upload size={13} />
        )}
        {status === "uploading"
          ? "Đang xử lý..."
          : status === "success"
          ? "Đã cập nhật!"
          : status === "error"
          ? "Sai định dạng!"
          : "Upload Data"}
      </button>

      {lastSync && status === "idle" && (
        <span className="text-[9px] text-slate-400 hidden lg:block">
          Sync: {lastSync.toLocaleTimeString("vi-VN")}
        </span>
      )}
    </div>
  );
}
