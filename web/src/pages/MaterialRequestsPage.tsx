import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  X,
  Building2,
  Filter,
  Truck,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  AlertTriangle,
  ArrowDownToLine,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { constructionService } from '../services/construction.service';
import { MaterialRequest, Site, InventoryMasterItem } from '@project/shared';
import { useAuth } from '../hooks/useAuth';
import { useDashboardContext } from '../context/DashboardContext';
import { ConfirmationModal, ConfirmationVariant, DetailItem } from '../components/common';

const URGENCY_OPTIONS = ['Normal', 'High', 'Urgent'];
const MEASUREMENT_OPTIONS = ['Bags', 'Tons', 'Nos', 'Kg', 'Litres', 'Sq.Ft', 'Cum', 'Rft'];

export const MaterialRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    sites,
    myAssignedSites,
    selectedSite,
    inventory,
    roleMode,
    isSupervisor: isSupervisorCtx,
    refreshData,
  } = useDashboardContext();

  const isSupervisor = isSupervisorCtx || roleMode === 'supervisor' || user?.role === 'supervisor';
  const isAdmin = !isSupervisor;

  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [inventoryMaster, setInventoryMaster] = useState<InventoryMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterSite, setFilterSite] = useState<string>('All Sites');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showAdminCreate, setShowAdminCreate] = useState(false);

  // Form states
  const [site, setSite] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [category, setCategory] = useState<string>('Cement');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('Bags');
  const [urgency, setUrgency] = useState<string>('Normal');
  const [requiredDate, setRequiredDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [purpose, setPurpose] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [successText, setSuccessText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Dispatch modal for Admin to accept & send materials to supervisor
  const [dispatchModalReq, setDispatchModalReq] = useState<MaterialRequest | null>(null);
  const [dispatchQty, setDispatchQty] = useState<string>('');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  const [dispatchStore, setDispatchStore] = useState<string>('Central Warehouse / Admin Store');
  const [dispatching, setDispatching] = useState(false);

  // Restock / Add to stock before dispatch states
  const [needAddStock, setNeedAddStock] = useState(false);
  const [addStockQty, setAddStockQty] = useState('');
  const [stockSupplier, setStockSupplier] = useState('');
  const [stockInvoice, setStockInvoice] = useState('');
  const [stockUnitPrice, setStockUnitPrice] = useState('');

  const fetchRequestsData = async () => {
    try {
      setLoading(true);
      const [reqData, masterData] = await Promise.all([
        constructionService.getRequests(),
        constructionService.getInventoryMaster(),
      ]);
      setRequests(reqData || []);
      setInventoryMaster(masterData || []);

      if (masterData && masterData.length > 0 && !material) {
        setMaterial(masterData[0].material);
        setCategory(masterData[0].category);
        setUnit(masterData[0].measurement || 'Bags');
      }
    } catch (err: any) {
      console.error('Failed to load material requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsData();
  }, []);

  const availableSites = isSupervisor && myAssignedSites.length > 0 ? myAssignedSites : sites;

  useEffect(() => {
    if (availableSites.length > 0 && !site) {
      setSite(selectedSite && selectedSite !== 'All Sites' ? selectedSite : availableSites[0].name);
    }
  }, [availableSites, selectedSite]);

  const handleMaterialSelect = (matName: string) => {
    setMaterial(matName);
    const matched = inventoryMaster.find((m) => m.material.toLowerCase() === matName.toLowerCase());
    if (matched) {
      setCategory(matched.category);
      setUnit(matched.measurement || 'Bags');
    }
  };

  const handleReset = () => {
    setQuantity('');
    setPurpose('');
    setNotes('');
    setErrorText(null);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    const qtyNum = parseFloat(quantity);

    if (!site.trim()) {
      setErrorText('Please specify the construction site.');
      return;
    }
    if (!material.trim()) {
      setErrorText('Please enter or select a material name.');
      return;
    }
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorText('Please enter a valid requested quantity.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await constructionService.createRequest({
        site,
        material: material.trim(),
        quantity: qtyNum,
        unit,
        urgency,
        requiredDate,
        purpose: purpose.trim() || undefined,
        notes: notes.trim() || undefined,
        requestedBy: user?.name || (isSupervisor ? 'Site Supervisor' : 'Admin Staff'),
      });

      setSuccessText(
        `Material Request #${res.requestId || res.id} sent to Admin successfully! Admin will review and dispatch the materials to your site.`
      );
      handleReset();
      setShowAdminCreate(false);
      setTimeout(() => setSuccessText(null), 5000);
      await fetchRequestsData();
      await refreshData();
    } catch (err: any) {
      setErrorText(err.response?.data?.message || 'Failed to submit material request.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDispatchModal = (req: MaterialRequest) => {
    setDispatchModalReq(req);
    setDispatchQty(req.quantity.toString());
    setDispatchNotes(`Dispatched via delivery for site requisition ${req.requestId}`);
    setDispatchStore('Central Warehouse / Admin Store');

    // Calculate current available stock for this material across inventory
    const matchedStockItems = inventory.filter(
      (i) => i.name.toLowerCase() === req.material.toLowerCase()
    );
    const available = matchedStockItems.reduce((acc, curr) => acc + (curr.totalStock || 0), 0);

    if (available < req.quantity) {
      setNeedAddStock(true);
      const neededDeficit = req.quantity > available ? req.quantity - available : req.quantity;
      setAddStockQty(neededDeficit.toString());
      setStockSupplier('Central Wholesale Distributor');
    } else {
      setNeedAddStock(false);
      setAddStockQty('');
      setStockSupplier('');
    }
    setStockInvoice('');
    setStockUnitPrice('');
  };
  // Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant: ConfirmationVariant;
    details?: DetailItem[];
    onConfirm: () => Promise<void> | void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    onConfirm: () => {},
  });

  const handleRejectStatus = (req: MaterialRequest) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Decline Material Request',
      message: `Are you sure you want to decline this material requisition for ${req.quantity} ${req.unit} of ${req.material}? The site supervisor will be notified immediately.`,
      confirmText: 'Decline Request',
      variant: 'warning',
      details: [
        { label: 'Request ID', value: req.requestId || req.id },
        { label: 'Site', value: req.site },
        { label: 'Material', value: req.material },
        { label: 'Requested Qty', value: `${req.quantity} ${req.unit}` },
        { label: 'Purpose', value: req.purpose || 'Not specified' },
      ],
      onConfirm: async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          const reqId = req.id || req.requestId;
          await constructionService.updateRequestStatus(reqId, 'Rejected');
          setRequests((prev) =>
            prev.map((r) =>
              r.id === reqId || r.requestId === reqId ? { ...r, status: 'Rejected' } : r
            )
          );
          setSuccessText(`Request ${req.requestId} declined.`);
          setTimeout(() => setSuccessText(null), 4000);
          await fetchRequestsData();
          await refreshData();
        } catch (err: any) {
          setErrorText(err.response?.data?.message || 'Failed to update request status.');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  const handleDeleteRequest = (req: MaterialRequest) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Material Request',
      message: `Are you sure you want to permanently delete request ${req.requestId || req.id}? This action cannot be reversed.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
      details: [
        { label: 'Request ID', value: req.requestId || req.id },
        { label: 'Site', value: req.site },
        { label: 'Material', value: `${req.quantity} ${req.unit} of ${req.material}` },
      ],
      onConfirm: async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          const reqId = req.id || req.requestId;
          await constructionService.deleteRequest(reqId);
          setRequests((prev) => prev.filter((r) => r.id !== reqId && r.requestId !== reqId));
          setSuccessText(`Request deleted successfully.`);
          setTimeout(() => setSuccessText(null), 4000);
          await fetchRequestsData();
          await refreshData();
        } catch (err: any) {
          setErrorText(err.response?.data?.message || 'Failed to delete request.');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchModalReq) return;
    const reqId = dispatchModalReq.id || dispatchModalReq.requestId;
    const qtyNum = parseFloat(dispatchQty);
    const addQtyNum = needAddStock && addStockQty ? parseFloat(addStockQty) : undefined;
    const priceNum = needAddStock && stockUnitPrice ? parseFloat(stockUnitPrice) : undefined;

    try {
      setDispatching(true);
      await constructionService.sendMaterialsToSupervisor(reqId, {
        quantity: qtyNum,
        notes: dispatchNotes.trim() || undefined,
        supplierOrStore: dispatchStore.trim() || undefined,
        addStockQuantity: addQtyNum,
        supplier: stockSupplier.trim() || undefined,
        invoiceNo: stockInvoice.trim() || undefined,
        unitPrice: priceNum,
      });

      setSuccessText(
        `Dispatched ${qtyNum} ${dispatchModalReq.unit} of ${dispatchModalReq.material} to ${dispatchModalReq.site}! Dispatched alert notice sent to site supervisor.`
      );
      setDispatchModalReq(null);
      setTimeout(() => setSuccessText(null), 5000);
      await fetchRequestsData();
      await refreshData();
    } catch (err: any) {
      setErrorText(err.response?.data?.message || 'Failed to dispatch materials.');
    } finally {
      setDispatching(false);
    }
  };

  const triggerDispatchWithConfirm = () => {
    if (!dispatchModalReq) return;
    const qtyNum = parseFloat(dispatchQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorText('Please enter a valid dispatch quantity.');
      return;
    }
    const addQtyNum = needAddStock && addStockQty ? parseFloat(addStockQty) : undefined;
    if (needAddStock && (addQtyNum === undefined || isNaN(addQtyNum) || addQtyNum <= 0)) {
      setErrorText('Please enter a valid quantity to add to stock.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Material Dispatch',
      message: `Are you sure you want to dispatch ${qtyNum} ${dispatchModalReq.unit} of ${dispatchModalReq.material} to ${dispatchModalReq.site}? This will deduct central storage, log an Outward dispatch, and notify the site supervisor.`,
      confirmText: 'Confirm & Dispatch',
      variant: 'success',
      details: [
        { label: 'Destination Site', value: dispatchModalReq.site },
        { label: 'Material', value: dispatchModalReq.material },
        { label: 'Dispatch Quantity', value: `${qtyNum} ${dispatchModalReq.unit}` },
        { label: 'Source', value: dispatchStore },
        ...(needAddStock ? [{ label: 'Restock Central Store', value: `+${addQtyNum} ${dispatchModalReq.unit}` }] : []),
      ],
      onConfirm: async () => {
        await handleConfirmDispatch();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (filterSite !== 'All Sites' && r.site !== filterSite) return false;
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-[#0D5C3A] rounded-xl">
            {isSupervisor ? <Send className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isSupervisor ? 'Site Material Requests to Admin' : 'Supervisor Material Requests & Dispatches'}
            </h1>
            <p className="text-sm text-slate-500">
              {isSupervisor
                ? 'Request materials from Admin for your project site. Admin will approve and send the requested materials to your site inventory.'
                : 'Review material requisitions from supervisors, accept requests, and send requested materials to site inventory.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowAdminCreate(!showAdminCreate)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAdminCreate ? 'Hide Request Form' : 'New Request on Behalf'}</span>
            </button>
          )}
          <span className="text-xs font-bold text-[#0D5C3A] bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{pendingCount} Pending Approval</span>
          </span>
        </div>
      </div>

      {/* Admin KPI Overview Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Dispatch</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Supervisor requests waiting for Admin action</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Materials Sent</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2">{approvedCount}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Fulfilled & dispatched to site stock</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requisitions</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2">{requests.length}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">All historical requests from supervisors</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Sites</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2">{sites.length}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Project sites managed by company</p>
          </div>
        </div>
      )}

      {/* Success / Error notification alerts */}
      {successText && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3 text-emerald-900 text-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successText}</span>
          </div>
          <button onClick={() => setSuccessText(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorText && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3 text-rose-900 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorText}</span>
          </div>
          <button onClick={() => setErrorText(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form: Raise Site Material Request (Always visible for Supervisor, toggleable for Admin) */}
      {(isSupervisor || showAdminCreate) && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#0D5C3A]" />
              <h2 className="text-base font-bold text-slate-800">
                {isSupervisor ? 'Request Materials from Central Admin' : 'Create Material Request on Behalf'}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
              Requested by: {user?.name || (isSupervisor ? 'Site Supervisor' : 'Admin Staff')}
            </span>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Target Project Site <span className="text-red-500">*</span>
                </label>
                <select
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all font-semibold"
                  required
                >
                  {availableSites.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name} {s.location ? `— ${s.location}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Material Required <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="material-request-options"
                  placeholder="Enter or choose material name"
                  value={material}
                  onChange={(e) => handleMaterialSelect(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all font-semibold"
                  required
                />
                <datalist id="material-request-options">
                  {inventoryMaster.map((m) => (
                    <option key={m.id} value={m.material} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Required Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-2/3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all font-semibold"
                    required
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-1/3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm font-semibold"
                  >
                    {MEASUREMENT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm font-semibold"
                >
                  {URGENCY_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u} Priority
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Needed By Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Purpose / Construction Activity
                </label>
                <input
                  type="text"
                  placeholder="e.g., Ground floor column beam pour"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Additional Notes / Site Justification
              </label>
              <textarea
                rows={2}
                placeholder="Specify preferred supplier brand, vehicle entry timing or on-site storage instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#0D5C3A] hover:bg-[#0b4e31] text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to Admin...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Request to Admin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ledger Table: Site Requisitions & Admin Action Controls */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isSupervisor ? 'My Site Requisitions & Delivery Status' : 'Supervisor Requisitions & Dispatch Log'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSupervisor
                ? 'Track your material requests sent to Admin and monitor when materials are dispatched to your site.'
                : 'Review pending supervisor requests, approve them, and send materials directly to site inventory.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="bg-transparent focus:outline-none"
              >
                <option value="All Sites">All Sites</option>
                {sites.map((s) => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent focus:outline-none"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending Admin Approval</option>
                <option value="Approved">Materials Sent / Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0D5C3A]" />
            <p className="text-sm">Loading material requisitions...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No Material Requisitions Found</p>
            <p className="text-xs text-slate-400 mt-1">
              {isSupervisor
                ? 'You have not submitted any material requests for this filter yet.'
                : 'No supervisor material requests currently match the selected filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Req # & Date</th>
                  <th className="py-3 px-4">Site & Supervisor</th>
                  <th className="py-3 px-4">Material Details</th>
                  <th className="py-3 px-4">Priority & Needed By</th>
                  <th className="py-3 px-4">Status & Dispatch Details</th>
                  {isAdmin && <th className="py-3 px-4 text-center">Admin Dispatch Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id || req.requestId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className="font-bold text-slate-800">{req.requestId || req.id}</span>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">{req.requestedOn}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-[#0D5C3A]" />
                        <span>{req.site}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{req.requestedBy || 'Site Supervisor'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{req.material}</div>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">
                        {req.quantity}{' '}
                        <span className="text-[11px] font-normal text-slate-500 uppercase">{req.unit}</span>
                      </div>
                      {req.purpose && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5 line-clamp-1">
                          For: {req.purpose}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.urgency === 'Urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : req.urgency === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {req.urgency || 'Normal'} Priority
                      </span>
                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{req.requiredDate || 'Immediate'}</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {req.status === 'Approved' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Materials Sent</span>
                          </span>
                          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                            {req.dispatchedQty || req.quantity} {req.unit} dispatched to site
                          </p>
                          {req.dispatchedOn && (
                            <p className="text-[10px] text-slate-400">On: {req.dispatchedOn}</p>
                          )}
                          {isSupervisor && (
                            <Link
                              to="/material-inward?tab=inward"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0D5C3A] hover:bg-[#094228] text-white text-[11px] font-bold rounded-lg shadow-2xs transition-all mt-1.5"
                            >
                              <ArrowDownToLine className="w-3 h-3 text-emerald-300" />
                              <span>Confirm Inward at Site</span>
                            </Link>
                          )}
                        </div>
                      ) : req.status === 'Rejected' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Declined</span>
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Waiting Admin Approval</span>
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">Awaiting dispatch by admin</p>
                        </div>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="py-3.5 px-4 text-center">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openDispatchModal(req)}
                              className="px-3 py-1.5 bg-[#0D5C3A] hover:bg-[#0b4e31] text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                              title="Accept request and send materials to supervisor site"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Accept & Send</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectStatus(req)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                              title="Reject request"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : req.status === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sent to Supervisor</span>
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Closed</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(req)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Dispatch Confirmation Modal */}
      {dispatchModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0D5C3A] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Send Materials to Supervisor</h3>
                  <p className="text-xs text-white/80">
                    Accept request and dispatch to {dispatchModalReq.site}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchModalReq(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Request Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-700">
                    #{dispatchModalReq.requestId || dispatchModalReq.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {dispatchModalReq.urgency || 'Normal'} Urgency
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-slate-500">Requested Material:</span>{' '}
                  <span className="font-bold text-slate-900">{dispatchModalReq.material}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Requested Qty:{' '}
                    <strong className="text-slate-900">
                      {dispatchModalReq.quantity} {dispatchModalReq.unit}
                    </strong>
                  </span>
                  <span>
                    Supervisor:{' '}
                    <strong className="text-slate-900">{dispatchModalReq.requestedBy}</strong>
                  </span>
                </div>

                {dispatchModalReq.purpose && (
                  <p className="text-xs text-slate-500 italic">Purpose: {dispatchModalReq.purpose}</p>
                )}
              </div>

              {/* Stock Availability Indicator */}
              {(() => {
                const matchedStockItems = inventory.filter(
                  (i) => i.name.toLowerCase() === dispatchModalReq.material.toLowerCase()
                );
                const totalAvailStock = matchedStockItems.reduce(
                  (acc, curr) => acc + (curr.totalStock || 0),
                  0
                );
                const reqQtyNum = parseFloat(dispatchQty) || dispatchModalReq.quantity;
                const isDeficit = totalAvailStock < reqQtyNum;

                return (
                  <div className="space-y-3">
                    {isDeficit ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              Stock Deficit: Only <strong>{totalAvailStock} {dispatchModalReq.unit}</strong> available (Need {reqQtyNum} {dispatchModalReq.unit})
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900">
                            Restock Required
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-700 font-normal">
                          You do not have enough stock in the warehouse. Add stock below before dispatching to {dispatchModalReq.site}.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Warehouse Stock Available: <strong>{totalAvailStock} {dispatchModalReq.unit}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!needAddStock && !addStockQty) {
                              setAddStockQty('50');
                              setStockSupplier('Central Wholesale Distributor');
                            }
                            setNeedAddStock(!needAddStock);
                          }}
                          className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                        >
                          {needAddStock ? 'Hide Stock Addition' : '+ Add Stock to Warehouse'}
                        </button>
                      </div>
                    )}

                    {/* Restock Section */}
                    {needAddStock && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-[#0D5C3A]" />
                            <span>Procure / Add to Warehouse Stock</span>
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                            Stock Intake
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                              Quantity to Add ({dispatchModalReq.unit}) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="any"
                              min="0.1"
                              value={addStockQty}
                              onChange={(e) => setAddStockQty(e.target.value)}
                              placeholder="e.g. 50"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                              Supplier / Vendor Name
                            </label>
                            <input
                              type="text"
                              value={stockSupplier}
                              onChange={(e) => setStockSupplier(e.target.value)}
                              placeholder="e.g. UltraTech Wholesale Dealer"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                              Invoice / Batch DC Ref
                            </label>
                            <input
                              type="text"
                              value={stockInvoice}
                              onChange={(e) => setStockInvoice(e.target.value)}
                              placeholder="e.g. INV-2026-9021"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                              Unit Price (₹) (Optional)
                            </label>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={stockUnitPrice}
                              onChange={(e) => setStockUnitPrice(e.target.value)}
                              placeholder="e.g. 380"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 italic">
                          This intake will automatically add {addStockQty || '0'} {dispatchModalReq.unit} to warehouse stock before dispatching {dispatchQty || '0'} {dispatchModalReq.unit} to {dispatchModalReq.site}.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Dispatch Form Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity to Send / Dispatch ({dispatchModalReq.unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={dispatchQty}
                  onChange={(e) => setDispatchQty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A] text-sm"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This dispatch will be recorded in Material Outward for {dispatchModalReq.site}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dispatch Source Warehouse / Store
                </label>
                <input
                  type="text"
                  value={dispatchStore}
                  onChange={(e) => setDispatchStore(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dispatch Note / Delivery Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sent via Delivery Truck TN-45-7890 with batch slip"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 focus:border-[#0D5C3A]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDispatchModalReq(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dispatching}
                onClick={triggerDispatchWithConfirm}
                className="px-5 py-2.5 bg-[#0D5C3A] hover:bg-[#0b4e31] text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {dispatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>
                      {needAddStock ? 'Add Stock & Dispatch to Site' : 'Confirm & Send Materials'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        details={confirmDialog.details}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
};

export default MaterialRequestsPage;
