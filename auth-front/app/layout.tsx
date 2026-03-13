import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "로그인",
  description: "OAuth2 인가 서버",
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
