import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardContext } from '../context/DashboardContext';
import { StockBarChart } from '../components/StockBarChart';
import { StockDonutChart } from '../components/StockDonutChart';
import {
  Building2,
  Package,
  Coins,
  AlertTriangle,
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Eye,
  Camera,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  Phone,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    roleMode,
    selectedSite,
    photos,
    activities,
    lowStockAlerts,
    materialRequests,
    deliveries,
    selectedDate,
  } = useDashboardContext();

  // Mock bar chart data matching mockup
  const adminBarData = [
    { day: 'Mon', stockIn: 120, stockOut: 85 },
    { day: 'Tue', stockIn: 160, stockOut: 110 },
    { day: 'Wed', stockIn: 95, stockOut: 130 },
    { day: 'Thu', stockIn: 180, stockOut: 90 },
    { day: 'Fri', stockIn: 140, stockOut: 120 },
    { day: 'Sat', stockIn: 175, stockOut: 70 },
    { day: 'Sun', stockIn: 60, stockOut: 140 },
  ];

  const supervisorBarData = [
    { day: 'Mon', stockIn: 65, stockOut: 35 },
    { day: 'Tue', stockIn: 90, stockOut: 55 },
    { day: 'Wed', stockIn: 110, stockOut: 75 },
    { day: 'Thu', stockIn: 80, stockOut: 95 },
    { day: 'Fri', stockIn: 70, stockOut: 60 },
    { day: 'Sat', stockIn: 85, stockOut: 45 },
    { day: 'Sun', stockIn: 30, stockOut: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {roleMode === 'admin' ? (
              <>Good Morning, Admin! 👋</>
            ) : (
              <>Good Morning, Rajesh! 👋</>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {roleMode === 'admin'
              ? "Here's what's happening across all your sites."
              : "Here's what's happening at your site today."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
          <span>{selectedDate}</span>
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADMIN VIEW (Image 1) */}
      {/* ========================================================================= */}
      {roleMode === 'admin' ? (
        <>
          {/* Top 5 KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Sites */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-[#0D5C3A]/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Sites</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">12</h3>
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active Sites
                </span>
              </div>
            </div>

            {/* Card 2: Total Materials */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-[#0D5C3A]/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Materials</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">68</h3>
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  In Inventory
                </span>
              </div>
            </div>

            {/* Card 3: Stock Value */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-amber-500/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Stock Value</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">₹24,85,600</h3>
                <span className="inline-block mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Total Value
                </span>
              </div>
            </div>

            {/* Card 4: Low Stock Items */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-orange-500/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Low Stock Items</span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">07</h3>
                <span className="inline-block mt-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                  Reorder Soon
                </span>
              </div>
            </div>

            {/* Card 5: Pending Requests */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-blue-500/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">15</h3>
                <span className="inline-block mt-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Requires Action
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row (Stock Overview Bar Chart, Recent Activity, Stock Status Donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 1. Bar Chart (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <StockBarChart data={adminBarData} stockOutColor="#E5A91E" />
            </div>

            {/* 2. Recent Activity (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">Recent Activity</h3>
                </div>
                <div className="space-y-3.5">
                  {activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="flex items-start justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0D5C3A] shrink-0" />
                        <span className="font-medium text-slate-700">{act.text}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">{act.subtext}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <Link
                  to="/material-requests"
                  className="text-xs font-bold text-[#0D5C3A] hover:underline flex items-center gap-1"
                >
                  View All Activity <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Donut Chart (3 cols) */}
            <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col items-center justify-between">
              <StockDonutChart />
            </div>
          </div>

          {/* Bottom 4 Summary Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Material Requests */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between hover:border-[#0D5C3A]/30 transition-all">
              <div>
                <span className="text-xs text-slate-500 font-medium">Material Requests</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-extrabold text-slate-900">15</span>
                  <span className="text-xs text-slate-500">Pending</span>
                </div>
                <Link
                  to="/material-requests"
                  className="text-[11px] font-bold text-[#0D5C3A] hover:underline block mt-2"
                >
                  View All
                </Link>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                <FileText className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Deliveries */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between hover:border-[#0D5C3A]/30 transition-all">
              <div>
                <span className="text-xs text-slate-500 font-medium">Deliveries</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-extrabold text-slate-900">08</span>
                  <span className="text-xs text-slate-500">In Progress</span>
                </div>
                <Link
                  to="/deliveries"
                  className="text-[11px] font-bold text-[#0D5C3A] hover:underline block mt-2"
                >
                  View All
                </Link>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                <Truck className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Photo Uploaded */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between hover:border-[#0D5C3A]/30 transition-all">
              <div>
                <span className="text-xs text-slate-500 font-medium">Photo Uploaded</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-extrabold text-slate-900">42</span>
                  <span className="text-xs text-slate-500">Today</span>
                </div>
                <Link
                  to="/photo-monitoring"
                  className="text-[11px] font-bold text-[#0D5C3A] hover:underline block mt-2"
                >
                  View All
                </Link>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4: Low Stock Alerts */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between hover:border-[#0D5C3A]/30 transition-all">
              <div>
                <span className="text-xs text-slate-500 font-medium">Low Stock Alerts</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-extrabold text-slate-900">07</span>
                  <span className="text-xs text-slate-500">Items</span>
                </div>
                <Link
                  to="/low-stock"
                  className="text-[11px] font-bold text-[#0D5C3A] hover:underline block mt-2"
                >
                  View All
                </Link>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* SUPERVISOR VIEW (Image 2) */
        /* ========================================================================= */
        <>
          {/* Top 6 KPI Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Available Stock Value */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 leading-tight">Available Stock Value</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-extrabold text-slate-900">₹8,24,500</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
                  <Coins className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Total Value</span>
            </div>

            {/* 2. Total Materials */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 leading-tight">Total Materials</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-extrabold text-slate-900">32</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Materials</span>
            </div>

            {/* 3. Low Stock Items */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 leading-tight">Low Stock Items</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-extrabold text-slate-900">04</span>
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Items</span>
            </div>

            {/* 4. Pending Requests */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 leading-tight">Pending Requests</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-extrabold text-slate-900">03</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Requests</span>
            </div>

            {/* 5. Today's Stock In */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 leading-tight">Today's Stock In</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-extrabold text-slate-900">16</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Items</span>
            </div>

            {/* 6. Today's Stock Out */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 leading-tight">Today's Stock Out</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-extrabold text-slate-900">08</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Items</span>
            </div>
          </div>

          {/* Middle Row (Stock Overview, Today's Activity, Site Summary) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 1. Bar Chart (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <StockBarChart data={supervisorBarData} stockOutColor="#DC2626" />
            </div>

            {/* 2. Today's Activity (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">Today's Activity</h3>
                </div>
                <div className="space-y-3.5">
                  {activities.map((act) => (
                    <div key={act.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{act.text}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4">
                <Link
                  to="/material-requests"
                  className="text-xs font-bold text-[#0D5C3A] hover:underline flex items-center gap-1"
                >
                  View All Activity <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Site Summary Card (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">Site Summary</h3>
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Project Name</span>
                      <span className="font-bold text-slate-800">Anna Nagar Residential</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Site Code</span>
                      <span className="font-bold text-slate-800">RBL-S-001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Location</span>
                      <span className="font-medium text-slate-700">Chennai, Tamil Nadu</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Start Date</span>
                      <span className="font-medium text-slate-700">12 Jan 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Supervisor</span>
                      <span className="font-medium text-slate-700">Rajesh Kumar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Contact</span>
                      <span className="font-medium text-slate-700">98765 43210</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400 font-medium">Status</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=300&auto=format&fit=crop&q=80"
                      alt="Site Building"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to="/my-site"
                  className="w-full py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg text-center block transition-colors shadow-xs"
                >
                  View Site Details
                </Link>
              </div>
            </div>
          </div>

          {/* Third Row (Low Stock Items, Pending Requests, Pending Deliveries) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Low Stock Items */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-sm">Low Stock Items</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[11px] pb-2 text-left">
                        <th className="font-semibold pb-1.5">Material</th>
                        <th className="font-semibold pb-1.5">Current Stock</th>
                        <th className="font-semibold pb-1.5">Reorder Level</th>
                        <th className="font-semibold pb-1.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lowStockAlerts.slice(0, 4).map((item) => (
                        <tr key={item.id} className="text-slate-700">
                          <td className="py-2 font-medium">{item.material}</td>
                          <td className="py-2 text-slate-500">
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="py-2 text-slate-500">
                            {item.reorderLevel} {item.unit}
                          </td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === 'Low'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-amber-50 text-amber-600'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3">
                <Link
                  to="/low-stock"
                  className="text-xs font-bold text-[#0D5C3A] hover:underline block"
                >
                  View All Low Stock
                </Link>
              </div>
            </div>

            {/* 2. Pending Requests */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-sm">Pending Requests</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[11px] pb-2 text-left">
                        <th className="font-semibold pb-1.5">Request ID</th>
                        <th className="font-semibold pb-1.5">Material</th>
                        <th className="font-semibold pb-1.5">Quantity</th>
                        <th className="font-semibold pb-1.5">Requested On</th>
                        <th className="font-semibold pb-1.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {materialRequests.slice(0, 3).map((r) => (
                        <tr key={r.id} className="text-slate-700">
                          <td className="py-2 font-bold text-slate-800">{r.requestId}</td>
                          <td className="py-2 font-medium">{r.material}</td>
                          <td className="py-2 text-slate-500">
                            {r.quantity} {r.unit}
                          </td>
                          <td className="py-2 text-slate-400 text-[11px]">{r.requestedOn}</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-600'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3">
                <Link
                  to="/material-requests"
                  className="text-xs font-bold text-[#0D5C3A] hover:underline block"
                >
                  View All Requests
                </Link>
              </div>
            </div>

            {/* 3. Pending Deliveries */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-sm">Pending Deliveries</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[11px] pb-2 text-left">
                        <th className="font-semibold pb-1.5">Delivery ID</th>
                        <th className="font-semibold pb-1.5">Material</th>
                        <th className="font-semibold pb-1.5">Expected Date</th>
                        <th className="font-semibold pb-1.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deliveries.slice(0, 3).map((d) => (
                        <tr key={d.id} className="text-slate-700">
                          <td className="py-2 font-bold text-slate-800">{d.deliveryId}</td>
                          <td className="py-2 font-medium">{d.material}</td>
                          <td className="py-2 text-slate-500">{d.expectedDate}</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                d.status === 'Received'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : d.status === 'In Transit'
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3">
                <Link
                  to="/deliveries"
                  className="text-xs font-bold text-[#0D5C3A] hover:underline block"
                >
                  View All Deliveries
                </Link>
              </div>
            </div>
          </div>

          {/* Fourth Row: Recent Photos & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Recent Photos (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">Recent Photos</h3>
                  <Link
                    to="/photo-monitoring"
                    className="text-xs font-bold text-[#0D5C3A] hover:underline"
                  >
                    View All Photos
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {photos.slice(0, 6).map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-4/3 cursor-pointer"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-2 text-white">
                        <span className="text-[11px] font-bold leading-tight truncate">
                          {photo.title}
                        </span>
                        <span className="text-[9px] text-slate-300 truncate mt-0.5">
                          {photo.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/stock-in"
                    className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 hover:border-[#0D5C3A] hover:bg-emerald-50/40 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-md bg-emerald-100 text-[#0D5C3A] mb-1.5 group-hover:scale-105 transition-transform">
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Stock In</span>
                    <span className="text-[10px] text-slate-400">Add new stock</span>
                  </Link>

                  <Link
                    to="/stock-out"
                    className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 hover:border-[#0D5C3A] hover:bg-emerald-50/40 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-md bg-rose-100 text-rose-700 mb-1.5 group-hover:scale-105 transition-transform">
                      <ArrowUpFromLine className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Stock Out</span>
                    <span className="text-[10px] text-slate-400">Issue material</span>
                  </Link>

                  <Link
                    to="/material-requests"
                    className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 hover:border-[#0D5C3A] hover:bg-emerald-50/40 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-md bg-amber-100 text-amber-700 mb-1.5 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Material Request</span>
                    <span className="text-[10px] text-slate-400">Request material</span>
                  </Link>

                  <Link
                    to="/deliveries"
                    className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 hover:border-[#0D5C3A] hover:bg-emerald-50/40 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-md bg-blue-100 text-blue-700 mb-1.5 group-hover:scale-105 transition-transform">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Delivery Received</span>
                    <span className="text-[10px] text-slate-400">Record delivery</span>
                  </Link>

                  <Link
                    to="/photo-monitoring"
                    className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 hover:border-[#0D5C3A] hover:bg-emerald-50/40 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-md bg-purple-100 text-purple-700 mb-1.5 group-hover:scale-105 transition-transform">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Upload Photo</span>
                    <span className="text-[10px] text-slate-400">Site photo</span>
                  </Link>

                  <Link
                    to="/reports"
                    className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 hover:border-[#0D5C3A] hover:bg-emerald-50/40 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-md bg-slate-100 text-slate-700 mb-1.5 group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">View Reports</span>
                    <span className="text-[10px] text-slate-400">Site reports</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
