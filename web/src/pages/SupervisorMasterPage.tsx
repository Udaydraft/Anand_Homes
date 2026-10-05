import React, { useState, useEffect } from 'react';
import { Users, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { constructionService } from '../services/construction.service';
import { SupervisorMaster, ProjectMaster } from '@project/shared';

export const SupervisorMasterPage: React.FC = () => {
  const [supervisors, setSupervisors] = useState<SupervisorMaster[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [project, setProject] = useState('');
  const [site, setSite] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [supData, projData] = await Promise.all([
        constructionService.getSupervisorsMaster(),
        constructionService.getProjectsMaster(),
      ]);
      setSupervisors(supData || []);
      setProjects(projData || []);
      if (projData && projData.length > 0 && !project) {
        setProject(projData[0].projectName);
        setSite(projData[0].siteName);
      }
    } catch (err: any) {
      console.error('Failed to load supervisor master data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProjectSelect = (projName: string) => {
    setProject(projName);
    const matched = projects.find((p) => p.projectName === projName);
    if (matched) {
      setSite(matched.siteName);
    }
  };

  const handleReset = () => {
    setName('');
    setLoginId('');
    setPassword('');
    setEditingId(null);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !loginId.trim() || !project.trim() || !site.trim()) {
      setFeedback({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }
    if (!editingId && !password.trim()) {
      setFeedback({ type: 'error', message: 'Password is required when creating a new supervisor.' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await constructionService.updateSupervisorMaster(editingId, {
          name,
          loginId,
          project,
          site,
          ...(password ? { password } : {}),
        });
        setFeedback({ type: 'success', message: 'Supervisor updated successfully.' });
      } else {
        await constructionService.createSupervisorMaster({
          name,
          loginId,
          password,
          project,
          site,
        });
        setFeedback({ type: 'success', message: 'Supervisor registered and assigned successfully.' });
      }
      handleReset();
      await fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sup: SupervisorMaster) => {
    setEditingId(sup.id);
    setName(sup.name);
    setLoginId(sup.loginId);
    setPassword('');
    setProject(sup.project);
    setSite(sup.site);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      await constructionService.deleteSupervisorMaster(id);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to delete supervisor:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0A3925]/10 text-[#0A3925] rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Supervisor Master</h1>
            <p className="text-sm text-slate-500">Create site supervisors and assign them to specific project & site locations</p>
          </div>
        </div>
      </div>


      {/* Form: Create / Edit Supervisor & Assign */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Create / Edit Supervisor */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
              {editingId ? 'Edit Supervisor' : 'Create / Edit Supervisor'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Supervisor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter supervisor name (e.g. Ramesh Kumar)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Supervisor Login (Username) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter login username (e.g. ramesh)"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Password <span className="text-red-500">{editingId ? '' : '*'}</span>
                </label>
                <input
                  type="password"
                  placeholder={editingId ? 'Leave blank to keep unchanged' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                  required={!editingId}
                />
              </div>
            </div>
          </div>

          {/* Section: Assign Project & Site */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
              Assign Project & Site
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={project}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                  required
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.projectName}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Select site (e.g. Site A)"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
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
              ) : (
                'Save'
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Table: Supervisor List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Supervisor List</span>
          <span className="text-xs font-normal text-slate-500">{supervisors.length} supervisor(s)</span>
        </h2>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0A3925]" />
          </div>
        ) : supervisors.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No supervisors registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Login ID</th>
                  <th className="py-3 px-4 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {supervisors.map((sup, idx) => (
                  <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{sup.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{sup.project}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {sup.site}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{sup.loginId}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(sup)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sup.id)}
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
export default SupervisorMasterPage;
