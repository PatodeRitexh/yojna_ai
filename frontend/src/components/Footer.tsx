import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Info, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-navy-800 border border-slate-700 flex items-center justify-center text-white font-bold">
                <span className="text-saffron-400">य</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Yojana AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent, transparent civic-tech platform empowering Indian citizens to discover and access Central and Maharashtra welfare schemes.
            </p>
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-200">CEP Initiative</span> • College Community Engagement Project
            </div>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Official Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  myScheme Portal <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://mahadbt.maharashtra.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  MahaDBT Portal (Maharashtra) <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  National Scholarship Portal <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  PM-KISAN Portal <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://services.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  National Services Portal <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Platform Tools</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/schemes" className="hover:text-white">Scheme Explorer</Link></li>
              <li><Link to="/recommendations" className="hover:text-white">Eligibility Engine</Link></li>
              <li><Link to="/documents" className="hover:text-white">Document Vault & Scanner</Link></li>
              <li><Link to="/applications" className="hover:text-white">Application Tracker</Link></li>
              <li><Link to="/privacy-terms" className="hover:text-white">Privacy Notice & Terms</Link></li>
            </ul>
          </div>

          {/* Privacy & Disclaimers */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Responsible AI</h4>
            <div className="bg-navy-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-saffron-400 font-semibold">
                <Shield className="w-4 h-4" />
                <span>Data Protection</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Documents are stored privately with end-to-end user isolation. Full Aadhaar/PAN numbers are masked. Uploaded files are never used to train public AI models.
              </p>
            </div>
          </div>
        </div>

        {/* Civic Disclaimer */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 text-center">
          <div className="inline-flex items-center gap-2 bg-navy-900 text-slate-400 px-4 py-2 rounded-lg text-xs max-w-4xl border border-slate-800">
            <Info className="w-4 h-4 text-saffron-400 flex-shrink-0" />
            <p className="text-left text-[11px] leading-relaxed">
              <strong className="text-slate-200">Public Service Disclaimer:</strong> Yojana AI is an independent academic informational research project for community welfare. It is not an official government service and does not approve benefits. All users apply directly on official state and central government portals.
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            © {new Date().getFullYear()} Yojana AI (CEP Project) • Made for Indian Citizens with Pride
          </p>
        </div>
      </div>
    </footer>
  );
};
