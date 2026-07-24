import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JNH PRESS Daily Brief 아카이브",
  description: "경쟁사·고객사·산업 뉴스 데일리 브리핑 아카이브입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
