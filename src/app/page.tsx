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
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Coins, Info } from 'lucide-react';

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

const AnimatedNumber = ({ value, isCurrency = false }: { value: string | number, isCurrency?: boolean }) => {
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
    let schdOnlyBalance = initialInvestment;
    let peakBalance = initialInvestment;
    let maxDrawdown = 0;
    const chartData = [{ year: 2013, value: initialInvestment, qqqOnly: initialInvestment, schdOnly: initialInvestment }];

    data.forEach((item) => {
      const yearlyReturn = (qqqWeight / 100) * (item.qqq / 100) + (schdWeight / 100) * (item.schd / 100);
      currentBalance *= (1 + yearlyReturn);
      qqqOnlyBalance *= (1 + item.qqq / 100);
      schdOnlyBalance *= (1 + item.schd / 100);

      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const drawdown = (currentBalance - peakBalance) / peakBalance;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
      
      chartData.push({ 
        year: item.year, 
        value: Math.round(currentBalance),
        qqqOnly: Math.round(qqqOnlyBalance),
        schdOnly: Math.round(schdOnlyBalance)
      });
    });

    const cagr = (Math.pow(currentBalance / initialInvestment, 1 / data.length) - 1);
    const futureValue = initialInvestment * Math.pow(1 + cagr, investmentYears);
    const dividendYield = (qqqWeight / 100) * 0.6 + (schdWeight / 100) * 3.4;
    const monthlyDividendPostTax = ((futureValue * (dividendYield / 100)) / 12) * 0.85;

    return { 
      chartData, 
      cagr: (cagr * 100).toFixed(2), 
      mdd: (maxDrawdown * 100).toFixed(2), 
      monthlyDividendPostTax: Math.round(monthlyDividendPostTax), 
      futureValue: Math.round(futureValue)
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
            <span className="bg-[#3182F6] text-white text-[10px] px-3 py-1 rounded-full font-black shadow-sm uppercase tracking-widest">v0.2.5 Balanced</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#191F28]">QQQ x SCHD 황금비율 시뮬레이터</h1>
          <p className="text-[#8B95A1] text-sm md:text-base font-medium px-4">과거 12년 데이터를 기반으로 나만의 최적 조합을 찾아보세요.</p>
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

        {/* Highlight Future Value */}
        <section className="bg-white p-10 rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-[#F2F4F6] text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-[#4E5968] font-bold text-lg">
              <span className="text-[#3182F6]">{investmentYears}년 뒤</span> 예상 자산
            </h2>
            <p className="text-5xl md:text-7xl font-black text-[#3182F6] tracking-tighter">
              <AnimatedNumber value={results.futureValue} isCurrency={true} />
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00D084]">
                <Coins className="w-3.5 h-3.5" />
                세후 월 <AnimatedNumber value={results.monthlyDividendPostTax} isCurrency={true} />
              </div>
              <div className="w-px h-3 bg-[#E5E8EB]" />
              <div className="text-[11px] font-bold text-[#8B95A1]">연평균 {results.cagr}%</div>
            </div>
          </div>
        </section>

        {/* Enhanced Controls */}
        <section className="bg-white p-10 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-12">
          <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <span className="text-2xl font-black text-[#3182F6]">QQQ</span>
              <div className="bg-[#3182F6] text-white px-6 py-2 rounded-2xl text-xl font-black shadow-lg shadow-[#3182F644]">
                {qqqWeight} : {schdWeight}
              </div>
              <span className="text-2xl font-black text-[#4E5968]">SCHD</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={qqqWeight} onChange={(e) => setQqqWeight(parseInt(e.target.value))} className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#3182F6]" />
            <div className="flex justify-between text-[11px] font-black text-[#ADB5BD] uppercase tracking-tighter px-2">
              <span className="text-[#00D084]">배당 집중</span><span>최적 밸런스</span><span className="text-[#3182F6]">수익 집중</span>
            </div>
          </div>

          <div className="space-y-8 pt-4 border-t border-[#F2F4F6]">
            <div className="flex justify-between items-center px-4">
              <span className="text-sm font-black text-[#191F28]">투자 기간</span>
              <div className="bg-[#191F28] text-white px-6 py-2 rounded-2xl text-xl font-black">
                {investmentYears}년
              </div>
            </div>
            <input type="range" min="1" max="30" step="1" value={investmentYears} onChange={(e) => setInvestmentYears(parseInt(e.target.value))} className="w-full h-4 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#191F28]" />
          </div>
        </section>

        {/* Comparison Chart with Symmetrical Layout */}
        <section className="bg-white py-10 px-4 md:px-8 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-8 overflow-hidden">
          <div className="px-4 md:px-6">
            <h3 className="text-xl font-black tracking-tight mb-2">수익률 비교분석 (2014-2025)</h3>
            <p className="text-[11px] font-medium text-[#8B95A1]">각 ETF의 개별 성과와 내 포트폴리오를 비교해 보세요.</p>
          </div>
          
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={results.chartData} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3182F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F6" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ADB5BD', fontSize: 11 }} 
                  dy={10} 
                  interval={"preserveStartEnd"}
                />
                <YAxis 
                  width={60} 
                  domain={['auto', 'auto']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ADB5BD', fontSize: 11 }} 
                  tickFormatter={formatYAxis}
                  dx={-5}
                />
                <Tooltip 
                  cursor={{ stroke: '#3182F6', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                  formatter={(value, name) => [new Intl.NumberFormat('ko-KR').format(Number(value)) + "원", name === 'value' ? '내 조합' : name === 'qqqOnly' ? 'QQQ 100%' : 'SCHD 100%']}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle" 
                  iconSize={8} 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#8B95A1', paddingBottom: '30px', paddingRight: '10px' }} 
                />
                <Area name="내 조합" type="monotone" dataKey="value" stroke="#3182F6" strokeWidth={5} fill="url(#colorValue)" animationDuration={1000} />
                <Line name="QQQ 100%" type="monotone" dataKey="qqqOnly" stroke="#ADB5BD" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line name="SCHD 100%" type="monotone" dataKey="schdOnly" stroke="#00D084" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mx-4 md:mx-6 bg-[#F9FAFB] p-5 rounded-3xl flex items-start gap-3">
            <Info className="w-4 h-4 text-[#3182F6] mt-0.5 shrink-0" />
            <div className="text-[11px] text-[#4E5968] leading-relaxed font-medium">
              <p>• <strong className="text-[#3182F6]">파란 실선</strong>은 내가 설정한 <strong className="text-[#3182F6]">내 조합</strong>의 성과입니다.</p>
              <p>• <strong className="text-[#8B95A1]">회색 점선</strong>은 QQQ 100%, <strong className="text-[#00D084]">초록 점선</strong>은 SCHD 100%의 성과입니다.</p>
              <p className="mt-1 text-[#8B95A1]">내 조합이 시장의 변동성을 얼마나 잘 이겨내는지 시각적으로 확인해 보세요.</p>
            </div>
          </div>
        </section>

        {/* Footer with Padding */}
        <footer className="text-center pt-10 pb-20 space-y-6">
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-1 bg-white border border-[#F2F4F6] px-3 py-1.5 rounded-full shadow-sm">
              <ShieldCheck className="w-3 h-3 text-[#3182F6]" /><span className="text-[10px] font-bold text-[#8B95A1]">로직 검증 완료</span>
            </div>
            <div className="flex items-center gap-1 bg-white border border-[#F2F4F6] px-3 py-1.5 rounded-full shadow-sm">
              <TrendingUp className="w-3 h-3 text-[#3182F6]" /><span className="text-[10px] font-bold text-[#8B95A1]">12년 데이터 적용</span>
            </div>
          </div>
          <p className="text-[11px] text-[#B0B8C1] leading-relaxed px-8">
            Data Source: Portfolio Visualizer (2014-2025).<br />
            이 시뮬레이션은 과거 데이터를 기반으로 한 참고용 수치입니다. 실제 결과는 투자 시점과 환경에 따라 크게 다를 수 있으며, 모든 투자의 책임은 본인에게 있습니다.
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
