import React from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  User,
  Phone,
  Calendar,
  Layers,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  Camera,
  Upload,
  ChevronRight,
  Clock,
  Package,
  FileSpreadsheet,
  HardHat,
  Truck,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const MySitePage: React.FC = () => {
  const {
    selectedSite,
    setSelectedSite,
    sites,
    myAssignedSites,
    isSupervisor,
    roleMode,
    photos,
    inventory,
    deliveries,
  } = useDashboardContext();
  const navigate = useNavigate();

  // If supervisor, strictly scope to myAssignedSites; if admin, scope to sites
  const supervisorMode = isSupervisor || roleMode === 'supervisor';
  const targetSites = supervisorMode ? (myAssignedSites.length > 0 ? myAssignedSites : sites) : sites;
  const site = targetSites.find((s) => s.name === selectedSite) || targetSites[0] || null;

  if (!site) {
    return (
      <EmptyState
        variant="card"
        icon={<Building2 className="w-10 h-10 text-amber-500" />}
        title="No Project Site Assigned"
        description="You currently do not have any construction sites assigned to your supervisor account. Please ask an administrator to assign a site to your profile in the Project & Site Master portal."
        actionLabel="Back to Dashboard"
        onAction={() => navigate(supervisorMode ? '/supervisor/dashboard' : '/admin/dashboard')}
      />
    );
  }

  const sitePhotos = photos.filter((p) => p.site === site.name);
  const siteInventory = inventory.filter((i) => i.site === site.name);

  return (
    <div className="space-y-6">
      {/* Quick Action Navigation Bar for Supervisor */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/material-inward"
          className="bg-white border border-slate-200/80 hover:border-emerald-500 rounded-xl p-3.5 flex items-center gap-3 shadow-xs hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center group-hover:bg-[#0D5C3A] group-hover:text-white transition-colors">
            <ArrowDownToLine className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Inward Material</span>
            <span className="text-[10px] text-slate-400">Receive stock deliveries</span>
          </div>
        </Link>

        <Link
          to="/material-requests"
          className="bg-white border border-slate-200/80 hover:border-blue-500 rounded-xl p-3.5 flex items-center gap-3 shadow-xs hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Material Request</span>
            <span className="text-[10px] text-slate-400">Request site stock</span>
          </div>
        </Link>

        <Link
          to="/labour-entry"
          className="bg-white border border-slate-200/80 hover:border-amber-500 rounded-xl p-3.5 flex items-center gap-3 shadow-xs hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <HardHat className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Labour Entry</span>
            <span className="text-[10px] text-slate-400">Log daily site workers</span>
          </div>
        </Link>

        <Link
          to="/inventory"
          className="bg-white border border-slate-200/80 hover:border-purple-500 rounded-xl p-3.5 flex items-center gap-3 shadow-xs hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Stock Balance</span>
            <span className="text-[10px] text-slate-400">Track current stock</span>
          </div>
        </Link>
      </div>

      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="relative h-48 sm:h-64 bg-slate-900">
          <img
            src={site.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=1200&auto=format&fit=crop&q=80'}
            alt={site.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider inline-block mb-1.5">
                  {site.status || 'Active Construction'}
                </span>
                <h2 className="text-2xl font-extrabold">{site.name}</h2>
                <p className="text-xs text-slate-200 font-medium">
                  {site.projectType || 'Residential Project'} • Code: {site.code}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {targetSites.length > 1 && (
                  <div className="bg-black/60 backdrop-blur-xs border border-white/20 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-200">Site:</span>
                    <select
                      value={site.name}
                      onChange={(e) => setSelectedSite(e.target.value)}
                      className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                    >
                      {targetSites.map((s) => (
                        <option key={s.id || s.name} value={s.name} className="text-slate-900 bg-white">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Link
                  to="/photo-monitoring"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Photo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Site Details Info Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Project Name</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{site.projectType}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Site Code</span>
            <span className="font-bold text-slate-800 mt-0.5 block font-mono">{site.code}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Location</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{site.location}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Start Date</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{site.startDate || '12 Jan 2025'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Supervisor</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{site.supervisor}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Contact</span>
            <span className="font-bold text-[#0D5C3A] mt-0.5 block">{site.contact || '98765 43210'}</span>
          </div>
        </div>

        {/* Site Summary Metrics */}
        <div className="p-6 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Total Materials</span>
              <span className="text-lg font-extrabold text-slate-900">{site.totalMaterials} Items</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Stock Value</span>
              <span className="text-lg font-extrabold text-slate-900">{site.stockValueFormatted}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Total Deliveries</span>
              <span className="text-lg font-extrabold text-slate-900">{deliveries.filter((d) => d.site === site.name).length} Shipments</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Site Photos</span>
              <span className="text-lg font-extrabold text-slate-900">{sitePhotos.length} Uploads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Site Inventory & Photos Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Site Materials */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Site Inventory Status</h3>
            <Link to="/inventory" className="text-xs font-bold text-[#0D5C3A] hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {siteInventory.length > 0 ? (
              siteInventory.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-slate-400 ml-2">({item.category})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      {item.totalStock} {item.unit}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Good'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'Medium'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">No specific items registered for this site.</p>
            )}
          </div>
        </div>

        {/* Right: Site Photos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Site Progress Photos</h3>
            <Link to="/photo-monitoring" className="text-xs font-bold text-[#0D5C3A] hover:underline">
              View Gallery
            </Link>
          </div>
          {sitePhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sitePhotos.slice(0, 6).map((p) => (
                <div key={p.id} className="rounded-lg overflow-hidden border border-slate-200 aspect-4/3 relative group">
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end p-2 text-white">
                    <span className="text-[10px] font-bold leading-tight truncate">{p.title}</span>
                    <span className="text-[8px] text-slate-300 truncate">{p.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-slate-400 text-xs">No progress photos uploaded for this site yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
