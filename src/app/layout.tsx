import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QQQ vs SCHD 투자 비중 계산기 | 나만의 황금 비율 찾기",
  description: "나스닥100(QQQ)과 배당성장(SCHD) ETF의 투자 비중별 수익률, MDD를 실시간으로 확인하세요. 10년 이상의 백테스트 데이터 기반 무료 계산기.",
  keywords: ["QQQ", "SCHD", "ETF", "투자비중", "계산기", "포트폴리오", "백테스트", "자산배분"],
  openGraph: {
    title: "QQQ vs SCHD 투자 비중 계산기",
    description: "당신에게 맞는 QQQ와 SCHD의 황금 비율은 무엇인가요? 실시간 시뮬레이션으로 확인하세요.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Read occupation<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
