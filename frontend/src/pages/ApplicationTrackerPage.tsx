import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ApplicationTrackerItem } from '../types';
import {
  CheckCircle2, Clock, AlertCircle, Trash2, ExternalLink,
  Edit2, FileText, Check, Plus, ArrowRight
} from 'lucide-react';

export const ApplicationTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationTrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRefNum, setEditRefNum] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const loadApplications = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleStartEdit = (app: ApplicationTrackerItem) => {
    setEditingId(app.id);
    setEditStatus(app.status);
    setEditRefNum(app.reference_number || '');
    setEditNotes(app.notes || '');
  };

  const handleSaveEdit = async (trackerId: string) => {
    try {
      await api.updateApplication(trackerId, {
        status: editStatus,
        reference_number: editRefNum,
        notes: editNotes,
      });
      setEditingId(null);
      await loadApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    }
  };

  const handleDelete = async (trackerId: string) => {
    if (!confirm('Remove this application tracker?')) return;
    try {
      await api.deleteApplication(trackerId);
      setApplications((prev) => prev.filter((a) => a.id !== trackerId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indiaGreen-50 text-indiaGreen-800 border border-indiaGreen-200">Approved & Disbursed</span>;
      case 'applied':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">Applied on Portal</span>;
      case 'ready_to_apply':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">Ready to Apply</span>;
      case 'preparing_documents':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Preparing Documents</span>;
      case 'awaiting_response':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">Awaiting Response</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">Rejected / Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Interested</span>;
    }
  };

  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const inProgressCount = applications.filter((a) => a.status !== 'approved' && a.status !== 'rejected').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-indiaGreen-600" /> Welfare Application Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of your submissions, government reference numbers, and verification progress.
          </p>
        </div>

        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Scheme</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tracked</span>
          <div className="text-3xl font-extrabold text-navy-950 mt-1">{applications.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Central & State applications</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">{inProgressCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Preparing, applied, or under review</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved & Received</span>
          <div className="text-3xl font-extrabold text-indiaGreen-700 mt-1">{approvedCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Confirmed government benefit disbursements</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-navy-950">Active Applications ({applications.length})</h2>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading your applications...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No applications currently tracked</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Find schemes from your recommendations or the scheme explorer and click "Track Application" to monitor progress here.
            </p>
            <Link
              to="/recommendations"
              className="inline-block px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
            >
              View Recommendations
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const isEditing = editingId === app.id;
              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(app.status)}
                        <span className="text-xs text-slate-400 font-medium">
                          Last Updated: {new Date(app.updated_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <Link
                        to={`/schemes/${app.scheme_id}`}
                        className="text-base font-bold text-navy-950 hover:underline"
                      >
                        {app.scheme?.official_name || 'Government Scheme'}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.scheme?.benefits_summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={app.portal_link || app.scheme?.official_application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 text-xs font-bold text-navy-900 bg-navy-50 hover:bg-navy-100 rounded-lg border border-navy-200 transition-colors flex items-center gap-1"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleStartEdit(app)}
                        className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Update Status / Notes"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove tracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata display */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Application Ref / Registration ID:
                      </span>
                      <span className="font-mono text-slate-800 font-medium">
                        {app.reference_number || 'Not added yet'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Private Notes:
                      </span>
                      <span className="text-slate-700 italic">
                        {app.notes || 'No private notes.'}
                      </span>
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {isEditing && (
                    <div className="pt-3 border-t border-slate-200 space-y-3 bg-slate-50/80 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-900">Update Tracking Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            <option value="interested">Interested</option>
                            <option value="preparing_documents">Preparing Documents</option>
                            <option value="ready_to_apply">Ready to Apply</option>
                            <option value="applied">Applied on Official Portal</option>
                            <option value="awaiting_response">Awaiting Response</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reference Number</label>
                          <input
                            type="text"
                            value={editRefNum}
                            onChange={(e) => setEditRefNum(e.target.value)}
                            placeholder="e.g. MH-DBT-2024-XXXX"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes</label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Application notes..."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(app.id)}
                          className="px-4 py-1 bg-navy-900 text-white font-semibold text-xs rounded-lg hover:bg-navy-800"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
