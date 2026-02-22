'use client';

import React, { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Label
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Coins, HelpCircle, Info } from 'lucide-react';

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

const AnimatedNumber = ({ value, isCurrency = false, isPostTax = false }: { value: string | number, isCurrency?: boolean, isPostTax?: boolean }) => {
  const num = Number(value);
  const displayValue = new Intl.NumberFormat('ko-KR').format(num);
  return (
    <span className="inline-flex items-baseline gap-0.5">
      {isCurrency && <span className="text-xl md:text-2xl font-bold mr-0.5">₩</span>}
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-block"
      >
        {displayValue}
      </motion.span>
      {!isCurrency && <span className="text-sm md:text-lg font-bold ml-0.5">%</span>}
      {isCurrency && <span className="text-sm md:text-lg font-bold ml-0.5">원</span>}
    </span>
  );
};

export default function PortfolioCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(10000000);
  const [qqqWeight, setQqqWeight] = useState(70);
  const [investmentYears, setInvestmentYears] = useState(10);
  const schdWeight = 100 - qqqWeight;

  const results = useMemo(() => {
    let currentBalance = initialInvestment;
    let qqqOnlyBalance = initialInvestment;
    let savingsBalance = initialInvestment;
    let peakBalance = initialInvestment;
    let maxDrawdown = 0;
    const chartData = [{ year: 2013, value: initialInvestment, qqqOnly: initialInvestment, savings: initialInvestment }];

    data.forEach((item) => {
      const yearlyReturn = (qqqWeight / 100) * (item.qqq / 100) + (schdWeight / 100) * (item.schd / 100);
      currentBalance *= (1 + yearlyReturn);
      qqqOnlyBalance *= (1 + item.qqq / 100);
      savingsBalance *= 1.035;

      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const drawdown = (currentBalance - peakBalance) / peakBalance;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
      
      chartData.push({ 
        year: item.year, 
        value: Math.round(currentBalance),
        qqqOnly: Math.round(qqqOnlyBalance),
        savings: Math.round(savingsBalance)
      });
    });

    const cagr = (Math.pow(currentBalance / initialInvestment, 1 / data.length) - 1);
    const futureValue = initialInvestment * Math.pow(1 + cagr, investmentYears);
    const dividendYield = (qqqWeight / 100) * 0.6 + (schdWeight / 100) * 3.4;
    
    // 배당금 계산 (세전 vs 세후 15%)
    const monthlyDividendPreTax = (futureValue * (dividendYield / 100)) / 12;
    const monthlyDividendPostTax = monthlyDividendPreTax * 0.85;

    return { 
      chartData, 
      cagr: (cagr * 100).toFixed(2), 
      mdd: (maxDrawdown * 100).toFixed(2), 
      monthlyDividendPreTax: Math.round(monthlyDividendPreTax),
      monthlyDividendPostTax: Math.round(monthlyDividendPostTax), 
      futureValue: Math.round(futureValue), 
      finalValue: Math.round(currentBalance) 
    };
  }, [qqqWeight, schdWeight, initialInvestment, investmentYears]);

  const formatYAxis = (value: number) => {
    if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
    if (value >= 10000) return `${(value / 10000).toLocaleString()}만`;
    return value.toLocaleString();
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4 md:p-10 font-sans text-[#191F28] pb-40">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header & Input */}
        <header className="text-center space-y-6">
          <div className="flex justify-center gap-2">
            <span className="bg-[#3182F6] text-white text-[10px] px-3 py-1 rounded-full font-black shadow-sm uppercase tracking-widest">v0.2.3 Final</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">나의 투자 미래 보고서</h1>
          
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] max-w-sm mx-auto group focus-within:shadow-md transition-shadow">
            <label className="text-[11px] font-black text-[#8B95A1] block mb-3 uppercase tracking-widest">초기 투자 원금</label>
            <div className="flex items-center justify-center gap-2 border-b-2 border-[#F2F4F6] group-focus-within:border-[#3182F6] transition-colors pb-2">
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

        {/* Highlight Future Value */}
        <section className="bg-white p-10 rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-[#F2F4F6] text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-[#4E5968] font-bold text-lg">
              <span className="text-[#3182F6]">{investmentYears}년 뒤</span> 예상 자산은
            </h2>
            <p className="text-5xl md:text-6xl font-black text-[#3182F6] tracking-tighter">
              <AnimatedNumber value={results.futureValue} isCurrency={true} />
            </p>
            <p className="text-[11px] text-[#ADB5BD] font-medium">*과거 수익률이 미래에도 유지된다는 가정하의 시뮬레이션입니다.</p>
          </div>
        </section>

        {/* Metrics Grid with Icons & Units */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F2F4F6] space-y-3 relative overflow-hidden">
            <TrendingUp className="text-[#3182F6] w-5 h-5" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#8B95A1] block">연평균 성장률</span>
              <div className="text-2xl font-black text-[#3182F6] leading-none">
                <AnimatedNumber value={results.cagr} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F2F4F6] space-y-3">
            <Coins className="text-[#00D084] w-5 h-5" />
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-[#8B95A1]">세후 월 배당금</span>
                <HelpCircle className="w-3 h-3 text-[#ADB5BD] cursor-help" />
              </div>
              <div className="text-2xl font-black text-[#00D084] leading-none">
                <AnimatedNumber value={results.monthlyDividendPostTax} isCurrency={true} />
              </div>
              <span className="text-[10px] font-bold text-[#ADB5BD] block mt-1">세전: {results.monthlyDividendPreTax.toLocaleString()}원</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F2F4F6] space-y-3">
            <ShieldCheck className="text-[#FF4D4F] w-5 h-5" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#8B95A1]">최대 하락폭 (MDD)</span>
              <div className="text-2xl font-black text-[#FF4D4F] leading-none">
                <AnimatedNumber value={results.mdd} />
              </div>
            </div>
          </div>
        </section>

        {/* Two Sliders */}
        <section className="bg-white p-10 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-12">
          <div className="space-y-8">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm font-black text-[#3182F6]">QQQ</span>
              <div className="bg-[#3182F6] text-white px-6 py-2 rounded-2xl text-xl font-black shadow-lg shadow-[#3182F644]">
                {qqqWeight}% : {schdWeight}%
              </div>
              <span className="text-sm font-black text-[#4E5968]">SCHD</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={qqqWeight} onChange={(e) => setQqqWeight(parseInt(e.target.value))} className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#3182F6]" />
            <div className="flex justify-between text-[11px] font-black text-[#ADB5BD] uppercase tracking-tighter">
              <span className="text-[#00D084]">배당 집중형</span><span>황금 밸런스</span><span className="text-[#3182F6]">수익 집중형</span>
            </div>
          </div>

          <div className="space-y-8 pt-4 border-t border-[#F2F4F6]">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm font-black text-[#191F28]">투자 기간</span>
              <div className="bg-[#191F28] text-white px-6 py-2 rounded-2xl text-xl font-black">
                {investmentYears}년
              </div>
            </div>
            <input type="range" min="1" max="30" step="1" value={investmentYears} onChange={(e) => setInvestmentYears(parseInt(e.target.value))} className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#191F28]" />
          </div>
        </section>

        {/* Comparison Chart with Benchmark */}
        <section className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <h3 className="text-xl font-black tracking-tight">수익률 비교분석</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#3182F6]" /><span className="text-[10px] font-bold text-[#8B95A1]">내 조합</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm border border-[#ADB5BD] border-dashed" /><span className="text-[10px] font-bold text-[#8B95A1]">QQQ 100%</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#E5E8EB]" /><span className="text-[10px] font-bold text-[#8B95A1]">연 3.5% 예금</span></div>
            </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={results.chartData} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3182F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F6" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 11 }} dy={10} />
                <YAxis width={80} domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 11 }} tickFormatter={formatYAxis} />
                <Tooltip 
                  cursor={{ stroke: '#3182F6', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                  formatter={(value, name) => [new Intl.NumberFormat('ko-KR').format(Number(value)) + "원", name === 'value' ? '내 조합' : name === 'qqqOnly' ? 'QQQ 100%' : '예적금']}
                />
                <Area type="monotone" dataKey="value" stroke="#3182F6" strokeWidth={5} fill="url(#colorValue)" animationDuration={1000} />
                <Line type="monotone" dataKey="qqqOnly" stroke="#ADB5BD" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="savings" stroke="#E5E8EB" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#F9FAFB] p-4 rounded-2xl flex items-start gap-3">
            <Info className="w-4 h-4 text-[#3182F6] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#4E5968] leading-relaxed font-medium">
              차트의 점선은 **QQQ 100%** 성과이며, 실선은 **연 3.5% 예금** 성과입니다. <br className="hidden md:block" />
              내 조합이 하락장에서 얼마나 강한지, 혹은 시장 대비 얼마나 더 수익을 내는지 비교해 보세요.
            </p>
          </div>
        </section>

        {/* Footer info */}
        <footer className="text-center py-10 space-y-6">
          <p className="text-[11px] text-[#B0B8C1] leading-relaxed px-6">
            Data Source: Portfolio Visualizer (2014-2025).<br />
            배당금은 배당소득세 15.0%를 원천징수한 세후 금액 기준입니다.<br />
            모든 투자의 책임은 본인에게 있습니다.
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
        }
      `}</style>
    </main>
  );
}
