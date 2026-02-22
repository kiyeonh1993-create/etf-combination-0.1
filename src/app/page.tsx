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
  "Apple", "Microsoft", "Amazon", "NVIDIA", "Alphabet Cl A", 
  "Meta", "Broadcom", "Tesla", "Costco", "Alphabet Cl C"
];

const schdHoldings = [
  "AbbVie", "Home Depot", "Chevron", "Amgen", "Verizon", 
  "PepsiCo", "Pfizer", "Cisco", "Coca-Cola", "Texas Instruments"
];

const AnimatedNumber = ({ value, suffix = "" }: { value: string | number, suffix?: string }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-block"
    >
      {value}{suffix}
    </motion.span>
  );
};

export default function PortfolioCalculator() {
  const [qqqWeight, setQqqWeight] = useState(70);
  const schdWeight = 100 - qqqWeight;

  const results = useMemo(() => {
    let currentBalance = 100;
    let peakBalance = 100;
    let maxDrawdown = 0;
    const chartData = [{ year: 2013, value: 100 }];

    data.forEach((item) => {
      const yearlyReturn = (qqqWeight / 100) * (item.qqq / 100) + (schdWeight / 100) * (item.schd / 100);
      currentBalance *= (1 + yearlyReturn);
      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const drawdown = (currentBalance - peakBalance) / peakBalance;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
      chartData.push({ year: item.year, value: Math.round(currentBalance * 10) / 10 });
    });

    const years = data.length;
    const cagr = (Math.pow(currentBalance / 100, 1 / years) - 1) * 100;
    const dividendYield = (qqqWeight / 100) * 0.6 + (schdWeight / 100) * 3.4;
    const mddImprovement = (Math.abs(-32.58) - Math.abs(maxDrawdown * 100)).toFixed(1);

    let profile = { title: "", icon: "⚖️", desc: "", color: "#4E5968" };
    if (qqqWeight >= 80) {
      profile = { title: "초공격적 성장형", icon: "🚀", desc: "자산 폭발! 하락장 멘탈이 강한 젊은 투자자에게 추천해요.", color: "#3182F6" };
    } else if (qqqWeight >= 60) {
      profile = { title: "공격적 밸런스형", icon: "📈", desc: "시장을 이기면서도 하락장 방어력을 챙긴 가장 영리한 비율이에요.", color: "#3182F6" };
    } else if (qqqWeight >= 40) {
      profile = { title: "중립적 밸런스형", icon: "⚖️", desc: "수익과 배당, 두 마리 토끼를 잡고 싶은 분들의 황금 비율입니다.", color: "#4E5968" };
    } else {
      profile = { title: "안정적 배당형", icon: "☕", desc: "잠 편하게 자고 싶은 배당러! 하락장에서도 마음이 편안해요.", color: "#00D084" };
    }

    return { chartData, cagr: cagr.toFixed(2), mdd: (maxDrawdown * 100).toFixed(2), dividendYield: dividendYield.toFixed(2), profile, mddImprovement };
  }, [qqqWeight, schdWeight]);

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4 md:p-10 font-sans text-[#191F28]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="space-y-2 py-4 text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <span className="inline-block px-3 py-1 bg-[#3182F61A] text-[#3182F6] text-xs font-bold rounded-full mb-2">QQQ vs SCHD Calculator</span>
            <h1 className="text-3xl font-bold tracking-tight">투자 비중 계산기</h1>
          </motion.div>
        </header>

        {/* Dynamic Insight Card */}
        <section className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F2F4F6]">
          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl">{results.profile.icon}</span>
            <div className="space-y-1">
              <h2 className="text-xl font-bold" style={{ color: results.profile.color }}>{results.profile.title}</h2>
              <p className="text-[#4E5968] text-sm leading-relaxed">{results.profile.desc}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#F2F4F6] flex items-center justify-between text-sm">
            <span className="text-[#8B95A1]">시장 대비 장점</span>
            <span className="font-bold text-[#3182F6]">
              {parseFloat(results.mddImprovement) > 0 
                ? `100% QQQ보다 하락폭을 ${results.mddImprovement}% 줄였어요!` 
                : "최고의 공격력을 가진 구성이에요!"}
            </span>
          </div>
        </section>

        {/* Controls */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-[#F2F4F6] space-y-10">
          <div className="flex gap-2">
            {[ { label: "공격 8:2", val: 80 }, { label: "밸런스 5:5", val: 50 }, { label: "안정 2:8", val: 20 } ].map((btn) => (
              <button key={btn.val} onClick={() => setQqqWeight(btn.val)} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${qqqWeight === btn.val ? 'bg-[#3182F6] text-white' : 'bg-[#F2F4F6] text-[#4E5968]'}`}>
                {btn.label}
              </button>
            ))}
          </div>
          <div className="relative py-4">
            <div className="absolute top-1/2 left-[50%] right-[20%] h-3 bg-[#3182F622] -translate-y-1/2 rounded-full pointer-events-none" />
            <input type="range" min="0" max="100" step="5" value={qqqWeight} onChange={(e) => setQqqWeight(parseInt(e.target.value))} className="w-full h-3 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#3182F6] relative z-10" />
            <div className="flex justify-between mt-4 text-[10px] font-bold text-[#ADB5BD]">
              <span>SCHD 집중형</span><span className="text-[#3182F6]">황금비율 구간 (6:4 ~ 8:2)</span><span>QQQ 집중형</span>
            </div>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F2F4F6] text-center"><span className="text-xs font-bold text-[#8B95A1]">CAGR</span><div className="text-2xl font-black text-[#3182F6]"><AnimatedNumber value={results.cagr} suffix="%" /></div></div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F2F4F6] text-center"><span className="text-xs font-bold text-[#8B95A1]">MDD</span><div className="text-2xl font-black text-[#FF4D4F]"><AnimatedNumber value={results.mdd} suffix="%" /></div></div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F2F4F6] text-center"><span className="text-xs font-bold text-[#8B95A1]">DIVIDEND</span><div className="text-2xl font-black text-[#00D084]"><AnimatedNumber value={results.dividendYield} suffix="%" /></div></div>
        </section>

        {/* AdSense Placeholder */}
        <div className="w-full max-w-[640px] h-[100px] mx-auto bg-[#F2F4F6] border border-dashed border-[#E5E8EB] rounded-3xl flex items-center justify-center text-[#B0B8C1] text-[10px] font-bold">ADVERTISEMENT</div>

        {/* SEO Blog Content Section (New) */}
        <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-[#F2F4F6] space-y-8">
          <h2 className="text-2xl font-bold">왜 QQQ와 SCHD를 함께 투자해야 할까요?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#3182F6]">📈 QQQ의 강력한 성장성</h3>
              <p className="text-sm text-[#4E5968] leading-relaxed">
                나스닥100(QQQ)은 Apple, Microsoft, NVIDIA 등 기술 혁신을 주도하는 기업들에 집중합니다. 높은 자본 차익을 기대할 수 있지만, 시장 변동성에는 다소 취약한 모습을 보입니다.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#00D084]">☕ SCHD의 탄탄한 안정성</h3>
              <p className="text-sm text-[#4E5968] leading-relaxed">
                배당성장(SCHD)은 꾸준히 배당을 늘리는 가치주에 투자합니다. 상승장에서는 QQQ보다 속도가 느릴 수 있지만, 하락장에서의 방어력이 뛰어나고 매월 현금 흐름을 만들어줍니다.
              </p>
            </div>
          </div>

          <div className="bg-[#F9FAFB] p-6 rounded-[24px]">
            <h3 className="text-md font-bold mb-3 italic">"하락장을 견디는 힘이 수익을 만듭니다."</h3>
            <p className="text-sm text-[#4E5968] leading-relaxed">
              두 ETF를 적절히 섞으면 기술주의 **폭발적인 수익**과 가치주의 **안정적인 배당**을 동시에 챙길 수 있습니다. 특히 2022년과 같은 하락장에서 MDD(최대 하락폭)를 획기적으로 낮추는 포트폴리오 다각화 효과를 얻을 수 있습니다.
            </p>
          </div>
        </section>

        {/* Holdings Comparison */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#F2F4F6]">
            <h4 className="font-bold text-[#3182F6] mb-6 flex items-center gap-2">QQQ Top 10</h4>
            <ul className="space-y-4">
              {qqqHoldings.map((h, i) => (<li key={h} className="flex justify-between text-sm"><span className="text-[#8B95A1] font-bold">{i+1}</span><span className="font-medium text-[#4E5968]">{h}</span></li>))}
            </ul>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#F2F4F6]">
            <h4 className="font-bold text-[#4E5968] mb-6 flex items-center gap-2">SCHD Top 10</h4>
            <ul className="space-y-4">
              {schdHoldings.map((h, i) => (<li key={h} className="flex justify-between text-sm"><span className="text-[#8B95A1] font-bold">{i+1}</span><span className="font-medium text-[#4E5968]">{h}</span></li>))}
            </ul>
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
