'use client';

import React, { useState, useMemo, useEffect } from 'react';
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

// 간단한 숫자 애니메이션 컴포넌트
const AnimatedNumber = ({ value, suffix = "" }: { value: string | number, suffix?: string }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="inline-block"
    >
      {value}{suffix}
    </motion.span>
  );
};

export default function PortfolioCalculator() {
  const [qqqWeight, setQqqWeight] = useState(50);
  const schdWeight = 100 - qqqWeight;

  const results = useMemo(() => {
    let currentBalance = 100;
    let peakBalance = 100;
    let maxDrawdown = 0;
    const chartData = [{ year: 2013, value: 100 }];

    data.forEach((item) => {
      const yearlyReturn = (qqqWeight / 100) * (item.qqq / 100) + (schdWeight / 100) * (item.schd / 100);
      currentBalance *= (1 + yearlyReturn);
      
      if (currentBalance > peakBalance) {
        peakBalance = currentBalance;
      }
      
      const drawdown = (currentBalance - peakBalance) / peakBalance;
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }

      chartData.push({
        year: item.year,
        value: Math.round(currentBalance * 10) / 10
      });
    });

    const years = data.length;
    const cagr = (Math.pow(currentBalance / 100, 1 / years) - 1) * 100;
    
    // 평균 배당률 (대략적인 값: QQQ 0.6%, SCHD 3.4%)
    const dividendYield = (qqqWeight / 100) * 0.6 + (schdWeight / 100) * 3.4;

    return {
      chartData,
      cagr: cagr.toFixed(2),
      mdd: (maxDrawdown * 100).toFixed(2),
      finalValue: currentBalance.toFixed(1),
      dividendYield: dividendYield.toFixed(2)
    };
  }, [qqqWeight, schdWeight]);

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4 md:p-10 font-sans text-[#191F28]">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header - Minimalist */}
        <header className="space-y-2 py-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-center"
          >
            투자 비중 계산기
          </motion.h1>
          <p className="text-[#8B95A1] text-center text-sm font-medium">
            QQQ와 SCHD, 나에게 맞는 황금 비율 찾기
          </p>
        </header>

        {/* Slider Section - Large & Interactive */}
        <section className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
          <div className="flex justify-between items-end mb-4">
            <div className="space-y-1">
              <span className="text-[#8B95A1] text-xs font-semibold uppercase tracking-wider">나스닥100</span>
              <p className="text-2xl font-bold text-[#3182F6]">QQQ {qqqWeight}%</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[#8B95A1] text-xs font-semibold uppercase tracking-wider">배당성장</span>
              <p className="text-2xl font-bold text-[#4E5968]">SCHD {schdWeight}%</p>
            </div>
          </div>

          <div className="relative pt-6 pb-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={qqqWeight}
              onChange={(e) => setQqqWeight(parseInt(e.target.value))}
              className="w-full h-3 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#3182F6] hover:accent-[#1B64DA] transition-all"
              style={{
                WebkitAppearance: 'none',
              }}
            />
            <div className="flex justify-between mt-6 px-1">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-[#4E5968]">안정형</span>
                <span className="text-[10px] text-[#ADB5BD]">SCHD 100%</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-[#3182F6]">공격형</span>
                <span className="text-[10px] text-[#ADB5BD]">QQQ 100%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section - Toss Style Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-[#F2F4F6] text-center space-y-2"
          >
            <span className="text-xs font-semibold text-[#8B95A1]">연평균 수익률</span>
            <div className="text-2xl font-bold text-[#3182F6]">
              <AnimatedNumber value={results.cagr} suffix="%" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-[#F2F4F6] text-center space-y-2"
          >
            <span className="text-xs font-semibold text-[#8B95A1]">최대 하락폭</span>
            <div className="text-2xl font-bold text-[#FF4D4F]">
              <AnimatedNumber value={results.mdd} suffix="%" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-[#F2F4F6] text-center space-y-2"
          >
            <span className="text-xs font-semibold text-[#8B95A1]">예상 배당률</span>
            <div className="text-2xl font-bold text-[#00D084]">
              <AnimatedNumber value={results.dividendYield} suffix="%" />
            </div>
          </motion.div>
        </section>

        {/* AdSense Placeholder */}
        <div className="w-full max-w-[640px] h-[100px] mx-auto bg-white border border-dashed border-[#E5E8EB] rounded-2xl flex items-center justify-center text-[#ADB5BD] text-xs overflow-hidden">
          <p>ADVERTISEMENT (640x100)</p>
        </div>

        {/* Chart Section - High Fidelity */}
        <section className="bg-white p-6 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#F2F4F6]">
          <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
            누적 수익률 추이
            <span className="text-[10px] font-normal text-[#8B95A1]">(2014-2025)</span>
          </h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3182F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F2F4F6" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8B95A1', fontSize: 11, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8B95A1', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ stroke: '#3182F6', strokeWidth: 1 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#3182F6', fontWeight: 'bold' }}
                  labelStyle={{ fontWeight: 'bold', color: '#191F28', marginBottom: '4px' }}
                  formatter={(value) => [`${value}p`, '자산 지수']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3182F6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Footer info */}
        <footer className="text-center py-10 space-y-4">
          <p className="text-[11px] text-[#B0B8C1] leading-relaxed">
            위 결과는 과거의 데이터를 기반으로 한 백테스트 결과이며,<br />
            미래의 수익을 보장하지 않습니다. 투자 결정은 본인의 책임입니다.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        /* Custom Slider Thumb for Mobile-First Experience */
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          background: #ffffff;
          border: 4px solid #3182F6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        input[type='range']::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #ffffff;
          border: 4px solid #3182F6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </main>
  );
}
