import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import {
  Server,
  Database,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Globe,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const {
    data: health,
    isLoading: isHealthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => authService.checkHealth(),
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-8 border border-white/10">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-400 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live System Connected
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Hello, {user?.name || 'Developer'}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Welcome to the AntiGravity dashboard. Your React web application, Expo mobile application,
            FastAPI backend, and MongoDB database are connected under a unified architecture.
          </p>
        </div>
      </div>

      {/* Real-time Health Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> System Infrastructure Health
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchHealth()}
            isLoading={isHealthLoading}
          >
            Refresh Status
          </Button>
        </div>

        {isHealthLoading && !health ? (
          <div className="p-12 glass-panel rounded-xl flex items-center justify-center">
            <Loading label="Polling API and MongoDB status..." />
          </div>
        ) : healthError ? (
          <ErrorState
            title="Backend Connectivity Error"
            message="Could not reach the FastAPI backend at the configured URL. Ensure uvicorn is running on port 8000."
            onRetry={() => refetchHealth()}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* FastAPI Service */}
            <Card className="flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    FastAPI Backend
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 mt-1">
                    {health?.service || 'Antigravity API'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Version {health?.version || '1.0.0'}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Server className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-border/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Running
                </span>
              </div>
            </Card>

            {/* MongoDB Connectivity */}
            <Card className="flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Database
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 mt-1">MongoDB</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {health?.database?.details || 'Database connection'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-border/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">State</span>
                {health?.database?.status === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <AlertCircle className="w-4 h-4" /> {health?.database?.status || 'Pending'}
                  </span>
                )}
              </div>
            </Card>

            {/* Authentication Layer */}
            <Card className="flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Security Layer
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 mt-1">JWT Bearer Auth</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Role: {user?.role || 'user'}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-border/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Token Refresh</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Active Interceptor
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Monorepo Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Connected Platforms" subtitle="Shared FastAPI Backend & MongoDB">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-elevated/60 border border-surface-border">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-slate-200">Web Application (React + Vite)</h5>
                <p className="text-xs text-slate-400">Communicates via Axios interceptors + TanStack Query</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                Active
              </span>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-elevated/60 border border-surface-border">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-slate-200">Mobile Application (React Native + Expo)</h5>
                <p className="text-xs text-slate-400">Uses SecureStore + same FastAPI endpoints</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-500/15 text-violet-400">
                Ready
              </span>
            </div>
          </div>
        </Card>

        <Card title="Quick API Resources" subtitle="Interactive Documentation & Tools">
          <div className="space-y-3">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/60 border border-surface-border hover:border-indigo-500/40 hover:bg-surface-elevated transition-all group"
            >
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                  FastAPI Swagger Documentation
                </p>
                <p className="text-xs text-slate-400">Interactive OpenAPI specification at /docs</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>

            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/60 border border-surface-border hover:border-indigo-500/40 hover:bg-surface-elevated transition-all group"
            >
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                  ReDoc API Reference
                </p>
                <p className="text-xs text-slate-400">Clean developer documentation at /redoc</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};
