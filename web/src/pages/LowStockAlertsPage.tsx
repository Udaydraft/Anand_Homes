import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboardContext } from '../context/DashboardContext';
import {
  AlertTriangle,
  ArrowRight,
  Package,
  Plus,
  BarChart3,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/common/EmptyState';

export const LowStockAlertsPage: React.FC = () => {
  const { lowStockAlerts } = useDashboardContext();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Low Stock Alerts</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Proactive threshold warnings to prevent site downtime and material shortages
        </p>
      </div>

      {lowStockAlerts.length === 0 ? (
        <EmptyState
          variant="card"
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
          title="All Stock Levels Optimal"
          description="Great job! None of your construction materials are currently below their safety threshold across any active sites."
          actionLabel="View Inventory"
          onAction={() => navigate('/inventory')}
        />
      ) : (
        <>
          {/* Warning Banner Matching Mockup */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm">
                  {String(lowStockAlerts.length).padStart(2, '0')} items are below minimum level
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Urgent replenishment recommended to maintain construction schedule across active sites
                </p>
              </div>
            </div>
            <Button
              variant="brand"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => navigate('/material-requests')}
            >
              Create Indent
            </Button>
          </div>

      {/* Items List Cards */}
      <div className="space-y-3">
        {lowStockAlerts.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-300 transition-all"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  item.status === 'Low' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}
              >
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{item.material}</h4>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      item.status === 'Low' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.status} Alert
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.site}</span>
                  <span>&bull;</span>
                  <span>
                    Current: <strong className="text-slate-800">{item.currentStock} {item.unit}</strong>
                  </span>
                  <span>&bull;</span>
                  <span>
                    Reorder Level: <strong className="text-slate-800">{item.reorderLevel} {item.unit}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <strong>Recommendation:</strong> {item.recommendation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Link
                to="/material-requests"
                className="px-3 py-1.5 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Create Request
              </Link>
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {/* Bottom Actions */}
      <div className="pt-2 flex items-center justify-between">
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0D5C3A] hover:underline"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View All Inventory Reports</span>
        </Link>
      </div>
    </div>
  );
};
