import React, { useState } from 'react';

interface DayData {
  day: string;
  stockIn: number;
  stockOut: number;
}

interface StockBarChartProps {
  data: DayData[];
  stockOutColor?: string;
}

export const StockBarChart: React.FC<StockBarChartProps> = ({
  data,
  stockOutColor = '#E5A91E',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = 200;
  const chartHeight = 160;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-sm">Stock Overview (This Week)</h3>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0D5C3A]" />
            <span>Stock In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: stockOutColor }} />
            <span>Stock Out</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative pt-4">
        {/* Y Axis Grid lines */}
        <div className="flex flex-col justify-between absolute inset-0 pb-7 pointer-events-none">
          {[200, 150, 100, 50, 0].map((val) => (
            <div key={val} className="flex items-center gap-2 border-b border-slate-100 w-full text-[10px] text-slate-400">
              <span className="w-6 text-right pr-1 select-none">{val}</span>
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="flex items-end justify-between pl-8 pr-2 h-[160px] relative z-10 pb-1">
          {data.map((item, idx) => {
            const inHeight = Math.min(chartHeight, (item.stockIn / maxValue) * chartHeight);
            const outHeight = Math.min(chartHeight, (item.stockOut / maxValue) * chartHeight);

            return (
              <div
                key={item.day}
                className="flex flex-col items-center gap-1 group relative cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {hoveredIndex === idx && (
                  <div className="absolute -top-12 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-md shadow-lg flex items-center gap-2 pointer-events-none z-30 whitespace-nowrap">
                    <span className="text-emerald-400 font-bold">In: {item.stockIn}</span>
                    <span>|</span>
                    <span className="text-amber-400 font-bold">Out: {item.stockOut}</span>
                  </div>
                )}

                {/* Bars side by side */}
                <div className="flex items-end gap-1.5 h-[130px]">
                  {/* Stock In Bar */}
                  <div
                    className="w-2.5 sm:w-3.5 bg-[#0D5C3A] rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${Math.max(4, inHeight)}px` }}
                  />
                  {/* Stock Out Bar */}
                  <div
                    className="w-2.5 sm:w-3.5 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                    style={{
                      height: `${Math.max(4, outHeight)}px`,
                      backgroundColor: stockOutColor,
                    }}
                  />
                </div>

                {/* Day Label */}
                <span className="text-[11px] font-semibold text-slate-500 mt-1 select-none">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
