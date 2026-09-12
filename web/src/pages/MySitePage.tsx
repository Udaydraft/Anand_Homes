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
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const MySitePage: React.FC = () => {
  const { selectedSite, sites, myAssignedSites, roleMode, photos, inventory, deliveries } = useDashboardContext();
  const navigate = useNavigate();

  // If supervisor, strictly scope to myAssignedSites; if admin, scope to sites
  const targetSites = roleMode === 'supervisor' ? myAssignedSites : sites;
  const site = targetSites.find((s) => s.name === selectedSite) || targetSites[0] || null;

  if (!site) {
    return (
      <EmptyState
        variant="card"
        icon={<Building2 className="w-10 h-10 text-amber-500" />}
        title="No Project Site Assigned"
        description="You currently do not have any construction sites assigned to your supervisor account. Please ask an administrator to assign a site to your profile in the Sites Management portal."
        actionLabel="Back to Dashboard"
        onAction={() => navigate(roleMode === 'supervisor' ? '/supervisor-dashboard' : '/dashboard')}
      />
    );
  }

  const sitePhotos = photos.filter((p) => p.site === site.name);
  const siteInventory = inventory.filter((i) => i.site === site.name);

  return (
    <div className="space-y-6">
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
                  {site.status}
                </span>
                <h2 className="text-2xl font-extrabold">{site.name}</h2>
                <p className="text-xs text-slate-200 font-medium">
                  {site.projectType || 'Anna Nagar Residential'} • Code: {site.code}
                </p>
              </div>

              <Link
                to="/photo-monitoring"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Site Photo</span>
              </Link>
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
