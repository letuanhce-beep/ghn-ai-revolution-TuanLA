# 🚀 GHN EES 2026 — Employee Engagement Survey Dashboard

> **GiaoHangNhanh · Bộ phận Nhân lực & EX · Bảo mật nội bộ**  
> Dashboard phân tích trải nghiệm nhân viên — Chu kỳ 2026

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

---

## 📋 Mô tả

GHN EES Dashboard là hệ thống phân tích và trực quan hóa dữ liệu khảo sát trải nghiệm nhân viên (Employee Engagement Survey) của GiaoHangNhanh — chu kỳ 2026 với **23,412 phản hồi** từ nhân viên toàn quốc.

Dashboard cung cấp cái nhìn toàn diện về mức độ gắn kết, eNPS, rủi ro nghỉ việc, và hiệu quả quản lý, giúp lãnh đạo đưa ra quyết định dựa trên dữ liệu.

---

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|--------|
| 🔐 **Authentication** | Google SSO với kiểm soát truy cập theo email whitelist |
| 📊 **Dashboard 8 tabs** | Tổng quan, Phòng ban, Trend, Benchmark, AI Insights, Action Tracker, Chatbot, Phụ lục |
| 🤖 **AI Insights** | Phân tích thông minh với AI — phát hiện rủi ro, đề xuất hành động cho từng phòng ban |
| 📝 **Action Tracker CRUD** | Tạo, sửa, xóa, theo dõi tiến độ hành động cải thiện |
| 💬 **Chatbot Copilot** | Trợ lý AI hỗ trợ truy vấn dữ liệu EES theo ngôn ngữ tự nhiên |
| 📥 **Auto-Report Export** | Xuất báo cáo tự động dạng PDF/Excel |
| 🔔 **Smart Alert** | Cảnh báo khi chỉ số vượt ngưỡng rủi ro |
| 📈 **Scoring Engine** | Tính toán Engagement Index, eNPS, Attrition Risk, MEI tự động |

---

## 🔄 Tự động Đồng bộ Dữ liệu từ URL (Google Sheets / JSON)

Hệ thống hỗ trợ cơ chế đồng bộ hóa dữ liệu khảo sát thời gian thực tự động từ URL liên kết:

### 1. Đồng bộ từ Google Sheets (CSV)
Bạn có thể quản lý cơ sở dữ liệu EES trực tiếp trên Google Sheets. Hệ thống sẽ tự động quét và bóc tách dữ liệu thông qua cấu trúc **Flat CSV**:
1. Tải tệp dữ liệu mẫu chuẩn [ees_template.csv](file:///Users/tuanleanh/Documents/Antigravity/GHN-EES-2026/dashboard/frontend/public/ees_template.csv) (cũng có sẵn nút tải trực tiếp trong Dashboard).
2. Tạo một Google Sheet mới và dán dữ liệu mẫu này vào.
3. Vào **Tệp (File) ➡️ Chia sẻ (Share) ➡️ Công bố công khai lên web (Publish to web)**.
4. Chọn xuất **Trang tính hiện tại** dưới dạng **CSV (.csv)** và bấm **Công bố**.
5. Copy đường dẫn công bố và dán vào Bộ quản lý Đồng bộ của Dashboard.
   * *Mẹo: Dashboard hỗ trợ tự động nhận dạng và chuyển đổi link chia sẻ chuẩn của Google Sheets thành link tải CSV, bạn có thể dán trực tiếp link chia sẻ.*

### 2. Tự động cập nhật
* Khi bật tùy chọn **"Tự động đồng bộ khi mở trang"**, mỗi khi người dùng truy cập hoặc tải lại trang Dashboard, hệ sinh thái sẽ tự động gọi HTTP request tới Google Sheet để kéo dữ liệu mới nhất mà không cần nạp thủ công.
* Dữ liệu đồng bộ thành công được lưu trữ cục bộ vào `localStorage` của trình duyệt để duy trì trạng thái khi mất mạng hoặc tải lại trang.

---

## 🛠 Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | **Next.js 15** (App Router) |
| Language | **TypeScript** |
| UI | **React 19** + **TailwindCSS** |
| Charts | **Recharts** |
| Icons | **Lucide React** |
| Auth | **NextAuth.js** (Google Provider) |
| Deploy | **Vercel** |
| Analytics | Custom Scoring Engine (`/analytics_engine/scoring.ts`) |

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd GHN-EES-2026/dashboard/frontend
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `dashboard/frontend/`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Access Control — danh sách email được phép truy cập (phân cách bằng dấu phẩy)
ALLOWED_EMAILS=user1@ghn.vn,user2@scommerce.asia
```

### 3. Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem dashboard.

### 4. Build Production

```bash
npm run build
npm start
```

---

## 🌐 Deployment

Dashboard được deploy trên **Vercel** với cấu hình:

- **Framework Preset**: Next.js
- **Root Directory**: `dashboard/frontend`
- **Environment Variables**: Cấu hình trên Vercel Dashboard
- **Domain**: Nội bộ GHN

---

## 🔐 Bảo mật

| Lớp bảo mật | Chi tiết |
|-------------|----------|
| **Google SSO** | Xác thực qua Google OAuth 2.0 — chỉ tài khoản Google |
| **Email Whitelist** | Danh sách email được phê duyệt trong `ALLOWED_EMAILS` |
| **Domain Restriction** | Chỉ chấp nhận email `@ghn.vn` hoặc `@scommerce.asia` |
| **Session Management** | JWT token với thời gian hết hạn tự động |

---

## 🏗 Kiến trúc Hệ thống

```
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────────┐
│  Dữ liệu khảo  │────▶│  Data Cleaning &     │────▶│    Dashboard       │
│  sát (23,412    │     │  Scoring Engine       │     │  Visualization     │
│  phản hồi)      │     │  (scoring.ts)         │     │  (Next.js + React) │
└─────────────────┘     └──────────────────────┘     └────────┬───────────┘
                                                              │
                        ┌──────────────────────┐              │
                        │  Auto-Report         │◀─────────────┤
                        │  Export (PDF/Excel)   │              │
                        └──────────────────────┘              │
                                                              ▼
                        ┌──────────────────────┐     ┌────────────────────┐
                        │  Action Tracker      │◀───▶│  AI Insights       │
                        │  (CRUD)              │     │  Analysis          │
                        └──────────────────────┘     └────────────────────┘
```

---

## 📁 Cấu trúc dự án

```
GHN-EES-2026/
├── data/
│   ├── raw/                  # Dữ liệu thô từ hệ thống khảo sát
│   ├── cleaned/              # Dữ liệu đã làm sạch, chuẩn hóa
│   ├── survey/               # File khảo sát (form, responses)
│   └── benchmark/            # Dữ liệu benchmark ngành Logistics VN
│
├── dashboard/
│   └── frontend/
│       ├── app/              # Next.js App Router (pages, layout)
│       │   ├── about/        # Trang thông tin phiên bản
│       │   ├── login/        # Trang đăng nhập Google SSO
│       │   └── api/          # API routes (auth)
│       ├── components/       # React components
│       │   ├── tabs/         # 8 tab components
│       │   └── ui/           # Shared UI components
│       ├── lib/              # Mock data, utilities
│       └── analytics_engine/ # Scoring engine
│
├── docs/                     # Tài liệu, báo cáo
└── prompts/                  # AI prompts cho phân tích EES
```

---

## 🎯 Mục tiêu KPI 2026

| Chỉ số | Target 2026 | Benchmark Logistics VN |
|--------|-------------|------------------------|
| Engagement Index | ≥ 75 | 68–72 |
| eNPS | ≥ +30 | +15–+25 |
| Attrition Risk | ≤ 15% | 18–22% |
| Response Rate | ≥ 85% | 70–75% |

---

## 📄 License

**Internal use only** — Dự án này là tài sản nội bộ của GiaoHangNhanh.  
Không được phân phối, sao chép, hoặc sử dụng ngoài phạm vi tổ chức.

---

*© 2026 GiaoHangNhanh · HR & EX Team × AI*
