# GHN EES 2026 — Employee Engagement Survey Project

> **GiaoHangNhanh · Bộ phận Nhân lực & EX · Bảo mật nội bộ**  
> Employee Experience & Engagement Survey — Chu kỳ 2026

---

## 📁 Cấu trúc dự án

```
GHN-EES-2026/
│
├── data/
│   ├── raw/              # Dữ liệu thô từ hệ thống khảo sát (chưa xử lý)
│   ├── cleaned/          # Dữ liệu đã làm sạch, chuẩn hóa
│   ├── survey/           # File khảo sát (form, responses export)
│   └── benchmark/        # Dữ liệu benchmark thị trường Logistics VN
│
├── docs/
│   ├── reports/          # Báo cáo phân tích, Executive Summary
│   ├── framework/        # Khung đo lường EX Index, 5 Pillars Framework
│   └── questionnaire/    # Bộ câu hỏi khảo sát (26 câu + eNPS)
│
├── dashboard/
│   ├── frontend/         # Source code dashboard (Next.js/React)
│   ├── backend/          # API, data pipeline
│   └── analytics_engine/ # Script phân tích, scoring engine
│
└── prompts/              # AI prompts cho phân tích EES, insight generation
```

---

## 🎯 Mục tiêu dự án

| Chỉ số | Target 2026 | Benchmark Logistics VN |
|--------|-------------|------------------------|
| Engagement Index | ≥ 75 | 68–72 |
| eNPS | ≥ +30 | +15–+25 |
| Attrition Risk | ≤ 15% | 18–22% |
| Response Rate | ≥ 85% | 70–75% |

## 📅 Timeline

- **Tháng 3/2026**: Triển khai khảo sát
- **Tháng 4/2026**: Làm sạch & phân tích dữ liệu
- **Tháng 5/2026**: Ra mắt dashboard & báo cáo
- **Tháng 6–12/2026**: Action plan & theo dõi KPI

---

*© 2026 GiaoHangNhanh · Tài liệu nội bộ*
