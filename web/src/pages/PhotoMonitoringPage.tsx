import React, { useState, useRef } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import {
  Camera,
  Search,
  Plus,
  Calendar,
  X,
  Upload,
  Clock,
  MapPin,
  ZoomIn,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { SitePhoto } from '@project/shared';
import { Button } from '../components/Button';
import { EmptyState } from '../components/common/EmptyState';
import { constructionService } from '../services/construction.service';
import { resolveImageUrl } from '../services/api';

export const PhotoMonitoringPage: React.FC = () => {
  const { photos, sitesList, uploadPhoto, globalSearch, refreshData } = useDashboardContext();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('01 May 2025 - 28 May 2025');
  const [selectedPhoto, setSelectedPhoto] = useState<SitePhoto | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Available real sites
  const availableSites = sitesList.filter((s) => s !== 'All Sites');

  // New Photo Form State
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    site: availableSites[0] || 'Main Site',
    type: 'Site Progress' as 'Stock In' | 'Stock Out' | 'Site Progress',
    imageUrl: '',
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if image
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to server
    setIsUploadingFile(true);
    try {
      const uploadRes = await constructionService.uploadPhotoFile(file);
      const fullUrl = uploadRes.url.startsWith('http')
        ? uploadRes.url
        : uploadRes.url.startsWith('/') ? uploadRes.url : `/${uploadRes.url}`;
      setNewPhoto((prev) => ({ ...prev, imageUrl: fullUrl }));
    } catch (err: any) {
      // Fallback: convert to base64 data url so image always displays
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setNewPhoto((prev) => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.title) {
      setUploadError('Please provide a photo title.');
      return;
    }
    if (!newPhoto.imageUrl && !previewUrl) {
      setUploadError('Please choose an image file to upload.');
      return;
    }

    const finalImageUrl = newPhoto.imageUrl || previewUrl || '';

    await uploadPhoto({
      title: newPhoto.title,
      site: newPhoto.site || availableSites[0] || 'Main Project',
      type: newPhoto.type,
      imageUrl: finalImageUrl,
    });

    setNewPhoto({
      title: '',
      site: availableSites[0] || 'Main Site',
      type: 'Site Progress',
      imageUrl: '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setShowUploadModal(false);
    await refreshData();
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
        <Button
          variant="brand"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setUploadError(null);
            setShowUploadModal(true);
          }}
        >
          Upload New Photo
        </Button>
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

          {/* Date Range */}
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

      {/* Photo Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <EmptyState
          variant="dashed"
          icon={<Camera className="w-8 h-8 text-[#0D5C3A]" />}
          title="No Site Photos Uploaded Yet"
          description={
            query
              ? `No site photos match "${query}". Try adjusting your filters or search keywords.`
              : 'Capture and upload real site progress, delivery challans, or concrete pours from your device.'
          }
          actionLabel="+ Upload Your First Photo"
          onAction={() => setShowUploadModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden group cursor-pointer hover:border-[#0D5C3A] hover:shadow-md transition-all flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                <img
                  src={resolveImageUrl(photo.imageUrl)}
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
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{photo.timestamp}</span>
                  </div>
                  {photo.uploader && <span className="text-slate-500 font-semibold">{photo.uploader}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                src={resolveImageUrl(selectedPhoto.imageUrl)}
                alt={selectedPhoto.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
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

      {/* Real Upload Photo Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0D5C3A]" />
                <span>Upload Site Progress Photo</span>
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setUploadError(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd Floor Slab Reinforcement & Shuttering"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site</label>
                  {availableSites.length > 0 ? (
                    <select
                      value={newPhoto.site}
                      onChange={(e) => setNewPhoto({ ...newPhoto, site: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] font-medium"
                    >
                      {availableSites.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Project Alpha"
                      value={newPhoto.site}
                      onChange={(e) => setNewPhoto({ ...newPhoto, site: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] font-medium"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newPhoto.type}
                    onChange={(e) =>
                      setNewPhoto({
                        ...newPhoto,
                        type: e.target.value as 'Stock In' | 'Stock Out' | 'Site Progress',
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] font-medium"
                  >
                    <option value="Site Progress">Site Progress</option>
                    <option value="Stock In">Stock In Proof</option>
                    <option value="Stock Out">Stock Out Usage</option>
                  </select>
                </div>
              </div>

              {/* Real Interactive File Upload Area */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 shadow-sm"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setNewPhoto((prev) => ({ ...prev, imageUrl: '' }));
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                    {isUploadingFile && (
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/70 text-white text-[10px] font-bold">
                        Uploading to server...
                      </div>
                    )}
                    {!isUploadingFile && (
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-200 hover:border-[#0D5C3A] rounded-xl p-5 text-center bg-slate-50 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100/60 text-[#0D5C3A] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Click to browse or drag and drop photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      PNG, JPG, JPEG, WEBP from your camera or computer
                    </span>
                  </div>
                )}
              </div>

              {/* Optional Direct URL Input */}
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                  Or paste direct Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/site-photo.jpg"
                  value={newPhoto.imageUrl}
                  onChange={(e) => {
                    setNewPhoto({ ...newPhoto, imageUrl: e.target.value });
                    setPreviewUrl(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-600 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setUploadError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={isUploadingFile}
                  icon={<Camera className="w-3.5 h-3.5" />}
                >
                  {isUploadingFile ? 'Uploading...' : 'Save & Publish Photo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
