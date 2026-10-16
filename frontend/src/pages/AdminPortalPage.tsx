import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Scheme } from '../types';
import {
  ShieldAlert, ShieldCheck, CheckCircle2, Clock, AlertTriangle,
  FileCheck, Users, BarChart3, Database, RefreshCw, ExternalLink
} from 'lucide-react';

export const AdminPortalPage: React.FC = () => {
  const [qualityReport, setQualityReport] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [quality, systemStats, schemeList] = await Promise.all([
        api.getAdminQualityReport(),
        api.getAdminStats(),
        api.getSchemes()
      ]);
      setQualityReport(quality);
      setStats(systemStats);
      setSchemes(schemeList);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleStatus = async (schemeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'verified' ? 'pending_verification' : 'verified';
    setUpdatingId(schemeId);
    try {
      await api.toggleSchemeVerification(schemeId, nextStatus);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">Loading administrator controls...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-extrabold text-navy-950">Administrative Portal & Scheme Verification</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor government source verification, dataset freshness, and aggregate citizen analytics.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Citizens</span>
            <Users className="w-4 h-4 text-navy-800" />
          </div>
          <div className="text-2xl font-extrabold text-navy-950 mt-2">
            {stats?.total_registered_users ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Profiles maintained privately</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Published Schemes</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-950 mt-2">
            {stats?.total_schemes_published ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Central & Maharashtra records</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Recommendations Ran</span>
            <BarChart3 className="w-4 h-4 text-saffron-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-950 mt-2">
            {stats?.total_recommendations_computed ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Deterministic rule evaluations</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tracked Applications</span>
            <CheckCircle2 className="w-4 h-4 text-indiaGreen-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-950 mt-2">
            {stats?.total_applications_tracked ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Citizen submissions</p>
        </div>
      </div>

      {/* Quality Report Card */}
      {qualityReport && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-navy-900" /> Scheme Dataset Quality & Verification Health
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-indiaGreen-50 rounded-xl border border-indiaGreen-200">
              <span className="text-indiaGreen-800 font-bold block text-sm">
                {qualityReport.verified_schemes} / {qualityReport.total_schemes}
              </span>
              <span className="text-indiaGreen-700 font-medium">Officially Verified Records</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-amber-800 font-bold block text-sm">
                {qualityReport.pending_verification}
              </span>
              <span className="text-amber-700 font-medium">Pending Source Review</span>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue-800 font-bold block text-sm">
                {qualityReport.data_freshness_rate}
              </span>
              <span className="text-blue-700 font-medium">Data Freshness Rate</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-800 font-bold block text-sm">
                {qualityReport.unannounced_deadlines_count}
              </span>
              <span className="text-slate-600 font-medium">Continuous / Unannounced Windows</span>
            </div>
          </div>
        </div>
      )}

      {/* Scheme Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
        <h2 className="text-base font-bold text-navy-950">Published Government Schemes Registry</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Scheme Name</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Deadline Type</th>
                <th className="py-3 px-3">Verification Status</th>
                <th className="py-3 px-3">Last Verified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {schemes.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-navy-950 max-w-xs truncate">
                    {s.official_name}
                  </td>
                  <td className="py-3 px-3 capitalize font-medium">{s.government_level}</td>
                  <td className="py-3 px-3 capitalize">{s.category.replace('_', ' ')}</td>
                  <td className="py-3 px-3">{s.date_info?.status_label || 'Continuous'}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                      s.verification_status === 'verified'
                        ? 'bg-indiaGreen-50 text-indiaGreen-800 border border-indiaGreen-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {s.verification_status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{s.last_verified_date}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <a
                      href={s.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-navy-900 inline-block"
                      title="View Official Source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleToggleStatus(s.id, s.verification_status)}
                      disabled={updatingId === s.id}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-navy-50 text-navy-900 border border-slate-300 transition-colors"
                    >
                      {s.verification_status === 'verified' ? 'Mark Pending' : 'Mark Verified'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
