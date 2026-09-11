import React from 'react';
import { useDashboardContext } from '../context/DashboardContext';

interface Segment {
  label: string;
  count: number;
  color: string;
}

export const StockDonutChart: React.FC = () => {
  const { inventory } = useDashboardContext();

  const goodCount = inventory.filter((i) => i.status === 'Good').length;
  const medCount = inventory.filter((i) => i.status === 'Medium').length;
  const lowCount = inventory.filter((i) => i.status === 'Low').length;
  const outCount = inventory.filter((i) => i.status === 'Out of Stock').length;

  const segments: Segment[] = [
    { label: 'Good', count: goodCount, color: '#0D5C3A' },
    { label: 'Medium', count: medCount, color: '#F59E0B' },
    { label: 'Low', count: lowCount, color: '#F97316' },
    { label: 'Out of Stock', count: outCount, color: '#EF4444' },
  ];

  const total = inventory.length;

  // Calculate SVG stroke dashes
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 text-sm">Stock Status</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around w-full gap-4 pt-1">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="18"
            />
            {/* Slices */}
            {segments.map((seg) => {
              const percent = total > 0 ? seg.count / total : 0;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += percent;

              return (
                <circle
                  key={seg.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="18"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 hover:opacity-90"
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-800 leading-tight">{total}</span>
            <span className="text-[10px] font-semibold text-slate-400">Total Materials</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-[130px]">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-slate-600 font-medium">{seg.label}</span>
              </div>
              <span className="font-bold text-slate-800">({seg.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
