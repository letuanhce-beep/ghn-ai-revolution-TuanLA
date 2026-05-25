import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "GHN EES 2026 – Bảng điều khiển Khảo sát Gắn kết Nhân viên",
  description:
    "Dashboard phân tích toàn diện kết quả Employee Engagement Survey 2026 của GiaoHangNhanh. Theo dõi Engagement Index, eNPS, Attrition Risk, và 5 Trụ cột EX.",
  keywords: ["GHN", "Employee Engagement", "EES", "HR Analytics", "GiaoHangNhanh"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
