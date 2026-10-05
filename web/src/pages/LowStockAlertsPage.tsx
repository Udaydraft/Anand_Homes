import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Package,
  Plus,
  BarChart3,
  MapPin,
  CheckCircle2,
  Filter,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/common/EmptyState';
import { constructionService } from '../services/construction.service';
import { LowStockAlertItem } from '@project/shared';

export const LowStockAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<LowStockAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('ALL');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Fetch across ALL project sites
      const data = await constructionService.getLowStock();
      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to load low stock alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Extract unique project/site names for the filter
  const uniqueSites = Array.from(new Set(alerts.map((a) => a.site).filter(Boolean)));

  const filteredAlerts =
    selectedProject === 'ALL'
      ? alerts
      : alerts.filter((a) => a.site === selectedProject);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Low Stock Alerts</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
              All Projects
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time threshold warnings across all project sites to prevent material shortages
          </p>
        </div>

        {/* Project Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-[#0A3925]"
          >
            <option value="ALL">All Projects ({alerts.length})</option>
            {uniqueSites.map((site) => (
              <option key={site} value={site}>
                {site} ({alerts.filter((a) => a.site === site).length})
              </option>
            ))}
          </select>
          <Button
            variant="brand"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/material-inward')}
          >
            Inward Entry
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#0A3925]" />
          <span className="text-xs">Checking stock thresholds across all projects...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          variant="card"
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
          title={selectedProject === 'ALL' ? 'All Project Stock Levels Optimal' : `Stock Levels Optimal for ${selectedProject}`}
          description="None of your construction materials are currently below their safety threshold."
          actionLabel="View Inventory"
          onAction={() => navigate('/inventory')}
        />
      ) : (
        <>
          {/* Warning Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm">
                  {String(filteredAlerts.length).padStart(2, '0')} items require replenishment
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Showing safety buffer warnings across all active construction projects
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/material-inward')}
            >
              + Inward Material
            </Button>
          </div>

          {/* Items List Cards */}
          <div className="space-y-3">
            {filteredAlerts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-300 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      item.status === 'Critical' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{item.material}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Critical' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.status} Alert
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.site}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">Project / Site: {item.site}</span>
                      <span>&bull;</span>
                      <span>
                        Current Stock: <strong className="text-slate-800">{item.currentStock} {item.unit}</strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Reorder Level: <strong className="text-slate-800">{item.reorderLevel} {item.unit}</strong>
                      </span>
                    </div>
                    {item.recommendation && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <strong>Recommendation:</strong> {item.recommendation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="brand"
                    size="sm"
                    onClick={() => navigate('/material-inward')}
                  >
                    Inward Entry
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom Actions */}
      <div className="pt-2 flex items-center justify-between">
        <Link
          to="/projects?tab=reports"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0D5C3A] hover:underline"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View All Inventory Reports</span>
        </Link>
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <span>Inventory Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
