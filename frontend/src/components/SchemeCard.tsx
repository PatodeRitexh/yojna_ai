import React from 'react';
import { Link } from 'react-router-dom';
import { Scheme } from '../types';
import {
  GraduationCap, Sprout, HeartPulse, Home, Users,
  Calendar, CheckCircle, ExternalLink, ArrowRight, Bookmark
} from 'lucide-react';

interface SchemeCardProps {
  scheme: Scheme;
  onSave?: (schemeId: string) => void;
  isSaved?: boolean;
}

export const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'education':
      return <GraduationCap className="w-4 h-4 text-blue-600" />;
    case 'agriculture':
      return <Sprout className="w-4 h-4 text-emerald-600" />;
    case 'healthcare':
      return <HeartPulse className="w-4 h-4 text-rose-600" />;
    case 'housing':
      return <Home className="w-4 h-4 text-amber-600" />;
    case 'social_welfare':
      return <Users className="w-4 h-4 text-purple-600" />;
    default:
      return <Users className="w-4 h-4 text-navy-600" />;
  }
};

export const getStatusBadgeColor = (statusLabel?: string) => {
  if (!statusLabel) return 'bg-slate-100 text-slate-700';
  if (statusLabel.includes('Open') || statusLabel.includes('Continuous')) {
    return 'bg-indiaGreen-50 text-indiaGreen-800 border-indiaGreen-200';
  }
  if (statusLabel.includes('Closing soon')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (statusLabel.includes('Opens soon')) {
    return 'bg-blue-50 text-blue-800 border-blue-200';
  }
  if (statusLabel.includes('Closed')) {
    return 'bg-red-50 text-red-800 border-red-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, onSave, isSaved = false }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-slate-50 border border-slate-200">
              {getCategoryIcon(scheme.category)}
            </span>
            <span className="text-xs font-semibold capitalize text-slate-700">
              {scheme.category.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              scheme.government_level === 'central'
                ? 'bg-navy-50 text-navy-800 border-navy-200'
                : 'bg-saffron-50 text-saffron-800 border-saffron-200'
            }`}>
              {scheme.government_level === 'central' ? 'Central Scheme' : 'Maharashtra State'}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/schemes/${scheme.id}`} className="block">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-navy-900 transition-colors line-clamp-2">
            {scheme.official_name}
          </h3>
        </Link>

        {/* Short Summary */}
        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {scheme.short_summary}
        </p>

        {/* Benefit Highlight */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documented Benefit</div>
          <div className="text-xs font-semibold text-navy-950 mt-0.5 line-clamp-2">
            {scheme.benefits_summary}
          </div>
        </div>

        {/* Required Documents preview */}
        {scheme.required_documents && scheme.required_documents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {scheme.required_documents.slice(0, 3).map((doc, i) => (
              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {doc}
              </span>
            ))}
            {scheme.required_documents.length > 3 && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                +{scheme.required_documents.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer info & CTA */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Deadline pill */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getStatusBadgeColor(scheme.date_info?.status_label)}`}>
            {scheme.date_info?.status_label || 'Continuous / Active'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={() => onSave(scheme.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-500 hover:text-navy-900 border-slate-200'
              }`}
              title={isSaved ? 'Saved' : 'Save scheme'}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          )}

          <Link
            to={`/schemes/${scheme.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-navy-700 group-hover:translate-x-0.5 transition-all"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
