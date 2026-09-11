import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Enquiry } from '@project/shared';
import { enquiryService } from '../services/enquiry.service';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/feedback/ErrorMessage';
import {
  FileQuestion,
  Building2,
  Calendar,
  Phone,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export const EnquiriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enquiryService.getEnquiries();
      setEnquiries(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load your property enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            New
          </span>
        );
      case 'in_progress':
      case 'in progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            In Progress
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Contacted
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Property Enquiries</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#0D5C3A] border border-emerald-200">
              {enquiries.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Track inquiries submitted for Anand Homes properties and follow up status with sales executives.
          </p>
        </div>

        <Link
          to="/properties"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Browse More Properties</span>
        </Link>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchEnquiries}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="w-7 h-7 text-blue-500" />}
          title="No Enquiries Found"
          description="You haven't submitted any inquiries for Anand Homes properties yet. Explore our luxury villas and apartments to request site visits or pricing details!"
          actionLabel="Explore Properties"
          onAction={() => navigate('/properties')}
        />
      ) : (
        <div className="space-y-3.5">
          {enquiries.map((enq) => {
            const formattedDate = enq.createdAt
              ? new Date(enq.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently';

            return (
              <div
                key={enq.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-600/40 hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(enq.status)}
                    <span className="text-[11px] font-mono font-semibold text-slate-400">
                      REF-{enq.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#0D5C3A]" />
                      <span>{enq.propertyTitle || `Property Enquiry (ID: ${enq.propertyId.slice(-6)})`}</span>
                    </h3>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 leading-relaxed italic">
                      "{enq.message}"
                    </p>
                  </div>

                  {enq.userPhone && (
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{enq.userPhone}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Status Action */}
                <div className="shrink-0 flex sm:flex-col items-end justify-between gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Assigned Team</span>
                    <span className="text-xs font-bold text-slate-800">Chennai Sales Desk</span>
                  </div>
                  <Link
                    to="/properties"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0D5C3A] hover:underline"
                  >
                    <span>View Property</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
