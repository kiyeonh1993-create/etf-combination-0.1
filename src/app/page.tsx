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
  { name: "Apple", weight: 12.4, symbol: "AAPL" },
  { name: "Microsoft", weight: 9.8, symbol: "MSFT" },
  { name: "Amazon", weight: 4.7, symbol: "AMZN" },
  { name: "NVIDIA", weight: 4.5, symbol: "NVDA" },
  { name: "Alphabet Cl A", weight: 3.8, symbol: "GOOGL" },
  { name: "Meta", weight: 3.5, symbol: "META" },
  { name: "Broadcom", weight: 3.2, symbol: "AVGO" },
  { name: "Tesla", weight: 2.8, symbol: "TSLA" },
  { name: "Costco", weight: 2.1, symbol: "COST" },
  { name: "Alphabet Cl C", weight: 2.0, symbol: "GOOG" }
];

const schdHoldings = [
  { name: "AbbVie", weight: 4.4, symbol: "ABBV" },
  { name: "Home Depot", weight: 4.2, symbol: "HD" },
  { name: "Chevron", weight: 4.1, symbol: "CVX" },
  { name: "Amgen", weight: 4.0, symbol: "AMGN" },
  { name: "Verizon", weight: 3.9, symbol: "VZ" },
  { name: "PepsiCo", weight: 3.8, symbol: "PEP" },
  { name: "Pfizer", weight: 3.7, symbol: "PFE" },
  { name: "Cisco", weight: 3.6, symbol: "CSCO" },
  { name: "Coca-Cola", weight: 3.5, symbol: "KO" },
  { name: "Texas Instruments", weight: 3.4, symbol: "TXN" }
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
  const [initialInvestment, setInitialInvestment] = useState(10000000); // 기본 1,000만 원
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
    
    // 월 예상 배당금 (연간 배당 / 12)
    const monthlyDividend = (currentBalance * (dividendYield / 100)) / 12;

    let profile = { title: "", icon: "⚖️", desc: "", color: "#4E5968" };
    if (qqqWeight >= 80) profile = { title: "초공격적 성장형", icon: "🚀", desc: "자산 폭발! 하락장 멘탈이 강한 투자자에게 추천해요.", color: "#3182F6" };
    else if (qqqWeight >= 60) profile = { title: "공격적 밸런스형", icon: "📈", desc: "수익률을 높이면서 배당 안전핀을 적절히 섞었어요.", color: "#3182F6" };
    else if (qqqWeight >= 40) profile = { title: "중립적 밸런스형", icon: "⚖️", desc: "수익과 배당, 두 마리 토끼를 잡는 가장 대중적인 비율이에요.", color: "#4E5968" };
    else profile = { title: "안정적 배당형", icon: "☕", desc: "자산의 변동성을 줄이고 매달 들어오는 현금을 즐겨보세요.", color: "#00D084" };

    return { chartData, cagr: cagr.toFixed(2), mdd: (maxDrawdown * 100).toFixed(2), dividendYield: dividendYield.toFixed(2), monthlyDividend: Math.round(monthlyDividend), finalValue: Math.round(currentBalance), profile };
  }, [qqqWeight, schdWeight, initialInvestment]);

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4 md:p-10 font-sans text-[#191F28]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="space-y-4 py-4 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="inline-block px-3 py-1 bg-[#3182F61A] text-[#3182F6] text-[10px] font-bold rounded-full mb-2 uppercase tracking-widest">Investment Simulator</span>
            <h1 className="text-3xl font-bold tracking-tight mb-6">나의 투자 미래 확인하기</h1>
          </motion.div>

          {/* Money Input Section */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F2F4F6] max-w-sm mx-auto">
            <label className="text-xs font-bold text-[#8B95A1] block mb-2">초기 투자 원금</label>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold text-[#191F28]">₩</span>
              <input 
                type="number" 
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="text-2xl font-black text-[#3182F6] w-full text-center outline-none border-b-2 border-[#F2F4F6] focus:border-[#3182F6] transition-colors"
              />
            </div>
            <p className="text-[10px] text-[#B0B8C1] mt-3">숫자를 클릭해 투자금을 변경해보세요</p>
          </div>
        </header>

        {/* Results Card - The "Money" Focus */}
        <section className="bg-white p-8 rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#F2F4F6] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="text-9xl">{results.profile.icon}</span>
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#8B95A1]">12년 뒤 내 예상 자산</h2>
              <p className="text-4xl font-black text-[#191F28]">
                <AnimatedNumber value={results.finalValue} isCurrency={true} />
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F9FAFB] p-5 rounded-3xl">
                <span className="text-[10px] font-bold text-[#8B95A1] block mb-1">매달 받는 배당금</span>
                <p className="text-xl font-bold text-[#00D084]">
                  <AnimatedNumber value={results.monthlyDividend} isCurrency={true} />
                </p>
              </div>
              <div className="bg-[#F9FAFB] p-5 rounded-3xl">
                <span className="text-[10px] font-bold text-[#8B95A1] block mb-1">연평균 수익률</span>
                <p className="text-xl font-bold text-[#3182F6]">
                  <AnimatedNumber value={results.cagr} suffix="%" />
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#F2F4F6]">
              <h3 className="text-lg font-bold" style={{ color: results.profile.color }}>{results.profile.icon} {results.profile.title}</h3>
              <p className="text-[#4E5968] text-sm leading-relaxed mt-1">{results.profile.desc}</p>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-[#F2F4F6] space-y-8">
          <div className="flex gap-2">
            {[ { label: "공격 8:2", val: 80 }, { label: "밸런스 5:5", val: 50 }, { label: "안정 2:8", val: 20 } ].map((btn) => (
              <button key={btn.val} onClick={() => setQqqWeight(btn.val)} className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all ${qqqWeight === btn.val ? 'bg-[#3182F6] text-white shadow-lg shadow-[#3182F644]' : 'bg-[#F2F4F6] text-[#4E5968]'}`}>
                {btn.label}
              </button>
            ))}
          </div>
          <div className="relative py-4">
            <input type="range" min="0" max="100" step="5" value={qqqWeight} onChange={(e) => setQqqWeight(parseInt(e.target.value))} className="w-full h-3 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#3182F6]" />
            <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-[#ADB5BD] tracking-tighter">
              <span>More Dividend</span><span className="text-[#3182F6]">Golden Zone</span><span>More Growth</span>
            </div>
          </div>
        </section>

        {/* SEO & Blog Content */}
        <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-6">
          <h2 className="text-2xl font-bold">왜 QQQ와 SCHD를 함께 투자해야 할까요?</h2>
          <p className="text-sm text-[#4E5968] leading-relaxed">
            나스닥100(QQQ)의 **혁신적인 성장**과 배당성장(SCHD)의 **탄탄한 현금 흐름**을 결합하는 것은 이미 많은 자산가들이 선택한 검증된 전략입니다. 이 포트폴리오의 핵심은 강세장에서는 수익률을 극대화하고, 2022년과 같은 약세장에서는 배당금을 통해 버틸 수 있는 '안전핀'을 확보하는 데 있습니다.
          </p>
        </section>

        {/* Visual Holdings with Logos */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-6">
            <h4 className="font-bold text-[#3182F6] flex items-center gap-2">
              <img src="https://logo.clearbit.com/invesco.com" className="w-5 h-5 rounded-full" /> QQQ Top 10
            </h4>
            <div className="space-y-4">
              {qqqHoldings.map((h) => (
                <div key={h.name} className="flex items-center gap-3">
                  <img src={`https://logo.clearbit.com/${h.name.toLowerCase().replace(" alphabet cl a", "google").replace("alphabet cl c", "google").split(' ')[0]}.com`} 
                       onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${h.name}&background=F2F4F6&color=8B95A1`; }}
                       className="w-8 h-8 rounded-xl object-contain bg-[#F9FAFB] p-1" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#191F28]">{h.name}</p>
                    <p className="text-[10px] text-[#8B95A1]">{h.symbol}</p>
                  </div>
                  <span className="text-xs font-bold text-[#3182F6]">{h.weight}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-6">
            <h4 className="font-bold text-[#4E5968] flex items-center gap-2">
              <img src="https://logo.clearbit.com/schwab.com" className="w-5 h-5 rounded-full" /> SCHD Top 10
            </h4>
            <div className="space-y-4">
              {schdHoldings.map((h) => (
                <div key={h.name} className="flex items-center gap-3">
                  <img src={`https://logo.clearbit.com/${h.name.toLowerCase().replace(" ", "").split(' ')[0]}.com`} 
                       onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${h.name}&background=F2F4F6&color=8B95A1`; }}
                       className="w-8 h-8 rounded-xl object-contain bg-[#F9FAFB] p-1" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#191F28]">{h.name}</p>
                    <p className="text-[10px] text-[#8B95A1]">{h.symbol}</p>
                  </div>
                  <span className="text-xs font-bold text-[#4E5968]">{h.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 32px;
          height: 32px;
          background: #ffffff;
          border: 6px solid #3182F6;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(49, 130, 246, 0.3);
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
