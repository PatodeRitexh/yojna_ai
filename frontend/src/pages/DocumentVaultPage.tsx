import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UploadedDocument } from '../types';
import { DocumentReviewModal } from '../components/DocumentReviewModal';
import {
  FileText, Upload, Shield, Trash2, CheckCircle2, AlertCircle,
  Clock, FileCheck, Eye, RefreshCw
} from 'lucide-react';

export const DocumentVaultPage: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('income_certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Review modal
  const [reviewingDoc, setReviewingDoc] = useState<UploadedDocument | null>(null);

  const loadDocuments = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploaded = await api.uploadDocument(selectedFile, docType);
      setSelectedFile(null);
      // Reset file input element
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setSuccess('Document uploaded and scanned successfully! Please review the extracted data below.');
      await loadDocuments();

      // Automatically open review modal if extraction generated fields
      if (uploaded.status === 'review_required') {
        setReviewingDoc(uploaded);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to permanently delete this document and its extracted data?')) {
      return;
    }
    try {
      await api.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified_by_user':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indiaGreen-50 text-indiaGreen-800 border border-indiaGreen-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-indiaGreen-600" /> Confirmed by Citizen
          </span>
        );
      case 'review_required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Review Required
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" /> Scanning
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Unreadable / Manual
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Uploaded
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 flex items-center gap-2">
            <FileText className="w-6 h-6 text-navy-800" /> Citizen Document Vault & Scanner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store proof certificates privately. Automated OCR parses eligibility fields with your confirmation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <Shield className="w-4 h-4 text-indiaGreen-600" />
          <span>Private Encrypted Storage</span>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 text-xs text-navy-950 space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-navy-800" /> Responsible Document Processing:
        </p>
        <p className="text-navy-800 leading-relaxed">
          Files are saved inside a private, unexposed directory. We automatically mask full 12-digit Aadhaar and PAN numbers. OCR is an assessment aid, not government certification. You must review extracted values before confirming.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-navy-900" /> Upload Certificate or Marksheet
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-indiaGreen-50 text-indiaGreen-800 text-xs rounded-lg flex items-center gap-2 border border-indiaGreen-200">
            <CheckCircle2 className="w-4 h-4 text-indiaGreen-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
            >
              <option value="income_certificate">Income Certificate (Tahsildar / SDO)</option>
              <option value="caste_certificate">Caste / Category Certificate</option>
              <option value="domicile_certificate">Maharashtra Domicile Certificate</option>
              <option value="marksheet">Marksheet (10th / 12th / Degree)</option>
              <option value="bonafide_certificate">College Bonafide Certificate</option>
              <option value="disability_certificate">Disability Certificate / UDID Card</option>
              <option value="ration_card">Ration Card (Yellow / Saffron / White)</option>
              <option value="other">Other Official Certificate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select File (PDF, PNG, JPG - Max 10MB)
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy-800 hover:file:bg-navy-100 cursor-pointer border border-slate-300 rounded-lg p-1"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning & Extracting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Scan Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-navy-950 flex items-center justify-between">
          <span>Uploaded Documents ({documents.length})</span>
          <button
            onClick={loadDocuments}
            className="text-xs text-navy-800 hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </h2>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No documents uploaded yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Upload your Income Certificate or Maharashtra Domicile to auto-fill your profile and unlock 100% matched schemes.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center flex-shrink-0 border border-navy-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate max-w-sm sm:max-w-md">
                      {doc.original_filename}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="capitalize font-medium text-slate-700">
                        {doc.document_type.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>Uploaded {new Date(doc.created_at).toLocaleDateString('en-IN')}</span>
                    </div>

                    {/* Detected fields brief */}
                    {doc.extracted_data && (
                      <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/80 inline-block">
                        <span className="font-semibold text-navy-900">Detected: </span>
                        {Object.entries(doc.extracted_data.user_confirmed_fields || doc.extracted_data.extracted_fields || {})
                          .map(([k, v]) => `${k.replace('_', ' ')}: ${typeof v === 'number' ? '₹' + v.toLocaleString('en-IN') : v}`)
                          .join(' | ') || 'No structured fields detected. Manual entry available.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {getStatusBadge(doc.status)}

                  {doc.extracted_data && (
                    <button
                      onClick={() => setReviewingDoc(doc)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-navy-900 bg-navy-50 hover:bg-navy-100 border border-navy-200 transition-colors flex items-center gap-1"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-navy-700" />
                      <span>{doc.extracted_data.is_confirmed ? 'Edit Values' : 'Review & Confirm'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Human-in-the-loop Review Modal */}
      {reviewingDoc && (
        <DocumentReviewModal
          document={reviewingDoc}
          onClose={() => setReviewingDoc(null)}
          onConfirmed={loadDocuments}
        />
      )}
    </div>
  );
};
