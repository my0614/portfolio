import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "김민영 | ML / MLOps Engineer",
  description: "위성·드론·RTSP 영상 데이터 기반 End-to-End ML 파이프라인 구축 5년차 개발자 김민영의 포트폴리오",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
