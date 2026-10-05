import React, { useState, useEffect } from 'react';
import { Package, RotateCcw, CheckCircle2, AlertCircle, Loader2, Tag, Boxes } from 'lucide-react';
import { constructionService } from '../services/construction.service';
import { InventoryMasterItem } from '@project/shared';
import { useDashboardContext } from '../context/DashboardContext';

const DEFAULT_CATEGORIES = ['Cement', 'Steel', 'Aggregate', 'Masonry', 'Finishing', 'Electrical', 'Plumbing', 'Others'];
const DEFAULT_MEASUREMENTS = ['Bags', 'Tons', 'Nos', 'Kg', 'Litres', 'Sq.Ft', 'Cum', 'Rft', 'Bundles'];
const NATURE_OF_WORK_OPTIONS = ['Construction', 'Installation', 'Maintenance', 'Testing', 'Others'];

export const InventoryMasterPage: React.FC = () => {
  const { refreshData, sitesList } = useDashboardContext();
  const [items, setItems] = useState<InventoryMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [material, setMaterial] = useState('');
  const [measurement, setMeasurement] = useState(DEFAULT_MEASUREMENTS[0]);
  const [materialType, setMaterialType] = useState<'Prime' | 'Other'>('Prime');
  const [selectedNatureOfWork, setSelectedNatureOfWork] = useState<string[]>(['Construction']);
  const [initialStock, setInitialStock] = useState('0');
  const [minStock, setMinStock] = useState('10');
  const [targetSite, setTargetSite] = useState('All Sites');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await constructionService.getInventoryMaster();
      setItems(data || []);
    } catch (err: any) {
      console.error('Failed to load inventory master:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const toggleNatureOfWork = (item: string) => {
    if (selectedNatureOfWork.includes(item)) {
      if (selectedNatureOfWork.length > 1) {
        setSelectedNatureOfWork(selectedNatureOfWork.filter((x) => x !== item));
      }
    } else {
      setSelectedNatureOfWork([...selectedNatureOfWork, item]);
    }
  };

  const handleReset = () => {
    setCategory(DEFAULT_CATEGORIES[0]);
    setMaterial('');
    setMeasurement(DEFAULT_MEASUREMENTS[0]);
    setMaterialType('Prime');
    setSelectedNatureOfWork(['Construction']);
    setInitialStock('0');
    setMinStock('10');
    setTargetSite(sitesList.length > 1 ? sitesList[1] : 'All Sites');
    setEditingId(null);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material.trim()) {
      setFeedback({ type: 'error', message: 'Material name is required.' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await constructionService.updateInventoryMaster(editingId, {
          category,
          material,
          measurement,
          materialType,
          natureOfWork: selectedNatureOfWork,
          initialStock: parseFloat(initialStock) || 0,
          minStock: parseFloat(minStock) || 10,
          site: targetSite,
        });
        setFeedback({ type: 'success', message: 'Inventory master and stock tracking updated.' });
      } else {
        await constructionService.createInventoryMaster({
          category,
          material,
          measurement,
          materialType,
          natureOfWork: selectedNatureOfWork,
          initialStock: parseFloat(initialStock) || 0,
          minStock: parseFloat(minStock) || 10,
          site: targetSite,
        });
        setFeedback({ type: 'success', message: 'Material created and registered in Stock Tracking!' });
      }
      handleReset();
      await Promise.all([fetchInventory(), refreshData()]);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: InventoryMasterItem) => {
    setEditingId(item.id);
    setCategory(item.category);
    setMaterial(item.material);
    setMeasurement(item.measurement);
    setMaterialType(item.materialType || 'Prime');
    setSelectedNatureOfWork(item.natureOfWork && item.natureOfWork.length > 0 ? item.natureOfWork : ['Construction']);
    setInitialStock(item.initialStock ? item.initialStock.toString() : '0');
    setMinStock(item.minStock ? item.minStock.toString() : '10');
    setTargetSite(item.site || 'All Sites');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      await constructionService.deleteInventoryMaster(id);
      await Promise.all([fetchInventory(), refreshData()]);
    } catch (err) {
      console.error('Failed to delete inventory master item:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0A3925]/10 text-[#0A3925] rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Inventory Master</h1>
            <p className="text-sm text-slate-500">Master configuration for categories, materials, units, and nature of work</p>
          </div>
        </div>
      </div>


      {/* Form: Create / Edit Inventory Master */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          {editingId ? 'Edit Inventory Master' : 'Create / Edit Inventory Master'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Material <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Select or enter material (e.g. UltraTech PPC)"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Measurement <span className="text-red-500">*</span>
              </label>
              <select
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              >
                {DEFAULT_MEASUREMENTS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Stock Tracking Setup */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Boxes className="w-4 h-4 text-[#0D5C3A]" />
              <span className="text-xs font-bold text-[#0D5C3A] uppercase tracking-wider">
                Live Stock Tracking Setup
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                (Automatically registers and updates stock in Stock Tracking screen)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Target Project Site
                </label>
                <select
                  value={targetSite}
                  onChange={(e) => setTargetSite(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all"
                >
                  <option value="All Sites">All Project Sites</option>
                  {sitesList
                    .filter((s) => s !== 'All Sites')
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Min Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="10"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Material / Nature of Work (Examples) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Material Classification
              </label>
              <div className="flex items-center gap-2">
                {(['Prime', 'Other'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMaterialType(type)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      materialType === type
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Nature of Work (Examples)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {NATURE_OF_WORK_OPTIONS.map((item) => {
                  const active = selectedNatureOfWork.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleNatureOfWork(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        active
                          ? 'bg-[#0A3925] text-white border-[#0A3925]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : editingId ? (
                'Save Changes'
              ) : (
                'Create'
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Table: Inventory Master Catalogue */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Inventory Master Items</span>
          <span className="text-xs font-normal text-slate-500">{items.length} item(s)</span>
        </h2>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0A3925]" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No items in Inventory Master.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Measurement</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Nature of Work</th>
                  <th className="py-3 px-4 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.category}</td>
                    <td className="py-3 px-4">{item.material}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.measurement}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.materialType === 'Prime'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.materialType || 'Prime'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.natureOfWork?.map((now) => (
                          <span key={now} className="px-1.5 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {now}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default InventoryMasterPage;
