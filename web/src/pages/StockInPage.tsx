import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboardContext } from '../context/DashboardContext';
import {
  ArrowLeft,
  ArrowDownToLine,
  Upload,
  Calendar,
  CheckCircle2,
  FileText,
  Building2,
  Plus,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '../components/Button';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import { constructionService } from '../services/construction.service';

export const StockInPage: React.FC = () => {
  const navigate = useNavigate();
  const { sites, addStockIn } = useDashboardContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [site, setSite] = useState(sites[0]?.name || '');
  const [material, setMaterial] = useState('Cement');
  const [customMaterial, setCustomMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Bags');
  const [supplier, setSupplier] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const materials = ['Cement', 'Steel 12mm', 'Sand', 'Bricks', 'Paint', 'Gravel 20mm', 'Plywood', 'Rods 8mm', 'Other'];
  const units = ['Bags', 'Ton', 'Loads', 'Nos', 'Boxes', 'Sheets', 'Liters'];

  // Auto-select first site when sites load
  useEffect(() => {
    if (!site && sites.length > 0) {
      setSite(sites[0].name);
    }
  }, [sites, site]);

  const handleFileProcess = async (file: File) => {
    try {
      setIsUploading(true);
      const res = await constructionService.uploadPhotoFile(file);
      const fullUrl = res.url.startsWith('http')
        ? res.url
        : res.url.startsWith('/') ? res.url : `/${res.url}`;
      setUploadedFile(fullUrl);
    } catch (err) {
      console.warn('Backend file upload fallback:', err);
      setUploadedFile(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveMaterial = material === 'Other' ? customMaterial.trim() : material;
    if (!site || !effectiveMaterial || !quantity || !invoiceNo) return;

    addStockIn({
      site,
      material: effectiveMaterial,
      quantity: parseFloat(quantity) || 0,
      unit,
      supplier: supplier.trim() || 'Direct Supplier',
      invoiceNo: invoiceNo.trim(),
      deliveryDate,
      notes,
    });

    setIsSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Stock In</h2>
          <p className="text-xs text-slate-500">Record incoming construction materials and delivery challans</p>
        </div>
      </div>

      {isSuccess && (
        <SuccessMessage
          title="Stock In Recorded"
          message="Material receipt successfully logged and inventory levels updated! Redirecting to Dashboard..."
        />
      )}

      {/* When no sites exist, show actionable banner */}
      {sites.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Construction Sites Available</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              You must add at least one project site before recording incoming material stock and delivery challans.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/sites"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D5C3A] text-white rounded-lg text-xs font-bold hover:bg-[#094228] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Project Site First
            </Link>
          </div>
        </div>
      ) : (
        /* Main Form Box */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Form Column (7 cols) */}
            <div className="md:col-span-7 space-y-4 text-xs">
              {/* Site */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Site *</label>
                <select
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code}) - {s.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material *</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
                >
                  {materials.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {material === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom material name"
                    value={customMaterial}
                    onChange={(e) => setCustomMaterial(e.target.value)}
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800"
                  />
                )}
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity Received *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. UltraTech Cement / Sri Build Mart"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
                />
              </div>

              {/* Invoice / DC No */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice / Delivery Challan No. *</label>
                <input
                  type="text"
                  required
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-2025-081"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-mono"
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Date *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800"
                  />
                  <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Inspection notes, truck registration, batch numbers..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 resize-none"
                />
              </div>
            </div>

            {/* Right Form Column: Real File Upload (5 cols) */}
            <div className="md:col-span-5 flex flex-col">
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Upload Invoice / DC Photo (Optional)
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => {
                  if (!uploadedFile && !isUploading) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`flex-1 min-h-[220px] rounded-xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden ${
                  isDragOver
                    ? 'border-[#0D5C3A] bg-emerald-50/50'
                    : uploadedFile
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-[#0D5C3A] bg-slate-50/50 hover:bg-emerald-50/20'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="w-8 h-8 text-[#0D5C3A] animate-spin" />
                    <span className="text-xs font-semibold">Uploading document...</span>
                  </div>
                ) : uploadedFile ? (
                  <div className="w-full h-full flex flex-col items-center justify-center relative group">
                    <img
                      src={uploadedFile}
                      alt="Invoice Preview"
                      className="max-h-48 object-contain rounded-lg shadow-sm border border-slate-200"
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-bold shadow-xs hover:bg-slate-50"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded text-[11px] font-bold border border-rose-200 hover:bg-rose-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0D5C3A] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to choose photo or drag & drop
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={isUploading}
                >
                  Save Stock In
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
