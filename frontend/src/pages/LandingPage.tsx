import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Sparkles, ShieldCheck, CheckCircle2, ArrowRight,
  GraduationCap, Sprout, HeartPulse, Home, Users, FileText,
  Lock, ExternalLink, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { api } from '../services/api';
import { Scheme } from '../types';
import { SchemeCard } from '../components/SchemeCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredSchemes, setFeaturedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const schemes = await api.getSchemes();
        setFeaturedSchemes(schemes.slice(0, 6));
      } catch (err) {
        console.error('Failed to load featured schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/schemes');
    }
  };

  const categories = [
    { id: 'education', name: 'Education & Scholarships', desc: 'Higher education fees, post-matric assistance', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'agriculture', name: 'Agriculture & Farmers', desc: 'Direct DBT support, farm equipment subsidies', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'healthcare', name: 'Healthcare & Wellness', desc: 'Ayushman Bharat hospitalization coverage', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'housing', name: 'Housing & Shelter', desc: 'Pucca house grants under PMAY-G & PMAY-U', icon: Home, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'social_welfare', name: 'Pensions & Social Welfare', desc: 'Senior citizen pensions, disability allowances', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const faqs = [
    {
      q: 'Is Yojana AI an official Indian Government website?',
      a: 'No. Yojana AI is an independent civic-technology and academic Community Engagement Project (CEP) designed to help citizens navigate official welfare schemes. We do not process government payments, charge fees, or issue official approvals. We direct you to official portals like myScheme.gov.in, MahaDBT, and NSP.'
    },
    {
      q: 'How does the Eligibility Rules Engine determine my scheme match?',
      a: 'We evaluate your profile against published Government Resolutions (GRs) and official guidelines using deterministic rules (income limits, domicile, education, caste category, and age). We distinguish between "Likely Eligible", "Potentially Eligible" (needs extra document confirmation), and "Not Eligible".'
    },
    {
      q: 'Are my uploaded documents and personal information secure?',
      a: 'Yes. All documents are stored in private, unexposed server directories. Sensitive identifiers such as Aadhaar and PAN are automatically masked. Documents are solely used to extract required eligibility fields with your explicit consent, and you can delete them at any time.'
    },
    {
      q: 'Does Yojana AI support schemes outside Maharashtra?',
      a: 'Currently, the platform includes nationwide Central Government schemes (such as PM-KISAN, Ayushman Bharat, PMAY, NSAP, and NSP) alongside Maharashtra State Government schemes (MahaDBT). The architecture is designed to expand to additional Indian states.'
    }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 text-white">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-saffron-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 right-0 w-[400px] h-[300px] bg-indiaGreen-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-slate-700 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-saffron-400"></span>
            <span>Empowering Indian Citizens • Central & Maharashtra Welfare Schemes</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            The Right Scheme.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-400 via-white to-indiaGreen-400">
              The Right Opportunity.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Government benefits, made easier to discover. Check your verified eligibility for Central and Maharashtra schemes based on your education, income, and profession.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-6">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white p-1.5 border border-slate-200">
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholarships, farmers assistance, pensions, housing..."
                className="w-full text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none px-2 py-2.5"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-400">
              <span>Trending:</span>
              <button onClick={() => navigate('/schemes?q=MahaDBT')} className="hover:text-white underline">MahaDBT EBC</button>
              <span>•</span>
              <button onClick={() => navigate('/schemes?q=PM-KISAN')} className="hover:text-white underline">PM-KISAN</button>
              <span>•</span>
              <button onClick={() => navigate('/schemes?q=Ayushman')} className="hover:text-white underline">Ayushman Bharat</button>
              <span>•</span>
              <button onClick={() => navigate('/schemes?q=Girls')} className="hover:text-white underline">Free Education for Girls</button>
            </div>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-bold text-sm shadow-lg shadow-saffron-500/25 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find My Eligible Schemes</span>
            </Link>
            <Link
              to="/schemes"
              className="px-6 py-3 rounded-xl bg-navy-800/90 hover:bg-navy-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors"
            >
              Browse All Schemes
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">Welfare Scheme Categories</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">Explore official schemes tailored to specific community sectors and life stages.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/schemes?category=${cat.id}`)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-navy-300 hover:shadow-md transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-6 h-6 ${cat.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-navy-900 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-navy-800">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider">Transparent Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">How Yojana AI Works</h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">A reliable, 4-step workflow connecting citizens with verified government benefits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-navy-900 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Complete Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your education, family income, state residency, and category in our secure profile wizard.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-navy-900 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Upload Documents</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload income or caste certificates to your private Document Vault. Our OCR extracts details with human confirmation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-navy-900 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Deterministic Rules Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rules match your profile against officially published criteria with 100% transparency on reasons.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-navy-900 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Apply on Official Portals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Directly visit verified portals like MahaDBT, PM-KISAN, or NSP and track your progress in your tracker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Schemes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indiaGreen-500"></span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">Featured Government Schemes</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">Recently verified Central & Maharashtra welfare programs.</p>
          </div>
          <Link
            to="/schemes"
            className="flex items-center gap-1 text-sm font-semibold text-navy-900 hover:text-navy-700"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-xl bg-slate-100 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* Privacy & Responsible AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-navy-900 text-white p-8 sm:p-12 border border-navy-800 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-saffron-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Privacy-First & Civic Trust
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">Responsible AI for Public Welfare</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We uphold strict ethical guidelines for public sector applications. We never make automated eligibility determinations based on inferred caste, religion, or location.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indiaGreen-400 flex-shrink-0" />
                <span>Deterministic rules for decisions; AI strictly for summaries and assistance.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indiaGreen-400 flex-shrink-0" />
                <span>Zero leakage: PII (Aadhaar & PAN) masked before extraction.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indiaGreen-400 flex-shrink-0" />
                <span>Documents kept in private local storage, never exposed publicly.</span>
              </li>
            </ul>
          </div>

          <div className="bg-navy-950/80 p-6 rounded-2xl border border-navy-800 space-y-4">
            <h4 className="text-sm font-semibold text-white">Public Service Standards</h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-navy-900 rounded-lg border border-navy-800">
                <strong className="text-slate-100 block mb-0.5">Verified Source Linking</strong>
                Every scheme links directly to Gazette notifications, Government Resolutions (GR), and official portals.
              </div>
              <div className="p-3 bg-navy-900 rounded-lg border border-navy-800">
                <strong className="text-slate-100 block mb-0.5">Accurate Deadline Reporting</strong>
                We never fabricate countdowns. If a scheme has an unannounced deadline, we state "Deadline not announced".
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-600">Common questions about scheme discovery and document verification.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full p-4 text-left font-semibold text-sm text-slate-900 flex justify-between items-center hover:bg-slate-50"
              >
                <span>{f.q}</span>
                {faqOpen === i ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {faqOpen === i && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
