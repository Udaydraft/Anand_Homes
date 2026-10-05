import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Lock,
  FileText,
  Mail,
  Building,
  CheckCircle2,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/Button';

export const PrivacyPolicyPage: React.FC = () => {
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
            Print Policy
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#0A3925] to-[#0D5C3A] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Legal & Compliance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 max-w-2xl leading-relaxed">
          Anand Homes Enterprise Construction & Inventory Management Platform is committed to safeguarding the operational, personal, and site data entrusted to us.
        </p>
        <div className="mt-4 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Effective: October 2026
          </span>
          <span>&bull;</span>
          <span>Version 2.4</span>
          <span>&bull;</span>
          <span>Applicable: Web & Mobile Supervisor Applications</span>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8 text-slate-700 text-sm leading-relaxed">
        {/* Section 1 */}
        <section id="overview" className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>Platform Overview & Scope</span>
          </h2>
          <p>
            This Privacy Policy governs the collection, use, and protection of information obtained through the Anand Homes Construction Management platform, which encompasses both the web administrative dashboard and mobile field applications for site engineers and supervisors.
          </p>
          <p>
            By accessing or operating the platform, authorized personnel acknowledge and agree to the operational data practices described in this document.
          </p>
        </section>

        {/* Section 2 */}
        <section id="collection" className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Information We Collect</span>
          </h2>
          <p>
            To facilitate construction site logistics, inventory tracking, and worker count verification, we collect the following classifications of data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs mb-1">User & Credential Data</h4>
              <p className="text-xs text-slate-600">
                Supervisor names, work email addresses, assigned project sites, role permissions, and cryptographic password hashes.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Material Logistics & Inward Records</h4>
              <p className="text-xs text-slate-600">
                Inward material deliveries, generated entry codes (INW-YYYYMMDD-XXXX), supplier invoices, unit valuations, and quantities.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Stock Outward & Consumption</h4>
              <p className="text-xs text-slate-600">
                Daily material dispatches to specific sites, construction nature of work, and consumption audit trails.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Labour Attendance & Manpower Counts</h4>
              <p className="text-xs text-slate-600">
                Headcounts of on-site masons, carpenters, and helpers grouped by work category for project progress tracking.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="usage" className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              3
            </span>
            <span>How We Use Your Operational Data</span>
          </h2>
          <p>
            Operational data collected through the system is strictly utilized for the following enterprise functions:
          </p>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
            <li>Calculating live inventory balances and safety buffer thresholds across active project locations.</li>
            <li>Preventing construction downtime by triggering proactive Low Stock alerts.</li>
            <li>Generating project duration timelines and milestone status reports for executive management.</li>
            <li>Auditing supervisor shift entries, material inward receipts, and site dispatches.</li>
            <li>Ensuring accounting transparency with itemized unit price calculations and transaction hashes.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="security" className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              4
            </span>
            <span>Data Security & Storage Standards</span>
          </h2>
          <p>
            We implement enterprise-grade technical safeguards to prevent unauthorized access, alteration, or disclosure:
          </p>
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Encrypted Cloud Storage:</strong> All project masters, inventory transactions, and labour entries are persisted in TLS 1.3 encrypted databases (MongoDB Atlas Enterprise Cluster).
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Cryptographic Authentication:</strong> Supervisor and administrator logins utilize salted bcrypt password hashing and short-lived stateless JWT access tokens.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Role-Based Access Control (RBAC):</strong> Strict isolation ensures site supervisors can only modify operational records relevant to their assigned construction sites.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="third-party" className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              5
            </span>
            <span>Third-Party Disclosures & Commercial Confidentiality</span>
          </h2>
          <p>
            Anand Homes does not sell, lease, or monetize any enterprise project information or worker data. Information is shared only under the following conditions:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
            <li>With vetted material suppliers strictly for invoice verification and delivery fulfilment.</li>
            <li>With chartered accounting auditors for official GST tax filings and material expenditure balance sheets.</li>
            <li>When mandated by regulatory authorities or court orders under Indian jurisdictional law.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="retention" className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0A3925] flex items-center justify-center text-xs font-black">
              6
            </span>
            <span>Data Retention & User Rights</span>
          </h2>
          <p>
            Site records and inventory ledgers are maintained for the statutory duration of the construction project and a subsequent 5-year post-completion maintenance audit window. Authorized personnel may request data corrections through their Head Office administrative portal.
          </p>
        </section>

        {/* Section 7 */}
        <section id="contact" className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#0A3925]" />
            <span>Compliance & Legal Contact</span>
          </h2>
          <p className="text-xs text-slate-600">
            For questions or inquiries regarding our privacy standards or data protection protocols, please reach out to our legal compliance division:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-900">Anand Homes Construction Legal Division</p>
            <p className="text-slate-600">Head Office: Anna Nagar Heights, Chennai, Tamil Nadu, India</p>
            <p className="text-[#0D5C3A] font-semibold">Email: legal@anandhomes.com &bull; Support: compliance@anandhomes.com</p>
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <Link to="/terms" className="font-bold text-[#0D5C3A] hover:underline flex items-center gap-1">
          <span>Read Terms & Conditions</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <span>&copy; {new Date().getFullYear()} Anand Homes. All rights reserved.</span>
      </div>
    </div>
  );
};
