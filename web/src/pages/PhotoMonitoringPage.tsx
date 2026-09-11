import React, { useState } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import {
  Camera,
  Search,
  Plus,
  Calendar,
  Filter,
  Eye,
  X,
  Upload,
  Clock,
  MapPin,
  Tag,
  ZoomIn,
} from 'lucide-react';
import { SitePhoto } from '@project/shared';

export const PhotoMonitoringPage: React.FC = () => {
  const { photos, sitesList, uploadPhoto, globalSearch } = useDashboardContext();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('01 May 2025 - 28 May 2025');
  const [selectedPhoto, setSelectedPhoto] = useState<SitePhoto | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Photo Form State
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    site: 'Site Alpha',
    type: 'Site Progress' as 'Stock In' | 'Stock Out' | 'Site Progress',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
  });

  const photoTypes = ['All', 'Stock In', 'Stock Out', 'Site Progress'];

  const query = searchTerm || globalSearch;
  const filteredPhotos = photos.filter((p) => {
    const matchesSite = selectedSiteFilter === 'All' || p.site === selectedSiteFilter;
    const matchesType = selectedTypeFilter === 'All' || p.type === selectedTypeFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.site.toLowerCase().includes(query.toLowerCase()) ||
      p.type.toLowerCase().includes(query.toLowerCase());
    return matchesSite && matchesType && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.title) return;
    uploadPhoto({
      title: newPhoto.title,
      site: newPhoto.site,
      type: newPhoto.type,
      imageUrl: newPhoto.imageUrl,
    });
    setNewPhoto({
      title: '',
      site: 'Site Alpha',
      type: 'Site Progress',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
    });
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Photo Monitoring</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual monitoring of construction progress, material deliveries, and stock proof
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Photo</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Site Filter */}
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-[#0D5C3A]"
          >
            <option value="All">All Sites</option>
            {sitesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-[#0D5C3A]"
          >
            {photoTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Types' : t}
              </option>
            ))}
          </select>

          {/* Date Range Picker */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRange}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search photos..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-700"
          />
        </div>
      </div>

      {/* Photo Gallery Grid Matching Mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden group cursor-pointer hover:border-[#0D5C3A] transition-all flex flex-col"
          >
            {/* Image Container */}
            <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 right-2.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                    photo.type === 'Site Progress'
                      ? 'bg-blue-600 text-white'
                      : photo.type === 'Stock In'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {photo.type}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Photo Info Content */}
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#0D5C3A] transition-colors">
                  {photo.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{photo.site}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{photo.timestamp}</span>
                </div>
                {photo.uploader && <span className="text-slate-500 font-semibold">{photo.uploader}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Zoom Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/10 bg-black">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedPhoto.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedPhoto.site} • {selectedPhoto.type} • {selectedPhoto.timestamp}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#0D5C3A] text-white text-xs font-bold">
                Verified Proof
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Upload Site Progress Photo</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd Floor Slab Concrete Pour"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site</label>
                  <select
                    value={newPhoto.site}
                    onChange={(e) => setNewPhoto({ ...newPhoto, site: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D5C3A]"
                  >
                    {sitesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Photo Category</label>
                  <select
                    value={newPhoto.type}
                    onChange={(e) =>
                      setNewPhoto({
                        ...newPhoto,
                        type: e.target.value as 'Stock In' | 'Stock Out' | 'Site Progress',
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D5C3A]"
                  >
                    <option value="Site Progress">Site Progress</option>
                    <option value="Stock In">Stock In</option>
                    <option value="Stock Out">Stock Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo URL / Demo Image</label>
                <input
                  type="text"
                  value={newPhoto.imageUrl}
                  onChange={(e) => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                />
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                <Upload className="w-5 h-5 mx-auto text-[#0D5C3A] mb-1" />
                <span className="text-[11px] text-slate-600 font-semibold block">
                  Click or drag images to upload
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white font-bold rounded-lg shadow-sm"
                >
                  Upload Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
