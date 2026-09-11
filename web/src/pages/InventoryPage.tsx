import React, { useState } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
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
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { inventory, sitesList, globalSearch } = useDashboardContext();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-5">
      {/* Top Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time stock levels, minimum thresholds, and site allocations</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Main Table Container */}
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
              {filteredItems.map((item) => (
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
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing 1 to {filteredItems.length} of 68 items</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-[#0D5C3A] text-white font-bold">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
              3
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
              4
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
              5
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
