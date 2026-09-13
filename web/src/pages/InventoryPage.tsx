import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardContext } from '../context/DashboardContext';
import { Button } from '../components/Button';
import { EmptyState, TableSkeleton } from '../components/common';
import {
  Package,
  Download,
  Search,
  Filter,
  Eye,
  MoreVertical,
  ChevronRight,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    inventory,
    sitesList,
    globalSearch,
    isLoadingData,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  } = useDashboardContext();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // CRUD Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const initialItemForm = {
    name: '',
    category: 'Cement',
    unit: 'Bags',
    totalStock: 100,
    minStock: 25,
    site: sitesList.length > 1 ? sitesList[1] : 'All Sites',
  };

  const [newItem, setNewItem] = useState(initialItemForm);

  const categories = ['All', 'Cement', 'Steel', 'Aggregate', 'Masonry', 'Finishing', 'Others'];

  const query = searchTerm || globalSearch;
  const filteredItems = inventory.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSite = selectedSiteFilter === 'All' || item.site === selectedSiteFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.site.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSite && matchesSearch;
  });

  const handleExport = () => {
    const csvRows = [
      ['Material', 'Category', 'Unit', 'Total Stock', 'Min Stock', 'Status', 'Site'],
      ...filteredItems.map((i) => [i.name, i.category, i.unit, i.totalStock, i.minStock, i.status, i.site]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `anand_homes_inventory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.site) return;
    setIsSavingItem(true);
    try {
      await addInventoryItem({
        name: newItem.name,
        category: newItem.category as any,
        unit: newItem.unit,
        totalStock: Number(newItem.totalStock),
        minStock: Number(newItem.minStock),
        site: newItem.site,
      });
      setShowAddModal(false);
      setNewItem(initialItemForm);
    } catch (err) {
      console.error('Failed to add inventory item:', err);
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleOpenEditItem = (item: any) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      totalStock: item.totalStock,
      minStock: item.minStock,
      site: item.site,
    });
  };

  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name) return;
    setIsSavingItem(true);
    try {
      await updateInventoryItem(editingItem.id, {
        name: editingItem.name,
        category: editingItem.category as any,
        unit: editingItem.unit,
        totalStock: Number(editingItem.totalStock),
        minStock: Number(editingItem.minStock),
        site: editingItem.site,
      });
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update inventory item:', err);
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItemConfirm = async () => {
    if (!deletingItem) return;
    setIsDeletingItem(true);
    try {
      await deleteInventoryItem(deletingItem.id);
      setDeletingItem(null);
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
    } finally {
      setIsDeletingItem(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time stock levels, minimum thresholds, and site allocations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Material
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={() => navigate('/stock-in')}
            leftIcon={<Boxes className="w-4 h-4" />}
          >
            Record Stock In
          </Button>
        </div>
      </div>

      {/* Main Table Container */}
      {isLoadingData ? (
        <TableSkeleton rows={5} columns={7} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-[#0D5C3A]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Site Dropdown */}
            <div className="flex items-center gap-2">
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
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search material..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-700"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4">Min. Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Site</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8">
                    <EmptyState
                      icon={<Package className="w-7 h-7 text-slate-400" />}
                      title={
                        query || selectedCategory !== 'All' || selectedSiteFilter !== 'All'
                          ? 'No matching materials found'
                          : 'No inventory items recorded yet'
                      }
                      description={
                        query || selectedCategory !== 'All' || selectedSiteFilter !== 'All'
                          ? 'No items match your active filters. Try clearing your filters or search terms.'
                          : 'Start recording incoming materials, deliveries, and stock receipts to track quantities across project sites.'
                      }
                      actionLabel={
                        query || selectedCategory !== 'All' || selectedSiteFilter !== 'All'
                          ? 'Clear Filters'
                          : 'Record First Stock In'
                      }
                      onAction={
                        query || selectedCategory !== 'All' || selectedSiteFilter !== 'All'
                          ? () => {
                              setSearchTerm('');
                              setSelectedCategory('All');
                              setSelectedSiteFilter('All');
                            }
                          : () => navigate('/stock-in')
                      }
                      variant="default"
                    />
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                          <Boxes className="w-3.5 h-3.5 text-[#0D5C3A]" />
                        </div>
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{item.category}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{item.unit}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {item.totalStock.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{item.minStock.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Good'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'Medium'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{item.site}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditItem(item)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#0D5C3A] hover:bg-emerald-50 transition-colors"
                          title="Edit Item"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {filteredItems.length > 0 ? 1 : 0} to {filteredItems.length} of {inventory.length} items
          </span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-[#0D5C3A] text-white font-bold">
              1
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Add Inventory Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#0D5C3A]" />
                  <span>Add Inventory Material</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Define material name, category, initial balance & min threshold</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UltraTech Super Cement 53 Grade"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] bg-white font-medium text-slate-900"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bags, MT, Tons, Sqft"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.totalStock}
                    onChange={(e) => setNewItem({ ...newItem, totalStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Threshold (Alert)</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.minStock}
                    onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Site *</label>
                <select
                  value={newItem.site}
                  onChange={(e) => setNewItem({ ...newItem, site: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] bg-white font-medium text-slate-900"
                >
                  {sitesList.filter((s) => s !== 'All Sites').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingItem && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingItem ? 'Saving...' : 'Add Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#0D5C3A]" />
                  <span>Edit Inventory Material</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Update stock quantities, alert threshold, or unit</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditItemSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] bg-white font-medium text-slate-900"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={editingItem.totalStock}
                    onChange={(e) => setEditingItem({ ...editingItem, totalStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Threshold (Alert)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingItem.minStock}
                    onChange={(e) => setEditingItem({ ...editingItem, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site</label>
                <input
                  type="text"
                  disabled
                  value={editingItem.site}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingItem && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingItem ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Inventory Item Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">Delete Inventory Item?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to remove <strong className="text-slate-800">{deletingItem.name}</strong> from <strong className="text-slate-800">{deletingItem.site}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={handleDeleteItemConfirm}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeletingItem && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{isDeletingItem ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
