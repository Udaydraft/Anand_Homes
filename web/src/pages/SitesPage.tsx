import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardContext } from '../context/DashboardContext';
import { Button } from '../components/Button';
import { EmptyState, TableSkeleton, ImageUploadField } from '../components/common';
import { resolveImageUrl } from '../services/api';
import { userService } from '../services/user.service';
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Eye,
  MapPin,
  User,
  Users,
  UserPlus,
  Layers,
  Coins,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  Key,
  Mail,
  Edit2,
  Check,
} from 'lucide-react';

export const SitesPage: React.FC = () => {
  const navigate = useNavigate();
  const { sites, addSite, updateSite, deleteSite, globalSearch, isLoadingData } = useDashboardContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSite, setEditingSite] = useState<any | null>(null);
  const [deletingSite, setDeletingSite] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // Supervisors state & management
  const [supervisors, setSupervisors] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [showSupervisorsModal, setShowSupervisorsModal] = useState(false);
  const [newSupervisor, setNewSupervisor] = useState({ name: '', email: '', password: '' });
  const [isCreatingSupervisor, setIsCreatingSupervisor] = useState(false);
  const [supervisorError, setSupervisorError] = useState<string | null>(null);
  const [supervisorSuccess, setSupervisorSuccess] = useState<string | null>(null);

  // Quick supervisor add within Assign modal
  const [showQuickAddSupervisor, setShowQuickAddSupervisor] = useState(false);
  const [quickSupervisor, setQuickSupervisor] = useState({ name: '', email: '', password: '' });
  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  // Edit supervisor modal state
  const [editingSupervisor, setEditingSupervisor] = useState<{ id: string; name: string; email: string; password?: string } | null>(null);
  const [isSavingSupervisorEdit, setIsSavingSupervisorEdit] = useState(false);
  const [editSupervisorError, setEditSupervisorError] = useState<string | null>(null);

  // Delete supervisor state
  const [deletingSupervisor, setDeletingSupervisor] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isDeletingSupervisor, setIsDeletingSupervisor] = useState(false);

  // Site assignment modal
  const [assignModalSite, setAssignModalSite] = useState<any | null>(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  const fetchSupervisors = async () => {
    try {
      const users = await userService.listUsers('supervisor');
      if (Array.isArray(users)) {
        setSupervisors(users.map((u) => ({ id: u.id, name: u.name, email: u.email })));
      }
    } catch (err) {
      console.error('Failed to load supervisors:', err);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupervisor.name.trim() || !newSupervisor.email.trim() || !newSupervisor.password) {
      setSupervisorError('Name, Email, and Password are required.');
      return;
    }
    setIsCreatingSupervisor(true);
    setSupervisorError(null);
    setSupervisorSuccess(null);
    try {
      const created = await userService.createUser({
        name: newSupervisor.name.trim(),
        email: newSupervisor.email.trim().toLowerCase(),
        password: newSupervisor.password,
        role: 'supervisor',
      });
      setSupervisorSuccess(`Supervisor "${created.name}" registered successfully!`);
      setNewSupervisor({ name: '', email: '', password: '' });
      await fetchSupervisors();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to create supervisor account.';
      setSupervisorError(msg);
    } finally {
      setIsCreatingSupervisor(false);
    }
  };

  const handleQuickCreateAndAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSupervisor.name.trim() || !quickSupervisor.email.trim() || !quickSupervisor.password) {
      setQuickError('Name, Email, and Password are required.');
      return;
    }
    if (!assignModalSite) return;
    setIsQuickCreating(true);
    setQuickError(null);
    try {
      const created = await userService.createUser({
        name: quickSupervisor.name.trim(),
        email: quickSupervisor.email.trim().toLowerCase(),
        password: quickSupervisor.password,
        role: 'supervisor',
      });
      await fetchSupervisors();
      await updateSite(assignModalSite.id, {
        supervisor: created.name,
        supervisorId: created.id,
        supervisorEmail: created.email,
      });
      setQuickSupervisor({ name: '', email: '', password: '' });
      setShowQuickAddSupervisor(false);
      setAssignModalSite(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to create and assign supervisor.';
      setQuickError(msg);
    } finally {
      setIsQuickCreating(false);
    }
  };

  const handleUpdateSupervisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupervisor) return;
    setIsSavingSupervisorEdit(true);
    setEditSupervisorError(null);
    try {
      const payload: any = {
        name: editingSupervisor.name.trim(),
        email: editingSupervisor.email.trim().toLowerCase(),
      };
      if (editingSupervisor.password && editingSupervisor.password.trim()) {
        payload.password = editingSupervisor.password.trim();
      }
      await userService.updateUser(editingSupervisor.id, payload);
      await fetchSupervisors();
      setEditingSupervisor(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update supervisor.';
      setEditSupervisorError(msg);
    } finally {
      setIsSavingSupervisorEdit(false);
    }
  };

  const handleDeleteSupervisorConfirm = async () => {
    if (!deletingSupervisor) return;
    setIsDeletingSupervisor(true);
    try {
      await userService.deleteUser(deletingSupervisor.id);
      await fetchSupervisors();
      setDeletingSupervisor(null);
    } catch (err: any) {
      console.error('Failed to delete supervisor:', err);
    } finally {
      setIsDeletingSupervisor(false);
    }
  };

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
    imageUrl: '',
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
      imageUrl: newSite.imageUrl || undefined,
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
      imageUrl: '',
    });
    setShowAddModal(false);
  };

  const handleOpenEditModal = (site: any) => {
    setEditingSite({
      id: site.id,
      name: site.name || '',
      code: site.code || '',
      location: site.location || '',
      supervisor: site.supervisor || '',
      supervisorId: site.supervisorId || '',
      supervisorEmail: site.supervisorEmail || '',
      projectType: site.projectType || 'Residential Construction',
      contact: site.contact || '',
      status: site.status || 'Active',
      imageUrl: site.imageUrl || '',
    });
  };

  const handleEditSupervisorSelect = (supId: string) => {
    const chosen = supervisors.find((s) => s.id === supId);
    if (chosen) {
      setEditingSite((prev: any) => ({
        ...prev,
        supervisor: chosen.name,
        supervisorId: chosen.id,
        supervisorEmail: chosen.email,
      }));
    } else {
      setEditingSite((prev: any) => ({
        ...prev,
        supervisor: 'Unassigned',
        supervisorId: '',
        supervisorEmail: '',
      }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite || !editingSite.name || !editingSite.location) return;
    setIsSavingEdit(true);
    try {
      await updateSite(editingSite.id, {
        name: editingSite.name,
        code: editingSite.code,
        location: editingSite.location,
        supervisor: editingSite.supervisor || 'Unassigned',
        supervisorId: editingSite.supervisorId || undefined,
        supervisorEmail: editingSite.supervisorEmail || undefined,
        projectType: editingSite.projectType,
        contact: editingSite.contact,
        status: editingSite.status,
        imageUrl: editingSite.imageUrl || undefined,
      });
      setEditingSite(null);
    } catch (err) {
      console.error('Failed to update site:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSite) return;
    setIsDeleting(true);
    try {
      await deleteSite(deletingSite.id);
      setDeletingSite(null);
    } catch (err) {
      console.error('Failed to delete site:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sites / Projects</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage all active residential and commercial site locations</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSupervisorError(null);
              setSupervisorSuccess(null);
              setShowSupervisorsModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
          >
            <Users className="w-4 h-4 text-[#0D5C3A]" />
            <span>Manage Supervisors</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-[#0D5C3A]">
              {supervisors.length}
            </span>
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Site
          </Button>
        </div>
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
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-900 font-medium placeholder:text-slate-400"
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
                                site.imageUrl
                                  ? resolveImageUrl(site.imageUrl)
                                  : 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=100&auto=format&fit=crop&q=80'
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(site)}
                            className="px-2 py-1 rounded-lg bg-[#0D5C3A]/10 hover:bg-[#0D5C3A]/20 text-[#0D5C3A] font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                            title="Assign or change supervisor for this site"
                          >
                            <User className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(site)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-[#0D5C3A] hover:bg-emerald-50 transition-colors"
                            title="Edit Site"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingSite(site)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Site"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Supervisor</label>
                  <select
                    value={newSite.supervisorId}
                    onChange={(e) => handleSupervisorSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] bg-white font-medium text-slate-900"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Image Upload Field */}
              <ImageUploadField
                value={newSite.imageUrl}
                onChange={(url) => setNewSite({ ...newSite, imageUrl: url })}
                label="Site / Project Banner Photo"
                helperText="Upload site entrance, 3D blueprint, or work-in-progress banner"
              />

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

      {/* Edit Site Modal */}
      {editingSite && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#0D5C3A]" />
                  <span>Edit Construction Site</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Modify project details, supervisor, or update photo</p>
              </div>
              <button
                onClick={() => setEditingSite(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Name *</label>
                <input
                  type="text"
                  required
                  value={editingSite.name}
                  onChange={(e) => setEditingSite({ ...editingSite, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site Code</label>
                  <input
                    type="text"
                    value={editingSite.code}
                    onChange={(e) => setEditingSite({ ...editingSite, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={editingSite.location}
                    onChange={(e) => setEditingSite({ ...editingSite, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Supervisor</label>
                  <select
                    value={editingSite.supervisorId || ''}
                    onChange={(e) => handleEditSupervisorSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] bg-white font-medium text-slate-900"
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
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingSite.status || 'Active'}
                    onChange={(e) => setEditingSite({ ...editingSite, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] bg-white font-medium text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Type</label>
                  <input
                    type="text"
                    value={editingSite.projectType}
                    onChange={(e) => setEditingSite({ ...editingSite, projectType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editingSite.contact}
                    onChange={(e) => setEditingSite({ ...editingSite, contact: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              {/* Image Upload Field for Edit */}
              <ImageUploadField
                value={editingSite.imageUrl}
                onChange={(url) => setEditingSite({ ...editingSite, imageUrl: url })}
                label="Site / Project Banner Photo"
                helperText="Upload a new photo or replace existing banner"
              />

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingEdit ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Site Confirmation Modal */}
      {deletingSite && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">Delete Construction Site?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-800">{deletingSite.name}</strong> ({deletingSite.code})?
                  This action removes the site and its linkages.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingSite(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Supervisor Modal */}
      {assignModalSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
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
                onClick={() => {
                  setAssignModalSite(null);
                  setShowQuickAddSupervisor(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!showQuickAddSupervisor ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Registered Supervisor
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickAddSupervisor(true);
                        setQuickError(null);
                      }}
                      className="text-xs font-bold text-[#0D5C3A] hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ New Supervisor</span>
                    </button>
                  </div>
                  <select
                    value={selectedSupervisorId}
                    onChange={(e) => setSelectedSupervisorId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-xs font-medium text-slate-900"
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
                    className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSavingAssign && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSavingAssign ? 'Saving...' : 'Save Assignment'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Inline Quick Register & Assign Form */
              <form onSubmit={handleQuickCreateAndAssign} className="space-y-3">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <UserPlus className="w-3.5 h-3.5 text-[#0D5C3A]" />
                    <span>Create & Assign Supervisor</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Register a new supervisor account and immediately link them to this project.
                  </p>
                </div>

                {quickError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {quickError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Varma"
                    value={quickSupervisor.name}
                    onChange={(e) => setQuickSupervisor({ ...quickSupervisor, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@anandhomes.com"
                    value={quickSupervisor.email}
                    onChange={(e) => setQuickSupervisor({ ...quickSupervisor, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={quickSupervisor.password}
                    onChange={(e) => setQuickSupervisor({ ...quickSupervisor, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddSupervisor(false)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back to Selection
                  </button>
                  <button
                    type="submit"
                    disabled={isQuickCreating}
                    className="px-4 py-1.5 bg-[#0D5C3A] hover:bg-[#0A482E] text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isQuickCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isQuickCreating ? 'Creating & Linking...' : 'Create & Assign'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Supervisors Directory & Management Modal */}
      {showSupervisorsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0D5C3A]" />
                  <span>Site Supervisors Management</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create, configure, edit, or remove supervisor accounts for on-site construction tracking
                </p>
              </div>
              <button
                onClick={() => setShowSupervisorsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create New Supervisor Form Card */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <UserPlus className="w-4 h-4 text-[#0D5C3A]" />
                <span>Register New Supervisor Account</span>
              </h4>

              {supervisorError && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {supervisorError}
                </div>
              )}
              {supervisorSuccess && (
                <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{supervisorSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateSupervisor} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={newSupervisor.name}
                    onChange={(e) => setNewSupervisor({ ...newSupervisor, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-900 font-medium placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh@anandhomes.com"
                    value={newSupervisor.email}
                    onChange={(e) => setNewSupervisor({ ...newSupervisor, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-900 font-medium placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Initial Password *</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={newSupervisor.password}
                      onChange={(e) => setNewSupervisor({ ...newSupervisor, password: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-900 font-medium placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={isCreatingSupervisor}
                      className="px-3.5 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white rounded-lg text-xs font-bold shrink-0 shadow-sm transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      {isCreatingSupervisor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Current Supervisors List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  Registered Supervisors ({supervisors.length})
                </h4>
                <span className="text-[11px] text-slate-400">
                  Supervisors can log in via web or mobile application
                </span>
              </div>

              {supervisors.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No site supervisors registered yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to add your first supervisor.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Supervisor</th>
                        <th className="py-2.5 px-3">Assigned Site(s)</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {supervisors.map((sup) => {
                        const assignedSites = sites.filter(
                          (s) =>
                            s.supervisorId === sup.id ||
                            (s.supervisorEmail && s.supervisorEmail.toLowerCase() === sup.email.toLowerCase()) ||
                            (s.supervisor && s.supervisor.toLowerCase() === sup.name.toLowerCase())
                        );

                        return (
                          <tr key={sup.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0D5C3A] font-bold flex items-center justify-center text-xs shrink-0">
                                  {sup.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{sup.name}</div>
                                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{sup.email}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {assignedSites.length === 0 ? (
                                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
                                  No site assigned
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {assignedSites.map((site) => (
                                    <span
                                      key={site.id}
                                      className="inline-block px-2 py-0.5 bg-emerald-50 text-[#0D5C3A] border border-emerald-200/60 rounded text-[10px] font-bold"
                                    >
                                      {site.name} ({site.code})
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSupervisor({ id: sup.id, name: sup.name, email: sup.email });
                                    setEditSupervisorError(null);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#0D5C3A] hover:bg-emerald-50 transition-colors"
                                  title="Edit Supervisor"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingSupervisor(sup)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete Supervisor"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSupervisorsModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supervisor Modal */}
      {editingSupervisor && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3.5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-[#0D5C3A]" />
                <span>Edit Supervisor</span>
              </h3>
              <button
                onClick={() => setEditingSupervisor(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editSupervisorError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {editSupervisorError}
              </div>
            )}

            <form onSubmit={handleUpdateSupervisorSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingSupervisor.name}
                  onChange={(e) => setEditingSupervisor({ ...editingSupervisor, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingSupervisor.email}
                  onChange={(e) => setEditingSupervisor({ ...editingSupervisor, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty to keep unchanged"
                  value={editingSupervisor.password || ''}
                  onChange={(e) => setEditingSupervisor({ ...editingSupervisor, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSupervisor(null)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSupervisorEdit}
                  className="px-4 py-1.5 bg-[#0D5C3A] hover:bg-[#0A482E] text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingSupervisorEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingSupervisorEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Supervisor Confirmation Modal */}
      {deletingSupervisor && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Delete Supervisor Account?</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-800">{deletingSupervisor.name}</strong> ({deletingSupervisor.email})?
                  This supervisor will lose access to all sites.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingSupervisor(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingSupervisor}
                onClick={handleDeleteSupervisorConfirm}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeletingSupervisor && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{isDeletingSupervisor ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
