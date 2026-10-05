import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboardContext } from '../context/DashboardContext';
import { EmptyState } from '../components/common/EmptyState';
import { constructionService } from '../services/construction.service';
import {
  HardHat,
  ArrowDownToLine,
  ArrowUpFromLine,
  Camera,
  FileSpreadsheet,
  Building2,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Plus,
  Boxes,
  Phone,
  Layers,
  ArrowRight,
  Send,
  Bell,
  MessageSquare,
  X,
} from 'lucide-react';
import { Button } from '../components/Button';

export const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    sites,
    inventory,
    lowStockAlerts,
    inwardEntries,
    outwardEntries,
    materialRequests,
    labourEntries,
    selectedSite,
    setSelectedSite,
    sitesList,
    myAssignedSites,
    activities,
    refreshData,
    isLoadingData,
  } = useDashboardContext();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [requestCategory, setRequestCategory] = useState<'material' | 'work' | 'words'>('material');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  const supervisorName = user?.name || 'Supervisor';

  // Determine active assigned site strictly from supervisor's assigned sites (NO sites[0] auto-assign)
  const myAssignedSite =
    myAssignedSites.find((s) => s.name === selectedSite) ||
    myAssignedSites[0] ||
    null;

  const siteName = myAssignedSite ? myAssignedSite.name : '';
  const siteRequests = materialRequests.filter((r) => !siteName || r.site === siteName);

  const handleSendSupervisorRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) return;
    try {
      setRequestSubmitting(true);
      const prefix =
        requestCategory === 'material'
          ? 'Material Indent Request'
          : requestCategory === 'work'
          ? 'Site Status Update'
          : 'Supervisor Message';
      await constructionService.createActivity({
        text: `${prefix}: ${requestText.trim()}`,
        site: siteName || (sites[0]?.name || 'My Site'),
        type: 'request',
        words: requestText.trim(),
        actor: supervisorName,
        targetRole: 'admin',
      });
      setRequestText('');
      setShowRequestModal(false);
      await refreshData();
    } catch (err) {
      console.error('Failed to dispatch request to admin:', err);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const adminNotices = activities.filter(
    (act) => act.targetRole === 'supervisor' || act.actor === 'Admin' || act.type === 'delivery'
  );

  // Filter metrics strictly for this assigned site; if no site is assigned, keep arrays empty
  const siteInventory = siteName
    ? inventory.filter((i) => i.site === siteName)
    : [];

  const siteAlerts = siteName
    ? lowStockAlerts.filter((a) => a.site === siteName)
    : [];

  const siteInward = siteName
    ? inwardEntries.filter((e) => !e.material || e.material.toLowerCase().includes(siteName.toLowerCase()))
    : inwardEntries;

  const siteOutward = siteName
    ? outwardEntries.filter((e) => e.site === siteName || e.project === siteName)
    : outwardEntries;

  const siteLabour = siteName
    ? labourEntries.filter((e) => e.site === siteName || e.project === siteName)
    : labourEntries;

  return (
    <div className="space-y-6">
      {/* Top Header Greeting & Role Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {supervisorName}!</span>
            <span>👷‍♂️</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <span>On-Site Construction Operations • Role: <strong className="text-slate-800 font-bold">Site Supervisor</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <Button
            variant="brand"
            size="sm"
            onClick={() => setShowRequestModal(true)}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Send Word / Request to Admin
          </Button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
            <HardHat className="w-3.5 h-3.5 text-amber-600" />
            <span>Supervisor Portal</span>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Active Project Site Banner Card */}
      {myAssignedSite ? (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0A3925] rounded-2xl p-6 text-white shadow-md border border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-400 shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Assigned Site
                  </span>
                  <span className="font-mono text-xs text-slate-300 font-semibold">{myAssignedSite.code}</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">{myAssignedSite.name}</h3>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {myAssignedSite.location}
                  </span>
                  <span>&bull;</span>
                  <span>Project: {myAssignedSite.projectType || 'Residential'}</span>
                  <span>&bull;</span>
                  <span>Contact: {myAssignedSite.contact || '98765 43210'}</span>
                </p>
              </div>
            </div>

            {/* Site Switcher Dropdown (Only for supervisor's assigned sites) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              {myAssignedSites.length > 1 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-xs">
                  <span className="text-slate-300 text-[11px] font-medium">Switch Site:</span>
                  <select
                    value={siteName}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
                  >
                    {myAssignedSites.map((s) => (
                      <option key={s.id} value={s.name} className="text-slate-900">
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Link
                to="/my-site"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Full Site Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <Building2 className="w-7 h-7" />
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-200/80 text-amber-900 mb-2 inline-block">
            Site Assignment Pending
          </span>
          <h3 className="text-lg font-extrabold text-slate-900">No Construction Site Assigned Yet</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
            Your supervisor account (<strong>{user?.email || supervisorName}</strong>) has not been assigned to an active construction site yet.
            <br />
            Please ask the Super Admin (<strong>admin@anandhomes.com</strong>) to assign a site to your profile in the <strong>Sites Management</strong> portal.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshData()}
              className="border-slate-300 hover:bg-white text-slate-700 font-bold"
            >
              Refresh Status
            </Button>
          </div>
        </div>
      )}

      {/* Primary Supervisor Actions Grid (4 Big Visual Cards) */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Field Operations & Daily Tasks</span>
          <span className="text-slate-400 text-xs font-normal">• One-click site actions</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Material Inward */}
          <Link
            to="/material-inward"
            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-[#0D5C3A] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0D5C3A] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownToLine className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Inward
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#0D5C3A] transition-colors">
                Material Inward
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Log arriving cement, steel & vendor shipments with auto-unit cost
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0D5C3A]">
              <span>Record Inward</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 2: Material Outward */}
          <Link
            to="/material-outward"
            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpFromLine className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                Outward
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                Material Outward
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Disburse materials by project, site, and specific nature of work
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Issue Material</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 3: Labour Entry */}
          <Link
            to="/labour-entry"
            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HardHat className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Labour
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Labour Entry
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Log on-site daily worker headcounts and labour task assignments
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>Record Labour</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 4: Stock Balance Tracking */}
          <Link
            to="/inventory"
            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Stock
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                Stock Balance Tracking
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Real-time stock balance calculated as Inward minus Outward
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>View Balance</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4 On-Site Operational KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#0D5C3A] flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">On-Site Materials</span>
            <span className="text-xl font-extrabold text-slate-900">{siteInventory.length} Items</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            siteAlerts.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Low Stock Items</span>
            <span className={`text-xl font-extrabold ${siteAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {siteAlerts.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Inward Logs</span>
            <span className="text-xl font-extrabold text-slate-900">{siteInward.length} Entries</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Labour Logs</span>
            <span className="text-xl font-extrabold text-amber-700">{siteLabour.length} Entries</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Left (Material Gauges & Indents) | Right (Deliveries & Photo Gallery) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Real-Time Stock Status Gauges & My Indents */}
        <div className="lg:col-span-7 space-y-6">
          {/* Site Material Stock Gauges */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Site Material Stock Levels</h3>
                  <p className="text-[11px] text-slate-500">Real-time inventory and safety buffer thresholds at {siteName}</p>
                </div>
              </div>
              <Link to="/inventory" className="text-xs font-bold text-[#0D5C3A] hover:underline">
                View Full Inventory
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {siteInventory.length === 0 ? (
                <div className="p-8 text-center">
                  <EmptyState
                    icon={<Package className="w-8 h-8 text-slate-400" />}
                    title="No Materials Recorded for this Site"
                    description="Receive delivery trucks or register material quantities to track stock levels at this project site."
                    actionLabel="+ Record Material Inward"
                    onAction={() => navigate('/material-inward')}
                  />
                </div>
              ) : (
                siteInventory.slice(0, 6).map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        <Boxes className="w-4 h-4 text-[#0D5C3A]" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{item.name}</span>
                        <span className="text-[11px] text-slate-500">
                          Category: {item.category} • Min Reorder Buffer: {item.minStock} {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {item.totalStock.toLocaleString()} {item.unit}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full inline-block mt-0.5 ${
                          item.status === 'Good'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'Medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.status} Stock
                        </span>
                      </div>

                      <Link
                        to="/material-inward"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-[#0D5C3A] transition-colors"
                        title="Record Inward"
                      >
                        <Plus className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Site Material Requests to Admin */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Site Material Requests to Admin</h3>
                  <p className="text-[11px] text-slate-500">Material indents and requisitions raised for {siteName}</p>
                </div>
              </div>
              <Button
                variant="brand"
                size="sm"
                onClick={() => navigate('/material-requests')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Request Materials
              </Button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {siteRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <p className="font-semibold text-slate-700">No Material Requests Raised Yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Need additional supplies or materials on-site? Submit a request to central admin.</p>
                </div>
              ) : (
                siteRequests.slice(0, 4).map((req) => (
                  <div key={req.id || req.requestId} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{req.material}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0D5C3A] border border-emerald-200">
                          {req.site}
                        </span>
                      </div>
                      <p className="text-slate-800 font-semibold mt-1">
                        {req.quantity} {req.unit}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {req.purpose ? `Purpose: ${req.purpose}` : `Urgency: ${req.urgency || 'Normal'}`} • Need: {req.requiredDate || 'Immediate'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.status === 'Approved' ? (
                          <Truck className="w-3 h-3 text-emerald-600" />
                        ) : req.status === 'Rejected' ? (
                          <X className="w-3 h-3 text-rose-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{req.status === 'Approved' ? 'Materials Sent' : req.status}</span>
                      </span>
                      {req.status === 'Approved' && (
                        <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          {req.dispatchedQty || req.quantity} {req.unit} in site stock
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Inbound Entries & Labour Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Admin Instructions & Delivery Notices Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Admin Instructions & Notices</h3>
                  <p className="text-[11px] text-slate-500">Live delivery alerts and instructions from central admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(true)}
                className="px-2.5 py-1 text-xs font-bold text-[#0D5C3A] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Send Word</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs max-h-72 overflow-y-auto">
              {adminNotices.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <p className="font-semibold text-slate-600">No New Admin Notices</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Instructions and consignment dispatches from Admin will appear here.</p>
                </div>
              ) : (
                adminNotices.slice(0, 5).map((notice) => (
                  <div key={notice.id} className="p-3.5 hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 text-xs block">{notice.text}</span>
                      {notice.subtext && <p className="text-[11px] text-slate-600">{notice.subtext}</p>}
                      {notice.words && (
                        <p className="text-[11px] text-slate-700 italic bg-amber-50/70 p-1.5 rounded-md border border-amber-100 mt-1">
                          "{notice.words}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">{notice.site}</span>
                        <span>&bull; From Admin</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{notice.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Material Inward Logs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ArrowDownToLine className="w-4 h-4 text-[#0D5C3A]" />
                <h3 className="text-sm font-bold text-slate-900">Recent Material Inward</h3>
              </div>
              <Link to="/material-inward" className="text-xs font-bold text-[#0D5C3A] hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {siteInward.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <ArrowDownToLine className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-semibold">No Inward Deliveries Recorded</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Arriving materials will display here.</p>
                </div>
              ) : (
                siteInward.slice(0, 4).map((inEntry) => (
                  <div key={inEntry.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{inEntry.entryCode}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {inEntry.category}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {inEntry.quantity} {inEntry.measurement} &bull; {inEntry.material}
                      </p>
                      <p className="text-[11px] text-slate-500">Date: {inEntry.date}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-800 block text-xs">
                        ₹{inEntry.totalValue ? inEntry.totalValue.toLocaleString('en-IN') : '0'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Labour Entries Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Labour Workforce</h3>
              </div>
              <Link to="/labour-entry" className="text-xs font-bold text-[#0D5C3A] hover:underline">
                Record New
              </Link>
            </div>

            {siteLabour.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <HardHat className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No Labour Entries Recorded Today</p>
                <p className="text-[11px] text-slate-400">Log on-site worker counts to track daily site workforce.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/labour-entry')}
                  className="mt-2"
                >
                  + Add Labour Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {siteLabour.slice(0, 4).map((lab) => (
                  <div key={lab.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{lab.natureOfWork}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          {lab.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Project: {lab.project} &bull; Site: {lab.site}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 block">{lab.workerCount}</span>
                      <span className="text-[10px] text-slate-400">Workers</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Send Word / Request to Admin Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0D5C3A]" />
                <h3 className="text-base font-bold text-slate-900">Send Request / Word to Admin</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendSupervisorRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Active Site</label>
                <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800">
                  {siteName || 'Assigned Project Site'}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Request Category</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestCategory('material')}
                    className={`py-1.5 px-2 rounded-lg font-semibold text-center border transition-all ${
                      requestCategory === 'material'
                        ? 'bg-emerald-50 border-[#0D5C3A] text-[#0D5C3A]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📦 Material Indent
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestCategory('work')}
                    className={`py-1.5 px-2 rounded-lg font-semibold text-center border transition-all ${
                      requestCategory === 'work'
                        ? 'bg-emerald-50 border-[#0D5C3A] text-[#0D5C3A]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🏗️ Site Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestCategory('words')}
                    className={`py-1.5 px-2 rounded-lg font-semibold text-center border transition-all ${
                      requestCategory === 'words'
                        ? 'bg-emerald-50 border-[#0D5C3A] text-[#0D5C3A]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    💬 Message/Word
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Request Details / Message *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Urgent requirement of 150 bags OPC cement and 2 tonnes 12mm rebar for slab casting on Friday."
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={requestSubmitting || !requestText.trim()}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  {requestSubmitting ? 'Sending...' : 'Send to Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
