import React, { useState, useEffect } from 'react';
import { Calendar, RotateCcw, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { constructionService } from '../services/construction.service';
import { ProjectDuration, ProjectMaster } from '@project/shared';

export const ProjectDurationPage: React.FC = () => {
  const [durations, setDurations] = useState<ProjectDuration[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [siteName, setSiteName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [durData, projData] = await Promise.all([
        constructionService.getProjectDurations(),
        constructionService.getProjectsMaster(),
      ]);
      setDurations(durData || []);
      setProjects(projData || []);
      if (projData && projData.length > 0 && !projectName) {
        setProjectName(projData[0].projectName);
        setSiteName(projData[0].siteName);
      }
    } catch (err: any) {
      console.error('Failed to load project durations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProjectSelect = (proj: string) => {
    setProjectName(proj);
    const matched = projects.find((p) => p.projectName === proj);
    if (matched) {
      setSiteName(matched.siteName);
    }
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !siteName.trim() || !fromDate.trim() || !toDate.trim()) {
      setFeedback({ type: 'error', message: 'All fields are mandatory.' });
      return;
    }

    try {
      setSubmitting(true);
      await constructionService.createProjectDuration({
        projectName,
        siteName,
        fromDate,
        toDate,
      });
      setFeedback({ type: 'success', message: 'Project duration saved successfully.' });
      handleReset();
      await fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save project duration.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await constructionService.deleteProjectDuration(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete duration:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0A3925]/10 text-[#0A3925] rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Project Duration</h1>
            <p className="text-sm text-slate-500">Define milestone timelines and date ranges per project and site</p>
          </div>
        </div>
      </div>


      {/* Form: Project Duration */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          Set Project Duration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <select
                value={projectName}
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
                placeholder="Select or enter site (e.g. Site A)"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              />
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
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Table: Configured Project Durations */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Active Project Durations</span>
          <span className="text-xs font-normal text-slate-500">{durations.length} duration record(s)</span>
        </h2>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0A3925]" />
          </div>
        ) : durations.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No project duration configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Site Name</th>
                  <th className="py-3 px-4">From Date</th>
                  <th className="py-3 px-4">To Date</th>
                  <th className="py-3 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {durations.map((dur, idx) => (
                  <tr key={dur.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{dur.projectName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {dur.siteName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">{dur.fromDate}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">{dur.toDate}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(dur.id)}
                        className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
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
export default ProjectDurationPage;
