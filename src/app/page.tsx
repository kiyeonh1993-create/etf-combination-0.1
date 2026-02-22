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

    return {
      chartData,
      cagr: cagr.toFixed(2),
      mdd: (maxDrawdown * 100).toFixed(2),
      finalValue: currentBalance.toFixed(1)
    };
  }, [qqqWeight, schdWeight]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">QQQ & SCHD 포트폴리오 계산기</h1>
          <p className="text-slate-500">2014년 - 2025년 백테스트 데이터 기반</p>
        </div>

        {/* Controls & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex justify-between mb-4">
              <span className="font-semibold text-blue-600 text-lg">QQQ: {qqqWeight}%</span>
              <span className="font-semibold text-orange-500 text-lg">SCHD: {schdWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={qqqWeight}
              onChange={(e) => setQqqWeight(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>SCHD 100%</span>
              <span>50:50</span>
              <span>QQQ 100%</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">연평균 수익률 (CAGR)</p>
              <p className="text-2xl font-bold text-blue-600">{results.cagr}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">최대 하락폭 (MDD)</p>
              <p className="text-2xl font-bold text-red-500">{results.mdd}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">최종 자산 (100 기준)</p>
              <p className="text-2xl font-bold">{results.finalValue}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-6">누적 수익률 추이 (2014-2025)</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results.chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600 border-b">연도</th>
                <th className="p-4 text-sm font-semibold text-slate-600 border-b text-right">QQQ 수익률</th>
                <th className="p-4 text-sm font-semibold text-slate-600 border-b text-right">SCHD 수익률</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.year} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm border-b font-medium">{item.year}</td>
                  <td className="p-4 text-sm border-b text-right text-blue-600">{item.qqq}%</td>
                  <td className="p-4 text-sm border-b text-right text-orange-500">{item.schd}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
