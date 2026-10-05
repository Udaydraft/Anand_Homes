import React, { useState, useEffect } from 'react';
import { HardHat, RotateCcw, CheckCircle2, AlertCircle, Loader2, Users } from 'lucide-react';
import { constructionService } from '../services/construction.service';
import { LabourEntry, ProjectMaster } from '@project/shared';

const NATURE_OF_WORK_OPTIONS = ['Construction', 'Installation', 'Maintenance', 'Testing', 'Others'];

export const LabourEntryPage: React.FC = () => {
  const [entries, setEntries] = useState<LabourEntry[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [project, setProject] = useState('');
  const [site, setSite] = useState('');
  const [natureOfWork, setNatureOfWork] = useState(NATURE_OF_WORK_OPTIONS[0]);
  const [type, setType] = useState<'Count (Labour)' | 'Other'>('Count (Labour)');
  const [workerCount, setWorkerCount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [labData, projData] = await Promise.all([
        constructionService.getLabourEntries(),
        constructionService.getProjectsMaster(),
      ]);
      setEntries(labData || []);
      setProjects(projData || []);

      if (projData && projData.length > 0 && !project) {
        setProject(projData[0].projectName);
        setSite(projData[0].siteName);
      }
    } catch (err: any) {
      console.error('Failed to load labour entries:', err);
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
    setWorkerCount('');
    setType('Count (Labour)');
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const countNum = parseInt(workerCount, 10);
    if (!project.trim() || !site.trim() || isNaN(countNum) || countNum <= 0) {
      setFeedback({ type: 'error', message: 'Please select project/site and enter a valid number of workers.' });
      return;
    }

    try {
      setSubmitting(true);
      await constructionService.createLabourEntry({
        date,
        project,
        site,
        natureOfWork,
        type,
        workerCount: countNum,
      });

      setFeedback({ type: 'success', message: 'Labour deployment entry recorded successfully.' });
      handleReset();
      await fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to record labour entry.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await constructionService.deleteLabourEntry(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete labour record:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Labour Entry</h1>
            <p className="text-sm text-slate-500">Record on-site workforce headcounts, nature of work, and daily deployment logs</p>
          </div>
        </div>
      </div>


      {/* Form: Labour Entry */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          Record Daily Labour
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Project <span className="text-red-500">*</span>
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
                Site <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Select or enter site"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Nature of Work <span className="text-red-500">*</span>
              </label>
              <select
                value={natureOfWork}
                onChange={(e) => setNatureOfWork(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              >
                {NATURE_OF_WORK_OPTIONS.map((now) => (
                  <option key={now} value={now}>
                    {now}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="labourType"
                    checked={type === 'Count (Labour)'}
                    onChange={() => setType('Count (Labour)')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Count (Labour)</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="labourType"
                    checked={type === 'Other'}
                    onChange={() => setType('Other')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Other</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                No. of Workers <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="Enter number (e.g. 15)"
                value={workerCount}
                onChange={(e) => setWorkerCount(e.target.value)}
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

      {/* Table: Labour Records */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Labour Logs</span>
          <span className="text-xs font-normal text-slate-500">{entries.length} log(s) recorded</span>
        </h2>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0A3925]" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No labour entries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Nature of Work</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">No. of Workers</th>
                  <th className="py-3 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {entries.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 text-slate-500">{entry.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{entry.project}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {entry.site}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{entry.natureOfWork}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-700 flex items-center justify-end gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {entry.workerCount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(entry.id)}
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
export default LabourEntryPage;
