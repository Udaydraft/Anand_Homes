import React, { useState, useMemo } from 'react';

export interface ChartDayItem {
  day: string; // 'Mon', 'Tue', etc.
  fullDate?: string; // '05 Oct 2026'
  dateNum?: string; // '05'
  isToday?: boolean;
  stockIn: number;
  stockOut: number;
  stockInCount?: number;
  stockOutCount?: number;
}

export interface StockBarChartProps {
  data?: ChartDayItem[];
  inwardEntries?: Array<{
    date?: string;
    quantity?: number | string;
    createdOn?: string;
    material?: string;
    [key: string]: any;
  }>;
  outwardEntries?: Array<{
    date?: string;
    quantity?: number | string;
    createdOn?: string;
    material?: string;
    [key: string]: any;
  }>;
  stockInColor?: string;
  stockOutColor?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

// Robust multi-format date parser (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, ISO timestamps)
export const parseEntryDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const str = String(dateStr).trim();

  // Match DD-MM-YYYY or DD/MM/YYYY with optional time
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const min = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    return new Date(year, month, day, hour, min);
  }

  // Match YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

// Check if two dates represent the same calendar day
const isSameCalendarDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

// Compute neat round scale maximum for Y-axis
const getNiceMaxValue = (val: number): number => {
  if (val <= 0) return 10;
  if (val <= 5) return 5;
  if (val <= 10) return 10;
  if (val <= 20) return 20;
  if (val <= 50) return 50;
  if (val <= 100) return 100;
  if (val <= 200) return 200;
  if (val <= 500) return 500;
  if (val <= 1000) return 1000;
  const pow = Math.pow(10, Math.floor(Math.log10(val)));
  return Math.ceil(val / (pow / 2)) * (pow / 2);
};

export const StockBarChart: React.FC<StockBarChartProps> = ({
  data: externalData,
  inwardEntries = [],
  outwardEntries = [],
  stockInColor = '#0D5C3A',
  stockOutColor = '#E5A91E',
  title = 'Stock Movement Analytics',
  subtitle = 'Weekly inbound deliveries vs site disbursements',
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [metric, setMetric] = useState<'quantity' | 'transactions'>('quantity');
  const [timeRange, setTimeRange] = useState<'this-week' | 'last-7-days'>('this-week');

  // Compute daily chart points from entries if provided, else use externalData
  const chartItems: ChartDayItem[] = useMemo(() => {
    if (externalData && externalData.length > 0 && inwardEntries.length === 0 && outwardEntries.length === 0) {
      return externalData;
    }

    const now = new Date();
    let datesList: Date[] = [];

    if (timeRange === 'this-week') {
      // Monday to Sunday of the current week
      const currentDayOfWeek = now.getDay();
      const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);

      datesList = [0, 1, 2, 3, 4, 5, 6].map((i) => {
        return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      });
    } else {
      // Rolling last 7 days ending with today
      datesList = [6, 5, 4, 3, 2, 1, 0].map((i) => {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      });
    }

    const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return datesList.map((targetDate) => {
      const day = dayShortNames[targetDate.getDay()];
      const isToday = isSameCalendarDay(targetDate, now);
      const dateNum = String(targetDate.getDate()).padStart(2, '0');
      const fullDate = targetDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Filter inward entries matching this calendar day
      const matchingInward = inwardEntries.filter((entry) => {
        const d = parseEntryDate(entry.date || entry.createdOn);
        return d ? isSameCalendarDay(d, targetDate) : false;
      });

      // Filter outward entries matching this calendar day
      const matchingOutward = outwardEntries.filter((entry) => {
        const d = parseEntryDate(entry.date || entry.createdOn);
        return d ? isSameCalendarDay(d, targetDate) : false;
      });

      const qtyIn = matchingInward.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const qtyOut = matchingOutward.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

      const countIn = matchingInward.length;
      const countOut = matchingOutward.length;

      return {
        day,
        dateNum,
        fullDate,
        isToday,
        stockIn: metric === 'quantity' ? qtyIn : countIn,
        stockOut: metric === 'quantity' ? qtyOut : countOut,
        stockInCount: countIn,
        stockOutCount: countOut,
      };
    });
  }, [externalData, inwardEntries, outwardEntries, metric, timeRange]);

  // Aggregate totals for the period
  const totalStockIn = useMemo(
    () => chartItems.reduce((acc, item) => acc + item.stockIn, 0),
    [chartItems]
  );
  const totalStockOut = useMemo(
    () => chartItems.reduce((acc, item) => acc + item.stockOut, 0),
    [chartItems]
  );
  const netMovement = totalStockIn - totalStockOut;

  // Maximum value for dynamic scaling
  const maxValue = useMemo(() => {
    const highestValue = Math.max(
      ...chartItems.map((item) => Math.max(item.stockIn, item.stockOut)),
      0
    );
    return getNiceMaxValue(highestValue);
  }, [chartItems]);

  // Dynamic Y-axis ticks (5 levels: 100%, 75%, 50%, 25%, 0%)
  const yTicks = useMemo(() => {
    return [
      maxValue,
      Math.round(maxValue * 0.75),
      Math.round(maxValue * 0.5),
      Math.round(maxValue * 0.25),
      0,
    ];
  }, [maxValue]);

  const chartHeight = 160; // Base bar area height in px

  return (
    <div className={`w-full ${className}`}>
      {/* Chart Top Header & Interactive Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Sync
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Metric and Range Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Metric Selector (Units vs Logs) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setMetric('quantity')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                metric === 'quantity'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Units (Qty)
            </button>
            <button
              type="button"
              onClick={() => setMetric('transactions')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                metric === 'transactions'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Logs (Count)
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setTimeRange('this-week')}
              className={`px-2 py-1 rounded-md font-bold transition-all ${
                timeRange === 'this-week'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('last-7-days')}
              className={`px-2 py-1 rounded-md font-bold transition-all ${
                timeRange === 'last-7-days'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Pills & Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100 mb-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stockInColor }} />
            <span className="text-slate-700">Stock In:</span>
            <strong className="text-slate-900 font-extrabold">
              {totalStockIn.toLocaleString('en-IN')} {metric === 'quantity' ? 'units' : 'logs'}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stockOutColor }} />
            <span className="text-slate-700">Stock Out:</span>
            <strong className="text-slate-900 font-extrabold">
              {totalStockOut.toLocaleString('en-IN')} {metric === 'quantity' ? 'units' : 'logs'}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-2 font-medium text-[11px]">
          <span className="text-slate-500">Net Flow:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-md ${
              netMovement >= 0
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {netMovement >= 0 ? `+${netMovement.toLocaleString('en-IN')}` : netMovement.toLocaleString('en-IN')} {metric === 'quantity' ? 'units' : 'logs'}
          </span>
        </div>
      </div>

      {/* Interactive Chart Canvas */}
      <div className="relative pt-2 select-none">
        {/* Y Axis Grid Lines & Labels */}
        <div className="absolute inset-0 pl-1 pb-8 pointer-events-none flex flex-col justify-between">
          {yTicks.map((val, idx) => (
            <div
              key={`${val}-${idx}`}
              className="flex items-center w-full text-[10px] text-slate-400 border-b border-slate-100"
              style={{ height: idx === 0 ? '0px' : undefined }}
            >
              <span className="w-8 text-right pr-2 font-mono font-medium">{val}</span>
              <div className="flex-1 h-[1px]" />
            </div>
          ))}
        </div>

        {/* Bars Columns */}
        <div
          className="flex items-end justify-between pl-10 pr-2 relative z-10"
          style={{ height: `${chartHeight + 34}px` }}
        >
          {chartItems.map((item, idx) => {
            // Calculate proportional height in px (max chartHeight)
            const inHeight =
              maxValue > 0 && item.stockIn > 0
                ? Math.max(6, (item.stockIn / maxValue) * chartHeight)
                : 0;

            const outHeight =
              maxValue > 0 && item.stockOut > 0
                ? Math.max(6, (item.stockOut / maxValue) * chartHeight)
                : 0;

            return (
              <div
                key={`${item.day}-${idx}`}
                className="flex flex-col items-center flex-1 group relative cursor-pointer pt-2"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Floating Rich Tooltip */}
                {hoveredIndex === idx && (
                  <div className="absolute -top-16 bg-slate-900 text-white text-[11px] p-2.5 rounded-lg shadow-xl pointer-events-none z-30 whitespace-nowrap min-w-[140px] border border-slate-700 animate-in fade-in duration-150">
                    <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-slate-300 flex items-center justify-between gap-2">
                      <span>
                        {item.day} {item.dateNum ? `(${item.dateNum})` : ''}
                      </span>
                      {item.isToday && (
                        <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5 text-xs font-semibold">
                      <div className="flex items-center justify-between gap-3 text-emerald-400">
                        <span>Stock In:</span>
                        <span>{item.stockIn.toLocaleString('en-IN')} {metric === 'quantity' ? 'units' : 'logs'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-amber-400">
                        <span>Stock Out:</span>
                        <span>{item.stockOut.toLocaleString('en-IN')} {metric === 'quantity' ? 'units' : 'logs'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-slate-300 pt-1 border-t border-slate-700/60 text-[10px]">
                        <span>Net Flow:</span>
                        <span className={item.stockIn - item.stockOut >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {item.stockIn - item.stockOut >= 0 ? '+' : ''}
                          {(item.stockIn - item.stockOut).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bars Area */}
                <div
                  className="flex items-end justify-center gap-1.5 w-full transition-transform duration-200 group-hover:scale-105"
                  style={{ height: `${chartHeight}px` }}
                >
                  {/* Stock In Bar */}
                  <div
                    className="w-3 sm:w-4 rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-2xs"
                    style={{
                      height: inHeight > 0 ? `${inHeight}px` : '2px',
                      backgroundColor: inHeight > 0 ? stockInColor : '#CBD5E1',
                      opacity: inHeight > 0 ? 1 : 0.4,
                    }}
                    title={`In: ${item.stockIn}`}
                  />

                  {/* Stock Out Bar */}
                  <div
                    className="w-3 sm:w-4 rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-2xs"
                    style={{
                      height: outHeight > 0 ? `${outHeight}px` : '2px',
                      backgroundColor: outHeight > 0 ? stockOutColor : '#CBD5E1',
                      opacity: outHeight > 0 ? 1 : 0.4,
                    }}
                    title={`Out: ${item.stockOut}`}
                  />
                </div>

                {/* Day and Date Indicator Label */}
                <div className="flex flex-col items-center mt-2">
                  <span
                    className={`text-[11px] font-bold transition-colors ${
                      item.isToday
                        ? 'text-emerald-800'
                        : hoveredIndex === idx
                        ? 'text-slate-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.day}
                  </span>
                  {item.dateNum && (
                    <span
                      className={`text-[9px] font-semibold ${
                        item.isToday
                          ? 'text-emerald-700 font-extrabold'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.dateNum}
                    </span>
                  )}
                  {item.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
