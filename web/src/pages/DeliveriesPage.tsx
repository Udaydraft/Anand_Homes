import React, { useState } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import {
  Truck,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  X,
  FileText,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { Delivery } from '@project/shared';

export const DeliveriesPage: React.FC = () => {
  const { deliveries, sitesList, recordDelivery, globalSearch } = useDashboardContext();

  const [activeTab, setActiveTab] = useState<'All' | 'Expected' | 'In Transit' | 'Received' | 'Cancelled'>('Received');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Delivery Form State
  const [newDlv, setNewDlv] = useState({
    supplier: 'ABC Traders',
    site: 'Site Alpha',
    material: 'Cement',
    expectedQty: '200',
    receivedQty: '200',
    unit: 'Bags',
    status: 'Received' as 'Expected' | 'In Transit' | 'Received' | 'Cancelled',
  });

  const query = searchTerm || globalSearch;
  const filteredDeliveries = deliveries.filter((d) => {
    const matchesTab = activeTab === 'All' || d.status === activeTab;
    const matchesSearch =
      d.deliveryId.toLowerCase().includes(query.toLowerCase()) ||
      d.supplier.toLowerCase().includes(query.toLowerCase()) ||
      d.site.toLowerCase().includes(query.toLowerCase()) ||
      d.material.toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordDelivery({
      deliveryId: `DLV-00${Math.floor(45 + Math.random() * 50)}`,
      supplier: newDlv.supplier,
      site: newDlv.site,
      material: newDlv.material,
      expectedQty: parseFloat(newDlv.expectedQty) || 0,
      receivedQty: parseFloat(newDlv.receivedQty) || 0,
      unit: newDlv.unit,
      status: newDlv.status,
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Record Delivery Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Deliveries</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track consignments, dispatch statuses, and delivery verification
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Delivery</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tabs & Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Expected', 'In Transit', 'Received', 'Cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
                {tab === 'Received' && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                    {deliveries.filter((d) => d.status === 'Received').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search deliveries..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-700"
            />
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Delivery ID</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Site</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Received</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliveries.map((dlv) => (
                <tr key={dlv.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {dlv.deliveryId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{dlv.supplier}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{dlv.site}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{dlv.material}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {dlv.expectedQty} {dlv.unit}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {dlv.receivedQty} {dlv.unit}
                    {dlv.shortage && (
                      <span className="ml-1.5 text-[10px] text-rose-600 font-semibold">
                        (-{dlv.shortage})
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        dlv.status === 'Received'
                          ? 'bg-emerald-50 text-emerald-700'
                          : dlv.status === 'In Transit'
                          ? 'bg-blue-50 text-blue-700'
                          : dlv.status === 'Expected'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {dlv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedDelivery(dlv)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-[#0D5C3A] hover:bg-emerald-50 transition-colors"
                      title="View Delivery Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing 1 to {filteredDeliveries.length} of {deliveries.length} deliveries</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-[#0D5C3A] text-white font-bold">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Details Modal (matching Image 4 Screen 13) */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-slate-900">{selectedDelivery.deliveryId}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedDelivery.status === 'Received'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {selectedDelivery.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Supplier</span>
                <span className="font-bold text-slate-800">{selectedDelivery.supplier}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Site</span>
                <span className="font-bold text-slate-800">{selectedDelivery.site}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Material</span>
                <span className="font-bold text-slate-800">{selectedDelivery.material}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Expected</span>
                <span className="font-medium text-slate-700">
                  {selectedDelivery.expectedQty} {selectedDelivery.unit}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Received</span>
                <span className="font-bold text-slate-900">
                  {selectedDelivery.receivedQty} {selectedDelivery.unit}
                </span>
              </div>
              {selectedDelivery.shortage && (
                <div className="flex justify-between py-1 border-b border-slate-100 bg-rose-50/70 -mx-2 px-2 rounded">
                  <span className="text-rose-700 font-semibold">Shortage</span>
                  <span className="font-extrabold text-rose-700">{selectedDelivery.shortage}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Invoice No.</span>
                <span className="font-mono text-slate-800">{selectedDelivery.invoiceNo || 'INV-2025-00123'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Received On</span>
                <span className="text-slate-700">{selectedDelivery.receivedOn || '28 May 2025, 10:42 AM'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Received By</span>
                <span className="text-slate-700">{selectedDelivery.receivedBy || 'Rajesh Kumar'}</span>
              </div>

              {/* Photos Gallery */}
              <div className="pt-2">
                <span className="text-slate-400 block text-[11px] mb-2 font-medium">Delivery Proof Photos</span>
                <div className="grid grid-cols-3 gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80"
                    alt="Proof 1"
                    className="rounded-lg border border-slate-200 aspect-square object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=300&auto=format&fit=crop&q=80"
                    alt="Proof 2"
                    className="rounded-lg border border-slate-200 aspect-square object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=300&auto=format&fit=crop&q=80"
                    alt="Proof 3"
                    className="rounded-lg border border-slate-200 aspect-square object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedDelivery(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Delivery Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Record Consignment Delivery</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier *</label>
                <input
                  type="text"
                  required
                  value={newDlv.supplier}
                  onChange={(e) => setNewDlv({ ...newDlv, supplier: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site</label>
                  <select
                    value={newDlv.site}
                    onChange={(e) => setNewDlv({ ...newDlv, site: e.target.value })}
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
                  <label className="block font-semibold text-slate-700 mb-1">Material</label>
                  <input
                    type="text"
                    required
                    value={newDlv.material}
                    onChange={(e) => setNewDlv({ ...newDlv, material: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Qty</label>
                  <input
                    type="number"
                    value={newDlv.expectedQty}
                    onChange={(e) => setNewDlv({ ...newDlv, expectedQty: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Received Qty</label>
                  <input
                    type="number"
                    value={newDlv.receivedQty}
                    onChange={(e) => setNewDlv({ ...newDlv, receivedQty: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newDlv.unit}
                    onChange={(e) => setNewDlv({ ...newDlv, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white font-bold rounded-lg shadow-sm"
                >
                  Save Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
