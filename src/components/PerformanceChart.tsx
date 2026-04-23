"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, TrendingUp, Loader2, RefreshCw, DollarSign } from "lucide-react";
import { getEarnings, EarningsData, PeriodType } from "@/components/earningsApiClient";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-[12px] p-3 shadow-lg border border-gray-100">
        <p className="text-[12px] text-[#8C8C8C] mb-1">{label}</p>
        <p className="font-serif text-[18px] font-bold text-black">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const PerformanceChart = () => {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [showDropdown, setShowDropdown] = useState(false);
  const [trend, setTrend] = useState(0);

  const periods: { value: PeriodType; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getEarnings(period);
      setEarningsData(response.data);
      
      // Calculate trend (mock for now - would come from API ideally)
      setTrend(Math.floor(Math.random() * 15) + 1);
    } catch (err) {
      console.error("Failed to fetch earnings:", err);
      setError(err instanceof Error ? err.message : "Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEarnings();
  };

  const formatChartData = () => {
    if (!earningsData?.chartData) return [];
    return earningsData.chartData.map(item => ({
      name: item.label,
      value: item.revenue,
    }));
  };

  const formatYAxisTick = (value: number) => {
    if (value === 0) return "0";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const getYAxisTicks = () => {
    if (!earningsData?.chartData) return [0, 10000, 20000, 50000, 100000];
    const maxValue = Math.max(...earningsData.chartData.map(d => d.revenue));
    if (maxValue <= 1000) return [0, 250, 500, 750, 1000];
    if (maxValue <= 10000) return [0, 2500, 5000, 7500, 10000];
    if (maxValue <= 50000) return [0, 12500, 25000, 37500, 50000];
    if (maxValue <= 100000) return [0, 25000, 50000, 75000, 100000];
    return [0, 50000, 100000, 150000, 200000];
  };

  const getPeriodLabel = () => {
    return periods.find(p => p.value === period)?.label || "Monthly";
  };

  const chartData = formatChartData();
  const hasData = chartData.length > 0 && chartData.some(d => d.value > 0);

  return (
    <div className="w-full bg-white p-8 rounded-[24px] shadow-[0_10px_60px_rgba(0,0,0,0.02)] border border-gray-50 mb-5 mt-10">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-[28px] font-semibold text-black tracking-tight">
            Performance Analytics
          </h2>
          {earningsData && (
            <p className="text-[13px] text-[#8C8C8C] mt-1">
              Total Revenue: <span className="font-semibold text-black">${earningsData.totalRevenue.toLocaleString()}</span>
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-[#3448D6]" : "text-gray-400"} />
          </button>

          {/* Revenue Stats */}
          {earningsData && earningsData.totalRevenue > 0 && (
            <div className="flex flex-col items-end">
              <span className="font-sans text-[12px] text-gray-400 font-light">Revenue</span>
              <div className="flex items-center gap-1 text-[#4CAF50]">
                <TrendingUp size={14} />
                <span className="font-sans text-[14px] font-medium">{trend}%</span>
              </div>
            </div>
          )}
          
          {/* Period Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[10px] font-sans text-sm text-gray-600 hover:bg-gray-50 transition-all"
            >
              {getPeriodLabel()} <ChevronDown size={16} />
            </button>
            
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-[12px] shadow-lg border border-gray-100 z-20 overflow-hidden">
                  {periods.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setPeriod(p.value);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-[13px] hover:bg-gray-50 transition-colors ${
                        period === p.value ? "text-[#3448D6] font-medium bg-[#E9ECFF]" : "text-gray-600"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 size={36} className="animate-spin text-[#3448D6]" />
          <p className="text-[#8C8C8C] text-sm mt-4">Loading chart data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center h-[400px] bg-red-50 rounded-[16px]">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEarnings}
            className="px-4 py-2 bg-[#3448D6] text-white rounded-[8px] text-sm hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Chart Section */}
      {!loading && !error && (
        <>
          {!hasData ? (
            <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-[16px]">
              <DollarSign size={48} className="text-gray-300 mb-4" />
              <p className="text-[#8C8C8C] text-center">No revenue data available for {getPeriodLabel().toLowerCase()} period</p>
              <p className="text-[12px] text-[#B5B5B5] mt-1">
                Revenue data will appear once subscribers start making payments
              </p>
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3448D6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3448D6" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid 
                    vertical={true} 
                    horizontal={true} 
                    stroke="#F0F0F0" 
                    strokeDasharray="0" 
                  />
                  
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#B5B5B5', fontSize: 12, fontFamily: 'sans-serif' }}
                    dy={20}
                    interval={period === "daily" ? Math.floor(chartData.length / 10) : 0}
                  />
                  
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#B5B5B5', fontSize: 12, fontFamily: 'sans-serif' }}
                    ticks={getYAxisTicks()}
                    tickFormatter={formatYAxisTick}
                  />

                  <Tooltip content={<CustomTooltip />} />
                  
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3448D6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#chartGradient)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformanceChart;