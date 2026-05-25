"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type FilterYear = 2025 | 2026;

interface DashboardFilters {
  year: FilterYear;
  khoi: string; // "" = all
  phongBan: string; // "" = all
  nhomNV: string; // "" = all
}

interface DashboardContextType {
  filters: DashboardFilters;
  setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
  resetFilters: () => void;
}

const defaultFilters: DashboardFilters = {
  year: 2026,
  khoi: "",
  phongBan: "",
  nhomNV: "",
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);

  const setFilter = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Reset phongBan when khoi changes
      if (key === "khoi") next.phongBan = "";
      return next;
    });
  };

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <DashboardContext.Provider value={{ filters, setFilter, resetFilters }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
