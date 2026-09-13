import React, { useState, useEffect } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { constructionService } from '../services/construction.service';
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
  Loader2,
  Filter,
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
  const { sites, inventory, materialRequests, deliveries, activities, selectedSite, setSelectedSite, sitesList } =
    useDashboardContext();
  const [selectedReport, setSelectedReport] = useState<ReportCardItem | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const reports: ReportCardItem[] = [
    {
      id: 'daily-stock',
      title: 'Daily Stock Summary Report',
      desc: 'Real-time stock balance, category distribution, and inventory valuation',
      icon: Layers,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      lastUpdated: 'Live from MongoDB',
    },
    {
      id: 'material-movement',
      title: 'Material Movement & Inward/Outward Audit',
      desc: 'Chronological timeline of receipts, disbursements, and dispatches',
      icon: TrendingDown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      lastUpdated: 'Live from MongoDB',
    },
    {
      id: 'consumption-requests',
      title: 'Consumption & Indent Requests',
      desc: 'Material requirements raised by on-site supervisors with approval status',
      icon: FileSpreadsheet,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      lastUpdated: 'Live from MongoDB',
    },
    {
      id: 'vendor-deliveries',
      title: 'Vendor Consignments & Delivery Logs',
      desc: 'Purchase orders, delivery challans, vehicle dispatches, and gate entries',
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      lastUpdated: 'Live from MongoDB',
    },
    {
      id: 'site-valuation',
      title: 'Site-Wise Inventory Valuation Breakdown',
      desc: 'Active construction sites, material diversity, and total asset valuation',
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      lastUpdated: 'Live from MongoDB',
    },
    {
      id: 'low-stock',
      title: 'Low Stock Safety Buffer Statement',
      desc: 'Immediate shortfall alerts and materials below replenishment thresholds',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      lastUpdated: 'Live from MongoDB',
    },
  ];

  // Load preview data when a report is selected
  useEffect(() => {
    if (!selectedReport) {
      setReportData(null);
      return;
    }

    let isMounted = true;
    setIsLoadingPreview(true);

    constructionService
      .getReportData(selectedReport.id, selectedSite)
      .then((data) => {
        if (isMounted) setReportData(data);
      })
      .catch((err) => {
        console.warn('Backend report preview fallback to context data:', err);
        // Compute live fallback from active context if offline
        if (isMounted) {
          setReportData(buildContextReportFallback(selectedReport.id, selectedSite));
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedReport, selectedSite, inventory, activities, materialRequests, deliveries, sites]);

  // Fallback builder that uses real context state
  const buildContextReportFallback = (reportId: string, siteFilter?: string) => {
    const filterSite = siteFilter && siteFilter !== 'All Sites' ? siteFilter : null;
    const nowIso = new Date().toISOString();

    if (reportId === 'daily-stock') {
      const items = filterSite ? inventory.filter((i) => i.site === filterSite) : inventory;
      const headers = ['Material Name', 'Category', 'Site', 'Current Stock', 'Unit', 'Min Buffer', 'Status'];
      const rows = items.map((i) => [i.name, i.category, i.site, String(i.totalStock), i.unit, String(i.minStock), i.status]);
      return {
        title: 'Daily Stock Summary Report',
        site: filterSite || 'All Sites',
        headers,
        rows,
        summary: { totalItems: items.length },
      };
    } else if (reportId === 'material-movement') {
      const acts = filterSite ? activities.filter((a) => a.site === filterSite) : activities;
      const headers = ['Timestamp', 'Type', 'Material', 'Site', 'Details', 'Logged By'];
      const rows = acts.map((a: any) => [
        a.time || a.timestamp || '',
        a.type === 'stock_in' ? 'Stock In' : a.type === 'stock_out' ? 'Stock Out' : a.type || '',
        a.material || a.subtext || '',
        a.site || '',
        a.text || '',
        a.user || a.requestedBy || 'Site Staff',
      ]);
      return {
        title: 'Material Movement & Inward/Outward Audit',
        site: filterSite || 'All Sites',
        headers,
        rows,
        summary: { totalTransactions: acts.length },
      };
    } else if (reportId === 'consumption-requests') {
      const reqs = filterSite ? materialRequests.filter((r) => r.site === filterSite) : materialRequests;
      const headers = ['Request ID', 'Site', 'Material', 'Quantity', 'Unit', 'Purpose / Need Date', 'Status'];
      const rows = reqs.map((r: any) => [
        r.requestId || r.id,
        r.site,
        r.material,
        String(r.quantity),
        r.unit,
        r.purpose || r.requiredDate || r.urgency || 'Normal',
        r.status,
      ]);
      return {
        title: 'Consumption & Indent Requests',
        site: filterSite || 'All Sites',
        headers,
        rows,
        summary: { totalRequests: reqs.length },
      };
    } else if (reportId === 'vendor-deliveries') {
      const delivs = filterSite ? deliveries.filter((d) => d.site === filterSite) : deliveries;
      const headers = ['Challan ID', 'Supplier', 'Site', 'Material', 'Expected', 'Received', 'Unit', 'Status'];
      const rows = delivs.map((d) => [d.id, d.supplier, d.site, d.material, String(d.expectedQty), String(d.receivedQty), d.unit, d.status]);
      return {
        title: 'Vendor Consignments & Delivery Logs',
        site: filterSite || 'All Sites',
        headers,
        rows,
        summary: { totalDeliveries: delivs.length },
      };
    } else if (reportId === 'site-wise') {
      const sList = filterSite ? sites.filter((s) => s.name === filterSite) : sites;
      const headers = ['Site Code', 'Site Name', 'Location', 'Supervisor', 'Status', 'Materials', 'Stock Value'];
      const rows = sList.map((s) => [s.code, s.name, s.location, s.supervisor, s.status, String(s.totalMaterials), s.stockValueFormatted || '₹0']);
      return {
        title: 'Site-Wise Inventory Valuation Breakdown',
        site: filterSite || 'All Sites',
        headers,
        rows,
        summary: { totalSites: sList.length },
      };
    } else {
      const items = inventory.filter((i) => i.status === 'Low' || i.status === 'Out of Stock');
      const filtered = filterSite ? items.filter((i) => i.site === filterSite) : items;
      const headers = ['Material Name', 'Category', 'Site', 'Current Stock', 'Min Required', 'Status'];
      const rows = filtered.map((i) => [i.name, i.category, i.site, String(i.totalStock), String(i.minStock), i.status]);
      return {
        title: 'Low Stock Safety Buffer Statement',
        site: filterSite || 'All Sites',
        headers,
        rows,
        summary: { criticalItems: filtered.length },
      };
    }
  };

  const handleDownload = async (report: ReportCardItem) => {
    setIsDownloading(report.id);
    try {
      const blob = await constructionService.downloadReportCsv(report.id, selectedSite);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `anand_homes_${report.id}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(`"${report.title}" CSV successfully exported!`);
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (err) {
      console.warn('Backend download fallback to client generation:', err);
      const data = buildContextReportFallback(report.id, selectedSite);
      const csvRows = [
        ['ANAND HOMES CONSTRUCTION MANAGEMENT PLATFORM'],
        ['Report:', data.title],
        ['Site Scope:', data.site],
        ['Generated At:', new Date().toISOString()],
        [],
        data.headers,
        ...data.rows,
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `anand_homes_${report.id}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(`"${report.title}" CSV exported from live session!`);
      setTimeout(() => setDownloadSuccess(null), 3500);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Site Scope Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Real-Time Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compile, preview, and download authenticated live construction data and financial audits
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-[#0D5C3A]" />
            <span>Site Filter:</span>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="bg-transparent font-bold text-[#0D5C3A] focus:outline-none cursor-pointer text-xs"
            >
              {sitesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Reports Grid (6 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          const downloadingThis = isDownloading === report.id;

          return (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-[#0D5C3A] transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${report.bgColor} ${report.color} shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#0D5C3A] transition-colors">
                      {report.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {report.desc}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{report.lastUpdated}</span>
                    </span>
                    {selectedSite && selectedSite !== 'All Sites' && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Scoped: {selectedSite}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedReport(report)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview Data</span>
                </button>
                <button
                  type="button"
                  disabled={downloadingThis}
                  onClick={() => handleDownload(report)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {downloadingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{downloadingThis ? 'Exporting...' : 'Download CSV'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Live Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${selectedReport.bgColor} ${selectedReport.color}`}>
                  <selectedReport.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedReport.title}</h3>
                  <p className="text-xs text-slate-400">
                    Live database query • Scope: <strong className="text-slate-700">{selectedSite || 'All Sites'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with Live Data */}
            <div className="py-4 overflow-y-auto flex-1 space-y-4">
              {isLoadingPreview ? (
                <div className="py-16 text-center space-y-2">
                  <Loader2 className="w-7 h-7 text-[#0D5C3A] animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">Compiling live report records from database...</p>
                </div>
              ) : reportData ? (
                <>
                  {/* Summary Bar */}
                  {reportData.summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {Object.entries(reportData.summary).map(([key, val]) => (
                        <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </div>
                          <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                            {String(val)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="overflow-x-auto max-h-80">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                          <tr>
                            {reportData.headers?.map((h: string, idx: number) => (
                              <th key={idx} className="py-2.5 px-3 whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reportData.rows?.length === 0 ? (
                            <tr>
                              <td colSpan={reportData.headers?.length || 4} className="py-10 text-center text-slate-400 font-medium">
                                No records found matching this report scope.
                              </td>
                            </tr>
                          ) : (
                            reportData.rows?.map((row: string[], rIdx: number) => (
                              <tr key={rIdx} className="hover:bg-slate-50/50">
                                {row.map((cell: string, cIdx: number) => (
                                  <td key={cIdx} className="py-2 px-3 text-slate-700 whitespace-nowrap font-medium text-[11px]">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  Unable to load report preview.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isDownloading === selectedReport.id}
                onClick={() => handleDownload(selectedReport)}
                className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDownloading === selectedReport.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Download Report CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
