import React, { useState } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Eye,
  Calendar,
  Layers,
  TrendingDown,
  ShoppingCart,
  Building2,
  AlertTriangle,
  FileText,
  X,
  CheckCircle2,
} from 'lucide-react';

interface ReportCardItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  lastUpdated: string;
}

export const ReportsPage: React.FC = () => {
  const { sites, inventory, materialRequests, deliveries } = useDashboardContext();
  const [selectedReport, setSelectedReport] = useState<ReportCardItem | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const reports: ReportCardItem[] = [
    {
      id: 'stock-summary',
      title: 'Stock Summary Report',
      desc: 'Overview of stock across all sites and warehouses',
      icon: Layers,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      lastUpdated: 'Today, 08:30 AM',
    },
    {
      id: 'stock-movement',
      title: 'Stock Movement Report',
      desc: 'Stock in, out, and inter-site transfer details',
      icon: TrendingDown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      lastUpdated: 'Today, 10:15 AM',
    },
    {
      id: 'consumption',
      title: 'Consumption Report',
      desc: 'Material consumption categorized by site & building block',
      icon: FileSpreadsheet,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      lastUpdated: 'Yesterday, 06:00 PM',
    },
    {
      id: 'purchase',
      title: 'Purchase Report',
      desc: 'Purchases, vendor orders, and payment bills',
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      lastUpdated: '27 May 2025',
    },
    {
      id: 'site-wise',
      title: 'Site Wise Report',
      desc: 'Detailed inventory and activity breakdown for each site',
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      lastUpdated: 'Today, 09:45 AM',
    },
    {
      id: 'low-stock',
      title: 'Low Stock Report',
      desc: 'Materials currently below designated minimum safety buffer',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      lastUpdated: '10 mins ago',
    },
  ];

  const handleDownload = (report: ReportCardItem) => {
    const csvRows = [
      ['Report Name', report.title],
      ['Generated On', new Date().toLocaleDateString('en-GB')],
      [],
      ['Material / Item', 'Project Site', 'Quantity', 'Unit', 'Estimated Value (INR)'],
      ...inventory.map((inv) => [
        inv.name,
        inv.site,
        inv.totalStock,
        inv.unit,
        (inv.totalStock * 380).toString(),
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Reports</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate, preview, and export construction analytics and compliance statements
        </p>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Report CSV/PDF successfully compiled and downloaded!</span>
        </div>
      )}

      {/* Reports Grid (6 cards matching Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-[#0D5C3A] transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${report.bgColor} ${report.color} shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#0D5C3A] transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {report.desc}
                  </p>
                  <span className="inline-block mt-2 text-[10px] text-slate-400 font-medium">
                    Updated: {report.lastUpdated}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleDownload(report)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${selectedReport.bgColor} ${selectedReport.color}`}>
                  <selectedReport.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedReport.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    Preview generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Real Report Data Table */}
            <div className="py-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Item / Material</th>
                      <th className="py-2.5 px-3">Site</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No inventory stock records found to compile this report.
                        </td>
                      </tr>
                    ) : (
                      inventory.slice(0, 8).map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-2 px-3 font-semibold text-slate-800">{inv.name}</td>
                          <td className="py-2 px-3 text-slate-500">{inv.site}</td>
                          <td className="py-2 px-3 font-bold text-slate-700">{inv.totalStock} {inv.unit}</td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                            ₹{(inv.totalStock * 380).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedReport);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Export CSV / PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
