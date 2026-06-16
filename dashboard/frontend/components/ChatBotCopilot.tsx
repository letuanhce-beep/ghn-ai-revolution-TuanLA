"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { useDashboard, EesData } from "@/context/DashboardContext";
import {
  BENCHMARK,
  questionScores,
  pillarScoresByGroup,
  sentimentData,
  PILLARS,
  KHOI,
  NHOM_NV,
  actionItems as defaultActionItems,
} from "@/lib/mockData";

interface Message {
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

// ── Knowledge Base for smart responses ──
function generateResponse(query: string, eesData: EesData, actionItems: any[]): string {
  const q = query.toLowerCase().trim();
  const { kpiData, groupEngagement, divisionData, riskZones, excellenceZones, companyAvgPillars } = eesData;
  
  const kpi26 = kpiData.find(d => d.year === 2026) || kpiData[0] || { year: 2026, engagementIndex: 0, eNPS: 0, attritionRisk: 0, responseRate: 0 };
  const kpi25 = kpiData.find(d => d.year === 2025) || kpiData[0] || { year: 2025, engagementIndex: 0, eNPS: 0, attritionRisk: 0, responseRate: 0 };

  // Greeting
  if (/^(hi|hello|xin ch[aà]o|ch[aà]o|hey)/.test(q)) {
    return `Xin chào! 👋 Tôi là **GHN Copilot** — trợ lý AI phân tích dữ liệu EES 2026.\n\nTôi có thể giúp bạn:\n• Tra cứu chỉ số KPI (EI, eNPS, Attrition...)\n• Phân tích theo Khối hoặc Nhóm NV\n• Xác định vùng rủi ro & điểm sáng\n• Đề xuất hành động cải thiện\n\nBạn muốn hỏi gì?`;
  }

  // EI / Engagement Index
  if (/engagement|ei |chỉ số gắn kết|engagement index|điểm gắn kết/.test(q)) {
    const delta = kpi26.engagementIndex - kpi25.engagementIndex;
    const lowestGroup = [...groupEngagement].sort((a, b) => a.ei2026 - b.ei2026)[0];
    const highestGroup = [...groupEngagement].sort((a, b) => b.ei2026 - a.ei2026)[0];
    return `📊 **Engagement Index (EI) 2026: ${kpi26.engagementIndex}/100**\n\n` +
      `• So với 2025: **+${delta} điểm** (${kpi25.engagementIndex} → ${kpi26.engagementIndex})\n` +
      `• Benchmark Logistics VN: ${BENCHMARK.engagementIndex.low}–${BENCHMARK.engagementIndex.high}\n` +
      `• Nhóm cao nhất: **${highestGroup.label}** (${highestGroup.ei2026})\n` +
      `• Nhóm thấp nhất: **${lowestGroup.label}** (${lowestGroup.ei2026})\n\n` +
      `→ GHN đang ở mức **trên trung bình** ngành. Cần tập trung cải thiện nhóm ${lowestGroup.label}.`;
  }

  // eNPS
  if (/enps|e-nps|net promoter/.test(q)) {
    const delta = kpi26.eNPS - kpi25.eNPS;
    const lowestDiv = [...divisionData].sort((a, b) => a.eNPS2026 - b.eNPS2026)[0];
    const highestDiv = [...divisionData].sort((a, b) => b.eNPS2026 - a.eNPS2026)[0];
    return `📈 **eNPS 2026: +${kpi26.eNPS}**\n\n` +
      `• So với 2025: **+${delta} điểm** (+${kpi25.eNPS} → +${kpi26.eNPS})\n` +
      `• Benchmark Logistics VN: ${BENCHMARK.eNPS.low}–${BENCHMARK.eNPS.high}\n` +
      `• Khối cao nhất: **${highestDiv.khoiLabel}** (+${highestDiv.eNPS2026})\n` +
      `• Khối thấp nhất: **${lowestDiv.khoiLabel}** (+${lowestDiv.eNPS2026})\n\n` +
      `→ eNPS tăng mạnh, đặc biệt nhờ cải thiện quản lý và thu nhập.`;
  }

  // Attrition / Nghỉ việc
  if (/attrition|nghỉ việc|rủi ro|turnover|rời bỏ/.test(q)) {
    const delta = kpi25.attritionRisk - kpi26.attritionRisk;
    return `⚠️ **Tỷ lệ Rủi ro Nghỉ việc 2026: ${kpi26.attritionRisk}%**\n\n` +
      `• So với 2025: **giảm ${delta}%** (${kpi25.attritionRisk}% → ${kpi26.attritionRisk}%)\n` +
      `• Benchmark Logistics VN: ${BENCHMARK.attritionRisk.low}–${BENCHMARK.attritionRisk.high}%\n\n` +
      `**Top 3 vùng rủi ro cao nhất:**\n` +
      riskZones.map((z, i) => `${i + 1}. ${z.dept} (${z.khoi}) — Attrition: ${z.attrition}%, EI: ${z.engagementIndex}`).join("\n") +
      `\n\n→ Cần ưu tiên giữ chân nhân viên tại ${riskZones[0].dept}.`;
  }

  // Khối specific
  const khoiMatch = KHOI.find(k =>
    q.includes(k.label.toLowerCase()) || q.includes(k.id.toLowerCase())
  );
  if (khoiMatch || /kh[oố]i/.test(q)) {
    if (khoiMatch) {
      const div = divisionData.find(d => d.khoiId === khoiMatch.id);
      if (div) {
        return `🏢 **${div.khoiLabel} — Năm 2026:**\n\n` +
          `| Chỉ số | 2025 | 2026 | Thay đổi |\n|---|---|---|---|\n` +
          `| EI | ${div.ei2025} | ${div.ei2026} | +${div.ei2026 - div.ei2025} |\n` +
          `| eNPS | +${div.eNPS2025} | +${div.eNPS2026} | +${div.eNPS2026 - div.eNPS2025} |\n` +
          `| Attrition | ${div.attrition2025}% | ${div.attrition2026}% | -${div.attrition2025 - div.attrition2026}% |\n` +
          `| MEI | ${div.mei2025} | ${div.mei2026} | +${(div.mei2026 - div.mei2025).toFixed(1)} |\n\n` +
          `→ ${div.eNPS2026 > 30 ? "Khối này đang hoạt động xuất sắc! 🌟" : div.eNPS2026 > 10 ? "Khối này đang cải thiện tốt." : "Khối này cần được ưu tiên cải thiện."}`;
      }
    }
    const summary = divisionData.map(d =>
      `• ${d.khoiLabel}: EI=${d.ei2026}, eNPS=+${d.eNPS2026}`
    ).join("\n");
    return `📋 **Tổng hợp 6 Khối — 2026:**\n\n${summary}\n\nBạn muốn xem chi tiết Khối nào?`;
  }

  // Pillar / Trụ cột
  if (/tr[uụ] cột|pillar|tc[1-5]|niềm tin|quản lý|công việc|thu nhập|môi trường/.test(q)) {
    const avg = companyAvgPillars[2026];
    const prev = companyAvgPillars[2025];
    const pillars = [
      { id: "TC1", label: "Niềm tin LĐ", score: avg.TC1, prev: prev.TC1 },
      { id: "TC2", label: "Quản lý", score: avg.TC2, prev: prev.TC2 },
      { id: "TC3", label: "Công việc", score: avg.TC3, prev: prev.TC3 },
      { id: "TC4", label: "Thu nhập", score: avg.TC4, prev: prev.TC4 },
      { id: "TC5", label: "Môi trường", score: avg.TC5, prev: prev.TC5 },
    ];
    const lowest = [...pillars].sort((a, b) => a.score - b.score)[0];
    const highest = [...pillars].sort((a, b) => b.score - a.score)[0];
    return `🎯 **5 Trụ cột EES 2026 (Trung bình toàn công ty):**\n\n` +
      pillars.map(p => `• **${p.id} – ${p.label}**: ${p.score.toFixed(2)} (${p.score > p.prev ? "+" : ""}${(p.score - p.prev).toFixed(2)} vs 2025)`).join("\n") +
      `\n\n🔴 Thấp nhất: **${lowest.id} – ${lowest.label}** (${lowest.score.toFixed(2)})\n` +
      `🟢 Cao nhất: **${highest.id} – ${highest.label}** (${highest.score.toFixed(2)})\n\n` +
      `→ Thu nhập (TC4) vẫn là điểm yếu lớn nhất cần cải thiện.`;
  }

  // Action / Hành động
  if (/action|hành động|thực thi|kế hoạch|plan/.test(q)) {
    const completed = actionItems.filter(a => a.status === "Hoàn thành").length;
    const inProgress = actionItems.filter(a => a.status === "Đang làm").length;
    const overdue = actionItems.filter(a => a.status === "Trễ hạn").length;
    const notStarted = actionItems.filter(a => a.status === "Chưa bắt đầu").length;
    return `📋 **Action Tracker — Tổng hợp:**\n\n` +
      `• Tổng số hành động: **${actionItems.length}**\n` +
      `• ✅ Hoàn thành: **${completed}** (${Math.round(completed / actionItems.length * 100)}%)\n` +
      `• 🔄 Đang làm: **${inProgress}**\n` +
      `• 🔴 Trễ hạn: **${overdue}**\n` +
      `• ⬜ Chưa bắt đầu: **${notStarted}**\n\n` +
      `**Hành động trễ hạn cần xử lý gấp:**\n` +
      actionItems.filter(a => a.status === "Trễ hạn")
        .map(a => `• ${a.id}: ${a.actionName} (${a.owner})`)
        .join("\n") +
      `\n\n→ Cần đôn đốc ${overdue} hành động trễ hạn ngay lập tức.`;
  }

  // Sentiment / Cảm xúc
  if (/sentiment|cảm xúc|pain point|nỗi đau|feedback|phản hồi|verbatim/.test(q)) {
    const all = sentimentData.find(s => s.group === "ALL")!;
    return `💬 **Phân tích Cảm xúc Nhân viên (NLP):**\n\n` +
      `**🟢 Từ khóa tích cực:** ${all.positiveKeywords.join(", ")}\n\n` +
      `**🔴 Pain Points:** ${all.painPoints.join(", ")}\n\n` +
      `**Trích dẫn tiêu biểu:**\n` +
      all.quotes.map(q => `> _"${q.text}"_ — ${q.source} (${q.sentiment === "positive" ? "🟢" : "🔴"})`).join("\n\n") +
      `\n\n→ Thu nhập và KPI áp lực là 2 nỗi đau lớn nhất cần giải quyết.`;
  }

  // Benchmark
  if (/benchmark|so sánh|ngành|thị trường|logistics/.test(q)) {
    return `📊 **Benchmark so với ngành Logistics Việt Nam:**\n\n` +
      `| Chỉ số | GHN 2026 | Ngành (Thấp–Cao) | Đánh giá |\n|---|---|---|---|\n` +
      `| EI | ${kpi26.engagementIndex} | ${BENCHMARK.engagementIndex.low}–${BENCHMARK.engagementIndex.high} | ${kpi26.engagementIndex >= BENCHMARK.engagementIndex.high ? "🟢 Trên chuẩn" : "🟡 Trung bình"} |\n` +
      `| eNPS | +${kpi26.eNPS} | ${BENCHMARK.eNPS.low}–${BENCHMARK.eNPS.high} | ${kpi26.eNPS >= BENCHMARK.eNPS.high ? "🟢 Trên chuẩn" : "🟡 Trung bình"} |\n` +
      `| Attrition | ${kpi26.attritionRisk}% | ${BENCHMARK.attritionRisk.low}–${BENCHMARK.attritionRisk.high}% | ${kpi26.attritionRisk <= BENCHMARK.attritionRisk.low ? "🟢 Tốt" : "🟡 Trung bình"} |\n` +
      `| Response Rate | ${kpi26.responseRate}% | ${BENCHMARK.responseRate.low}–${BENCHMARK.responseRate.high}% | ${kpi26.responseRate >= BENCHMARK.responseRate.high ? "🟢 Trên chuẩn" : "🟡 Trung bình"} |\n\n` +
      `→ GHN đang ở mức **trên trung bình ngành** trên hầu hết các chỉ số! 🎉`;
  }

  // Response rate
  if (/response rate|tỷ lệ phản hồi|tỷ lệ trả lời|phản hồi/.test(q)) {
    return `📬 **Tỷ lệ Phản hồi 2026: ${kpi26.responseRate}%**\n\n` +
      `• So với 2025: +${kpi26.responseRate - kpi25.responseRate}% (${kpi25.responseRate}% → ${kpi26.responseRate}%)\n` +
      `• Benchmark: ${BENCHMARK.responseRate.low}–${BENCHMARK.responseRate.high}%\n` +
      `• Số lượng phản hồi: ~23,412 / ~28,900 nhân viên\n\n` +
      `→ Tỷ lệ phản hồi vượt chuẩn ngành, cho thấy nhân viên tin tưởng vào khảo sát.`;
  }

  // Excellence / Điểm sáng
  if (/điểm sáng|excellence|xuất sắc|tốt nhất|top/.test(q)) {
    return `🌟 **Top 3 Vùng Xuất sắc:**\n\n` +
      excellenceZones.map((z, i) =>
        `${i + 1}. **${z.dept}** (${z.khoi})\n   EI: ${z.engagementIndex} | eNPS: +${z.eNPS} | Attrition: ${z.attrition}%`
      ).join("\n\n") +
      `\n\n→ Khối Tech dẫn đầu nhờ văn hóa minh bạch và chương trình retention tốt.`;
  }

  // Help / Hướng dẫn
  if (/help|giúp|hướng dẫn|hỏi gì|làm gì/.test(q)) {
    return `💡 **Bạn có thể hỏi tôi về:**\n\n` +
      `📊 Chỉ số: _"EI bao nhiêu?", "eNPS 2026?", "Tỷ lệ nghỉ việc?"_\n` +
      `🏢 Khối: _"Khối Vận Hành thế nào?", "So sánh các Khối"_\n` +
      `🎯 Trụ cột: _"5 trụ cột điểm số?", "TC4 thu nhập?"_\n` +
      `⚠️ Rủi ro: _"Vùng rủi ro?", "Điểm sáng?"_\n` +
      `📋 Hành động: _"Action tracker?", "Kế hoạch?"_\n` +
      `💬 Cảm xúc: _"Pain point?", "Feedback nhân viên?"_\n` +
      `📊 Benchmark: _"So sánh ngành?"_`;
  }

  // Default / Không hiểu
  return `Tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi tôi về:\n\n` +
    `• **Chỉ số KPI**: EI, eNPS, Attrition, Response Rate\n` +
    `• **Phân tích theo Khối**: VD: "Khối Vận Hành thế nào?"\n` +
    `• **5 Trụ cột**: VD: "Điểm TC4 thu nhập?"\n` +
    `• **Vùng rủi ro / Điểm sáng**\n` +
    `• **Action Tracker**: VD: "Hành động nào trễ hạn?"\n` +
    `• **Benchmark ngành**\n\n` +
    `Hoặc gõ **"help"** để xem hướng dẫn chi tiết.`;
}

// ── Simple Markdown renderer ──
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold
    let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    processed = processed.replace(/_(.+?)_/g, '<em>$1</em>');
    // Blockquote
    if (processed.startsWith("> ")) {
      return <div key={i} className="border-l-2 border-slate-400 pl-3 my-1 text-slate-400 text-[12px] italic"
                  dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />;
    }
    // Table header
    if (processed.startsWith("|") && lines[i + 1]?.startsWith("|---")) {
      return null; // Skip, handled in table body
    }
    if (processed.startsWith("|---")) return null;
    // Table row
    if (processed.startsWith("|")) {
      const cells = processed.split("|").filter(Boolean).map(c => c.trim());
      const isHeader = lines[i + 1]?.startsWith("|---");
      return (
        <div key={i} className={`grid gap-1 text-[11px] py-1 ${isHeader ? "font-bold border-b border-slate-600" : ""}`}
             style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
          {cells.map((cell, j) => <span key={j} dangerouslySetInnerHTML={{ __html: cell }} />)}
        </div>
      );
    }
    // Bullet
    if (processed.startsWith("• ") || processed.startsWith("- ")) {
      return <div key={i} className="flex gap-2 ml-1 my-0.5 text-[12px]">
        <span className="text-[#FF5200] shrink-0">•</span>
        <span dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />
      </div>;
    }
    // Numbered list
    const numMatch = processed.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      return <div key={i} className="flex gap-2 ml-1 my-0.5 text-[12px]">
        <span className="text-[#006FAD] font-bold shrink-0">{numMatch[1]}.</span>
        <span dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
      </div>;
    }
    // Empty line
    if (!processed.trim()) return <div key={i} className="h-2" />;
    // Normal text
    return <div key={i} className="text-[12px] my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />;
  });
}

const SUGGESTED_QUESTIONS = [
  "EI 2026 bao nhiêu?",
  "eNPS thế nào?",
  "Vùng rủi ro?",
  "So sánh các Khối",
  "5 trụ cột điểm số?",
  "Benchmark ngành?",
];

export default function ChatBotCopilot({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const { eesData } = useDashboard();
  const [actions, setActions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(isEmbedded);

  useEffect(() => {
    if (isEmbedded) {
      setIsOpen(true);
    }
  }, [isEmbedded]);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ghn-ees-action-items");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActions(parsed);
            return;
          }
        }
      } catch {}
      setActions(defaultActionItems);
    }
  }, [isOpen]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: `Xin chào! 👋 Tôi là **GHN Copilot** — trợ lý AI phân tích dữ liệu EES 2026.\n\nHãy hỏi tôi bất kỳ điều gì về kết quả khảo sát nhân viên!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = { role: "user", content: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const response = generateResponse(trimmed, eesData, actions);
      const botMsg: Message = { role: "bot", content: response, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  }, [input, isTyping, eesData, actions]);

  const handleSuggestedClick = useCallback((question: string) => {
    setInput(question);
    setTimeout(() => {
      const userMsg: Message = { role: "user", content: question, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      const delay = 800 + Math.random() * 1200;
      setTimeout(() => {
        const response = generateResponse(question, eesData, actions);
        const botMsg: Message = { role: "bot", content: response, timestamp: new Date() };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, delay);
      setInput("");
    }, 100);
  }, [eesData, actions]);

  return (
    <>
      {/* Floating button */}
      {!isEmbedded && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #FF5200 0%, #006FAD 100%)",
            boxShadow: "0 4px 20px rgba(255,82,0,0.4)",
          }}
          title="GHN Copilot"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className={
            isEmbedded
              ? "w-full h-[320px] flex flex-col rounded-xl overflow-hidden border border-slate-700/30 shadow-sm"
              : "fixed bottom-24 right-6 z-50 w-[380px] max-h-[560px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeInUp"
          }
          style={{
            background: "#1C2331",
            border: isEmbedded ? undefined : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Header */}
          <div
            className="px-3.5 py-2.5 flex items-center gap-2.5 shrink-0"
            style={{ background: "linear-gradient(135deg, #FF5200 0%, #006FAD 100%)" }}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[12px] font-bold truncate">GHN Copilot</div>
              <div className="text-white/60 text-[9px] truncate">Trợ lý AI phân tích EES</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-[9px]">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "380px" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === "bot" ? "bg-[#006FAD]/30" : "bg-[#FF5200]/30"
                }`}>
                  {msg.role === "bot"
                    ? <Sparkles className="w-3.5 h-3.5 text-[#006FAD]" />
                    : <User className="w-3.5 h-3.5 text-[#FF5200]" />
                  }
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-[12px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#FF5200] text-white rounded-br-none"
                      : "bg-[#2A3444] text-slate-200 rounded-bl-none"
                  }`}
                >
                  {msg.role === "bot" ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[#006FAD]/30 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#006FAD]" />
                </div>
                <div className="bg-[#2A3444] rounded-xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedClick(sq)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-slate-600 text-slate-400 hover:border-[#FF5200] hover:text-[#FF5200] transition-colors"
                >
                  {sq}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Hỏi về dữ liệu EES..."
                className="flex-1 bg-[#2A3444] text-white text-[13px] px-4 py-2.5 rounded-xl border border-slate-600 focus:border-[#FF5200] focus:outline-none transition-colors placeholder:text-slate-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                style={{ background: input.trim() ? "linear-gradient(135deg, #FF5200, #006FAD)" : "#2A3444" }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
