import React, { useState } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { MaterialRequest } from '@project/shared';

export const MaterialRequestsPage: React.FC = () => {
  const {
    roleMode,
    materialRequests,
    sitesList,
    createMaterialRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    globalSearch,
  } = useDashboardContext();

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New Request Form State
  const [newReq, setNewReq] = useState({
    site: 'Site Alpha',
    material: 'Cement',
    quantity: '100',
    unit: 'Bags',
    purpose: 'Foundation Work',
    requiredDate: '02 Jun 2025',
    notes: '',
  });

  const materials = ['Cement', 'Steel 12mm', 'Sand', 'Bricks', 'Paint', 'Gravel 20mm', 'Plywood', 'Rods 8mm'];
  const units = ['Bags', 'Ton', 'Loads', 'Nos', 'Boxes', 'Sheets'];

  const query = searchTerm || globalSearch;
  const filteredRequests = materialRequests.filter((r) => {
    const matchesTab = activeTab === 'All' || r.status === activeTab;
    const matchesSearch =
      r.requestId.toLowerCase().includes(query.toLowerCase()) ||
      r.site.toLowerCase().includes(query.toLowerCase()) ||
      r.material.toLowerCase().includes(query.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMaterialRequest({
      site: newReq.site,
      material: newReq.material,
      quantity: parseFloat(newReq.quantity) || 1,
      unit: newReq.unit,
      purpose: newReq.purpose,
      requiredDate: newReq.requiredDate,
      notes: newReq.notes,
    });
    setShowNewModal(false);
    setActiveTab('Pending');
  };

  return (
    <div className="space-y-5">
      {/* Top Header & New Request Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Material Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit, track, and approve site material indents and allocations
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tabs & Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
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
                {tab === 'Pending' && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                    {materialRequests.filter((r) => r.status === 'Pending').length}
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
              placeholder="Search requests..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-700"
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Site</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Requested On</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {req.requestId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{req.site}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{req.material}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {req.quantity} {req.unit}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{req.requestedBy}</td>
                  <td className="py-3.5 px-4 text-slate-500">{req.requestedOn}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : req.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-[#0D5C3A] hover:bg-emerald-50 transition-colors"
                      title="View Request Details"
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
          <span>Showing 1 to {filteredRequests.length} of {materialRequests.length} requests</span>
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

      {/* Request Details Drawer / Modal (Image 3 Screen 6 & Image 4 Screen 12) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-slate-900">{selectedRequest.requestId}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedRequest.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : selectedRequest.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {selectedRequest.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Fields Grid */}
            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Site</span>
                  <span className="font-bold text-slate-800">{selectedRequest.site}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Material</span>
                  <span className="font-bold text-slate-800">{selectedRequest.material}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Quantity</span>
                  <span className="font-bold text-slate-800">
                    {selectedRequest.quantity} {selectedRequest.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Required Date</span>
                  <span className="font-bold text-slate-800">{selectedRequest.requiredDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Requested By</span>
                  <span className="font-medium text-slate-700">{selectedRequest.requestedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Requested On</span>
                  <span className="font-medium text-slate-700">{selectedRequest.requestedOn}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Purpose</span>
                <span className="font-medium text-slate-800">{selectedRequest.purpose}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Notes</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1 leading-relaxed">
                  {selectedRequest.notes || 'Required for ongoing construction work stage.'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Attachments</span>
                <span className="text-slate-500 italic mt-0.5 block">No file attached</span>
              </div>
            </div>

            {/* Action Buttons depending on role */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {roleMode === 'admin' ? (
                <>
                  <button
                    onClick={() => {
                      rejectRequest(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      approveRequest(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="px-5 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Approve
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    cancelRequest(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-lg"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create Material Request</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site *</label>
                <select
                  value={newReq.site}
                  onChange={(e) => setNewReq({ ...newReq, site: e.target.value })}
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
                <label className="block font-semibold text-slate-700 mb-1">Material *</label>
                <select
                  value={newReq.material}
                  onChange={(e) => setNewReq({ ...newReq, material: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D5C3A]"
                >
                  {materials.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newReq.quantity}
                    onChange={(e) => setNewReq({ ...newReq, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={newReq.unit}
                    onChange={(e) => setNewReq({ ...newReq, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D5C3A]"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Date</label>
                <input
                  type="text"
                  value={newReq.requiredDate}
                  onChange={(e) => setNewReq({ ...newReq, requiredDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose *</label>
                <input
                  type="text"
                  required
                  value={newReq.purpose}
                  onChange={(e) => setNewReq({ ...newReq, purpose: e.target.value })}
                  placeholder="e.g. Foundation Work, Slab Casting"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newReq.notes}
                  onChange={(e) => setNewReq({ ...newReq, notes: e.target.value })}
                  placeholder="Special instructions or urgency..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white font-bold rounded-lg shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
