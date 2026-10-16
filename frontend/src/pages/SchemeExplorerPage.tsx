import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Scheme } from '../types';
import { SchemeCard } from '../components/SchemeCard';
import { Search, Filter, RefreshCw, X, ShieldCheck } from 'lucide-react';

export const SchemeExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [govLevel, setGovLevel] = useState(searchParams.get('government_level') || 'all');
  const [state, setState] = useState(searchParams.get('state') || 'all');
  const [beneficiary, setBeneficiary] = useState(searchParams.get('beneficiary') || 'all');

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.getSchemes({
        q: search || undefined,
        category: category !== 'all' ? category : undefined,
        government_level: govLevel !== 'all' ? govLevel : undefined,
        state: state !== 'all' ? state : undefined,
        beneficiary: beneficiary !== 'all' ? beneficiary : undefined,
      });
      setSchemes(data);

      // Load saved schemes if logged in
      try {
        const saved = await api.getSavedSchemes();
        setSavedSchemeIds(new Set(saved.map((s) => s.scheme_id)));
      } catch {
        // Not logged in or error
      }
    } catch (err: any) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, [category, govLevel, state, beneficiary]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSchemes();
  };

  const handleSaveToggle = async (schemeId: string) => {
    try {
      if (savedSchemeIds.has(schemeId)) {
        await api.unsaveScheme(schemeId);
        setSavedSchemeIds((prev) => {
          const next = new Set(prev);
          next.delete(schemeId);
          return next;
        });
      } else {
        await api.saveScheme(schemeId);
        setSavedSchemeIds((prev) => new Set(prev).add(schemeId));
      }
    } catch (err: any) {
      alert('Please log in to save schemes to your personal vault.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setGovLevel('all');
    setState('all');
    setBeneficiary('all');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Indian Government Scheme Explorer</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified Central & Maharashtra welfare programs with official published eligibility rules.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-indiaGreen-600" />
          <span>Official Source Verified</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes by name, keyword, or benefits..."
            className="w-full pl-10 pr-24 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-800 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-4 py-1.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Category */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-800 focus:outline-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="education">Education & Scholarships</option>
              <option value="agriculture">Agriculture & Farmers</option>
              <option value="healthcare">Healthcare & Insurance</option>
              <option value="housing">Housing & Shelter</option>
              <option value="social_welfare">Pensions & Social Welfare</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Government Level</label>
            <select
              value={govLevel}
              onChange={(e) => setGovLevel(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-800 focus:outline-none bg-white"
            >
              <option value="all">Central & State</option>
              <option value="central">Central Government</option>
              <option value="state">Maharashtra State</option>
            </select>
          </div>

          {/* Beneficiary */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Beneficiary</label>
            <select
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-800 focus:outline-none bg-white"
            >
              <option value="all">All Beneficiaries</option>
              <option value="students">Students</option>
              <option value="farmers">Farmers</option>
              <option value="women">Women</option>
              <option value="senior_citizens">Senior Citizens</option>
              <option value="disability">Persons with Disabilities</option>
              <option value="low_income">Economically Weaker Section</option>
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Applicable State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-800 focus:outline-none bg-white"
            >
              <option value="all">All India</option>
              <option value="Maharashtra">Maharashtra Only</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button if any active */}
        {(search || category !== 'all' || govLevel !== 'all' || state !== 'all' || beneficiary !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Filtered Results: {schemes.length} schemes</span>
            <button
              onClick={resetFilters}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Scheme Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No schemes found matching criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your filters or searching for terms like "scholarship", "farmer", or "health".
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onSave={handleSaveToggle}
              isSaved={savedSchemeIds.has(scheme.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
