import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboardContext } from '../context/DashboardContext';
import { EmptyState } from '../components/common/EmptyState';
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
} from 'lucide-react';
import { Button } from '../components/Button';

export const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    sites,
    inventory,
    lowStockAlerts,
    materialRequests,
    deliveries,
    photos,
    selectedSite,
    setSelectedSite,
    sitesList,
    myAssignedSites,
    refreshData,
    isLoadingData,
  } = useDashboardContext();

  const supervisorName = user?.name || 'User_Name';

  // Determine active assigned site strictly from supervisor's assigned sites (NO sites[0] auto-assign)
  const myAssignedSite =
    myAssignedSites.find((s) => s.name === selectedSite) ||
    myAssignedSites[0] ||
    null;

  const siteName = myAssignedSite ? myAssignedSite.name : '';

  // Filter metrics strictly for this assigned site; if no site is assigned, keep arrays empty
  const siteInventory = siteName
    ? inventory.filter((i) => i.site === siteName)
    : [];

  const siteAlerts = siteName
    ? lowStockAlerts.filter((a) => a.site === siteName)
    : [];

  const siteDeliveries = siteName
    ? deliveries.filter((d) => d.site === siteName)
    : [];

  const myRequests = siteName
    ? materialRequests.filter((r) => r.site === siteName)
    : [];

  const sitePhotos = siteName
    ? photos.filter((p) => p.site === siteName)
    : [];

  const pendingIndentsCount = myRequests.filter((r) => r.status === 'Pending').length;
  const expectedDeliveriesCount = siteDeliveries.filter((d) => d.status === 'In Transit' || d.status === 'Expected').length;

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

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
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
          {/* Action 1: Stock In */}
          <Link
            to="/stock-in"
            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-[#0D5C3A] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0D5C3A] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownToLine className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Inbound
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#0D5C3A] transition-colors">
                Record Stock In
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Log arriving cement, steel & delivery challans with invoice photos
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0D5C3A]">
              <span>Receive Material</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 2: Stock Out */}
          <Link
            to="/stock-out"
            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpFromLine className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                Disbursement
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                Record Stock Out
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Issue materials to contractors, column casting, or masonry stages
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Issue to Site Work</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 3: Photo Monitoring */}
          <Link
            to="/photo-monitoring"
            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Milestones
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Upload Progress Photo
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Document daily construction progress, slab casting & site conditions
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>Capture & Upload</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 4: Material Indents */}
          <Link
            to="/material-requests"
            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Indent
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                Raise Material Indent
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Request new cement, TMT rods, or sand allocations from Head Office
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Create Indent</span>
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
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today's Deliveries</span>
            <span className="text-xl font-extrabold text-slate-900">{expectedDeliveriesCount} Expected</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">My Indent Status</span>
            <span className="text-xl font-extrabold text-amber-700">{pendingIndentsCount} Pending</span>
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
                    actionLabel="+ Record Stock In"
                    onAction={() => navigate('/stock-in')}
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
                        to="/stock-in"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-[#0D5C3A] transition-colors"
                        title="Stock In"
                      >
                        <Plus className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Material Indents / Requisitions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">My Material Requisitions (Indents)</h3>
                  <p className="text-[11px] text-slate-500">Status of requests submitted to Head Office for approval</p>
                </div>
              </div>
              <Button
                variant="brand"
                size="sm"
                onClick={() => navigate('/material-requests')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                New Indent
              </Button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {myRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <p className="font-semibold text-slate-700">No Indent Requests Submitted</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Submit indents whenever site inventory drops below threshold.</p>
                </div>
              ) : (
                myRequests.slice(0, 4).map((r) => (
                  <div key={r.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{r.requestId}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          r.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : r.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-slate-800 font-semibold mt-1">
                        {r.quantity} {r.unit} of {r.material}
                      </p>
                      <p className="text-[11px] text-slate-400">Required: {r.requiredDate || 'Urgent'}</p>
                    </div>

                    <div className="text-right text-[11px] text-slate-500">
                      {r.status === 'Approved' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Under Review</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Today's Gate Deliveries & Progress Photo Reel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Inbound Consignments / Gate Deliveries */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#0D5C3A]" />
                <h3 className="text-sm font-bold text-slate-900">Arriving Consignments</h3>
              </div>
              <Link to="/deliveries" className="text-xs font-bold text-[#0D5C3A] hover:underline">
                Gate Log
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {siteDeliveries.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-semibold">No Consignments in Transit</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dispatched material trucks will display here for site verification.</p>
                </div>
              ) : (
                siteDeliveries.slice(0, 4).map((d) => (
                  <div key={d.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{d.deliveryId}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          d.status === 'Received' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {d.supplier} &bull; {d.material}
                      </p>
                      <p className="text-[11px] text-slate-500">Qty: {d.receivedQty || d.expectedQty} {d.unit}</p>
                    </div>

                    <Link
                      to="/stock-in"
                      className="px-2.5 py-1 bg-[#0D5C3A] hover:bg-[#094228] text-white rounded text-[11px] font-bold transition-colors shrink-0 shadow-2xs"
                    >
                      Verify
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Site Progress Photos Reel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Progress Photos</h3>
              </div>
              <Link to="/photo-monitoring" className="text-xs font-bold text-[#0D5C3A] hover:underline">
                Upload New
              </Link>
            </div>

            {sitePhotos.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <Camera className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No Photos Uploaded for this Site</p>
                <p className="text-[11px] text-slate-400">Take site progress photos to verify work milestones.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/photo-monitoring')}
                  className="mt-2"
                >
                  Upload Site Photo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {sitePhotos.slice(0, 4).map((p) => (
                  <div key={p.id} className="rounded-xl overflow-hidden border border-slate-200 aspect-4/3 relative group shadow-2xs">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                      <span className="text-[11px] font-bold truncate">{p.title}</span>
                      <span className="text-[9px] text-slate-300">{p.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
