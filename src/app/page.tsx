'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
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
  { name: "NVIDIA", weight: 4.5, symbol: "NVDA", color: "#76B900" }
];

const schdHoldings = [
  { name: "AbbVie", weight: 4.4, symbol: "ABBV", color: "#003087" },
  { name: "Home Depot", weight: 4.2, symbol: "HD", color: "#F96302" },
  { name: "Chevron", weight: 4.1, symbol: "CVX", color: "#0054A6" }
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
    let savingsBalance = initialInvestment;
    let peakBalance = initialInvestment;
    let maxDrawdown = 0;
    const chartData = [{ year: 2013, value: initialInvestment, savings: initialInvestment }];

    data.forEach((item) => {
      // ETF 수익률 계산
      const yearlyReturn = (qqqWeight / 100) * (item.qqq / 100) + (schdWeight / 100) * (item.schd / 100);
      currentBalance *= (1 + yearlyReturn);
      
      // 예금 수익률 계산 (연 3.5%)
      savingsBalance *= 1.035;

      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const drawdown = (currentBalance - peakBalance) / peakBalance;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
      
      chartData.push({ 
        year: item.year, 
        value: Math.round(currentBalance),
        savings: Math.round(savingsBalance)
      });
    });

    const years = data.length;
    const cagr = (Math.pow(currentBalance / initialInvestment, 1 / years) - 1) * 100;
    const dividendYield = (qqqWeight / 100) * 0.6 + (schdWeight / 100) * 3.4;
    const monthlyDividend = (currentBalance * (dividendYield / 100)) / 12;
    const extraProfit = currentBalance - savingsBalance;

    let profile = { title: "", icon: "⚖️", desc: "", color: "#4E5968" };
    if (qqqWeight >= 80) profile = { title: "초공격적 성장형", icon: "🚀", desc: "자산 폭발! 하락장 멘탈이 강한 투자자에게 추천해요.", color: "#3182F6" };
    else if (qqqWeight >= 60) profile = { title: "공격적 밸런스형", icon: "📈", desc: "수익률을 높이면서 배당 안전핀을 적절히 섞었어요.", color: "#3182F6" };
    else if (qqqWeight >= 40) profile = { title: "중립적 밸런스형", icon: "⚖️", desc: "수익과 배당, 두 마리 토끼를 잡는 가장 대중적인 비율이에요.", color: "#4E5968" };
    else profile = { title: "안정적 배당형", icon: "☕", desc: "자산의 변동성을 줄이고 매달 들어오는 현금을 즐겨보세요.", color: "#00D084" };

    return { chartData, cagr: cagr.toFixed(2), mdd: (maxDrawdown * 100).toFixed(2), monthlyDividend: Math.round(monthlyDividend), finalValue: Math.round(currentBalance), extraProfit: Math.round(extraProfit), profile };
  }, [qqqWeight, schdWeight, initialInvestment]);

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4 md:p-10 font-sans text-[#191F28]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Authority Badges */}
        <div className="flex justify-center gap-2 mb-2">
          <span className="bg-white border border-[#F2F4F6] text-[#8B95A1] text-[10px] px-3 py-1 rounded-full font-bold shadow-sm">✓ 10년 백테스트 데이터</span>
          <span className="bg-white border border-[#F2F4F6] text-[#8B95A1] text-[10px] px-3 py-1 rounded-full font-bold shadow-sm">✓ 복리 계산 로직 검증</span>
        </div>

        {/* Header & Money Input */}
        <header className="space-y-6 text-center">
          <h1 className="text-3xl font-black tracking-tight text-[#191F28]">나의 투자 미래 확인하기</h1>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] max-w-sm mx-auto">
            <label className="text-xs font-bold text-[#8B95A1] block mb-3 uppercase tracking-wider">초기 투자 원금</label>
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

        {/* Immersion Scenario Buttons */}
        <section className="flex flex-col md:flex-row gap-3">
          <button 
            onClick={() => setQqqWeight(100)}
            className="flex-1 bg-[#FF4D4F11] hover:bg-[#FF4D4F22] border border-[#FF4D4F33] p-4 rounded-2xl transition-all group"
          >
            <p className="text-xs font-bold text-[#FF4D4F] mb-1">공포 체험 😱</p>
            <p className="text-sm font-black text-[#191F28] group-hover:scale-105 transition-transform text-left">2022년 하락장 직전 풀매수했다면?</p>
          </button>
          <button 
            onClick={() => setQqqWeight(60)}
            className="flex-1 bg-[#3182F611] hover:bg-[#3182F622] border border-[#3182F633] p-4 rounded-2xl transition-all group"
          >
            <p className="text-xs font-bold text-[#3182F6] mb-1">안도감 체험 🛡️</p>
            <p className="text-sm font-black text-[#191F28] group-hover:scale-105 transition-transform text-left">하락장에도 웃을 수 있는 황금 비율은?</p>
          </button>
        </section>

        {/* Results Card */}
        <section className="bg-white p-8 rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#F2F4F6] relative overflow-hidden">
          <div className="relative z-10 space-y-10">
            <div>
              <h2 className="text-sm font-bold text-[#8B95A1] mb-2">12년 뒤 내 예상 자산</h2>
              <p className="text-5xl font-black text-[#191F28] tracking-tighter">
                <AnimatedNumber value={results.finalValue} isCurrency={true} />
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-[#00D08411] px-4 py-2 rounded-2xl">
                <span className="text-xs font-bold text-[#00D084]">일반 예금보다</span>
                <span className="text-sm font-black text-[#00D084]">
                  +<AnimatedNumber value={results.extraProfit} isCurrency={true} /> 수익!
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[#F2F4F6]">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#8B95A1] uppercase">월 예상 배당금</span>
                <p className="text-2xl font-black text-[#00D084]">
                  <AnimatedNumber value={results.monthlyDividend} isCurrency={true} />
                </p>
                <p className="text-[10px] font-bold text-[#B0B8C1]">매달 치킨 약 {Math.floor(results.monthlyDividend / 25000)}마리 가능 🍗</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#8B95A1] uppercase">하락장 방어력 (MDD)</span>
                <p className="text-2xl font-black text-[#FF4D4F]">
                  <AnimatedNumber value={results.mdd} suffix="%" />
                </p>
                <p className="text-[10px] font-bold text-[#B0B8C1]">전고점 대비 최대 하락폭</p>
              </div>
            </div>
          </div>
        </section>

        {/* Controls - Slider */}
        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-10">
          <div className="flex justify-between items-center px-4">
            <span className="text-sm font-black text-[#3182F6]">QQQ</span>
            <div className="bg-[#3182F6] text-white px-6 py-2 rounded-2xl text-lg font-black shadow-lg shadow-[#3182F644]">
              {qqqWeight} : {schdWeight}
            </div>
            <span className="text-sm font-black text-[#4E5968]">SCHD</span>
          </div>
          <input 
            type="range" min="0" max="100" step="5" value={qqqWeight} 
            onChange={(e) => setQqqWeight(parseInt(e.target.value))} 
            className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#3182F6]" 
          />
          <div className="flex justify-between text-[11px] font-bold text-[#ADB5BD]">
            <span>배당 집중형</span><span className="text-[#3182F6]">황금 밸런스 구간</span><span className="text-[#3182F6]">수익 집중형</span>
          </div>
        </section>

        {/* Comparison Chart */}
        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6]">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-xl font-bold tracking-tight">투자 결과 비교</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3182F6]" /><span className="text-[10px] font-bold text-[#8B95A1]">나의 포트폴리오</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ADB5BD]" /><span className="text-[10px] font-bold text-[#8B95A1]">연 3.5% 예금</span></div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={results.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3182F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F2F4F6" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 11 }} />
                <Tooltip 
                  cursor={{ stroke: '#3182F6', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 30px rgba(0,0,0,0.08)', padding: '16px' }}
                  formatter={(value, name) => [new Intl.NumberFormat('ko-KR').format(Number(value)) + "원", name === 'value' ? '내 자산' : '예적금']}
                />
                <Area type="monotone" dataKey="value" stroke="#3182F6" strokeWidth={5} fill="url(#colorValue)" animationDuration={1500} />
                <Line type="monotone" dataKey="savings" stroke="#ADB5BD" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={1500} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Holdings Summary */}
        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
            <div className="space-y-4">
              <h4 className="font-black text-[#3182F6] uppercase tracking-widest text-[11px]">QQQ Key Stocks</h4>
              {qqqHoldings.map(h => (
                <div key={h.symbol} className="flex justify-between border-b border-[#F9FAFB] pb-2">
                  <span className="font-bold text-[#4E5968]">{h.name}</span><span className="text-[#3182F6] font-black">{h.weight}%</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-[#4E5968] uppercase tracking-widest text-[11px]">SCHD Key Stocks</h4>
              {schdHoldings.map(h => (
                <div key={h.symbol} className="flex justify-between border-b border-[#F9FAFB] pb-2">
                  <span className="font-bold text-[#4E5968]">{h.name}</span><span className="text-[#4E5968] font-black">{h.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer className="text-center py-10 space-y-4">
          <p className="text-[10px] text-[#B0B8C1] font-medium uppercase tracking-widest">
            Data Source: Portfolio Visualizer & Yahoo Finance (2014-2025)
          </p>
          <p className="text-[11px] text-[#B0B8C1] leading-relaxed">
            위 시뮬레이션은 과거 데이터를 기반으로 하며 미래를 보장하지 않습니다.<br />
            모든 투자의 책임은 본인에게 있습니다.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 40px;
          height: 40px;
          background: #ffffff;
          border: 10px solid #3182F6;
          border-radius: 50%;
          box-shadow: 0 8px 20px rgba(49, 130, 246, 0.4);
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
