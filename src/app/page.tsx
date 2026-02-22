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
  ComposedChart,
  Line
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
  const [investmentYears, setInvestmentYears] = useState(10); // 기본 10년
  const schdWeight = 100 - qqqWeight;

  const results = useMemo(() => {
    let currentBalance = initialInvestment;
    let savingsBalance = initialInvestment;
    let peakBalance = initialInvestment;
    let maxDrawdown = 0;
    const chartData = [{ year: 2013, value: initialInvestment, savings: initialInvestment }];

    data.forEach((item) => {
      const yearlyReturn = (qqqWeight / 100) * (item.qqq / 100) + (schdWeight / 100) * (item.schd / 100);
      currentBalance *= (1 + yearlyReturn);
      savingsBalance *= 1.035;
      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const drawdown = (currentBalance - peakBalance) / peakBalance;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
      chartData.push({ year: item.year, value: Math.round(currentBalance), savings: Math.round(savingsBalance) });
    });

    const cagr = (Math.pow(currentBalance / initialInvestment, 1 / data.length) - 1);
    
    // 미래 자산 계산: 원금 * (1 + CAGR)^투자년수
    const futureValue = initialInvestment * Math.pow(1 + cagr, investmentYears);
    
    const dividendYield = (qqqWeight / 100) * 0.6 + (schdWeight / 100) * 3.4;
    const monthlyDividend = (futureValue * (dividendYield / 100)) / 12;

    return { chartData, cagr: (cagr * 100).toFixed(2), mdd: (maxDrawdown * 100).toFixed(2), monthlyDividend: Math.round(monthlyDividend), futureValue: Math.round(futureValue), finalValue: Math.round(currentBalance) };
  }, [qqqWeight, schdWeight, initialInvestment, investmentYears]);

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4 md:p-10 font-sans text-[#191F28] pb-32">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="text-center space-y-6">
          <div className="flex justify-center gap-2">
            <span className="bg-white border border-[#F2F4F6] text-[#8B95A1] text-[10px] px-3 py-1 rounded-full font-bold shadow-sm uppercase tracking-widest">v0.2.0 Premium</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">나의 자산 미래 보고서</h1>
          
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] max-w-sm mx-auto">
            <label className="text-[11px] font-black text-[#8B95A1] block mb-3 uppercase tracking-widest">초기 투자 원금</label>
            <div className="flex items-center justify-center gap-2 border-b-2 border-[#F2F4F6] focus-within:border-[#3182F6] transition-colors pb-2">
              <span className="text-2xl font-bold text-[#191F28]">₩</span>
              <input 
                type="text" 
                value={initialInvestment.toLocaleString()}
                onChange={(e) => setInitialInvestment(Number(e.target.value.replace(/[^0-9]/g, '')))}
                className="text-3xl font-black text-[#3182F6] w-full text-center outline-none bg-transparent"
              />
            </div>
          </div>
        </header>

        {/* Highlight Section - The "Future Value" */}
        <section className="bg-white p-10 rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-[#F2F4F6] text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-[#4E5968] font-bold text-lg">
              <span className="text-[#3182F6]">{investmentYears}년 뒤</span> 예상 자산은
            </h2>
            <p className="text-5xl md:text-6xl font-black text-[#3182F6] tracking-tighter">
              <AnimatedNumber value={results.futureValue} isCurrency={true} />
            </p>
            <div className="space-y-1">
              <p className="text-[11px] text-[#ADB5BD] font-medium italic">
                *과거 연평균 수익률 {results.cagr}%가 유지된다는 가정 하의 시뮬레이션입니다.
              </p>
              <p className="text-sm font-bold text-[#00D084]">
                매달 예상 배당금: <AnimatedNumber value={results.monthlyDividend} isCurrency={true} />
              </p>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute -bottom-10 -right-10 text-[200px] opacity-[0.03] select-none font-black">
            {investmentYears}
          </div>
        </section>

        {/* Controls - Two Sliders */}
        <section className="bg-white p-10 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-14">
          {/* Slider 1: Weight */}
          <div className="space-y-8">
            <div className="flex justify-between items-center px-2">
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#3182F6]">QQQ</span>
                <span className="text-[10px] font-bold text-[#ADB5BD] uppercase">Growth</span>
              </div>
              <div className="bg-[#3182F6] text-white px-6 py-2 rounded-2xl text-xl font-black shadow-lg shadow-[#3182F644]">
                {qqqWeight}% : {schdWeight}%
              </div>
              <div className="flex flex-col text-right">
                <span className="text-sm font-black text-[#4E5968]">SCHD</span>
                <span className="text-[10px] font-bold text-[#ADB5BD] uppercase">Dividend</span>
              </div>
            </div>
            <input 
              type="range" min="0" max="100" step="5" value={qqqWeight} 
              onChange={(e) => setQqqWeight(parseInt(e.target.value))} 
              className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#3182F6]" 
            />
            <div className="flex justify-between text-[11px] font-black text-[#ADB5BD]">
              <span>배당 집중형</span><span className="text-[#3182F6]">황금 밸런스</span><span>수익 집중형</span>
            </div>
          </div>

          {/* Slider 2: Investment Years */}
          <div className="space-y-8 pt-4 border-t border-[#F2F4F6]">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm font-black text-[#4E5968]">투자 기간</span>
              <div className="bg-[#191F28] text-white px-6 py-2 rounded-2xl text-xl font-black">
                {investmentYears}년
              </div>
            </div>
            <input 
              type="range" min="1" max="30" step="1" value={investmentYears} 
              onChange={(e) => setInvestmentYears(parseInt(e.target.value))} 
              className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#191F28]" 
            />
            <div className="flex justify-between text-[11px] font-black text-[#ADB5BD]">
              <span>단기 (1년)</span><span>장기 복리 효과 (30년)</span>
            </div>
          </div>
        </section>

        {/* Chart Section - Dynamic Scaling */}
        <section className="bg-white p-10 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-8">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-black tracking-tight">10년 백테스트 결과</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3182F6]" /><span className="text-[10px] font-bold text-[#8B95A1]">포트폴리오</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ADB5BD]" /><span className="text-[10px] font-bold text-[#8B95A1]">연 3.5% 예금</span></div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3182F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F2F4F6" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 11 }} dy={10} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 11 }} />
                <Tooltip 
                  cursor={{ stroke: '#3182F6', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                  formatter={(value, name) => [new Intl.NumberFormat('ko-KR').format(Number(value)) + "원", name === 'value' ? '내 자산' : '예적금']}
                />
                <Area type="monotone" dataKey="value" stroke="#3182F6" strokeWidth={6} fill="url(#colorValue)" animationDuration={1000} />
                <Line type="monotone" dataKey="savings" stroke="#ADB5BD" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Footer info */}
        <footer className="text-center py-10 space-y-6">
          <div className="flex justify-center gap-4">
            <button className="text-[10px] font-bold text-[#3182F6] bg-[#3182F611] px-4 py-2 rounded-xl">데이터 출처 확인</button>
            <button className="text-[10px] font-bold text-[#4E5968] bg-[#F2F4F6] px-4 py-2 rounded-xl">계산 로직 검증</button>
          </div>
          <p className="text-[11px] text-[#B0B8C1] leading-relaxed px-6">
            Data Source: Portfolio Visualizer (2014-2025).<br />
            이 시뮬레이션은 과거의 성과가 미래에도 동일하게 반복된다는 가정 하에 계산된 수치입니다.<br />
            실제 투자 수익은 시장 상황, 세금, 수수료 등에 따라 크게 달라질 수 있습니다.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 44px;
          height: 44px;
          background: #ffffff;
          border: 12px solid #3182F6;
          border-radius: 50%;
          box-shadow: 0 10px 25px rgba(49, 130, 246, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        input[type='range']::-webkit-slider-thumb:active {
          transform: scale(1.2);
          border-width: 8px;
        }
      `}</style>
    </main>
  );
}
