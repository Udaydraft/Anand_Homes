import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, RotateCcw, Loader2, Hash, CheckCircle2, Truck, Sparkles } from 'lucide-react';
import { constructionService } from '../services/construction.service';
import { InwardMaterialEntry, InventoryItem, Site, MaterialRequest } from '@project/shared';
import { useDashboardContext } from '../context/DashboardContext';

export const InwardMaterialPage: React.FC = () => {
  const {
    refreshData,
    isSupervisor,
    myAssignedSites,
    sitesList,
    selectedSite,
  } = useDashboardContext();
  const [entries, setEntries] = useState<InwardMaterialEntry[]>([]);
  const [stockMaterials, setStockMaterials] = useState<InventoryItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterSite, setFilterSite] = useState<string>('All');

  // Scoped project sites:
  // For supervisor: strictly their assigned sites
  // For admin: all project sites
  const visibleSites = isSupervisor
    ? (myAssignedSites && myAssignedSites.length > 0
        ? myAssignedSites
        : sites.filter((s) => sitesList.includes(s.name)))
    : sites;

  const allowedSiteNames = visibleSites.map((s) => s.name);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [site, setSite] = useState('');
  const [category, setCategory] = useState('Cement');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [measurement, setMeasurement] = useState('Bags');
  const [totalValue, setTotalValue] = useState('');
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [dispatchedRequests, setDispatchedRequests] = useState<MaterialRequest[]>([]);

  // Filter dispatched requests strictly according to assigned sites
  const userDispatchedRequests = isSupervisor
    ? dispatchedRequests.filter((r) => allowedSiteNames.includes(r.site))
    : dispatchedRequests;

  // Filter inward entries strictly according to assigned sites (or admin site filter)
  const displayedEntries = entries.filter((entry) => {
    const entrySite = entry.site || '';
    if (isSupervisor) {
      return allowedSiteNames.includes(entrySite);
    }
    if (filterSite !== 'All') {
      return entrySite === filterSite;
    }
    return true;
  });

  // Derived Auto Unit Price
  const autoUnitPrice = (() => {
    const qty = parseFloat(quantity);
    const val = parseFloat(totalValue);
    if (!isNaN(qty) && qty > 0 && !isNaN(val) && val >= 0) {
      return (val / qty).toFixed(2);
    }
    return '0.00';
  })();

  const fetchData = async () => {
    try {
      setLoading(true);
      const targetSiteParam = isSupervisor ? (selectedSite || undefined) : undefined;
      const [inwData, invData, sitesData, reqData] = await Promise.all([
        constructionService.getMaterialInward(targetSiteParam),
        constructionService.getInventory(),
        constructionService.getSites(),
        constructionService.getRequests(),
      ]);
      setEntries(inwData || []);
      setStockMaterials(invData || []);
      setSites(sitesData || []);

      const approvedReqs = (reqData || []).filter((r) => r.status === 'Approved');
      setDispatchedRequests(approvedReqs);

      const scopedSites = isSupervisor
        ? (myAssignedSites && myAssignedSites.length > 0
            ? myAssignedSites
            : (sitesData || []).filter((s) => sitesList.includes(s.name)))
        : (sitesData || []);

      if (scopedSites.length > 0 && (!site || !scopedSites.some((s) => s.name === site))) {
        setSite(scopedSites[0].name);
      }

      if (invData && invData.length > 0 && !material) {
        setCategory(invData[0].category || 'Cement');
        setMaterial(invData[0].name);
        setMeasurement(invData[0].unit || 'Bags');
      }
    } catch (err: any) {
      console.error('Failed to load inward data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const matched = stockMaterials.find((m) => m.category === cat);
    if (matched) {
      setMaterial(matched.name);
      setMeasurement(matched.unit);
    }
  };

  const handleMaterialChange = (matName: string) => {
    setMaterial(matName);
    const matched = stockMaterials.find((m) => m.name.toLowerCase() === matName.toLowerCase());
    if (matched) {
      if (matched.unit) setMeasurement(matched.unit);
      if (matched.category) setCategory(matched.category);
    }
  };

  const handleInwardFromRequest = (req: MaterialRequest) => {
    setSite(req.site);
    setMaterial(req.material);
    setQuantity((req.dispatchedQty || req.quantity).toString());
    setMeasurement(req.unit);
    const matched = stockMaterials.find(
      (m) => m.name.toLowerCase() === req.material.toLowerCase()
    );
    if (matched) {
      setCategory(matched.category);
    }
  };

  const handleReset = () => {
    setQuantity('');
    setTotalValue('');
    setSuccessCode(null);
  };

  const handleGenerateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseFloat(quantity);
    if (!material.trim() || !category.trim() || isNaN(qtyNum) || qtyNum <= 0) {
      return;
    }

    try {
      setSubmitting(true);
      const matchedSite = sites.find((s) => s.name === site);
      const res = await constructionService.createMaterialInward({
        date,
        site: site || (sites[0]?.name || 'Site A'),
        project: matchedSite?.projectType || site || 'General',
        category,
        material,
        quantity: qtyNum,
        measurement,
        totalValue: parseFloat(totalValue) || 0,
      });

      setSuccessCode(res.entryCode);
      handleReset();
      setTimeout(() => setSuccessCode(null), 4000);
      await Promise.all([fetchData(), refreshData()]);
    } catch (err: any) {
      console.error('Inward entry error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ArrowDownToLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Inward Material Entry</h1>
            <p className="text-sm text-slate-500">
              Supervisor on-site receipts: Record incoming materials delivered to your site and add them to stock
            </p>
          </div>
        </div>
      </div>

      {/* Dispatched by Admin: Ready to Inward onto Site */}
      {userDispatchedRequests.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Admin Dispatches Awaiting On-Site Inward
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
              {userDispatchedRequests.length} Dispatched Item(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {userDispatchedRequests.map((req) => (
              <div
                key={req.id || req.requestId}
                className="bg-white border border-emerald-200/80 rounded-lg p-3 flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-400 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs">{req.material}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {req.site}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                    {req.dispatchedQty || req.quantity} {req.unit} dispatched
                  </p>
                  <p className="text-[10px] text-slate-400">Ref: #{req.requestId || req.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInwardFromRequest(req)}
                  className="px-2.5 py-1.5 bg-[#0D5C3A] hover:bg-[#0b4e31] text-white text-[11px] font-bold rounded-md shadow-xs transition-colors shrink-0"
                >
                  Inward to Site
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form: Inward Material Entry */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={handleGenerateEntry} className="space-y-5">
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Project Site <span className="text-red-500">*</span></span>
                {isSupervisor && (
                  <span className="text-[10px] lowercase font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    assigned site
                  </span>
                )}
              </label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                disabled={isSupervisor && visibleSites.length <= 1}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all font-semibold disabled:bg-slate-100 disabled:text-slate-600"
                required
              >
                {visibleSites.length === 0 ? (
                  <option value="">No site assigned</option>
                ) : (
                  visibleSites.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name} {s.location ? `— ${s.location}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              >
                <option value="">Select category</option>
                {Array.from(
                  new Set([
                    'Cement',
                    'Steel',
                    'Aggregate',
                    'Masonry',
                    'Finishing',
                    'Electrical',
                    'Plumbing',
                    'Others',
                    ...stockMaterials.map((m) => m.category).filter(Boolean),
                  ])
                ).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Material <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="material-options"
                placeholder="Select or enter material"
                value={material}
                onChange={(e) => handleMaterialChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              />
              <datalist id="material-options">
                {Array.from(new Set(stockMaterials.map((m) => m.name))).map((matName) => (
                  <option key={matName} value={matName} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="Enter qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Measurement <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Bags, Tons, Nos"
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Total Value (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="Enter total value"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3925]/20 focus:border-[#0A3925] text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Auto Unit Price (₹)
              </label>
              <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono font-medium text-sm">
                ₹{autoUnitPrice} / {measurement || 'unit'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0D5C3A] hover:bg-[#0A482E] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Hash className="w-4 h-4" />
                  Save Inward Entry
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

            {successCode && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Recorded #{successCode} for {site}</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Table: Inward Material Transactions */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Inward Receipts Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSupervisor
                ? `Scoped View: Inward receipts strictly for your assigned site (${allowedSiteNames.join(', ') || 'No site assigned'})`
                : `All project sites: ${displayedEntries.length} recorded receipt(s)`}
            </p>
          </div>

          {!isSupervisor && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Filter Site:</span>
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
              >
                <option value="All">All Sites</option>
                {sites.map((s) => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0D5C3A]" />
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            {isSupervisor
              ? `No inward material entries recorded for your assigned site (${allowedSiteNames.join(', ') || 'None'}) yet.`
              : 'No inward material entries found matching the filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Entry Code</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Project Site</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Measurement</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {displayedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-blue-700">
                      {entry.entryCode}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{entry.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {entry.site || 'Site A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{entry.category}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{entry.material}</td>
                    <td className="py-3 px-4 text-right font-medium">{entry.quantity}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">
                        {entry.measurement}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">₹{Number(entry.totalValue || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-emerald-700">
                      ₹{Number(entry.unitPrice || 0).toFixed(2)}
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
export default InwardMaterialPage;
