import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Printer,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/Button';

export const TermsConditionsPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Terms
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#0A3925] to-[#0D5C3A] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
          <Scale className="w-4 h-4" />
          <span>Enterprise Agreement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 max-w-2xl leading-relaxed">
          Standard operational rules, platform governance, and user responsibilities for the Anand Homes Construction & Material Inventory Management Platform.
        </p>
        <div className="mt-4 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Effective: October 2026
          </span>
          <span>&bull;</span>
          <span>Version 2.4</span>
          <span>&bull;</span>
          <span>Enforced: Web Administration & Mobile Supervisor Applications</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8 text-slate-700 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>Acceptance of Terms</span>
          </h2>
          <p>
            By accessing, browsing, or logging into the Anand Homes Construction Management platform via web portal or mobile application, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, you must immediately discontinue use of the platform and report to Head Office Administration.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Authorized Accounts & Supervisor Responsibilities</span>
          </h2>
          <p>
            Access to this platform is restricted to verified Anand Homes administrative personnel, site engineers, and appointed site supervisors.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
            <li>Account credentials are strictly individual and non-transferable. Sharing credentials across different supervisors is a disciplinary violation.</li>
            <li>Supervisors must maintain the confidentiality of their passwords and immediately notify IT support of any suspected compromise.</li>
            <li>Users are personally accountable for all entries, stock movements, and shift logs submitted under their authenticated session.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              3
            </span>
            <span>Inward Material Entry & Unique Verification Codes</span>
          </h2>
          <p>
            When recording incoming material consignments at any construction site or warehouse:
          </p>
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900">Physical Inspection Requirement:</strong> All materials (Cement, Steel Rebars, Aggregates, Blocks, Finishing) must be physically verified for quality, batch compliance, and quantity before generating the digital Inward Entry.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900">Entry Code Immutability:</strong> The system automatically produces a unique alphanumeric transaction code (e.g., <code className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">INW-YYYYMMDD-XXXX</code>) and calculates the unit valuation (<code className="font-mono text-slate-800">totalValue / quantity</code>). Once saved, inward codes are locked for audit traceability.
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              4
            </span>
            <span>Outward Material Dispatch & Work Nature Compliance</span>
          </h2>
          <p>
            Materials released from stock must specify the intended site and certified Nature of Work (<span className="font-medium text-slate-800">Construction, Installation, or Maintenance</span>). Dispatches without physical requisition tickets or unauthorized off-site transport are treated as material misappropriation.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              5
            </span>
            <span>Labour Headcount Reporting & Daily Logs</span>
          </h2>
          <p>
            Daily labour entries submitted by site supervisors serve as formal records for subcontractor billing, payroll verification, and safety compliance. Falsification or inflation of manpower numbers is subject to immediate suspension and legal proceedings under contract terms.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              6
            </span>
            <span>Intellectual Property & Enterprise Data Rights</span>
          </h2>
          <p>
            All architectural layouts, software interfaces, database designs, inventory algorithms, and brand assets of Anand Homes are the proprietary intellectual property of Anand Homes Private Limited. Unauthorized extraction, reverse engineering, or external duplication is strictly prohibited.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              7
            </span>
            <span>System Availability & Operational Limitations</span>
          </h2>
          <p>
            While Anand Homes maintains 99.9% platform uptime across high-availability cloud infrastructure, scheduled maintenance windows or field cellular network outages may temporarily affect real-time sync. Offline supervisor logs will automatically synchronize upon network restoration.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#0A3925]" />
            <span>Governing Law & Legal Inquiries</span>
          </h2>
          <p className="text-xs text-slate-600">
            These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising in connection with platform usage are subject to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu, India.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 mt-2">
            <p className="font-bold text-slate-900">Anand Homes Legal & Contracts Bureau</p>
            <p className="text-slate-600">Headquarters: Anna Nagar Heights, Chennai, Tamil Nadu 600040, India</p>
            <p className="text-[#0D5C3A] font-semibold">Direct Email: legal@anandhomes.com &bull; General Inquiries: contact@anandhomes.com</p>
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <Link to="/privacy" className="font-bold text-[#0D5C3A] hover:underline flex items-center gap-1">
          <span>Read Privacy Policy</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <span>&copy; {new Date().getFullYear()} Anand Homes. All rights reserved.</span>
      </div>
    </div>
  );
};
