import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "최애리 뉴스룸",
  description: "최애리 방송을 위한 한국 RSS 뉴스 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
