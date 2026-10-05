import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RotateCcw,
  Loader2,
  Hash,
  CheckCircle2,
  Truck,
  Sparkles,
  PackageCheck,
  AlertCircle,
  Package,
  Building2,
  Calendar,
  Layers,
  Filter,
  Search,
} from 'lucide-react';
import { constructionService } from '../services/construction.service';
import {
  InwardMaterialEntry,
  OutwardMaterialEntry,
  InventoryItem,
  Site,
  MaterialRequest,
  ProjectMaster,
} from '@project/shared';
import { useDashboardContext } from '../context/DashboardContext';

const CATEGORIES = [
  'Cement',
  'Steel & TMT',
  'Sand & Aggregates',
  'Bricks & Blocks',
  'Tiles & Granite',
  'Electrical',
  'Plumbing',
  'Painting',
  'Wood & Timber',
  'Hardware & Tools',
  'Others',
];

const MEASUREMENTS = [
  'Bags',
  'Tonnes',
  'Kg',
  'Litres',
  'Sq.ft',
  'Metres',
  'Bundles',
  'Trucks',
  'Units',
];

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

export const MaterialMovementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isOutwardPath = location.pathname.includes('outward') || searchParams.get('tab') === 'outward';
  const initialTab = isOutwardPath ? 'outward' : 'inward';
  const [activeTab, setActiveTab] = useState<'inward' | 'outward'>(initialTab);

  const {
    refreshData,
    isSupervisor,
    myAssignedSites,
    sitesList,
    selectedSite,
  } = useDashboardContext();

  // Shared state
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);

  // Inward states
  const [inwardEntries, setInwardEntries] = useState<InwardMaterialEntry[]>([]);
  const [stockMaterials, setStockMaterials] = useState<InventoryItem[]>([]);
  const [dispatchedRequests, setDispatchedRequests] = useState<MaterialRequest[]>([]);
  const [inwardSubmitting, setInwardSubmitting] = useState(false);
  const [inwardFilterSite, setInwardFilterSite] = useState<string>('All');
  const [inwardSearch, setInwardSearch] = useState('');
  const [inwardSuccessCode, setInwardSuccessCode] = useState<string | null>(null);

  // Inward Form states
  const [inDate, setInDate] = useState(new Date().toISOString().split('T')[0]);
  const [inSite, setInSite] = useState('');
  const [inCategory, setInCategory] = useState('Cement');
  const [inMaterial, setInMaterial] = useState('');
  const [inQuantity, setInQuantity] = useState('');
  const [inMeasurement, setInMeasurement] = useState('Bags');
  const [inTotalValue, setInTotalValue] = useState('');

  // Outward states
  const [outwardEntries, setOutwardEntries] = useState<OutwardMaterialEntry[]>([]);
  const [siteInventory, setSiteInventory] = useState<InventoryItem[]>([]);
  const [outwardSubmitting, setOutwardSubmitting] = useState(false);
  const [outwardFilterSite, setOutwardFilterSite] = useState<string>('All');
  const [outwardSearch, setOutwardSearch] = useState('');
  const [outwardError, setOutwardError] = useState<string | null>(null);
  const [outwardSuccess, setOutwardSuccess] = useState<string | null>(null);

  // Outward Form states
  const [outDate, setOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [outSite, setOutSite] = useState('');
  const [outProject, setOutProject] = useState('');
  const [outMaterial, setOutMaterial] = useState('');
  const [outNatureOfWork, setOutNatureOfWork] = useState(NATURE_OF_WORK_OPTIONS[0]);
  const [outQuantity, setOutQuantity] = useState('');
  const [outMeasurement, setOutMeasurement] = useState('Bags');

  // Scoped visible sites
  const visibleSites = isSupervisor
    ? (myAssignedSites && myAssignedSites.length > 0
        ? myAssignedSites
        : sites.filter((s) => sitesList.includes(s.name)))
    : sites;

  const allowedSiteNames = visibleSites.map((s) => s.name);

  // Sync tab with URL
  const handleTabChange = (tab: 'inward' | 'outward') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Sync URL search params change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'outward' && activeTab !== 'outward') {
      setActiveTab('outward');
    } else if (tabParam === 'inward' && activeTab !== 'inward') {
      setActiveTab('inward');
    }
  }, [searchParams]);

  // Derived Auto Unit Price for Inward
  const autoUnitPrice = (() => {
    const qty = parseFloat(inQuantity);
    const val = parseFloat(inTotalValue);
    if (!isNaN(qty) && qty > 0 && !isNaN(val) && val >= 0) {
      return (val / qty).toFixed(2);
    }
    return '0.00';
  })();

  // Available stock for selected outward material
  const selectedInventoryStock = siteInventory.find(
    (item) => item.name.toLowerCase() === outMaterial.toLowerCase()
  );

  // Load all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const targetSiteParam = isSupervisor ? (selectedSite || undefined) : undefined;
      const [inwData, outwData, invData, sitesData, reqData, projData] = await Promise.all([
        constructionService.getMaterialInward(targetSiteParam),
        constructionService.getMaterialOutward(),
        constructionService.getInventory(targetSiteParam),
        constructionService.getSites(),
        constructionService.getRequests(),
        constructionService.getProjectsMaster(),
      ]);

      setInwardEntries(inwData || []);
      setOutwardEntries(outwData || []);
      setStockMaterials(invData || []);
      setSites(sitesData || []);
      setProjects(projData || []);

      const dispatched = (reqData || []).filter(
        (r) => r.status === 'Approved' || (r.status as string) === 'Dispatched'
      );
      setDispatchedRequests(dispatched);

      // Default site selection
      const initialSite = visibleSites.length > 0 ? visibleSites[0].name : 'Site A';
      if (!inSite) {
        setInSite(initialSite);
      }
      if (!outSite) {
        setOutSite(initialSite);
        loadSiteInventory(initialSite);
      }
      if (projData && projData.length > 0 && !outProject) {
        setOutProject(projData[0].projectName);
      }
    } catch (err: any) {
      console.error('Failed to load material movement data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSiteInventory = async (siteName: string) => {
    try {
      const inv = await constructionService.getInventory(siteName);
      setSiteInventory(inv || []);
      if (inv && inv.length > 0) {
        setOutMaterial(inv[0].name);
        setOutMeasurement(inv[0].unit || 'Bags');
      } else {
        setOutMaterial('');
      }
    } catch (err) {
      console.error('Failed to load site inventory:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSite, isSupervisor]);

  // When outward site changes, load that site's inventory
  const handleOutSiteChange = (newSite: string) => {
    setOutSite(newSite);
    setOutwardError(null);
    loadSiteInventory(newSite);
  };

  // When outward material changes, auto sync measurement
  const handleOutMaterialChange = (matName: string) => {
    setOutMaterial(matName);
    const matched = siteInventory.find((i) => i.name === matName);
    if (matched && matched.unit) {
      setOutMeasurement(matched.unit);
    }
  };

  // Inward Form Submission
  const handleInwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseFloat(inQuantity);
    const totalValNum = parseFloat(inTotalValue);

    if (!inSite.trim() || !inMaterial.trim() || isNaN(qtyNum) || qtyNum <= 0) {
      alert('Please fill in valid site, material, and positive quantity.');
      return;
    }

    try {
      setInwardSubmitting(true);
      const res = await constructionService.createMaterialInward({
        date: inDate,
        site: inSite,
        category: inCategory,
        material: inMaterial.trim(),
        quantity: qtyNum,
        measurement: inMeasurement,
        totalValue: isNaN(totalValNum) ? 0 : totalValNum,
      });

      const entryCode = res.entryCode || `INW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-XXXX`;
      setInwardSuccessCode(entryCode);

      handleInwardReset();
      await fetchData();
      await refreshData();
    } catch (err: any) {
      console.error('Failed to record inward material:', err);
      alert(err.response?.data?.message || 'Failed to save material inward entry.');
    } finally {
      setInwardSubmitting(false);
    }
  };

  // Inward Quick Fill from Dispatched Request
  const handleInwardQuickFill = (req: MaterialRequest) => {
    setInSite(req.site);
    setInMaterial(req.material);
    setInQuantity(String(req.quantity));
    setInMeasurement(req.unit || 'Bags');
    const matched = stockMaterials.find((m) => m.name.toLowerCase() === req.material.toLowerCase());
    if (matched) {
      setInCategory(matched.category || 'Cement');
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleInwardReset = () => {
    setInMaterial('');
    setInQuantity('');
    setInTotalValue('');
    setInCategory('Cement');
    setInMeasurement('Bags');
  };

  // Outward Form Submission
  const handleOutwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOutwardError(null);
    setOutwardSuccess(null);

    const qtyNum = parseFloat(outQuantity);
    if (!outSite.trim() || !outProject.trim() || !outMaterial.trim() || isNaN(qtyNum) || qtyNum <= 0) {
      setOutwardError('Please select valid site, project, material, and positive quantity.');
      return;
    }

    if (selectedInventoryStock && qtyNum > selectedInventoryStock.totalStock) {
      setOutwardError(
        `Quantity (${qtyNum} ${outMeasurement}) exceeds available on-site stock (${selectedInventoryStock.totalStock} ${selectedInventoryStock.unit}).`
      );
      return;
    }

    try {
      setOutwardSubmitting(true);
      await constructionService.createMaterialOutward({
        date: outDate,
        site: outSite,
        project: outProject,
        material: outMaterial.trim(),
        natureOfWork: outNatureOfWork,
        quantity: qtyNum,
        measurement: outMeasurement,
      });

      setOutwardSuccess(
        `Outward dispatch of ${qtyNum} ${outMeasurement} of "${outMaterial}" successfully recorded and deducted from site stock!`
      );
      handleOutwardReset();
      await fetchData();
      if (outSite) {
        await loadSiteInventory(outSite);
      }
      await refreshData();
    } catch (err: any) {
      console.error('Failed to record outward material:', err);
      setOutwardError(err.response?.data?.message || 'Failed to record outward material.');
    } finally {
      setOutwardSubmitting(false);
    }
  };

  const handleOutwardReset = () => {
    setOutQuantity('');
    setOutNatureOfWork(NATURE_OF_WORK_OPTIONS[0]);
  };

  // Filtered lists for display
  const displayedInward = inwardEntries.filter((entry) => {
    const entrySite = entry.site || '';
    if (isSupervisor && !allowedSiteNames.includes(entrySite)) return false;
    if (inwardFilterSite !== 'All' && entrySite !== inwardFilterSite) return false;
    if (inwardSearch.trim()) {
      const q = inwardSearch.toLowerCase();
      const matchMat = (entry.material || '').toLowerCase().includes(q);
      const matchCode = (entry.entryCode || '').toLowerCase().includes(q);
      const matchCat = (entry.category || '').toLowerCase().includes(q);
      if (!matchMat && !matchCode && !matchCat) return false;
    }
    return true;
  });

  const displayedOutward = outwardEntries.filter((entry) => {
    const entrySite = entry.site || entry.project || '';
    if (isSupervisor && !allowedSiteNames.includes(entry.site)) return false;
    if (outwardFilterSite !== 'All' && entry.site !== outwardFilterSite) return false;
    if (outwardSearch.trim()) {
      const q = outwardSearch.toLowerCase();
      const matchMat = (entry.material || '').toLowerCase().includes(q);
      const matchProj = (entry.project || '').toLowerCase().includes(q);
      const matchWork = (entry.natureOfWork || '').toLowerCase().includes(q);
      if (!matchMat && !matchProj && !matchWork) return false;
    }
    return true;
  });

  // Calculate totals
  const totalInwardUnits = inwardEntries.reduce((acc, e) => acc + (Number(e.quantity) || 0), 0);
  const totalInwardVal = inwardEntries.reduce((acc, e) => acc + (Number(e.totalValue) || 0), 0);
  const totalOutwardUnits = outwardEntries.reduce((acc, e) => acc + (Number(e.quantity) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Unified Material Movement Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-[#0D5C3A] rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-[#0D5C3A]">
                Unified Material Movement
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                • Inward Deliveries & Outward Disbursements
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">Material Inward & Outward Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Record incoming supplier deliveries, verify admin dispatches, and log site material consumption in one place.
            </p>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
            <span className="text-[11px] text-emerald-800 block font-semibold">Total Stock In</span>
            <span className="text-base font-extrabold text-emerald-900">
              {totalInwardUnits.toLocaleString('en-IN')} <span className="text-xs font-normal">units</span>
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <span className="text-[11px] text-amber-800 block font-semibold">Total Stock Out</span>
            <span className="text-base font-extrabold text-amber-900">
              {totalOutwardUnits.toLocaleString('en-IN')} <span className="text-xs font-normal">units</span>
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block font-medium">Inward Valuation</span>
            <span className="text-base font-extrabold text-slate-800">
              ₹{totalInwardVal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Modern High-Contrast View Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => handleTabChange('inward')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inward'
              ? 'bg-[#0D5C3A] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4 text-emerald-300" />
          <span>1. Material Inward (Stock In)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'inward' ? 'bg-emerald-800/80 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {inwardEntries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('outward')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'outward'
              ? 'bg-[#0D5C3A] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ArrowUpFromLine className="w-4 h-4 text-amber-300" />
          <span>2. Material Outward (Stock Out / Dispatch)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'outward' ? 'bg-emerald-800/80 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {outwardEntries.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MATERIAL INWARD (STOCK IN) */}
      {/* ========================================================================= */}
      {activeTab === 'inward' && (
        <div className="space-y-6">
          {/* Success Code Banner */}
          {inwardSuccessCode && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-800 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold">
                  Material Inward entry recorded! Generated Tracking Code:{' '}
                  <strong className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                    {inwardSuccessCode}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInwardSuccessCode(null)}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Quick-import Banner for Dispatched Requests */}
          {dispatchedRequests.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Materials Dispatched by Admin - Ready for Site Inward Confirmation</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {dispatchedRequests.slice(0, 5).map((req) => (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => handleInwardQuickFill(req)}
                    className="shrink-0 bg-white hover:bg-amber-100/50 border border-amber-200 px-3 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center gap-2"
                  >
                    <span className="font-bold text-slate-800">{req.material}</span>
                    <span className="text-amber-700 font-semibold">
                      ({req.quantity} {req.unit})
                    </span>
                    <span className="text-[10px] text-slate-400">@ {req.site}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                      Fill Inward &darr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Record Inward Entry Form */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-[#0D5C3A]" />
                <span>Record Incoming Material Batch</span>
              </span>
              <span className="text-xs font-medium text-slate-400">Step 1: Inward Delivery</span>
            </h2>

            <form onSubmit={handleInwardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={inDate}
                    onChange={(e) => setInDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  />
                </div>

                {/* Site Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Site / Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inSite}
                    onChange={(e) => setInSite(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  >
                    {visibleSites.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inCategory}
                    onChange={(e) => setInCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Material Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UltraTech PPC, Fe-550 Steel"
                    value={inMaterial}
                    onChange={(e) => setInMaterial(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="e.g. 50"
                    value={inQuantity}
                    onChange={(e) => setInQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  />
                </div>

                {/* Measurement Unit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inMeasurement}
                    onChange={(e) => setInMeasurement(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  >
                    {MEASUREMENTS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Total Value */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Total Value (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 21000"
                    value={inTotalValue}
                    onChange={(e) => setInTotalValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                  />
                </div>

                {/* Calculated Unit Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Auto Unit Price
                  </label>
                  <div className="w-full px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-emerald-900 text-sm font-bold flex items-center justify-between">
                    <span>₹{autoUnitPrice}</span>
                    <span className="text-[10px] text-emerald-700 font-normal">per {inMeasurement}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleInwardReset}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="submit"
                  disabled={inwardSubmitting}
                  className="px-5 py-2 bg-[#0D5C3A] hover:bg-[#094228] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {inwardSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-300" />
                  )}
                  <span>Record Inward Delivery</span>
                </button>
              </div>
            </form>
          </div>

          {/* Inward Entries Log Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Inward Deliveries Audit Log</span>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-[#0D5C3A] px-2 py-0.5 rounded-full">
                    {displayedInward.length} records
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Historical incoming shipments with valuation and generated codes</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search material, code..."
                    value={inwardSearch}
                    onChange={(e) => setInwardSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Admin Site Filter */}
                {!isSupervisor && (
                  <select
                    value={inwardFilterSite}
                    onChange={(e) => setInwardFilterSite(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    <option value="All">All Project Sites</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Tracking Code</th>
                    <th className="py-3 px-4">Material & Category</th>
                    <th className="py-3 px-4">Site</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedInward.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No inward material records found.
                      </td>
                    </tr>
                  ) : (
                    displayedInward.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-700 font-medium">{item.date}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.entryCode || 'INW-RECORDED'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block font-bold">{item.material}</strong>
                          <span className="text-[10px] text-slate-400">{item.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                            {item.site}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {item.quantity} {item.measurement}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          ₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-[#0D5C3A]">
                          ₹{Number(item.totalValue || 0).toLocaleString('en-IN')}
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

      {/* ========================================================================= */}
      {/* TAB 2: MATERIAL OUTWARD (STOCK OUT / DISPATCH) */}
      {/* ========================================================================= */}
      {activeTab === 'outward' && (
        <div className="space-y-6">
          {/* Notifications */}
          {outwardError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-xs font-semibold animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{outwardError}</span>
              </div>
              <button
                type="button"
                onClick={() => setOutwardError(null)}
                className="text-red-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {outwardSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-semibold animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{outwardSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setOutwardSuccess(null)}
                className="text-emerald-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Record Outward Entry Form */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ArrowUpFromLine className="w-4 h-4 text-amber-600" />
                <span>Record Outward Material Disbursement</span>
              </span>
              <span className="text-xs font-medium text-slate-400">Step 2: On-Site Consumption / Dispatch</span>
            </h2>

            <form onSubmit={handleOutwardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={outDate}
                    onChange={(e) => setOutDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  />
                </div>

                {/* Site Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Site <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={outSite}
                    onChange={(e) => handleOutSiteChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  >
                    {visibleSites.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={outProject}
                    onChange={(e) => setOutProject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.projectName}>
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material Selection from Site Inventory */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Material <span className="text-red-500">*</span>
                  </label>
                  {siteInventory.length > 0 ? (
                    <select
                      value={outMaterial}
                      onChange={(e) => handleOutMaterialChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                      required
                    >
                      {siteInventory.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name} ({item.totalStock} {item.unit} available)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter material name"
                      value={outMaterial}
                      onChange={(e) => setOutMaterial(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Nature of Work */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Nature of Work <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={outNatureOfWork}
                    onChange={(e) => setOutNatureOfWork(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  >
                    {NATURE_OF_WORK_OPTIONS.map((now) => (
                      <option key={now} value={now}>
                        {now}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Quantity to Issue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="e.g. 15"
                    value={outQuantity}
                    onChange={(e) => setOutQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  />
                  {selectedInventoryStock && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Max available: <strong className="text-slate-800 font-bold">{selectedInventoryStock.totalStock} {selectedInventoryStock.unit}</strong>
                    </span>
                  )}
                </div>

                {/* Measurement Unit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Measurement Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={outMeasurement}
                    onChange={(e) => setOutMeasurement(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                    required
                  >
                    {MEASUREMENTS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleOutwardReset}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="submit"
                  disabled={outwardSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {outwardSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowUpFromLine className="w-3.5 h-3.5 text-amber-200" />
                  )}
                  <span>Record Outward Dispatch</span>
                </button>
              </div>
            </form>
          </div>

          {/* Outward Entries Log Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Outward Dispatches & Site Disbursements Log</span>
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {displayedOutward.length} records
                  </span>
                </h3>
                <p className="text-xs text-slate-400">History of materials consumed on-site or transferred</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search material, project..."
                    value={outwardSearch}
                    onChange={(e) => setOutwardSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Admin Site Filter */}
                {!isSupervisor && (
                  <select
                    value={outwardFilterSite}
                    onChange={(e) => setOutwardFilterSite(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    <option value="All">All Project Sites</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Project & Site</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4">Nature of Work</th>
                    <th className="py-3 px-4 text-right">Dispatched Qty</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedOutward.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No outward material dispatches recorded yet.
                      </td>
                    </tr>
                  ) : (
                    displayedOutward.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-700 font-medium">{item.date}</td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block font-bold">{item.project}</strong>
                          <span className="text-[10px] text-slate-500 font-medium">{item.site}</span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 font-semibold">{item.material}</strong>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {item.natureOfWork}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-amber-900">
                          {item.quantity} {item.measurement}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                            Dispatched
                          </span>
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
