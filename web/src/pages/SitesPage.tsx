import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardContext } from '../context/DashboardContext';
import { Button } from '../components/Button';
import { EmptyState, TableSkeleton } from '../components/common';
import { userService } from '../services/user.service';
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Eye,
  MapPin,
  User,
  Layers,
  Coins,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const SitesPage: React.FC = () => {
  const navigate = useNavigate();
  const { sites, addSite, updateSite, globalSearch, isLoadingData } = useDashboardContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [supervisors, setSupervisors] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [assignModalSite, setAssignModalSite] = useState<any | null>(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  useEffect(() => {
    userService
      .listUsers('supervisor')
      .then((users) => {
        if (Array.isArray(users)) {
          setSupervisors(users.map((u) => ({ id: u.id, name: u.name, email: u.email })));
        }
      })
      .catch(() => {});
  }, []);

  // Form State
  const [newSite, setNewSite] = useState({
    code: '',
    name: '',
    location: '',
    supervisor: '',
    supervisorId: '',
    supervisorEmail: '',
    projectType: '',
    contact: '',
  });

  const query = searchTerm || globalSearch;
  const filteredSites = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase()) ||
      s.location.toLowerCase().includes(query.toLowerCase()) ||
      s.supervisor.toLowerCase().includes(query.toLowerCase())
  );

  const handleSupervisorSelect = (supId: string) => {
    const chosen = supervisors.find((s) => s.id === supId);
    if (chosen) {
      setNewSite((prev) => ({
        ...prev,
        supervisor: chosen.name,
        supervisorId: chosen.id,
        supervisorEmail: chosen.email,
      }));
    } else {
      setNewSite((prev) => ({
        ...prev,
        supervisor: 'Unassigned',
        supervisorId: '',
        supervisorEmail: '',
      }));
    }
  };

  const handleOpenAssignModal = (site: any) => {
    setAssignModalSite(site);
    const match = supervisors.find(
      (s) =>
        (site.supervisorId && s.id === site.supervisorId) ||
        (site.supervisorEmail && s.email.toLowerCase() === site.supervisorEmail.toLowerCase()) ||
        s.name.toLowerCase() === site.supervisor?.toLowerCase()
    );
    setSelectedSupervisorId(match ? match.id : '');
  };

  const handleSaveAssignment = async () => {
    if (!assignModalSite) return;
    setIsSavingAssign(true);
    try {
      const chosen = supervisors.find((s) => s.id === selectedSupervisorId);
      await updateSite(assignModalSite.id, {
        supervisor: chosen ? chosen.name : 'Unassigned',
        supervisorId: chosen ? chosen.id : '',
        supervisorEmail: chosen ? chosen.email : '',
      });
      setAssignModalSite(null);
    } catch (err) {
      console.error('Failed to assign supervisor:', err);
    } finally {
      setIsSavingAssign(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.location) return;
    addSite({
      code: newSite.code || `RBL-S-00${sites.length + 1}`,
      name: newSite.name,
      location: newSite.location,
      supervisor: newSite.supervisor || 'Unassigned',
      supervisorId: newSite.supervisorId || undefined,
      supervisorEmail: newSite.supervisorEmail || undefined,
      projectType: newSite.projectType || 'Residential Construction',
      status: 'Active',
      contact: newSite.contact || '98765 43210',
    });
    setNewSite({
      code: '',
      name: '',
      location: '',
      supervisor: '',
      supervisorId: '',
      supervisorEmail: '',
      projectType: '',
      contact: '',
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sites / Projects</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage all active residential and commercial site locations</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Site
        </Button>
      </div>

      {/* Main Table Card */}
      {isLoadingData ? (
        <TableSkeleton rows={4} columns={6} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Search & Controls Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sites..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-700"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total {filteredSites.length} Sites
            </span>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Site Code</th>
                  <th className="py-3 px-4">Site Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Supervisor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total Materials</th>
                  <th className="py-3 px-4">Stock Value</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSites.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8">
                      <EmptyState
                        icon={<Building2 className="w-7 h-7 text-slate-400" />}
                        title={query ? 'No sites match your search' : 'No sites added yet'}
                        description={
                          query
                            ? `No projects found matching "${query}". Try clearing the search filter.`
                            : 'Start tracking construction inventory, progress photos, and material requests by creating your first site.'
                        }
                        actionLabel={query ? 'Clear Search' : 'Add New Site'}
                        onAction={query ? () => setSearchTerm('') : () => setShowAddModal(true)}
                        variant="default"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredSites.map((site) => (
                    <tr key={site.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                        {site.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                            <img
                              src={
                                site.imageUrl ||
                                'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={site.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{site.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {site.projectType || 'Residential Project'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{site.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {site.supervisor && site.supervisor !== 'Unassigned' && site.supervisor !== 'Site Engineer' ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#0D5C3A]" />
                              {site.supervisor}
                            </span>
                            {site.supervisorEmail && (
                              <span className="text-[10px] text-slate-400 font-mono">{site.supervisorEmail}</span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                            ⚠️ Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            site.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {site.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {site.totalMaterials}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {site.stockValueFormatted}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(site)}
                            className="px-2.5 py-1 rounded-lg bg-[#0D5C3A]/10 hover:bg-[#0D5C3A]/20 text-[#0D5C3A] font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                            title="Assign or change supervisor for this site"
                          >
                            <User className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                          <button
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="View Site"
                            onClick={() => navigate('/my-site')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing {filteredSites.length > 0 ? 1 : 0} to {filteredSites.length} of {sites.length} sites
            </span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 rounded border border-slate-200 bg-[#0D5C3A] text-white font-bold">
                1
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Construction Site</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Site Zeta"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site Code</label>
                  <input
                    type="text"
                    placeholder="e.g. RBL-S-006"
                    value={newSite.code}
                    onChange={(e) => setNewSite({ ...newSite, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai, TN"
                    value={newSite.location}
                    onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Supervisor</label>
                  <select
                    value={newSite.supervisorId}
                    onChange={(e) => handleSupervisorSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] bg-white font-medium text-slate-800"
                  >
                    <option value="">-- Select Supervisor --</option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 98765 43210"
                    value={newSite.contact}
                    onChange={(e) => setNewSite({ ...newSite, contact: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Type</label>
                <input
                  type="text"
                  placeholder="e.g. Commercial Complex"
                  value={newSite.projectType}
                  onChange={(e) => setNewSite({ ...newSite, projectType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                />
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
                  className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white font-bold rounded-lg shadow-sm"
                >
                  Add Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Supervisor Modal */}
      {assignModalSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0D5C3A]" />
                  <span>Assign Site Supervisor</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link an on-site supervisor to <strong className="text-slate-700">{assignModalSite.name}</strong> ({assignModalSite.code})
                </p>
              </div>
              <button
                onClick={() => setAssignModalSite(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Registered Supervisor
                </label>
                <select
                  value={selectedSupervisorId}
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-xs font-medium text-slate-800"
                >
                  <option value="">-- Unassigned (No Supervisor) --</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Strict Data Scoping</span>
                </span>
                <p className="text-emerald-700 leading-relaxed">
                  Only the assigned supervisor will see this site's inventory, material requests, deliveries, and progress photos. Other supervisors will not see or modify this project.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalSite(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingAssign}
                onClick={handleSaveAssignment}
                className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {isSavingAssign ? 'Saving...' : 'Save Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
