'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const data = [
  { year: 2014, qqq: 19.18, schd: 15.82 },
  { year: 2015, qqq: 9.45, schd: -0.32 },
  { year: 2016, qqq: 7.10, schd: 16.05 },
  { year: 2017, qqq: 32.66, schd: 21.03 },
  { year: 2018, qqq: -0.14, schd: -5.56 },
  { year: 2019, qqq: 38.96, schd: 27.27 },
  { year: 2020, qqq: 48.60, schd: 15.11 },
  { year: 2021, qqq: 27.24, schd: 29.87 },
  { year: 2022, qqq: -32.58, schd: -3.23 },
  { year: 2023, qqq: 54.85, schd: 4.57 },
  { year: 2024, qqq: 22.11, schd: 18.90 },
  { year: 2025, qqq: 14.50, schd: 11.20 }
];

const qqqHoldings = [
  { name: "Apple", weight: 12.4, symbol: "AAPL", color: "#555555" },
  { name: "Microsoft", weight: 9.8, symbol: "MSFT", color: "#00A4EF" },
  { name: "Amazon", weight: 4.7, symbol: "AMZN", color: "#FF9900" },
  { name: "NVIDIA", weight: 4.5, symbol: "NVDA", color: "#76B900" },
  { name: "Alphabet Cl A", weight: 3.8, symbol: "GOOGL", color: "#4285F4" },
  { name: "Meta", weight: 3.5, symbol: "META", color: "#0668E1" },
  { name: "Broadcom", weight: 3.2, symbol: "AVGO", color: "#CC0000" },
  { name: "Tesla", weight: 2.8, symbol: "TSLA", color: "#E00000" },
  { name: "Costco", weight: 2.1, symbol: "COST", color: "#005CAB" },
  { name: "Alphabet Cl C", weight: 2.0, symbol: "GOOG", color: "#34A853" }
];

const schdHoldings = [
  { name: "AbbVie", weight: 4.4, symbol: "ABBV", color: "#003087" },
  { name: "Home Depot", weight: 4.2, symbol: "HD", color: "#F96302" },
  { name: "Chevron", weight: 4.1, symbol: "CVX", color: "#0054A6" },
  { name: "Amgen", weight: 4.0, symbol: "AMGN", color: "#0047BA" },
  { name: "Verizon", weight: 3.9, symbol: "VZ", color: "#CD040B" },
  { name: "PepsiCo", weight: 3.8, symbol: "PEP", color: "#004B93" },
  { name: "Pfizer", weight: 3.7, symbol: "PFE", color: "#007DC3" },
  { name: "Cisco", weight: 3.6, symbol: "CSCO", color: "#049FD9" },
  { name: "Coca-Cola", weight: 3.5, symbol: "KO", color: "#F40009" },
  { name: "Texas Instruments", weight: 3.4, symbol: "TXN", color: "#D0021B" }
];

const AnimatedNumber = ({ value, suffix = "", isCurrency = false }: { value: string | number, suffix?: string, isCurrency?: boolean }) => {
  const displayValue = isCurrency ? new Intl.NumberFormat('ko-KR').format(Number(value)) : value;
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-block"
    >
      {isCurrency ? "₩" : ""}{displayValue}{suffix}
    </motion.span>
  );
};

export default function PortfolioCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(10000000);
  const [qqqWeight, setQqqWeight] = useState(70);
  const schdWeight = 100 - qqqWeight;

  const results = useMemo(() => {
    let currentBalance = initialInvestment;
    let peakBalance = initialInvestment;
    let maxDrawdown = 0;
    const chartData = [{ year: 2013, value: initialInvestment }];

    data.forEach((item) => {
      const yearlyReturn = (qqqWeight / 100) * (item.qqq / 100) + (schdWeight / 100) * (item.schd / 100);
      currentBalance *= (1 + yearlyReturn);
      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const drawdown = (currentBalance - peakBalance) / peakBalance;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
      chartData.push({ year: item.year, value: Math.round(currentBalance) });
    });

    const years = data.length;
    const cagr = (Math.pow(currentBalance / initialInvestment, 1 / years) - 1) * 100;
    const dividendYield = (qqqWeight / 100) * 0.6 + (schdWeight / 100) * 3.4;
    const monthlyDividend = (currentBalance * (dividendYield / 100)) / 12;

    let profile = { title: "", icon: "⚖️", desc: "", color: "#4E5968" };
    if (qqqWeight >= 80) profile = { title: "초공격적 성장형", icon: "🚀", desc: "자산 폭발! 하락장 멘탈이 강한 투자자에게 추천해요.", color: "#3182F6" };
    else if (qqqWeight >= 60) profile = { title: "공격적 밸런스형", icon: "📈", desc: "수익률을 높이면서 배당 안전핀을 적절히 섞었어요.", color: "#3182F6" };
    else if (qqqWeight >= 40) profile = { title: "중립적 밸런스형", icon: "⚖️", desc: "수익과 배당, 두 마리 토끼를 잡는 가장 대중적인 비율이에요.", color: "#4E5968" };
    else profile = { title: "안정적 배당형", icon: "☕", desc: "자산의 변동성을 줄이고 매달 들어오는 현금을 즐겨보세요.", color: "#00D084" };

    return { chartData, cagr: cagr.toFixed(2), mdd: (maxDrawdown * 100).toFixed(2), dividendYield: dividendYield.toFixed(2), monthlyDividend: Math.round(monthlyDividend), finalValue: Math.round(currentBalance), profile };
  }, [qqqWeight, schdWeight, initialInvestment]);

  // 투자금 입력 포맷팅 함수
  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInitialInvestment(Number(val));
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4 md:p-10 font-sans text-[#191F28]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header & Money Input */}
        <header className="space-y-6 py-4 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="inline-block px-3 py-1 bg-[#3182F61A] text-[#3182F6] text-[10px] font-bold rounded-full mb-2 uppercase tracking-widest tracking-tight">Investment Simulator</span>
            <h1 className="text-3xl font-bold tracking-tight mb-8">나의 투자 미래 확인하기</h1>
          </motion.div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] max-w-sm mx-auto">
            <label className="text-xs font-bold text-[#8B95A1] block mb-3">초기 투자 원금</label>
            <div className="flex items-center justify-center gap-2 border-b-2 border-[#F2F4F6] focus-within:border-[#3182F6] transition-colors pb-2">
              <span className="text-2xl font-bold text-[#191F28]">₩</span>
              <input 
                type="text" 
                value={initialInvestment.toLocaleString()}
                onChange={handleInvestmentChange}
                className="text-3xl font-black text-[#3182F6] w-full text-center outline-none bg-transparent"
              />
            </div>
            <p className="text-[10px] text-[#B0B8C1] mt-4 font-medium">매달 쌓이는 배당금과 자산 성장을 확인해보세요</p>
          </div>
        </header>

        {/* Dynamic Insight Card */}
        <section className="bg-white p-8 rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#F2F4F6] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl">
            {results.profile.icon}
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#8B95A1]">12년 뒤 내 예상 자산</h2>
              <p className="text-4xl md:text-5xl font-black text-[#191F28] tracking-tight">
                <AnimatedNumber value={results.finalValue} isCurrency={true} />
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F9FAFB] p-5 rounded-[28px] border border-[#F2F4F6]">
                <span className="text-[10px] font-bold text-[#8B95A1] block mb-1">매달 받는 배당금</span>
                <p className="text-xl font-bold text-[#00D084]">
                  <AnimatedNumber value={results.monthlyDividend} isCurrency={true} />
                </p>
              </div>
              <div className="bg-[#F9FAFB] p-5 rounded-[28px] border border-[#F2F4F6]">
                <span className="text-[10px] font-bold text-[#8B95A1] block mb-1">연평균 수익률</span>
                <p className="text-xl font-bold text-[#3182F6]">
                  <AnimatedNumber value={results.cagr} suffix="%" />
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#F2F4F6]">
              <h3 className="text-lg font-bold" style={{ color: results.profile.color }}>{results.profile.icon} {results.profile.title}</h3>
              <p className="text-[#4E5968] text-sm leading-relaxed mt-1 font-medium">{results.profile.desc}</p>
            </div>
          </div>
        </section>

        {/* Controls - Slider with Enhanced Labels */}
        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-10">
          <div className="flex gap-2">
            {[ { label: "공격 8:2", val: 80 }, { label: "밸런스 5:5", val: 50 }, { label: "안정 2:8", val: 20 } ].map((btn) => (
              <button key={btn.val} onClick={() => setQqqWeight(btn.val)} className={`flex-1 py-4 text-xs font-bold rounded-2xl transition-all ${qqqWeight === btn.val ? 'bg-[#3182F6] text-white shadow-lg shadow-[#3182F644]' : 'bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB]'}`}>
                {btn.label}
              </button>
            ))}
          </div>

          <div className="space-y-8 px-2">
            <div className="flex justify-between items-center px-4">
              <span className="text-sm font-black text-[#3182F6]">QQQ</span>
              <div className="bg-[#3182F61A] px-4 py-1 rounded-full text-[#3182F6] text-sm font-black">
                {qqqWeight} : {schdWeight}
              </div>
              <span className="text-sm font-black text-[#4E5968]">SCHD</span>
            </div>

            <div className="relative py-4">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5" 
                value={qqqWeight} 
                onChange={(e) => setQqqWeight(parseInt(e.target.value))} 
                className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#3182F6]" 
              />
              <div className="flex justify-between mt-5 text-[11px] font-bold text-[#ADB5BD]">
                <span className="text-[#00D084]">배당 집중형</span>
                <span className="text-[#3182F6]">황금 밸런스 구간</span>
                <span className="text-[#3182F6]">수익 집중형</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEO & Summarized Blog Content */}
        <section className="bg-white p-10 md:p-14 rounded-[48px] shadow-sm border border-[#F2F4F6] space-y-8">
          <h2 className="text-2xl font-bold tracking-tight">왜 QQQ와 SCHD를 함께 투자해야 할까요?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#F9FAFB] p-6 rounded-3xl space-y-3">
              <h3 className="font-bold text-[#3182F6]">📈 QQQ (성장성 담당)</h3>
              <ul className="text-sm text-[#4E5968] space-y-2">
                <li>• **강력한 수익률**: 나스닥 100 기술주의 성장성</li>
                <li>• **혁신 기업 집중**: 애플, 엔비디아 등 글로벌 리더</li>
              </ul>
            </div>
            <div className="bg-[#F9FAFB] p-6 rounded-3xl space-y-3">
              <h3 className="font-bold text-[#00D084]">🛡️ SCHD (방어·배당 담당)</h3>
              <ul className="text-sm text-[#4E5968] space-y-2">
                <li>• **하락장 방어**: 탄탄한 펀더멘털 기반의 안정성</li>
                <li>• **현금 흐름**: 꾸준히 늘어나는 배당금의 기쁨</li>
              </ul>
            </div>
          </div>
          <p className="text-center text-sm font-bold text-[#3182F6] bg-[#3182F60A] py-4 rounded-2xl">
            "적절한 배분은 하락장에서 당신의 멘탈을 지켜주는 가장 큰 무기입니다."
          </p>
        </section>

        {/* Visual Holdings with Text Avatars */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-6">
            <h4 className="font-black text-[#3182F6] flex items-center gap-2 px-2">QQQ 상위 종목</h4>
            <div className="space-y-4">
              {qqqHoldings.map((h) => (
                <div key={h.symbol} className="flex items-center gap-4 hover:bg-[#F9FAFB] p-2 rounded-2xl transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm" style={{ backgroundColor: h.color }}>
                    {h.symbol[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#191F28]">{h.name}</p>
                    <p className="text-[10px] text-[#8B95A1] font-bold">{h.symbol}</p>
                  </div>
                  <span className="text-xs font-black text-[#3182F6]">{h.weight}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-6">
            <h4 className="font-black text-[#4E5968] flex items-center gap-2 px-2">SCHD 상위 종목</h4>
            <div className="space-y-4">
              {schdHoldings.map((h) => (
                <div key={h.symbol} className="flex items-center gap-4 hover:bg-[#F9FAFB] p-2 rounded-2xl transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm" style={{ backgroundColor: h.color }}>
                    {h.symbol[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#191F28]">{h.name}</p>
                    <p className="text-[10px] text-[#8B95A1] font-bold">{h.symbol}</p>
                  </div>
                  <span className="text-xs font-black text-[#4E5968]">{h.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 36px;
          height: 36px;
          background: #ffffff;
          border: 8px solid #3182F6;
          border-radius: 50%;
          box-shadow: 0 6px 16px rgba(49, 130, 246, 0.3);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        input[type='range']::-webkit-slider-thumb:active {
          transform: scale(1.15);
        }
      `}</style>
    </main>
  );
}
