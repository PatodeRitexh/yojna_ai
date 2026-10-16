import React from 'react';
import { Shield, Lock, Eye, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyTermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 pb-8 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-900 border border-navy-200 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-navy-800" />
          <span>Civic Technology Governance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-950">Privacy Policy & Platform Terms</h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Committed to citizen data privacy, ethical artificial intelligence, and transparency for public welfare.
        </p>
      </div>

      {/* Prominent Legal Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>Public Service & Academic Project Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          <strong>Yojana AI</strong> is an independent academic informational research project developed as part of a college Community Engagement Project (CEP).
          It is <strong>NOT</strong> an official government portal, does not collect government fees, and does not issue welfare approvals or benefit disbursements.
          All formal applications must be submitted directly through official central and state portals (e.g. <code>scholarships.gov.in</code>, <code>mahadbt.maharashtra.gov.in</code>, <code>pmkisan.gov.in</code>).
        </p>
      </div>

      {/* Core Privacy Principles */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-navy-950">1. Citizen Data Minimization & Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Lock className="w-4 h-4 text-navy-800" /> Protected Document Storage
            </h3>
            <p className="leading-relaxed">
              Uploaded certificates are stored in private, unexposed server directories with strict owner-only access controls. Documents are never accessible through public URLs or logged in system logs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Eye className="w-4 h-4 text-indiaGreen-700" /> Aadhaar & PII Masking
            </h3>
            <p className="leading-relaxed">
              We never store or expose unmasked 12-digit Aadhaar numbers or bank account numbers. During text extraction, identity numbers are automatically masked (e.g. <code>XXXX-XXXX-1234</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Responsible AI */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-navy-950">2. Responsible AI & Deterministic Eligibility</h2>
        <div className="p-5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-3 shadow-sm leading-relaxed">
          <p>
            • <strong>Deterministic Rules for Hard Decisions:</strong> Scheme eligibility assessments are strictly governed by published Government Resolutions (GRs) and explicit logical operators (&lt;=, &gt;=, ==, in). AI models are NEVER permitted to override hard eligibility rules.
          </p>
          <p>
            • <strong>No Unreliable Inferences:</strong> We do not infer caste, religion, income, or disability status from names, appearance, or location. All sensitive fields must be explicitly confirmed by the citizen.
          </p>
          <p>
            • <strong>Human-in-the-Loop Review:</strong> Text and numbers extracted via OCR require explicit user confirmation before being saved to the user profile.
          </p>
        </div>
      </div>

      {/* User Rights */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-navy-950">3. Citizen Rights & Data Deletion</h2>
        <div className="p-5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2 shadow-sm leading-relaxed">
          <p>
            Citizens retain full ownership over their data. You may delete any uploaded certificate or reset your profile at any time through the Document Vault and Profile Wizard. Upon deletion, physical files and extracted metadata are permanently removed from our databases.
          </p>
        </div>
      </div>
    </div>
  );
};
