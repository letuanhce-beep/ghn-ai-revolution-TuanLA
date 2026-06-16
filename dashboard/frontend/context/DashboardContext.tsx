"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as mock from "@/lib/mockData";

export type FilterYear = 2025 | 2026;

interface DashboardFilters {
  year: FilterYear;
  khoi: string; // "" = all
  phongBan: string; // "" = all
  nhomNV: string; // "" = all
}

export interface EesData {
  kpiData: mock.KpiData[];
  divisionData: mock.DivisionENPS[];
  groupEngagement: mock.GroupEngagement[];
  riskZones: mock.ZoneData[];
  excellenceZones: mock.ZoneData[];
  pillarScoresByGroup: mock.PillarScore[];
  companyAvgPillars: Record<number, { TC1: number; TC2: number; TC3: number; TC4: number; TC5: number }>;
  divPillarScores: mock.DivPillarScore[];
  questionScores: mock.QuestionScore[];
}

interface DashboardContextType {
  // Filter state
  filters: DashboardFilters;
  setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
  resetFilters: () => void;
  
  // Dynamic EES Data state
  eesData: EesData;
  syncUrl: string;
  autoSync: boolean;
  lastSyncTime: string | null;
  syncStatus: "idle" | "syncing" | "success" | "error";
  syncErrorMsg: string | null;
  syncSource: string | null; // "Local Storage", "File Upload", "URL Link", "System Mock"
  
  // Actions
  setSyncUrl: (url: string) => void;
  setAutoSync: (val: boolean) => void;
  triggerSync: (url?: string) => Promise<boolean>;
  resetToMock: () => void;
  updateDataManually: (newData: Partial<EesData>, sourceName: string) => void;
}

const defaultFilters: DashboardFilters = {
  year: 2026,
  khoi: "",
  phongBan: "",
  nhomNV: "",
};

const defaultEesData: EesData = {
  kpiData: mock.kpiData,
  divisionData: mock.divisionData,
  groupEngagement: mock.groupEngagement,
  riskZones: mock.riskZones,
  excellenceZones: mock.excellenceZones,
  pillarScoresByGroup: mock.pillarScoresByGroup,
  companyAvgPillars: mock.companyAvgPillars,
  divPillarScores: mock.divPillarScores,
  questionScores: mock.questionScores,
};

const STORAGE_KEYS = {
  EES_DATA: "ghn-ees-dynamic-data",
  SYNC_URL: "ghn-ees-sync-url",
  AUTO_SYNC: "ghn-ees-auto-sync",
  LAST_SYNC: "ghn-ees-last-sync-time",
  SYNC_SOURCE: "ghn-ees-sync-source",
};

const DashboardContext = createContext<DashboardContextType | null>(null);

// ── Google Sheets URL Converter ───────────────────────────────────
// Convert sharing link to CSV export or publish link if needed
function cleanSyncUrl(url: string): string {
  let cleanUrl = url.trim();
  if (cleanUrl.includes("docs.google.com/spreadsheets")) {
    const match = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const spreadsheetId = match[1];
      // If it's already a published-to-web link, keep it as is
      if (cleanUrl.includes("/pub")) {
        return cleanUrl;
      }
      // Otherwise, convert standard spreadsheet URL to direct CSV export format.
      // This works for any Google Sheet shared as "Anyone with the link can view".
      return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
    }
  }
  return cleanUrl;
}

// ── Flat CSV Parser ───────────────────────────────────────────────
export function parseFlatCsv(csvText: string): Partial<EesData> {
  const lines = csvText.split(/\r?\n/);
  
  const kpiData: any[] = [];
  const divisionData: any[] = [];
  const groupEngagement: any[] = [];
  const riskZones: any[] = [];
  const excellenceZones: any[] = [];
  const pillarScoresByGroup: any[] = [];
  const companyAvgPillars: Record<number, any> = {};
  const divPillarScores: any[] = [];
  const questionScores: any[] = [];
  
  const headers: Record<string, string[]> = {};
  
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;
    
    // Simple CSV split (handling double quotes)
    const cells: string[] = [];
    let currentCell = "";
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        cells.push(currentCell.trim());
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());
    
    const cleanedCells = cells.map(cell => {
      if (cell.startsWith('"') && cell.endsWith('"')) {
        return cell.slice(1, -1);
      }
      return cell;
    });
    
    const datasetName = cleanedCells[0];
    if (!datasetName) continue;
    
    // Check if this row is a header
    const secondCell = cleanedCells[1];
    const isHeader = ["year", "khoiId", "group", "dept", "id", "pillar"].includes(secondCell);
    
    if (isHeader) {
      headers[datasetName] = cleanedCells.slice(1);
      continue;
    }
    
    const datasetHeaders = headers[datasetName];
    if (!datasetHeaders) continue; // Skip if no header found first
    
    const rowObj: Record<string, any> = {};
    for (let i = 0; i < datasetHeaders.length; i++) {
      const header = datasetHeaders[i];
      if (!header) continue;
      const val = cleanedCells[i + 1];
      if (val === undefined) continue;
      
      // Parse numbers if possible
      const numVal = Number(val);
      rowObj[header] = (isNaN(numVal) || val === "") ? val : numVal;
    }
    
    if (datasetName === "kpiData") kpiData.push(rowObj);
    else if (datasetName === "divisionData") divisionData.push(rowObj);
    else if (datasetName === "groupEngagement") groupEngagement.push(rowObj);
    else if (datasetName === "riskZones") riskZones.push(rowObj);
    else if (datasetName === "excellenceZones") excellenceZones.push(rowObj);
    else if (datasetName === "pillarScoresByGroup") pillarScoresByGroup.push(rowObj);
    else if (datasetName === "companyAvgPillars") {
      const yr = Number(rowObj.year);
      if (yr) {
        companyAvgPillars[yr] = {
          TC1: Number(rowObj.TC1),
          TC2: Number(rowObj.TC2),
          TC3: Number(rowObj.TC3),
          TC4: Number(rowObj.TC4),
          TC5: Number(rowObj.TC5),
        };
      }
    }
    else if (datasetName === "divPillarScores") divPillarScores.push(rowObj);
    else if (datasetName === "questionScores") questionScores.push(rowObj);
  }
  
  const parsedData: Partial<EesData> = {};
  if (kpiData.length > 0) parsedData.kpiData = kpiData;
  if (divisionData.length > 0) parsedData.divisionData = divisionData;
  if (groupEngagement.length > 0) parsedData.groupEngagement = groupEngagement;
  if (riskZones.length > 0) parsedData.riskZones = riskZones;
  if (excellenceZones.length > 0) parsedData.excellenceZones = excellenceZones;
  if (pillarScoresByGroup.length > 0) parsedData.pillarScoresByGroup = pillarScoresByGroup;
  if (Object.keys(companyAvgPillars).length > 0) parsedData.companyAvgPillars = companyAvgPillars;
  if (divPillarScores.length > 0) parsedData.divPillarScores = divPillarScores;
  if (questionScores.length > 0) parsedData.questionScores = questionScores;
  
  return parsedData;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [eesData, setEesData] = useState<EesData>(defaultEesData);
  const [syncUrl, setSyncUrlState] = useState<string>("");
  const [autoSync, setAutoSyncState] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncErrorMsg, setSyncErrorMsg] = useState<string | null>(null);
  const [syncSource, setSyncSource] = useState<string | null>("System Mock");

  // Load configuration and cached data from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // 1. Sync URL & Auto-Sync config
    const storedUrl = localStorage.getItem(STORAGE_KEYS.SYNC_URL);
    if (storedUrl) setSyncUrlState(storedUrl);
    
    const storedAuto = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
    if (storedAuto) setAutoSyncState(storedAuto === "true");
    
    const storedLast = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (storedLast) setLastSyncTime(storedLast);
    
    const storedSrc = localStorage.getItem(STORAGE_KEYS.SYNC_SOURCE);
    if (storedSrc) setSyncSource(storedSrc);
    
    // 2. Dynamic EES Data
    try {
      const storedData = localStorage.getItem(STORAGE_KEYS.EES_DATA);
      if (storedData) {
        const parsed = JSON.parse(storedData) as EesData;
        // Simple sanity check
        if (parsed.kpiData && parsed.kpiData.length > 0) {
          setEesData(parsed);
        }
      }
    } catch {
      console.warn("Failed to load cached EES data from localStorage.");
    }
  }, []);

  // ── Auto Sync Effect ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedAuto = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC) === "true";
    const storedUrl = localStorage.getItem(STORAGE_KEYS.SYNC_URL);
    
    if (storedAuto && storedUrl) {
      // Small delay to let initial hydration complete smoothly
      const timer = setTimeout(() => {
        triggerSync(storedUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const setFilter = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "khoi") next.phongBan = "";
      return next;
    });
  };

  const resetFilters = () => setFilters(defaultFilters);

  const setSyncUrl = (url: string) => {
    setSyncUrlState(url);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SYNC_URL, url);
    }
  };

  const setAutoSync = (val: boolean) => {
    setAutoSyncState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, String(val));
    }
  };

  // ── Manual & File Update ─────────────────────────────────────────
  const updateDataManually = (newData: Partial<EesData>, sourceName: string) => {
    setEesData((prev) => {
      const merged = { ...prev, ...newData } as EesData;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.EES_DATA, JSON.stringify(merged));
        const timeStr = new Date().toLocaleString("vi-VN");
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr);
        localStorage.setItem(STORAGE_KEYS.SYNC_SOURCE, sourceName);
        setLastSyncTime(timeStr);
        setSyncSource(sourceName);
      }
      return merged;
    });
  };

  // ── Reset to Default mockData ────────────────────────────────────
  const resetToMock = () => {
    setEesData(defaultEesData);
    setSyncStatus("idle");
    setSyncErrorMsg(null);
    setSyncSource("System Mock");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.EES_DATA);
      localStorage.setItem(STORAGE_KEYS.SYNC_SOURCE, "System Mock");
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
      setLastSyncTime(null);
    }
  };

  // ── Sync from URL Link ───────────────────────────────────────────
  const triggerSync = async (targetUrl?: string): Promise<boolean> => {
    const activeUrl = targetUrl || syncUrl;
    if (!activeUrl) {
      setSyncStatus("error");
      setSyncErrorMsg("Đường dẫn liên kết không được để trống!");
      return false;
    }

    setSyncStatus("syncing");
    setSyncErrorMsg(null);

    const cleanUrl = cleanSyncUrl(activeUrl);

    try {
      // Check if URL is external to avoid CORS blocks
      let fetchUrl = cleanUrl;
      if (typeof window !== "undefined" && cleanUrl.startsWith("http") && !cleanUrl.includes(window.location.host)) {
        fetchUrl = `/api/sync-proxy?url=${encodeURIComponent(cleanUrl)}`;
      }

      const response = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          "Accept": "text/csv, application/json, text/plain, */*"
        },
        // Avoid browser cache during manual sync triggers
        cache: "no-store",
      });

      if (!response.ok) {
        let errorBody = "";
        try {
          errorBody = await response.text();
          const errObj = JSON.parse(errorBody);
          if (errObj && errObj.error) {
            throw new Error(errObj.error);
          }
        } catch {}
        throw new Error(errorBody || `Mã phản hồi lỗi: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      let parsed: Partial<EesData> = {};

      // Try JSON first
      if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
        try {
          parsed = JSON.parse(text) as Partial<EesData>;
        } catch {
          throw new Error("Phát hiện dữ liệu JSON nhưng bị lỗi cú pháp.");
        }
      } else {
        // Fallback to Flat CSV
        parsed = parseFlatCsv(text);
      }

      // Validate parsed data
      if (!parsed.kpiData || parsed.kpiData.length === 0) {
        throw new Error("Dữ liệu trống hoặc không đúng cấu trúc (thiếu bảng kpiData).");
      }

      // Success
      updateDataManually(parsed, `URL Link: ${activeUrl}`);
      setSyncStatus("success");
      
      // Keep success state for 4 seconds, then go idle
      setTimeout(() => {
        setSyncStatus("idle");
      }, 4000);

      return true;
    } catch (err: any) {
      console.error("Fetch Sync error:", err);
      setSyncStatus("error");
      setSyncErrorMsg(err.message || "Không thể kết nối đến Link URL. Hãy kiểm tra kết nối mạng hoặc cấu hình URL.");
      return false;
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        filters,
        setFilter,
        resetFilters,
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
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
