import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Users,
  Calendar,
  Sparkles,
  Plus,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardHat,
  ArrowRight,
  Shield,
  Clock,
  Layers,
} from 'lucide-react';
import { constructionService } from '../services/construction.service';
import { ProjectMaster, SupervisorMaster, ProjectDuration } from '@project/shared';

type TabType = 'all-in-one' | 'projects' | 'supervisors' | 'durations';

export const ProjectMasterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state (synced with query param ?tab=...)
  const initialTab = (searchParams.get('tab') as TabType) || 'all-in-one';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Sync tab with URL
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(tab === 'all-in-one' ? {} : { tab });
    setFeedback(null);
  };

  // Shared Data States
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [supervisors, setSupervisors] = useState<SupervisorMaster[]>([]);
  const [durations, setDurations] = useState<ProjectDuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // -------------------------------------------------------------------------
  // Form State: 1. All-in-One Fast Setup
  // -------------------------------------------------------------------------
  const [aioProjectName, setAioProjectName] = useState('');
  const [aioSiteName, setAioSiteName] = useState('');
  const [aioStatus, setAioStatus] = useState('Active');
  const [aioAssignSupervisor, setAioAssignSupervisor] = useState(true);
  const [aioSupervisorName, setAioSupervisorName] = useState('');
  const [aioSupervisorLogin, setAioSupervisorLogin] = useState('');
  const [aioSupervisorPassword, setAioSupervisorPassword] = useState('');
  const [aioSetDuration, setAioSetDuration] = useState(true);
  const [aioFromDate, setAioFromDate] = useState('');
  const [aioToDate, setAioToDate] = useState('');

  // -------------------------------------------------------------------------
  // Form State: 2. Project Master Tab
  // -------------------------------------------------------------------------
  const [pProjectName, setPProjectName] = useState('');
  const [pSiteName, setPSiteName] = useState('');
  const [pStatus, setPStatus] = useState('Active');
  const [pEditingId, setPEditingId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Form State: 3. Supervisor Master Tab
  // -------------------------------------------------------------------------
  const [sName, setSName] = useState('');
  const [sLoginId, setSLoginId] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [sProject, setSProject] = useState('');
  const [sSite, setSSite] = useState('');
  const [sEditingId, setSEditingId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Form State: 4. Project Duration Tab
  // -------------------------------------------------------------------------
  const [dProjectName, setDProjectName] = useState('');
  const [dSiteName, setDSiteName] = useState('');
  const [dFromDate, setDFromDate] = useState('');
  const [dToDate, setDToDate] = useState('');

  // Fetch all 3 datasets in parallel
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [projData, supData, durData] = await Promise.all([
        constructionService.getProjectsMaster(),
        constructionService.getSupervisorsMaster(),
        constructionService.getProjectDurations(),
      ]);
      setProjects(projData || []);
      setSupervisors(supData || []);
      setDurations(durData || []);

      if (projData && projData.length > 0) {
        if (!sProject) {
          setSProject(projData[0].projectName);
          setSSite(projData[0].siteName);
        }
        if (!dProjectName) {
          setDProjectName(projData[0].projectName);
          setDSiteName(projData[0].siteName);
        }
      }
    } catch (err: any) {
      console.error('Failed to load project setup data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update tab if URL param changes externally
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['all-in-one', 'projects', 'supervisors', 'durations'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // -------------------------------------------------------------------------
  // Handler: All-in-One Fast Submit
  // -------------------------------------------------------------------------
  const handleAioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aioProjectName.trim() || !aioSiteName.trim()) {
      setFeedback({ type: 'error', message: 'Project Name and Site Name are mandatory.' });
      return;
    }

    if (aioAssignSupervisor) {
      if (!aioSupervisorName.trim() || !aioSupervisorLogin.trim() || !aioSupervisorPassword.trim()) {
        setFeedback({
          type: 'error',
          message: 'Please complete all supervisor details or uncheck "Assign Supervisor Now".',
        });
        return;
      }
    }

    if (aioSetDuration) {
      if (!aioFromDate || !aioToDate) {
        setFeedback({
          type: 'error',
          message: 'Please specify both From Date and To Date, or uncheck "Set Project Duration Now".',
        });
        return;
      }
      if (new Date(aioFromDate) > new Date(aioToDate)) {
        setFeedback({ type: 'error', message: 'From Date cannot be later than To Date.' });
        return;
      }
    }

    try {
      setSubmitting(true);
      // 1. Create Project Master
      await constructionService.createProjectMaster({
        projectName: aioProjectName.trim(),
        siteName: aioSiteName.trim(),
        status: aioStatus,
      });

      // 2. Optional: Create Supervisor Master
      if (aioAssignSupervisor && aioSupervisorName.trim() && aioSupervisorLogin.trim()) {
        await constructionService.createSupervisorMaster({
          name: aioSupervisorName.trim(),
          loginId: aioSupervisorLogin.trim(),
          password: aioSupervisorPassword.trim(),
          project: aioProjectName.trim(),
          site: aioSiteName.trim(),
        });
      }

      // 3. Optional: Create Project Duration
      if (aioSetDuration && aioFromDate && aioToDate) {
        await constructionService.createProjectDuration({
          projectName: aioProjectName.trim(),
          siteName: aioSiteName.trim(),
          fromDate: aioFromDate,
          toDate: aioToDate,
        });
      }

      setFeedback({
        type: 'success',
        message: `Project "${aioProjectName}" with site "${aioSiteName}" created successfully with supervisor & duration!`,
      });

      // Reset All-in-One inputs
      setAioProjectName('');
      setAioSiteName('');
      setAioSupervisorName('');
      setAioSupervisorLogin('');
      setAioSupervisorPassword('');
      setAioFromDate('');
      setAioToDate('');

      await fetchAllData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to complete project setup. Please verify inputs.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Handler: Project Master Tab Submit
  // -------------------------------------------------------------------------
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pProjectName.trim() || !pSiteName.trim()) {
      setFeedback({ type: 'error', message: 'Project Name and Site Name are required.' });
      return;
    }

    try {
      setSubmitting(true);
      if (pEditingId) {
        await constructionService.updateProjectMaster(pEditingId, {
          projectName: pProjectName.trim(),
          siteName: pSiteName.trim(),
          status: pStatus,
        });
        setFeedback({ type: 'success', message: 'Project updated successfully.' });
      } else {
        await constructionService.createProjectMaster({
          projectName: pProjectName.trim(),
          siteName: pSiteName.trim(),
          status: pStatus,
        });
        setFeedback({ type: 'success', message: 'Project created successfully.' });
      }
      setPProjectName('');
      setPSiteName('');
      setPStatus('Active');
      setPEditingId(null);
      await fetchAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await constructionService.deleteProjectMaster(id);
      await fetchAllData();
    } catch {
      console.error('Failed to delete project.');
    }
  };

  // -------------------------------------------------------------------------
  // Handler: Supervisor Master Tab Submit
  // -------------------------------------------------------------------------
  const handleSupervisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sLoginId.trim() || !sProject.trim() || !sSite.trim()) {
      setFeedback({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }
    if (!sEditingId && !sPassword.trim()) {
      setFeedback({ type: 'error', message: 'Password is required when creating a new supervisor.' });
      return;
    }

    try {
      setSubmitting(true);
      if (sEditingId) {
        await constructionService.updateSupervisorMaster(sEditingId, {
          name: sName.trim(),
          loginId: sLoginId.trim(),
          project: sProject,
          site: sSite,
          ...(sPassword ? { password: sPassword } : {}),
        });
        setFeedback({ type: 'success', message: 'Supervisor updated successfully.' });
      } else {
        await constructionService.createSupervisorMaster({
          name: sName.trim(),
          loginId: sLoginId.trim(),
          password: sPassword.trim(),
          project: sProject,
          site: sSite,
        });
        setFeedback({
          type: 'success',
          message: `Supervisor "${sName}" registered! User login created, assigned to site "${sSite}", and notice dispatched!`,
        });
      }
      setSName('');
      setSLoginId('');
      setSPassword('');
      setSEditingId(null);
      await fetchAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSupervisor = async (id: string) => {
    try {
      await constructionService.deleteSupervisorMaster(id);
      await fetchAllData();
    } catch {
      console.error('Failed to delete supervisor.');
    }
  };

  // -------------------------------------------------------------------------
  // Handler: Project Duration Tab Submit
  // -------------------------------------------------------------------------
  const handleDurationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dProjectName.trim() || !dSiteName.trim() || !dFromDate.trim() || !dToDate.trim()) {
      setFeedback({ type: 'error', message: 'All duration fields are mandatory.' });
      return;
    }
    if (new Date(dFromDate) > new Date(dToDate)) {
      setFeedback({ type: 'error', message: 'From Date cannot be later than To Date.' });
      return;
    }

    try {
      setSubmitting(true);
      await constructionService.createProjectDuration({
        projectName: dProjectName,
        siteName: dSiteName,
        fromDate: dFromDate,
        toDate: dToDate,
      });
      setFeedback({ type: 'success', message: 'Project duration saved successfully.' });
      setDFromDate('');
      setDToDate('');
      await fetchAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save duration.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDuration = async (id: string) => {
    try {
      await constructionService.deleteProjectDuration(id);
      await fetchAllData();
    } catch {
      console.error('Failed to delete duration schedule.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick KPI Counters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-[#0A3925]/10 text-[#0A3925] rounded-2xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-[#0A3925]">
                Unified Project Master
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Single-Screen Workflow</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">Project & Site Setup Hub</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Register projects, assign site supervisors, and define timeline milestones all in one place.
            </p>
          </div>
        </div>

        {/* 3 Quick Counters */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs text-slate-500 block font-medium">Projects</span>
            <span className="text-base font-extrabold text-slate-800">{projects.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs text-slate-500 block font-medium">Supervisors</span>
            <span className="text-base font-extrabold text-[#0D5C3A]">{supervisors.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs text-slate-500 block font-medium">Durations</span>
            <span className="text-base font-extrabold text-blue-600">{durations.length}</span>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => handleTabChange('all-in-one')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'all-in-one'
              ? 'bg-[#0A3925] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>⚡ Fast All-in-One Setup</span>
        </button>

        <button
          onClick={() => handleTabChange('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'projects'
              ? 'bg-[#0A3925] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1. Project Master ({projects.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('supervisors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'supervisors'
              ? 'bg-[#0A3925] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>2. Supervisor Master ({supervisors.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('durations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'durations'
              ? 'bg-[#0A3925] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>3. Project Duration ({durations.length})</span>
        </button>
      </div>



      {/* ===================================================================== */}
      {/* TAB 1: ALL-IN-ONE COMPLETE PROJECT SETUP (USER EXPERIENCE HIGHLIGHT)    */}
      {/* ===================================================================== */}
      {activeTab === 'all-in-one' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Fast Project Onboarding (Complete Setup in 1 Step)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register the project, appoint a site supervisor, and set milestone duration without navigating across 3 pages.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
              Saves Project + Supervisor + Timeline at once
            </span>
          </div>

          <form onSubmit={handleAioSubmit} className="space-y-6">
            {/* Step A: Project & Site Details */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0A3925] text-white text-[11px] font-extrabold flex items-center justify-center">
                  1
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Project & Site Identity <span className="text-rose-500">*</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marina Bay Towers"
                    value={aioProjectName}
                    onChange={(e) => setAioProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Site Location / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Site Alpha (Block A)"
                    value={aioSiteName}
                    onChange={(e) => setAioSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Initial Status</label>
                  <select
                    value={aioStatus}
                    onChange={(e) => setAioStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] outline-none font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Planning">Planning</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step B: Appoint Site Supervisor */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#0A3925] text-white text-[11px] font-extrabold flex items-center justify-center">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Site Supervisor Assignment
                  </h3>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={aioAssignSupervisor}
                    onChange={(e) => setAioAssignSupervisor(e.target.checked)}
                    className="rounded border-slate-300 text-[#0A3925] focus:ring-[#0A3925]"
                  />
                  <span>Assign Supervisor Now</span>
                </label>
              </div>

              {aioAssignSupervisor && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Supervisor Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={aioSupervisorName}
                      onChange={(e) => setAioSupervisorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Login ID / Username</label>
                    <input
                      type="text"
                      placeholder="e.g. rajesh.k or supervisor@anandhomes.com"
                      value={aioSupervisorLogin}
                      onChange={(e) => setAioSupervisorLogin(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Portal Password</label>
                    <input
                      type="password"
                      placeholder="Create secure password"
                      value={aioSupervisorPassword}
                      onChange={(e) => setAioSupervisorPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step C: Project Timeline Duration */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#0A3925] text-white text-[11px] font-extrabold flex items-center justify-center">
                    3
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Project Timeline & Duration
                  </h3>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={aioSetDuration}
                    onChange={(e) => setAioSetDuration(e.target.checked)}
                    className="rounded border-slate-300 text-[#0A3925] focus:ring-[#0A3925]"
                  />
                  <span>Set Timeline Now</span>
                </label>
              </div>

              {aioSetDuration && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">From Date</label>
                    <input
                      type="date"
                      value={aioFromDate}
                      onChange={(e) => setAioFromDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">To Date</label>
                    <input
                      type="date"
                      value={aioToDate}
                      onChange={(e) => setAioToDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#0A3925] hover:bg-[#082d1d] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Complete Setup...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Save Complete Project Setup</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PROJECT MASTER                                                 */}
      {/* ===================================================================== */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{pEditingId ? 'Edit Project Master Record' : 'Register New Project Master'}</span>
              {pEditingId && (
                <button
                  onClick={() => {
                    setPEditingId(null);
                    setPProjectName('');
                    setPSiteName('');
                    setPStatus('Active');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Cancel Edit
                </button>
              )}
            </h2>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter project name"
                    value={pProjectName}
                    onChange={(e) => setPProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Site Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter site name"
                    value={pSiteName}
                    onChange={(e) => setPSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Project Status
                  </label>
                  <select
                    value={pStatus}
                    onChange={(e) => setPStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                  >
                    <option value="Active">Active</option>
                    <option value="Planning">Planning</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0A3925] hover:bg-[#082d1d] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : pEditingId ? (
                    'Update Project'
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Project Master Directory</h3>
              <span className="text-xs text-slate-500">{projects.length} Projects Total</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Project Name</th>
                    <th className="px-4 py-3">Site Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created On</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No projects recorded yet.
                      </td>
                    </tr>
                  ) : (
                    projects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{p.projectName}</td>
                        <td className="px-4 py-3">{p.siteName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : p.status === 'Planning'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{p.createdOn || '-'}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setPEditingId(p.id);
                              setPProjectName(p.projectName);
                              setPSiteName(p.siteName);
                              setPStatus(p.status || 'Active');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: SUPERVISOR MASTER                                              */}
      {/* ===================================================================== */}
      {activeTab === 'supervisors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{sEditingId ? 'Edit Supervisor Assignment' : 'Register & Assign Supervisor'}</span>
              {sEditingId && (
                <button
                  onClick={() => {
                    setSEditingId(null);
                    setSName('');
                    setSLoginId('');
                    setSPassword('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Cancel Edit
                </button>
              )}
            </h2>

            <form onSubmit={handleSupervisorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Supervisor Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Login ID / Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rajesh.k"
                    value={sLoginId}
                    onChange={(e) => setSLoginId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {sEditingId ? 'Password (leave blank to keep unchanged)' : 'Password'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder={sEditingId ? 'Leave blank to preserve' : 'Enter password'}
                    value={sPassword}
                    onChange={(e) => setSPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                    required={!sEditingId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Project <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sProject}
                    onChange={(e) => {
                      const projName = e.target.value;
                      setSProject(projName);
                      const matched = projects.find((p) => p.projectName === projName);
                      if (matched) setSSite(matched.siteName);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
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
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Site Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Site name auto-filled or custom"
                    value={sSite}
                    onChange={(e) => setSSite(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0A3925] hover:bg-[#082d1d] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : sEditingId ? (
                    'Update Supervisor'
                  ) : (
                    'Register Supervisor'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Supervisors Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Registered Supervisors Directory</h3>
              <span className="text-xs text-slate-500">{supervisors.length} Supervisors Total</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Supervisor Name</th>
                    <th className="px-4 py-3">Login ID</th>
                    <th className="px-4 py-3">Assigned Project</th>
                    <th className="px-4 py-3">Site Location</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {supervisors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No supervisors registered yet.
                      </td>
                    </tr>
                  ) : (
                    supervisors.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{s.loginId}</td>
                        <td className="px-4 py-3 font-semibold text-[#0D5C3A]">{s.project}</td>
                        <td className="px-4 py-3">{s.site}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSEditingId(s.id);
                              setSName(s.name);
                              setSLoginId(s.loginId);
                              setSPassword('');
                              setSProject(s.project);
                              setSSite(s.site);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupervisor(s.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: PROJECT DURATION                                               */}
      {/* ===================================================================== */}
      {activeTab === 'durations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Set Project Milestone Duration
            </h2>

            <form onSubmit={handleDurationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={dProjectName}
                    onChange={(e) => {
                      const proj = e.target.value;
                      setDProjectName(proj);
                      const matched = projects.find((p) => p.projectName === proj);
                      if (matched) setDSiteName(matched.siteName);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
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
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Site Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Site name"
                    value={dSiteName}
                    onChange={(e) => setDSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    From Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dFromDate}
                    onChange={(e) => setDFromDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    To Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dToDate}
                    onChange={(e) => setDToDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0A3925] hover:bg-[#082d1d] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Save Project Duration'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Project Durations Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Project Durations & Timeline Directory</h3>
              <span className="text-xs text-slate-500">{durations.length} Timelines Total</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Project Name</th>
                    <th className="px-4 py-3">Site Name</th>
                    <th className="px-4 py-3">From Date</th>
                    <th className="px-4 py-3">To Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {durations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No project durations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    durations.map((dur) => (
                      <tr key={dur.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{dur.projectName}</td>
                        <td className="px-4 py-3">{dur.siteName}</td>
                        <td className="px-4 py-3 font-mono text-emerald-700 font-semibold">{dur.fromDate}</td>
                        <td className="px-4 py-3 font-mono text-blue-700 font-semibold">{dur.toDate}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteDuration(dur.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
