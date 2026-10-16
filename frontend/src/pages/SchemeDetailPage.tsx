import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Scheme } from '../types';
import { getCategoryIcon, getStatusBadgeColor } from '../components/SchemeCard';
import {
  ExternalLink, Calendar, CheckCircle2, FileText, ArrowLeft,
  Bookmark, Bot, AlertTriangle, ShieldCheck, Clock
} from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [refNum, setRefNum] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await api.getSchemeDetail(id);
        setScheme(data);

        // Check if saved
        try {
          const saved = await api.getSavedSchemes();
          setIsSaved(saved.some((s) => s.scheme_id === id));
          const apps = await api.getApplications();
          const existingApp = apps.find((a) => a.scheme_id === id);
          if (existingApp) {
            setTrackingStatus(existingApp.status);
            setNotes(existingApp.notes || '');
            setRefNum(existingApp.reference_number || '');
          }
        } catch {
          // not logged in
        }
      } catch (err) {
        console.error('Failed to load scheme details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleToggleSave = async () => {
    if (!scheme) return;
    try {
      if (isSaved) {
        await api.unsaveScheme(scheme.id);
        setIsSaved(false);
      } else {
        await api.saveScheme(scheme.id);
        setIsSaved(true);
      }
    } catch {
      alert('Please log in to bookmark this scheme.');
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheme) return;
    try {
      await api.trackApplication(scheme.id, trackingStatus || 'interested', notes);
      setTrackModalOpen(false);
      alert('Application tracked successfully in your tracker!');
    } catch {
      alert('Please log in to track your application.');
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">Loading scheme information...</div>;
  }

  if (!scheme) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Scheme not found</h2>
        <Link to="/schemes" className="text-sm font-semibold text-navy-800 hover:underline">
          Return to Scheme Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/schemes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Scheme Explorer</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                {getCategoryIcon(scheme.category)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {scheme.category.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                scheme.government_level === 'central'
                  ? 'bg-navy-50 text-navy-800 border-navy-200'
                  : 'bg-saffron-50 text-saffron-800 border-saffron-200'
              }`}>
                {scheme.government_level === 'central' ? 'Central Sector Scheme' : 'Government of Maharashtra'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indiaGreen-700 bg-indiaGreen-50 px-2 py-0.5 rounded-full border border-indiaGreen-200">
                <ShieldCheck className="w-3 h-3" /> Official Status: {scheme.verification_status.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 leading-tight">
              {scheme.official_name}
            </h1>
            <p className="text-xs text-slate-500">
              Department / Authority: <strong className="text-slate-700">{scheme.source_authority}</strong>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                isSaved
                  ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => setTrackModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indiaGreen-600 hover:bg-indiaGreen-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Track Application</span>
            </button>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Benefits</span>
            <span className="text-xs font-semibold text-navy-950 mt-0.5 block leading-relaxed">
              {scheme.benefits_summary}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application Deadline</span>
            <div className="mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getStatusBadgeColor(scheme.date_info?.status_label)}`}>
                {scheme.date_info?.status_label || 'Continuous Enrolment'}
              </span>
            </div>
            {scheme.date_info?.closing_date && (
              <span className="text-[11px] text-slate-500 mt-1 block">
                Closing Date: {new Date(scheme.date_info.closing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applicability</span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {(scheme.applicable_states || []).join(', ') || 'All India'}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Beneficiaries: {(scheme.target_beneficiaries || []).join(', ')}
            </span>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Scheme Overview</h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {scheme.detailed_description}
          </p>
        </div>

        {/* Required Documents */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-navy-800" /> Mandatory Required Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(scheme.required_documents || []).map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indiaGreen-600 flex-shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">How to Apply</h2>
          <div className="p-4 bg-navy-50/50 rounded-2xl border border-navy-100 text-xs sm:text-sm text-navy-950 leading-relaxed">
            {scheme.application_process}
          </div>
        </div>

        {/* Verified Links & Official Portals */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Official Government Application Portals:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={scheme.official_application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <span>Visit Official Application Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={scheme.official_source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>View Source / Gazette Guidelines</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          <p className="text-[11px] text-amber-800 leading-normal">
            Important: Never pay any fees on third-party websites. Government welfare applications must only be submitted through verified .gov.in or .nic.in portals.
          </p>
        </div>
      </div>

      {/* Application Tracking Modal */}
      {trackModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-navy-950">Track Scheme Application</h3>
            <p className="text-xs text-slate-500">Record your application progress for personal reference.</p>

            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Status</label>
                <select
                  value={trackingStatus || 'interested'}
                  onChange={(e) => setTrackingStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
                >
                  <option value="interested">Interested (Exploring requirements)</option>
                  <option value="preparing_documents">Preparing Documents</option>
                  <option value="ready_to_apply">Ready to Apply</option>
                  <option value="applied">Applied on Official Portal</option>
                  <option value="awaiting_response">Awaiting Response / Verification</option>
                  <option value="approved">Approved & Disbursed</option>
                  <option value="rejected">Rejected / Ineligible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application / Registration Ref Number (Optional)
                </label>
                <input
                  type="text"
                  value={refNum}
                  onChange={(e) => setRefNum(e.target.value)}
                  placeholder="e.g. MH-DBT-2024-987654"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Private Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Submitted income certificate at college desk on 12th Oct."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs rounded-lg shadow-sm"
                >
                  Save to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
