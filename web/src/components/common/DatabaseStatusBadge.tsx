import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, Database, Check, Copy, RefreshCw, ExternalLink, X, ShieldAlert } from 'lucide-react';
import { authService } from '../../services/auth.service';

interface DatabaseStatusData {
  is_atlas: boolean;
  mode: 'atlas' | 'local_persistent';
  is_connected: boolean;
  database_name: string;
  client_ip: string;
  storage_file?: string;
  atlas_error?: string;
  instructions: string;
  collections: Record<string, number>;
}

export const DatabaseStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatusData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await authService.getDatabaseStatus();
      setStatus(data);
    } catch {
      // Backend offline or unreachable
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyIp = () => {
    if (status?.client_ip) {
      navigator.clipboard.writeText(status.client_ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRetryAtlas = async () => {
    setIsRetrying(true);
    setFeedback(null);
    try {
      const res = await authService.retryAtlas();
      setStatus(res.data);
      if (res.success) {
        setFeedback('Connected to MongoDB Atlas Cloud successfully!');
      } else {
        setFeedback(res.message || 'Atlas rejected connection. Please check Network Access IP list.');
      }
    } catch (err: any) {
      setFeedback('Failed to test connection: ' + (err.message || 'Server error'));
    } finally {
      setIsRetrying(false);
    }
  };

  if (!status) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border shadow-2xs ${
          status.is_atlas
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
        }`}
        title="Click to view database connection status and IP whitelist instructions"
      >
        {status.is_atlas ? (
          <Cloud className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        ) : (
          <Database className="w-3.5 h-3.5 text-amber-600" />
        )}
        <span>{status.is_atlas ? 'Atlas Cloud' : 'Local Persistent DB'}</span>
      </button>

      {/* Detail Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              status.is_atlas ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
            }`}>
              <div className="flex items-center gap-2">
                {status.is_atlas ? (
                  <Cloud className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Database className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {status.is_atlas ? 'MongoDB Atlas Cloud Active' : 'Persistent Local Storage Engine'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Database: <span className="font-semibold text-slate-700">{status.database_name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 text-xs">
              {status.is_atlas ? (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Live Cloud Synchronization Active</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      All accounts, project sites, material stock, and indents are directly saved to your MongoDB Atlas cluster in real time.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Persistent Disk Storage Active</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Your users and data are safely saved to disk (<code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">local_db.json</code>) with <strong>zero data loss across restarts</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Your Current Public IP:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-[11px] font-bold text-slate-800">
                          {status.client_ip}
                        </code>
                        <button
                          onClick={handleCopyIp}
                          className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-semibold text-slate-700 flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                      <p className="font-bold text-slate-800">How to Connect Directly to Atlas Cloud:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                        <li>
                          Open{' '}
                          <a
                            href="https://cloud.mongodb.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0D5C3A] font-bold hover:underline inline-flex items-center gap-0.5"
                          >
                            cloud.mongodb.com <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </li>
                        <li>Navigate to <strong>Security &rarr; Network Access</strong></li>
                        <li>Click <strong>+ Add IP Address</strong></li>
                        <li>Choose <strong>Allow Access from Anywhere</strong> (<code className="font-mono bg-slate-200/80 px-1 rounded">0.0.0.0/0</code>) or enter your IP <code className="font-mono bg-slate-200/80 px-1 rounded">{status.client_ip}</code></li>
                        <li>Click <strong>Confirm</strong>, then click <em>Test Atlas Connection</em> below.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Collections stats */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Stored Documents Count
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                    <span className="text-slate-400 block text-[10px]">Users</span>
                    <span className="font-extrabold text-slate-800 text-sm">{status?.collections?.users ?? 0}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                    <span className="text-slate-400 block text-[10px]">Project Sites</span>
                    <span className="font-extrabold text-slate-800 text-sm">{status?.collections?.sites ?? 0}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                    <span className="text-slate-400 block text-[10px]">Materials</span>
                    <span className="font-extrabold text-slate-800 text-sm">{status?.collections?.inventory ?? 0}</span>
                  </div>
                </div>
              </div>

              {feedback && (
                <div className={`p-2.5 rounded-lg text-[11px] font-medium ${
                  feedback.includes('successfully') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {feedback}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={fetchStatus}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Refresh Status
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetryAtlas}
                  disabled={isRetrying}
                  className="px-3 py-1.5 bg-[#0D5C3A] hover:bg-[#094229] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Testing...' : 'Test Atlas Connection'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
