import React, { useState } from 'react';
import { UploadedDocument } from '../types';
import { api } from '../services/api';
import { Check, X, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface DocumentReviewModalProps {
  document: UploadedDocument | null;
  onClose: () => void;
  onConfirmed: () => void;
}

export const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  document,
  onClose,
  onConfirmed,
}) => {
  if (!document || !document.extracted_data) return null;

  const rawExtracted = document.extracted_data.extracted_fields || {};
  const [formData, setFormData] = useState<Record<string, any>>({
    income_amount: rawExtracted.income_amount || '',
    category: rawExtracted.category || '',
    issue_date: rawExtracted.issue_date || '',
    issuing_authority: rawExtracted.issuing_authority || '',
    state: rawExtracted.state || 'Maharashtra',
  });
  const [syncToProfile, setSyncToProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Format clean confirmed fields
    const confirmed: Record<string, any> = {};
    if (formData.income_amount) confirmed.income_amount = Number(formData.income_amount);
    if (formData.category) confirmed.category = formData.category.toLowerCase();
    if (formData.issue_date) confirmed.issue_date = formData.issue_date;
    if (formData.issuing_authority) confirmed.issuing_authority = formData.issuing_authority;
    if (formData.state) confirmed.state = formData.state;

    try {
      await api.confirmDocumentData(document.id, confirmed, syncToProfile);
      onConfirmed();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save confirmed data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-saffron-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Human-in-the-Loop Review
            </span>
            <h3 className="text-lg font-bold">Review Extracted Document Data</h3>
            <p className="text-xs text-slate-300 mt-0.5 truncate max-w-sm">
              File: {document.original_filename}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">OCR Verification Notice</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Machine extraction is not official government verification. Please review and correct the detected values from your certificate before confirming.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Income Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Family Income (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  value={formData.income_amount}
                  onChange={(e) => setFormData({ ...formData, income_amount: e.target.value })}
                  placeholder="e.g. 150000"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">As stated on Income Certificate issued by Tahsildar / Revenue Authority.</p>
            </div>

            {/* Category / Caste */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detected Category / Caste
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
              >
                <option value="">-- Select or Confirm --</option>
                <option value="general">General / Open</option>
                <option value="obc">OBC (Other Backward Class)</option>
                <option value="sc">SC (Scheduled Caste)</option>
                <option value="st">ST (Scheduled Tribe)</option>
                <option value="ews">EWS (Economically Weaker Section)</option>
                <option value="vjnt">VJNT</option>
                <option value="sbc">SBC</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Issue Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                />
              </div>

              {/* Issuing Authority */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issuing Authority
                </label>
                <input
                  type="text"
                  value={formData.issuing_authority}
                  onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                  placeholder="e.g. Tahsildar"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sync to profile checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToProfile}
                onChange={(e) => setSyncToProfile(e.target.checked)}
                className="rounded text-navy-900 focus:ring-navy-800 w-4 h-4"
              />
              <span className="text-xs text-slate-700 font-medium">
                Update my profile with these confirmed details automatically
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Save to Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
