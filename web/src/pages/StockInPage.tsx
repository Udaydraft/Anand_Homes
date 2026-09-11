import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboardContext } from '../context/DashboardContext';
import {
  ArrowLeft,
  ArrowDownToLine,
  Upload,
  Calendar,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

export const StockInPage: React.FC = () => {
  const navigate = useNavigate();
  const { sitesList, addStockIn } = useDashboardContext();

  const [site, setSite] = useState('Site Alpha');
  const [material, setMaterial] = useState('Cement');
  const [quantity, setQuantity] = useState('200');
  const [unit, setUnit] = useState('Bags');
  const [supplier, setSupplier] = useState('ABC Traders');
  const [invoiceNo, setInvoiceNo] = useState('INV-2025-00123');
  const [deliveryDate, setDeliveryDate] = useState('28 May 2025');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const materials = ['Cement', 'Steel 12mm', 'Sand', 'Bricks', 'Paint', 'Gravel 20mm', 'Plywood', 'Rods 8mm'];
  const suppliers = ['ABC Traders', 'Sri Build Mart', 'Sand Suppliers', 'Brick Works', 'Premier Cement Ltd'];
  const units = ['Bags', 'Ton', 'Loads', 'Nos', 'Boxes', 'Sheets'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!site || !material || !quantity || !invoiceNo) return;

    addStockIn({
      site,
      material,
      quantity: parseFloat(quantity) || 0,
      unit,
      supplier,
      invoiceNo,
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Stock In successfully recorded and inventory updated! Redirecting to Dashboard...</span>
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

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="200"
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
              <label className="block font-semibold text-slate-700 mb-1">Supplier *</label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
              >
                {suppliers.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice / DC No */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice / DC No. *</label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="INV-2025-00123"
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

          {/* Right Form Column: Upload Invoice / DC Photo (5 cols) */}
          <div className="md:col-span-5 flex flex-col">
            <label className="block font-semibold text-slate-700 text-xs mb-1">
              Upload Invoice / DC Photo
            </label>
            <div
              onClick={() =>
                setUploadedFile(
                  uploadedFile
                    ? null
                    : 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'
                )
              }
              className="flex-1 min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0D5C3A] bg-slate-50/50 hover:bg-emerald-50/20 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group relative overflow-hidden"
            >
              {uploadedFile ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={uploadedFile}
                    alt="Invoice Preview"
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
                Save Stock In
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
