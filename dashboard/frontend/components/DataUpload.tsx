"use client";

import { useState, useRef, useEffect } from "react";
import { useDashboard, parseFlatCsv, EesData } from "@/context/DashboardContext";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Link2,
  FileJson,
  Info,
  Database,
  Trash2,
  X,
  HelpCircle,
  Download,
} from "lucide-react";

export default function DataUpload() {
  const {
    eesData,
    syncUrl,
    autoSync,
    lastSyncTime,
    syncStatus,
    syncErrorMsg,
    syncSource,
    setSyncUrl,
    setAutoSync,
    triggerSync,
    resetToMock,
    updateDataManually,
  } = useDashboard();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"url" | "file">("url");
  const [tempUrl, setTempUrl] = useState(syncUrl);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state changes in input field
  useEffect(() => {
    setTempUrl(syncUrl);
  }, [syncUrl]);

  const handleUrlSync = async () => {
    if (!tempUrl.trim()) return;
    setSyncUrl(tempUrl);
    await triggerSync(tempUrl);
  };

  const handleLoadDemo = async () => {
    if (typeof window !== "undefined") {
      const demo = window.location.origin + "/ees_template.csv";
      setTempUrl(demo);
      setSyncUrl(demo);
      await triggerSync(demo);
    }
  };

  // Format the source name for display in header badge
  const getShortSource = () => {
    if (!syncSource || syncSource === "System Mock") {
      return "Mẫu";
    }
    if (syncSource.startsWith("Tải file: ")) {
      const filename = syncSource.replace("Tải file: ", "");
      return filename.length > 10 ? filename.substring(0, 8) + "..." : filename;
    }
    if (syncSource.startsWith("URL Link: ")) {
      const url = syncSource.replace("URL Link: ", "");
      if (url.includes("/ees_template.csv") || (typeof window !== "undefined" && url.includes(window.location.host))) {
        return "Demo";
      }
      try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("google.com")) {
          return "G-Sheet";
        }
        return parsed.hostname.length > 12 ? parsed.hostname.substring(0, 10) + "..." : parsed.hostname;
      } catch {
        return "URL";
      }
    }
    return syncSource;
  };

  // ── Drag & Drop File Handlers ─────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileError(null);
    setFileSuccess(false);

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".csv" && ext !== ".json") {
      setFileError("Hệ thống chỉ chấp nhận file .csv hoặc .json!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let parsed: Partial<EesData> = {};

        if (ext === ".json") {
          parsed = JSON.parse(text) as Partial<EesData>;
        } else {
          parsed = parseFlatCsv(text);
        }

        if (!parsed.kpiData || parsed.kpiData.length === 0) {
          throw new Error("Dữ liệu trống hoặc sai cấu trúc template.");
        }

        updateDataManually(parsed, `Tải file: ${file.name}`);
        setFileSuccess(true);
        setTimeout(() => setFileSuccess(false), 3000);
      } catch (err: any) {
        setFileError(err.message || "Lỗi đọc/phân tích tệp dữ liệu.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative shrink-0">
      {/* Header Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all hover:scale-105 border shrink-0 whitespace-nowrap"
        style={{
          background: syncStatus === "success" ? "#DCFCE7" : syncStatus === "error" ? "#FEE2E2" : "#EFF6FF",
          color: syncStatus === "success" ? "#166534" : syncStatus === "error" ? "#991B1B" : "#006FAD",
          borderColor: syncStatus === "success" ? "#BBF7D0" : syncStatus === "error" ? "#FECACA" : "#BFDBFE",
        }}
      >
        {syncStatus === "syncing" ? (
          <RefreshCw size={13} className="animate-spin" />
        ) : syncStatus === "success" ? (
          <CheckCircle2 size={13} />
        ) : syncStatus === "error" ? (
          <AlertCircle size={13} />
        ) : (
          <Database size={13} />
        )}
        <span>Cập nhật</span>
        <span 
          className="text-[9.5px] px-1.5 py-0.5 rounded font-extrabold uppercase"
          style={{
            background: syncStatus === "success" ? "#BBF7D0" : syncStatus === "error" ? "#FECACA" : "#BFDBFE",
            color: syncStatus === "success" ? "#14532D" : syncStatus === "error" ? "#7F1D1D" : "#1C3D5A",
          }}
        >
          {getShortSource()}
        </span>
        {lastSyncTime && syncStatus === "idle" && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-0.5" />
        )}
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp mx-4">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                  <Database size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-800">Đồng bộ Dữ liệu EES</h3>
                  <p className="text-[10px] text-slate-400">Chọn phương thức nạp dữ liệu cho Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setActiveTab("url")}
                className={`flex-1 py-3 text-[12px] font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "url"
                    ? "border-orange-500 text-orange-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/30"
                }`}
              >
                <Link2 size={13} />
                Đồng bộ từ Link URL
              </button>
              <button
                onClick={() => setActiveTab("file")}
                className={`flex-1 py-3 text-[12px] font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "file"
                    ? "border-orange-500 text-orange-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/30"
                }`}
              >
                <Upload size={13} />
                Tải lên File thủ công
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              
              {/* Active Database Source Status Card */}
              <div className="p-3.5 bg-orange-50/40 rounded-xl border border-orange-100/80 flex items-start gap-3 shadow-sm">
                <div className="w-8.5 h-8.5 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 mt-0.5 shadow-sm">
                  <Database size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-extrabold text-orange-850 uppercase tracking-wide">Nguồn Dữ Liệu Hiện Tại</p>
                  <div className="mt-1 text-slate-800 text-[12px] font-bold break-all">
                    {syncSource && syncSource.startsWith("URL Link: ") ? (
                      <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-green-700 font-extrabold text-[11.5px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Liên kết URL Google Sheets / Web API
                        </span>
                        <a 
                          href={syncSource.replace("URL Link: ", "")}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-700 hover:underline font-semibold block truncate text-[11px]"
                          title={syncSource.replace("URL Link: ", "")}
                        >
                          {syncSource.replace("URL Link: ", "")}
                        </a>
                      </div>
                    ) : syncSource && syncSource.startsWith("Tải file: ") ? (
                      <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-blue-700 font-extrabold text-[11.5px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          File Excel/CSV nạp thủ công
                        </span>
                        <span className="text-slate-600 font-medium block text-[11px] truncate">
                          📁 {syncSource.replace("Tải file: ", "")}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-slate-600 font-extrabold flex items-center gap-1.5 text-[11.5px]">
                          ⚙️ Mẫu hệ thống mặc định (Mock Data)
                        </span>
                        <p className="text-[10px] text-slate-400 font-normal">
                          Đang sử dụng bộ dữ liệu mẫu tĩnh tích hợp sẵn.
                        </p>
                      </div>
                    )}
                  </div>
                  {lastSyncTime && (
                    <p className="text-[9.5px] text-slate-400 mt-1">
                      Thời gian đồng bộ lần cuối: {lastSyncTime}
                    </p>
                  )}
                </div>
              </div>

              {activeTab === "url" ? (
                <div className="space-y-4">
                  {/* URL Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Đường dẫn URL nguồn (CSV / JSON / Google Sheets)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder="Dán link Google Sheets chia sẻ hoặc CSV..."
                        className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                      />
                      <button
                        onClick={handleUrlSync}
                        disabled={syncStatus === "syncing" || !tempUrl.trim()}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition shrink-0 shadow-sm shadow-orange-500/20"
                      >
                        {syncStatus === "syncing" ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <RefreshCw size={12} />
                        )}
                        <span>Đồng bộ</span>
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400">
                      * Chấp nhận link chia sẻ Google Sheets dạng thông thường (Anyone with the link can view).
                    </p>
                  </div>

                  {/* Settings */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-slate-400" />
                      <div>
                        <p className="text-[11px] font-bold text-slate-700">Tự động đồng bộ</p>
                        <p className="text-[9px] text-slate-400">Tải lại dữ liệu mới từ URL khi mở trang</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSync}
                        onChange={(e) => setAutoSync(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  {/* Buttons helper */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                      Hỗ trợ & Kiểm thử nhanh
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                        <button
                          onClick={handleLoadDemo}
                          disabled={syncStatus === "syncing"}
                          className="w-full py-2 px-3 text-[11px] font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-center flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {syncStatus === "syncing" && tempUrl.includes("/ees_template.csv") ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : (
                            <span>💡 Sử dụng Link Demo</span>
                          )}
                        </button>
                        <p className="text-[9px] text-slate-450 leading-normal text-justify">
                          Nạp nhanh dữ liệu mẫu chuẩn của GHN từ hệ thống (ees_template.csv) để chạy thử nghiệm đầy đủ biểu đồ.
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                        <a
                          href="/ees_template.csv"
                          download="GHN_EES_Template.csv"
                          className="w-full py-2 px-3 text-[11px] font-bold rounded-lg border border-slate-200 bg-white text-slate-655 hover:bg-slate-50 transition text-center flex items-center justify-center gap-1.5"
                        >
                          <Download size={11} />
                          Tải File CSV Mẫu
                        </a>
                        <p className="text-[9px] text-slate-450 leading-normal text-justify">
                          Tải file CSV có cấu trúc chuẩn để điền dữ liệu khảo sát của riêng bạn trước khi tải lên hoặc đồng bộ.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-3.5 bg-slate-50 rounded-xl text-[10px] leading-relaxed text-slate-500 border border-slate-100 space-y-2">
                    <p className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Info size={12} className="text-orange-500" /> Hướng dẫn lấy Link Google Sheets:
                    </p>
                    <div className="space-y-1.5 pl-1">
                      <p className="font-bold text-slate-600 text-[10px] text-orange-650">Cách 1: Sử dụng Link Chia sẻ (Khuyên dùng - Nhanh nhất)</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Chuẩn bị bảng tính Google Sheets của bạn theo đúng cấu trúc file mẫu.</li>
                        <li>Bấm nút <strong className="text-slate-700">Chia sẻ (Share)</strong> ở góc phải Google Sheets.</li>
                        <li>Đổi quyền truy cập thành <strong className="text-slate-700">"Bất kỳ ai có liên kết đều có thể xem" (Anyone with link can view)</strong>.</li>
                        <li>Sao chép liên kết trình duyệt (link edit) dán vào ô nhập liệu bên trên và bấm Đồng bộ.</li>
                      </ol>
                    </div>
                    <div className="space-y-1.5 pl-1 pt-1.5 border-t border-slate-200/60">
                      <p className="font-bold text-slate-600 text-[10px]">Cách 2: Công bố lên Web (Publish to web)</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Vào <strong className="text-slate-700">Tệp (File) ➡️ Chia sẻ (Share) ➡️ Công bố công khai lên web</strong>.</li>
                        <li>Chọn xuất trang tính hiện tại dạng <strong className="text-slate-700">CSV (.csv)</strong> và bấm công bố.</li>
                        <li>Copy link nhận được dán vào ô nhập liệu bên trên.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File drop zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-orange-500 bg-orange-50/40 scale-98"
                        : "border-slate-200 hover:border-orange-400 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload size={24} className="mx-auto text-slate-400 mb-2.5" />
                    <p className="text-[12px] font-bold text-slate-700">Kéo thả hoặc Click để tải lên</p>
                    <p className="text-[10px] text-slate-400 mt-1">Chấp nhận file dữ liệu định dạng .csv hoặc .json</p>
                  </div>

                  {fileSuccess && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-100">
                      <CheckCircle2 size={13} className="text-green-500" />
                      <span>Tải dữ liệu từ File lên thành công!</span>
                    </div>
                  )}

                  {fileError && (
                    <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100">
                      <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status Alert from triggerSync */}
              {activeTab === "url" && syncStatus === "error" && syncErrorMsg && (
                <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100 mt-3">
                  <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{syncErrorMsg}</span>
                </div>
              )}

              {activeTab === "url" && syncStatus === "success" && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-100 mt-3">
                  <CheckCircle2 size={13} className="text-green-500" />
                  <span>Đồng bộ dữ liệu từ URL thành công!</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={resetToMock}
                className="px-3.5 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 text-slate-550 text-[11px] font-bold border border-slate-200 hover:border-red-200 transition-all flex items-center gap-1.5 bg-white shadow-sm"
              >
                <Trash2 size={12} className="text-red-500" />
                Khôi phục Dữ liệu Gốc (Mock)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
