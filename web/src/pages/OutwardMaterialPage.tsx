import React, { useState, useEffect } from 'react';
import { ArrowUpFromLine, RotateCcw, Loader2, PackageCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { constructionService } from '../services/construction.service';
import { OutwardMaterialEntry, ProjectMaster, InventoryItem, Site } from '@project/shared';
import { useDashboardContext } from '../context/DashboardContext';

const NATURE_OF_WORK_OPTIONS = [
  'Construction',
  'Foundation Work',
  'Brickwork & Masonry',
  'Plastering & Finishing',
  'RCC / Slab Concrete Casting',
  'Electrical Installation',
  'Plumbing & Drainage',
  'Maintenance & Repairs',
  'Others',
];

export const OutwardMaterialPage: React.FC = () => {
  const { refreshData } = useDashboardContext();
  const [entries, setEntries] = useState<OutwardMaterialEntry[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteInventory, setSiteInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [site, setSite] = useState('');
  const [project, setProject] = useState('');
  const [material, setMaterial] = useState('');
  const [natureOfWork, setNatureOfWork] = useState(NATURE_OF_WORK_OPTIONS[0]);
  const [quantity, setQuantity] = useState('');
  const [measurement, setMeasurement] = useState('Bags');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Load initial sites, projects, outward entries
  const fetchData = async () => {
    try {
      setLoading(true);
      const [outData, projData, sitesData] = await Promise.all([
        constructionService.getMaterialOutward(),
        constructionService.getProjectsMaster(),
        constructionService.getSites(),
      ]);
      setEntries(outData || []);
      setProjects(projData || []);
      setSites(sitesData || []);

      const initialSite = sitesData && sitesData.length > 0 ? sitesData[0].name : 'Site A';
      if (!site) {
        setSite(initialSite);
        loadSiteInventory(initialSite);
      }

      if (projData && projData.length > 0 && !project) {
        setProject(projData[0].projectName);
      }
    } catch (err: any) {
      console.error('Failed to load outward material data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSiteInventory = async (siteName: string) => {
    try {
      const inv = await constructionService.getInventory(siteName);
      setSiteInventory(inv || []);
      if (inv && inv.length > 0) {
        setMaterial(inv[0].name);
        setMeasurement(inv[0].unit || 'Bags');
      } else {
        setMaterial('');
      }
    } catch (err) {
      console.error('Failed to load inventory for site:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setErrorText(null);
    loadSiteInventory(newSite);

    // Auto-match project name if available
    const matchedProject = projects.find((p) => p.siteName === newSite);
    if (matchedProject) {
      setProject(matchedProject.projectName);
    }
  };

  const handleMaterialChange = (matName: string) => {
    setMaterial(matName);
    setErrorText(null);
    const item = siteInventory.find((i) => i.name === matName);
    if (item) {
      setMeasurement(item.unit || 'Bags');
    }
  };

  const handleReset = () => {
    setQuantity('');
    setErrorText(null);
  };

  // Find currently selected inventory item stock
  const selectedInventoryItem = siteInventory.find((i) => i.name === material);
  const availableStock = selectedInventoryItem ? Number(selectedInventoryItem.totalStock || 0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    const qtyNum = parseFloat(quantity);

    if (!site.trim()) {
      setErrorText('Please select an active project site.');
      return;
    }
    if (!material.trim()) {
      setErrorText('Please select an inward material available in site inventory.');
      return;
    }
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorText('Please enter a valid positive quantity to dispatch.');
      return;
    }
    if (selectedInventoryItem && qtyNum > availableStock) {
      setErrorText(`Cannot dispatch ${qtyNum} ${measurement}. Only ${availableStock} ${measurement} available on-site.`);
      return;
    }

    try {
      setSubmitting(true);
      await constructionService.createMaterialOutward({
        date,
        site,
        project: project || site,
        material,
        natureOfWork,
        quantity: qtyNum,
        measurement,
      });

      setSuccessText(`Dispatched ${qtyNum} ${measurement} of ${material} for ${natureOfWork}`);
      handleReset();
      setTimeout(() => setSuccessText(null), 4000);
      await Promise.all([
        constructionService.getMaterialOutward().then((d) => setEntries(d || [])),
        loadSiteInventory(site),
        refreshData(),
      ]);
    } catch (err: any) {
      setErrorText(err.response?.data?.message || 'Failed to record outward dispatch.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ArrowUpFromLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Outward Material Dispatch</h1>
            <p className="text-sm text-slate-500">
              Disburse materials from available on-site inward inventory to construction tasks and work areas
            </p>
          </div>
        </div>
      </div>

      {/* Form: Outward Material Entry */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <h2 className="text-base font-bold text-slate-800">
            Issue Material from On-Site Stock
          </h2>
          {selectedInventoryItem && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available Stock: <strong>{availableStock} {measurement}</strong></span>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Dispatch Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Project Site <span className="text-red-500">*</span>
              </label>
              <select
                value={site}
                onChange={(e) => handleSiteChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all font-semibold"
                required
              >
                {sites.length === 0 ? (
                  <option value="Site A">Site A</option>
                ) : (
                  sites.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name} {s.location ? `— ${s.location}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Material from Inward Inventory <span className="text-red-500">*</span>
              </label>
              {siteInventory.length === 0 ? (
                <div className="px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
                  No inward materials currently in stock for {site || 'this site'}.
                </div>
              ) : (
                <select
                  value={material}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all font-semibold"
                  required
                >
                  <option value="">Select available material</option>
                  {siteInventory.map((item) => (
                    <option key={item.id || item.name} value={item.name}>
                      {item.name} — In Stock: {item.totalStock} {item.unit}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Nature of Work / Task <span className="text-red-500">*</span>
              </label>
              <select
                value={natureOfWork}
                onChange={(e) => setNatureOfWork(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all font-medium"
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
                Dispatch Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                max={availableStock > 0 ? availableStock : undefined}
                placeholder={availableStock > 0 ? `Max ${availableStock}` : 'Enter qty'}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setErrorText(null);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Measurement Unit
              </label>
              <input
                type="text"
                readOnly
                value={measurement}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {errorText && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-semibold">{errorText}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || siteInventory.length === 0}
              className="bg-[#0D5C3A] hover:bg-[#0A482E] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4" />
                  Issue Outward Material
                </>
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

            {successText && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successText}</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Table: Outward Material Transactions */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Outward Consumption Ledger</span>
          <span className="text-xs font-normal text-slate-500">{entries.length} recorded dispatch(es)</span>
        </h2>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0D5C3A]" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No outward material dispatches recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Project Site</th>
                  <th className="py-3 px-4">Material Item</th>
                  <th className="py-3 px-4">Nature of Work</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Measurement</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{entry.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {entry.site || entry.project}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {entry.material || entry.natureOfWork}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {entry.natureOfWork?.includes('Material Request') ? (
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Requisition Dispatch
                          </span>
                          <p className="text-xs text-slate-500 mt-1">{entry.natureOfWork}</p>
                          {entry.notes && <p className="text-[11px] text-slate-400 italic">{entry.notes}</p>}
                        </div>
                      ) : (
                        <span>{entry.natureOfWork}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {entry.quantity}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">
                        {entry.measurement}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Dispatched
                      </span>
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
export default OutwardMaterialPage;
