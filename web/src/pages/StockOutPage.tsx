import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboardContext } from '../context/DashboardContext';
import {
  ArrowLeft,
  ArrowUpFromLine,
  Upload,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';

export const StockOutPage: React.FC = () => {
  const navigate = useNavigate();
  const { sitesList, inventory, addStockOut } = useDashboardContext();

  const [site, setSite] = useState('Site Alpha');
  const [material, setMaterial] = useState('Cement');
  const [quantity, setQuantity] = useState('25');
  const [unit, setUnit] = useState('Bags');
  const [usedFor, setUsedFor] = useState('Foundation Work');
  const [requestedBy, setRequestedBy] = useState('Site Supervisor');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const materials = ['Cement', 'Steel 12mm', 'Sand', 'Bricks', 'Paint', 'Gravel 20mm', 'Plywood', 'Rods 8mm'];
  const units = ['Bags', 'Ton', 'Loads', 'Nos', 'Boxes', 'Sheets'];

  // Lookup current available stock
  const currentItem = inventory.find(
    (i) => i.name.toLowerCase() === material.toLowerCase() && i.site === site
  );
  const availableStock = currentItem ? currentItem.totalStock : 185;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = parseFloat(quantity) || 0;
    if (qty <= 0) {
      setError('Please enter a valid issue quantity.');
      return;
    }
    if (qty > availableStock) {
      setError(`Cannot issue ${qty} ${unit}. Only ${availableStock} ${unit} available in stock.`);
      return;
    }

    addStockOut({
      site,
      material,
      quantity: qty,
      unit,
      usedFor,
      requestedBy,
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
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Stock Out</h2>
          <p className="text-xs text-slate-500">Record material issuance to construction stages or subcontractors</p>
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Material successfully issued and stock deducted! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Form Column (7 cols) */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {/* Site */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Site *</label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
              >
                {sitesList.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
            </div>

            {/* Available Stock Indicator Badge */}
            <div>
              <span className="block font-semibold text-slate-500 mb-1 text-[11px]">Available Stock</span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                <Package className="w-3.5 h-3.5 text-[#0D5C3A]" />
                <span>{availableStock} {unit}</span>
              </div>
            </div>

            {/* Issue Quantity and Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={availableStock}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="25"
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

            {/* Used For */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Used For *</label>
              <input
                type="text"
                required
                value={usedFor}
                onChange={(e) => setUsedFor(e.target.value)}
                placeholder="e.g. Foundation Work, Column Casting"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
              />
            </div>

            {/* Requested By */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Requested By *</label>
              <input
                type="text"
                required
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                placeholder="e.g. Site Supervisor, Subcontractor"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Right Form Column: Upload Photo Proof (5 cols) */}
          <div className="md:col-span-5 flex flex-col">
            <label className="block font-semibold text-slate-700 text-xs mb-1">
              Upload Photo (Proof)
            </label>
            <div
              onClick={() =>
                setUploadedFile(
                  uploadedFile
                    ? null
                    : 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80'
                )
              }
              className="flex-1 min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0D5C3A] bg-slate-50/50 hover:bg-emerald-50/20 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group relative overflow-hidden"
            >
              {uploadedFile ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={uploadedFile}
                    alt="Proof Preview"
                    className="max-h-44 object-contain rounded-lg shadow-xs"
                  />
                  <span className="text-[11px] text-[#0D5C3A] font-bold mt-2">
                    Click to remove or replace
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0D5C3A] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                Issue Material
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
