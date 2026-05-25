"use client";

import { useState } from "react";
import {
  questionFramework,
  PILLARS,
  demographicSeniority,
  demographicGeneration,
} from "@/lib/mockData";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, BookOpen, BarChart2, HelpCircle } from "lucide-react";

// ── Accordion Item ────────────────────────────────────────────

function AccordionItem({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-orange-500 bg-orange-50 p-2 rounded-lg group-hover:bg-orange-100 transition-colors">
            {icon}
          </span>
          <span className="font-bold text-slate-700 text-sm">{title}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Question Framework Table ──────────────────────────────────

function QuestionFrameworkTable() {
  const PILLAR_COLORS: Record<string, string> = {
    TC1: "bg-orange-100 text-orange-700",
    TC2: "bg-blue-100 text-blue-700",
    TC3: "bg-green-100 text-green-700",
    TC4: "bg-purple-100 text-purple-700",
    TC5: "bg-teal-100 text-teal-700",
    eNPS: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">Mã câu</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Trụ cột</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nội dung câu hỏi</th>
          </tr>
        </thead>
        <tbody>
          {questionFramework.map((q, i) => {
            const pillarLabel = q.pillar === "eNPS"
              ? "eNPS"
              : PILLARS.find((p) => p.id === q.pillar)?.label ?? q.pillar;
            return (
              <tr
                key={q.id}
                className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
              >
                <td className="px-3 py-2.5">
                  <span className="text-xs font-mono font-bold text-slate-400">{q.id}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${PILLAR_COLORS[q.pillar] ?? "bg-slate-100 text-slate-600"}`}>
                    {pillarLabel}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-700 leading-relaxed">{q.question}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Demographic Pie Charts ────────────────────────────────────

const PIE_COLORS_1 = ["#F26522", "#003366", "#16A34A", "#D97706", "#7C3AED"];
const PIE_COLORS_2 = ["#F26522", "#003366", "#16A34A"];

function DemoPie({
  data,
  colors,
  title,
}: {
  data: { name: string; value: number }[];
  colors: string[];
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 text-center">
        {title}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={75}
            innerRadius={35}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, fontSize: 12 }}
            formatter={(v: number) => [`${v}%`, "Tỷ lệ"]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconSize={10}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Glossary ──────────────────────────────────────────────────

function GlossaryItem({ term, formula, description }: {
  term: string;
  formula: string;
  description: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-2">
      <h4 className="text-sm font-bold text-slate-800">{term}</h4>
      <div className="bg-slate-800 rounded-lg px-4 py-2.5 font-mono text-xs text-green-300 overflow-x-auto">
        {formula}
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────

export default function TabPhuLuc() {
  return (
    <div className="space-y-4">
      {/* Framework */}
      <AccordionItem
        title="Bộ khung 26 câu hỏi – Ánh xạ sang 5 Trụ cột EX"
        icon={<BookOpen size={16} />}
        defaultOpen={true}
      >
        <p className="text-xs text-slate-500 mb-4">
          Mỗi câu hỏi trong bộ khảo sát EES 2026 được ánh xạ vào một Trụ cột của mô hình
          Employee Experience (EX) gồm 5 chiều: Niềm tin Lãnh đạo, Quản lý, Công việc, Thu nhập,
          và Môi trường. Câu Q26 đo lường eNPS.
        </p>
        <QuestionFrameworkTable />
      </AccordionItem>

      {/* Demographics */}
      <AccordionItem
        title="Phân bổ Nhân khẩu học – Thâm niên & Thế hệ"
        icon={<BarChart2 size={16} />}
      >
        <p className="text-xs text-slate-500 mb-4">
          Phân tích cơ cấu nhân sự tham gia khảo sát EES 2026 theo thâm niên công tác và thế hệ
          (Gen Z, Gen Y, Gen X).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DemoPie
            data={demographicSeniority}
            colors={PIE_COLORS_1}
            title="Phân bổ theo Thâm niên công tác"
          />
          <DemoPie
            data={demographicGeneration}
            colors={PIE_COLORS_2}
            title="Phân bổ theo Thế hệ"
          />
        </div>
        <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
          <p className="text-xs text-orange-700 font-medium">
            💡 <strong>Ghi chú:</strong> Gen Z (sinh từ 1997–2012) chiếm 38% lực lượng lao động – cần có
            chương trình gắn kết và phát triển đặc thù cho nhóm này.
          </p>
        </div>
      </AccordionItem>

      {/* Glossary */}
      <AccordionItem
        title="Bảng chú giải – Công thức tính các chỉ số EES"
        icon={<HelpCircle size={16} />}
      >
        <div className="space-y-4">
          <GlossaryItem
            term="eNPS – Employee Net Promoter Score"
            formula='eNPS = (% Promoters [9–10]) − (% Detractors [0–6])'
            description='Chỉ số đo lường mức độ nhân viên sẵn sàng giới thiệu GHN là nơi làm việc tốt. Dải điểm từ -100 đến +100. Benchmark ngành Logistics: >20 là Tốt, >40 là Xuất sắc.'
          />
          <GlossaryItem
            term="Engagement Index (EI) – Chỉ số Gắn kết"
            formula='EI = (Trung bình có trọng số của 25 câu) × 20'
            description='Chuyển đổi điểm trung bình của 25 câu hỏi (thang 1–5) sang thang 0–100 để dễ so sánh. Điểm ≥75 là Tốt; 65–74 là Đạt; <65 là Cần cải thiện.'
          />
          <GlossaryItem
            term="Attrition Risk (%) – Rủi ro Nghỉ việc"
            formula='Attrition Risk = (Số nhân viên có EI < 3.0 hoặc eNPS Detractor) / Tổng NV × 100%'
            description='Dự báo tỷ lệ nhân viên có nguy cơ nghỉ việc trong 12 tháng tới, dựa trên tổ hợp điểm EI thấp và phản hồi eNPS tiêu cực.'
          />
          <GlossaryItem
            term="MEI – Manager Effectiveness Index"
            formula='MEI = Trung bình (Q06 + Q07 + Q08 + Q09 + Q10) / 5'
            description='Chỉ số hiệu quả quản lý, tính từ 5 câu hỏi về TC2 (Trụ cột Quản lý). Thang điểm 1–5. MEI ≥4.0 là Tốt; 3.5–3.9 là Cần cải thiện; <3.5 là Rủi ro.'
          />
        </div>
      </AccordionItem>
    </div>
  );
}
