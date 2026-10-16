import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rental CRM - Quản Lý Rổ Hàng BĐS Nhà Phố & Căn Hộ",
  description: "Phần mềm quản lý rổ hàng căn hộ và nhà phố cho môi giới BĐS chuyên nghiệp. Quản lý trạng thái, pass cửa, thông tin chủ nhà, tự động tạo tin Zalo.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rental CRM",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.className}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}

