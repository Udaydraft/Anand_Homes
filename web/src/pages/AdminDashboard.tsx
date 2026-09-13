import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboardContext } from '../context/DashboardContext';
import { StockBarChart } from '../components/StockBarChart';
import { EmptyState } from '../components/common/EmptyState';
import { ImageUploadField } from '../components/common/ImageUploadField';
import { userService } from '../services/user.service';
import {
  Building2,
  Package,
  Coins,
  AlertTriangle,
  FileText,
  Clock,
  Truck,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus,
  MapPin,
  Shield,
  Layers,
  FileSpreadsheet,
  Download,
  Eye,
  X,
  Compass,
} from 'lucide-react';
import { Button } from '../components/Button';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    sites,
    inventory,
    lowStockAlerts,
    materialRequests,
    deliveries,
    activities,
    approveRequest,
    rejectRequest,
    addSite,
    isLoadingData,
  } = useDashboardContext();

  const [supervisors, setSupervisors] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSite, setNewSite] = useState({
    name: '',
    code: '',
    location: '',
    supervisor: '',
    projectType: 'Residential Project',
    imageUrl: '',
  });

  useEffect(() => {
    userService
      .listUsers('supervisor')
      .then((res) => {
        if (Array.isArray(res)) {
          setSupervisors(res.map((u) => ({ id: u.id, name: u.name, email: u.email })));
          if (res.length > 0 && !newSite.supervisor) {
            setNewSite((prev) => ({ ...prev, supervisor: res[0].name }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const userName = user?.name || 'Admin';

  // Real calculations
  const totalSitesCount = sites.length;
  const activeSitesCount = sites.filter((s) => s.status === 'Active').length;
  const totalMaterialsCount = inventory.length;
  const totalStockValue = sites.reduce((acc, s) => acc + (s.stockValue || 0), 0);
  const formattedStockValue =
    totalStockValue >= 10000000
      ? `₹${(totalStockValue / 10000000).toFixed(1)} Cr`
      : totalStockValue >= 100000
      ? `₹${(totalStockValue / 100000).toFixed(1)} L`
      : `₹${totalStockValue.toLocaleString('en-IN')}`;

  const pendingRequests = materialRequests.filter((r) => r.status === 'Pending');
  const activeDeliveries = deliveries.filter((d) => d.status === 'In Transit' || d.status === 'Expected');
  const isSystemEmpty = totalSitesCount === 0 && totalMaterialsCount === 0;

  // Real weekly stock movement chart data based on actual logged activities
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartBarData = chartDays.map((day) => {
    const dayActs = activities.filter((act) => {
      const timeVal = act.time || (act as any).timestamp;
      if (!timeVal) return false;
      const d = new Date(timeVal);
      if (isNaN(d.getTime())) return false;
      return dayLabels[d.getDay()] === day;
    });
    return {
      day,
      stockIn: dayActs.filter((a) => a.type === 'stock_in').length,
      stockOut: dayActs.filter((a) => a.type === 'stock_out').length,
    };
  });

  const handleCreateSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.location) return;
    addSite({
      name: newSite.name,
      code: newSite.code || `RBL-S-00${sites.length + 1}`,
      location: newSite.location,
      supervisor: newSite.supervisor || (supervisors[0]?.name || 'Unassigned'),
      projectType: newSite.projectType,
      status: 'Active',
      totalMaterials: 0,
      stockValue: 0,
      stockValueFormatted: '₹0',
      imageUrl: newSite.imageUrl || undefined,
    });
    setNewSite({
      name: '',
      code: '',
      location: '',
      supervisor: supervisors[0]?.name || '',
      projectType: 'Residential Project',
      imageUrl: '',
    });
    setShowAddSiteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Role Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {userName}!</span>
            <span>👋</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <span>Executive Management Oversight • Role: <strong className="text-slate-800 font-bold">Super Admin</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0D5C3A] text-xs font-bold shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-[#0D5C3A]" />
            <span>Super Admin Portal</span>
          </div>

          <Button
            variant="brand"
            size="sm"
            onClick={() => setShowAddSiteModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Project Site
          </Button>
        </div>
      </div>

      {/* Onboarding Banner when no sites exist */}
      {isSystemEmpty && (
        <div className="bg-gradient-to-r from-emerald-900 via-[#0D5C3A] to-emerald-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Head Office Setup Mode</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Welcome to AnandHomes Enterprise Management!
            </h3>
            <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
              Your system is currently clean and ready for real operational data. Start by creating your first construction project site and appointing site supervisors.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddSiteModal(true)}
              className="px-4 py-2.5 bg-white text-[#0D5C3A] hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create First Project Site</span>
            </button>
            <Link
              to="/inventory"
              className="px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all border border-white/20"
            >
              View Inventory
            </Link>
          </div>
        </div>
      )}

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sites */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-[#0D5C3A] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Sites</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-slate-900">{totalSitesCount}</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {activeSitesCount} Active
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">All Locations</span>
            <Link to="/sites" className="text-[#0D5C3A] font-bold hover:underline flex items-center gap-1">
              <span>Manage</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Materials */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-[#0D5C3A] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Materials</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-slate-900">{totalMaterialsCount}</h3>
            <span className="text-xs text-slate-500 font-medium">SKUs in Inventory</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Global Registry</span>
            <Link to="/inventory" className="text-[#0D5C3A] font-bold hover:underline flex items-center gap-1">
              <span>Inventory</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-[#0D5C3A] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Valuation</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-slate-900">{formattedStockValue}</h3>
            <span className="text-xs text-slate-500 font-medium">Across All Sites</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Audited Valuation</span>
            <Link to="/reports" className="text-[#0D5C3A] font-bold hover:underline flex items-center gap-1">
              <span>Reports</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-[#0D5C3A] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${lowStockAlerts.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className={`text-2xl font-extrabold ${lowStockAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {lowStockAlerts.length}
            </h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lowStockAlerts.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {lowStockAlerts.length > 0 ? 'Urgent Attention' : 'All Optimal'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Safety Buffer</span>
            <Link to="/low-stock" className="text-[#0D5C3A] font-bold hover:underline flex items-center gap-1">
              <span>Alerts</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Two-Column Admin Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Pending Approvals & Active Sites */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pending Material Indent Approvals Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pending Material Approvals</h3>
                  <p className="text-[11px] text-slate-500">Site Supervisor Indents requiring Head Office Authorization</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {pendingRequests.length} Pending
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {pendingRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">All Indents Reviewed</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No pending material requisitions waiting for administrative approval.</p>
                </div>
              ) : (
                pendingRequests.slice(0, 4).map((req) => (
                  <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{req.requestId}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {req.site}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm mt-1">
                        {req.quantity} {req.unit} of {req.material}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Requested by: <strong>{req.requestedBy}</strong> • Purpose: {req.purpose || 'General Work'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveRequest(req.id)}
                        className="px-3 py-1.5 bg-[#0D5C3A] hover:bg-[#094228] text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => rejectRequest(req.id)}
                        className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {pendingRequests.length > 4 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <Link to="/material-requests" className="text-xs font-bold text-[#0D5C3A] hover:underline">
                  View All {pendingRequests.length} Indents in Approvals Queue &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Active Construction Sites Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Active Construction Sites</h3>
                  <p className="text-[11px] text-slate-500">Project locations, assigned site engineers & material stock</p>
                </div>
              </div>
              <Link to="/sites" className="text-xs font-bold text-[#0D5C3A] hover:underline">
                View All Sites
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {sites.length === 0 ? (
                <div className="p-8 text-center">
                  <EmptyState
                    icon={<Building2 className="w-8 h-8 text-slate-400" />}
                    title="No Project Sites Added Yet"
                    description="Create your first construction project to begin monitoring site supervisors, stock levels, and daily progress."
                    actionLabel="+ Add Project Site"
                    onAction={() => setShowAddSiteModal(true)}
                  />
                </div>
              ) : (
                sites.slice(0, 5).map((s) => (
                  <div key={s.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={s.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=100&auto=format&fit=crop&q=80'}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-semibold">{s.code}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{s.location}</span>
                          <span>&bull;</span>
                          <span>Supervisor: <strong className="text-slate-700">{s.supervisor}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {s.stockValueFormatted || '₹0'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {s.totalMaterials} Materials
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Activity Analytics & Consignments */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Management Actions Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Executive Controls</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-base font-extrabold text-white">Central Operations Management</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Manage enterprise site assignments, review consignment dispatches, and access live GIS satellite feeds.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/map"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>GIS Site Map</span>
              </Link>
              <Link
                to="/reports"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Audit</span>
              </Link>
            </div>
          </div>

          {/* Weekly Stock Movement Analytics */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stock Movement Analytics</h3>
                <p className="text-[11px] text-slate-500">Weekly inbound deliveries vs site disbursements</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C3A]" />
                  <span className="text-slate-600">Stock In</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5A91E]" />
                  <span className="text-slate-600">Stock Out</span>
                </div>
              </div>
            </div>

            <StockBarChart data={chartBarData} />
          </div>

          {/* Consignments & In-Transit Deliveries */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0D5C3A]" />
                <h3 className="text-sm font-bold text-slate-900">Active Vendor Consignments</h3>
              </div>
              <Link to="/deliveries" className="text-xs font-bold text-[#0D5C3A] hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {deliveries.length === 0 ? (
                <p className="p-6 text-center text-slate-400">No active vendor consignments recorded.</p>
              ) : (
                deliveries.slice(0, 4).map((d) => (
                  <div key={d.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{d.deliveryId}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          d.status === 'Received' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                      <p className="text-slate-700 font-semibold mt-0.5">
                        {d.supplier} &bull; {d.material}
                      </p>
                      <p className="text-[11px] text-slate-400">Destination: {d.site}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-800 block">
                        {d.receivedQty || d.expectedQty} {d.unit}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create New Project Site</h3>
              <button
                onClick={() => setShowAddSiteModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSiteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Site Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Site Alpha - Anna Nagar Heights"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Code</label>
                <input
                  type="text"
                  placeholder={`RBL-S-00${sites.length + 1}`}
                  value={newSite.code}
                  onChange={(e) => setNewSite({ ...newSite, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] font-mono text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anna Nagar West, Chennai"
                  value={newSite.location}
                  onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Site Supervisor</label>
                <select
                  value={newSite.supervisor}
                  onChange={(e) => setNewSite({ ...newSite, supervisor: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-900 font-medium"
                >
                  <option value="">-- Select Supervisor --</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Classification</label>
                <select
                  value={newSite.projectType}
                  onChange={(e) => setNewSite({ ...newSite, projectType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-900 font-medium"
                >
                  <option value="Residential Construction">Residential Construction</option>
                  <option value="Commercial Complex">Commercial Complex</option>
                  <option value="Luxury Villa Community">Luxury Villa Community</option>
                  <option value="Industrial Shed">Industrial Shed</option>
                </select>
              </div>

              <ImageUploadField
                value={newSite.imageUrl}
                onChange={(url) => setNewSite({ ...newSite, imageUrl: url })}
                label="Site / Project Banner Photo"
                helperText="Upload site entrance or 3D elevation photo"
              />

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddSiteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                >
                  Create Site
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
