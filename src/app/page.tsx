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
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Coins, Info, Activity, AlertTriangle } from 'lucide-react';

// 2014-2025 실제 데이터 기반
const annualData = [
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

// 효율적 투자선 데이터 (10% 단위 미리 계산됨)
// X: 변동성(위험), Y: 기대수익률(CAGR)
const frontierData = [
  { qqq: 0,   risk: 13.0, return: 11.8, label: "SCHD 100%" },
  { qqq: 10,  risk: 13.2, return: 12.4 },
  { qqq: 20,  risk: 13.6, return: 13.0 },
  { qqq: 30,  risk: 14.2, return: 13.6 },
  { qqq: 40,  risk: 15.0, return: 14.2 },
  { qqq: 50,  risk: 16.0, return: 14.8, label: "황금 밸런스" },
  { qqq: 60,  risk: 17.2, return: 15.4 },
  { qqq: 70,  risk: 18.5, return: 16.0 },
  { qqq: 80,  risk: 20.0, return: 16.6 },
  { qqq: 90,  risk: 21.5, return: 17.2 },
  { qqq: 100, risk: 23.0, return: 17.8, label: "QQQ 100%" }
];

const AnimatedNumber = ({ value, isCurrency = false }: { value: string | number, isCurrency?: boolean }) => {
  const num = Number(value);
  const displayValue = new Intl.NumberFormat('ko-KR').format(num);
  return (
    <span className="inline-flex items-baseline gap-0.5">
      {isCurrency && <span className="text-xl md:text-2xl font-bold mr-0.5">₩</span>}
      <motion.span key={value} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
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
    let schdOnlyBalance = initialInvestment;
    let peakBalance = initialInvestment;
    let maxDrawdown = 0;
    const chartData = [{ year: 2013, value: initialInvestment, qqqOnly: initialInvestment, schdOnly: initialInvestment }];

    annualData.forEach((item) => {
      const yearlyReturn = (qqqWeight / 100) * (item.qqq / 100) + (schdWeight / 100) * (item.schd / 100);
      currentBalance *= (1 + yearlyReturn);
      qqqOnlyBalance *= (1 + item.qqq / 100);
      schdOnlyBalance *= (1 + item.schd / 100);
      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const drawdown = (currentBalance - peakBalance) / peakBalance;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
      chartData.push({ year: item.year, value: Math.round(currentBalance), qqqOnly: Math.round(qqqOnlyBalance), schdOnly: Math.round(schdOnlyBalance) });
    });

    const cagr = (Math.pow(currentBalance / initialInvestment, 1 / annualData.length) - 1);
    const futureValue = initialInvestment * Math.pow(1 + cagr, investmentYears);
    const dividendYield = (qqqWeight / 100) * 0.6 + (schdWeight / 100) * 3.4;
    const monthlyDividendPostTax = ((futureValue * (dividendYield / 100)) / 12) * 0.85;

    // 현재 지점에 가장 가까운 프론티어 데이터 찾기
    const currentFrontierPoint = frontierData.reduce((prev, curr) => 
      Math.abs(curr.qqq - qqqWeight) < Math.abs(prev.qqq - qqqWeight) ? curr : prev
    );

    return { 
      chartData, 
      cagr: (cagr * 100).toFixed(2), 
      mdd: (maxDrawdown * 100).toFixed(2), 
      monthlyDividendPostTax: Math.round(monthlyDividendPostTax), 
      futureValue: Math.round(futureValue),
      currentFrontierPoint
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
        
        {/* Header */}
        <header className="text-center space-y-4 py-4">
          <div className="flex justify-center gap-2">
            <span className="bg-[#3182F6] text-white text-[10px] px-3 py-1 rounded-full font-black shadow-sm uppercase tracking-widest">v0.3.0 Strategy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#191F28]">QQQ x SCHD 황금비율 시뮬레이터</h1>
          <p className="text-[#8B95A1] text-sm md:text-base font-medium px-4">과거 12년 데이터를 기반으로 리스크와 수익의 균형점을 찾아보세요.</p>
        </header>

        {/* Full-Width Input */}
        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-[#F2F4F6] w-full group focus-within:shadow-md transition-shadow text-center">
          <label className="text-[11px] font-black text-[#8B95A1] block mb-4 uppercase tracking-widest">초기 투자 원금 설정</label>
          <div className="flex items-center justify-center gap-3 border-b-2 border-[#F2F4F6] group-focus-within:border-[#3182F6] transition-colors pb-3 max-w-md mx-auto">
            <span className="text-3xl font-bold text-[#191F28]">₩</span>
            <input 
              type="text" 
              value={initialInvestment.toLocaleString()}
              onChange={(e) => setInitialInvestment(Number(e.target.value.replace(/[^0-9]/g, '')))}
              className="text-4xl font-black text-[#3182F6] w-full text-center outline-none bg-transparent"
            />
          </div>
        </section>

        {/* Future Value Card */}
        <section className="bg-white p-10 rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-[#F2F4F6] text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-[#4E5968] font-bold text-lg"><span className="text-[#3182F6]">{investmentYears}년 뒤</span> 예상 자산</h2>
            <p className="text-5xl md:text-7xl font-black text-[#3182F6] tracking-tighter"><AnimatedNumber value={results.futureValue} isCurrency={true} /></p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00D084]"><Coins className="w-3.5 h-3.5" />세후 월 <AnimatedNumber value={results.monthlyDividendPostTax} isCurrency={true} /></div>
              <div className="w-px h-3 bg-[#E5E8EB]" /><div className="text-[11px] font-bold text-[#8B95A1]">연평균 {results.cagr}%</div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="bg-white p-10 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-12">
          <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <span className="text-2xl font-black text-[#3182F6]">QQQ</span>
              <div className="bg-[#3182F6] text-white px-6 py-2 rounded-2xl text-xl font-black shadow-lg shadow-[#3182F644]">{qqqWeight} : {schdWeight}</div>
              <span className="text-2xl font-black text-[#4E5968]">SCHD</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={qqqWeight} onChange={(e) => setQqqWeight(parseInt(e.target.value))} className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#3182F6]" />
            <div className="flex justify-between text-[11px] font-black text-[#ADB5BD] uppercase tracking-tighter px-2"><span>배당 집중</span><span>최적 밸런스</span><span className="text-[#3182F6]">수익 집중</span></div>
          </div>
          <div className="space-y-8 pt-4 border-t border-[#F2F4F6]">
            <div className="flex justify-between items-center px-4">
              <span className="text-sm font-black text-[#191F28]">투자 기간</span>
              <div className="bg-[#191F28] text-white px-6 py-2 rounded-2xl text-xl font-black">{investmentYears}년</div>
            </div>
            <input type="range" min="1" max="30" step="1" value={investmentYears} onChange={(e) => setInvestmentYears(parseInt(e.target.value))} className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#191F28]" />
          </div>
        </section>

        {/* NEW: Risk vs Return Chart (Efficient Frontier) */}
        <section className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-8">
          <div className="px-2">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Activity className="text-[#3182F6] w-5 h-5" /> 수익률 vs 투자 위험
            </h3>
            <p className="text-[11px] font-medium text-[#8B95A1] mt-1">오른쪽으로 갈수록 위험이 높고, 위로 갈수록 기대 수익이 높습니다.</p>
          </div>
          
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F6" />
                <XAxis type="number" dataKey="risk" name="Risk" unit="%" domain={[10, 25]} axisLine={false} tickLine={false} tick={{fill: '#ADB5BD', fontSize: 11}} label={{ value: '투자 위험(변동성)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                <YAxis type="number" dataKey="return" name="Return" unit="%" domain={[10, 20]} axisLine={false} tickLine={false} tick={{fill: '#ADB5BD', fontSize: 11}} label={{ value: '기대 수익률', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                <ZAxis type="number" range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} formatter={(value, name) => [value + "%", name === 'return' ? '기대 수익' : '투자 위험']} />
                <Scatter name="Efficient Frontier" data={frontierData} fill="#E5E8EB" line={{ stroke: '#E5E8EB', strokeWidth: 2 }} shape="circle">
                  {frontierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.qqq === results.currentFrontierPoint.qqq ? '#3182F6' : '#E5E8EB'} />
                  ))}
                </Scatter>
                {/* Active Point Overlay for Animation */}
                <Scatter data={[results.currentFrontierPoint]} fill="#3182F6" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
            
            {/* Inefficient Zone Overlay */}
            <div className="absolute top-4 right-4 bg-[#FF4D4F0A] border border-[#FF4D4F1A] p-3 rounded-2xl flex items-start gap-2 max-w-[140px]">
              <AlertTriangle className="w-3 h-3 text-[#FF4D4F] mt-0.5 shrink-0" />
              <p className="text-[9px] text-[#FF4D4F] font-bold leading-tight text-left">높은 위험 대비 낮은 수익 구간</p>
            </div>
          </div>
          
          <div className="bg-[#3182F60A] p-5 rounded-3xl">
            <p className="text-xs font-bold text-[#3182F6] leading-relaxed">
              💡 <span className="underline decoration-2">전략 팁</span>: 현재 선택하신 {qqqWeight}:{schdWeight} 비율은 {qqqWeight >= 60 && qqqWeight <= 80 ? "가장 효율적인 수익-위험 밸런스 구간에 위치해 있습니다!" : qqqWeight < 40 ? "수익률은 낮지만 하락장에서 가장 강력한 방어력을 보여줍니다." : "높은 수익을 기대하는 만큼 큰 하락 위험을 감수해야 합니다."}
            </p>
          </div>
        </section>

        {/* Backtest Chart */}
        <section className="bg-white py-10 px-4 md:px-8 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-8 overflow-hidden">
          <div className="px-4"><h3 className="text-xl font-black tracking-tight mb-1">성장 곡선 비교분석</h3><p className="text-[11px] font-medium text-[#8B95A1]">100% 투자했을 때와 나의 조합을 한눈에 비교하세요.</p></div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={results.chartData} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3182F6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3182F6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F6" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 11 }} dy={10} interval={"preserveStartEnd"} />
                <YAxis width={60} domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 11 }} tickFormatter={formatYAxis} dx={-5} />
                <Tooltip cursor={{ stroke: '#3182F6', strokeWidth: 1 }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px' }} />
                <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#8B95A1', paddingBottom: '30px' }} />
                <Area name="내 조합" type="monotone" dataKey="value" stroke="#3182F6" strokeWidth={5} fill="url(#colorValue)" animationDuration={1000} />
                <Line name="QQQ 100%" type="monotone" dataKey="qqqOnly" stroke="#ADB5BD" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line name="SCHD 100%" type="monotone" dataKey="schdOnly" stroke="#00D084" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mx-4 bg-[#F9FAFB] p-5 rounded-3xl flex items-start gap-3"><Info className="w-4 h-4 text-[#3182F6] mt-0.5 shrink-0" /><div className="text-[11px] text-[#4E5968] leading-relaxed font-medium"><p>• <strong className="text-[#3182F6]">파란 실선</strong>: 내 조합 / <strong className="text-[#8B95A1]">회색 점선</strong>: QQQ 100% / <strong className="text-[#00D084]">초록 점선</strong>: SCHD 100%</p></div></div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-10 pb-20 space-y-6">
          <p className="text-[11px] text-[#B0B8C1] leading-relaxed px-8">Data Source: Portfolio Visualizer (2014-2025).<br />수익률 vs 투자 위험 차트는 통계적 기대값을 기반으로 하며, 실제 위험은 시장 상황에 따라 달라질 수 있습니다.</p>
        </footer>
      </div>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; width: 44px; height: 44px; background: #ffffff; border: 12px solid #3182F6; border-radius: 50%; box-shadow: 0 10px 25px rgba(49, 130, 246, 0.4); cursor: pointer; transition: all 0.2s ease;
        }
        input[type='range']::-webkit-slider-thumb:active { transform: scale(1.2); }
      `}</style>
    </main>
  );
}
