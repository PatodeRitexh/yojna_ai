import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, FileText, CheckCircle2, Bookmark, ShieldCheck,
  LogOut, User as UserIcon, Menu, X, Bot, Search
} from 'lucide-react';

interface NavbarProps {
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAssistant }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top micro-bar for civic identity */}
      <div className="bg-navy-900 text-slate-300 text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-saffron-500"></span>
          <span>Government of India & State Welfare Discovery Platform (Academic CEP)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <span>Official Portal Sync: Daily</span>
          <span className="text-indiaGreen-400 font-medium">● System Online</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-navy-800 transition-colors">
              <span className="text-saffron-400">य</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-navy-950 tracking-tight">Yojana</span>
                <span className="text-xl font-extrabold text-saffron-600">AI</span>
                <span className="text-[10px] bg-navy-100 text-navy-800 px-1.5 py-0.5 rounded font-semibold ml-1">CIVIC</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-1 font-medium">The Right Scheme. The Right Opportunity.</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/schemes"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/schemes') ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              Explore Schemes
            </Link>

            {user && (
              <>
                <Link
                  to="/recommendations"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/recommendations') ? 'bg-saffron-50 text-saffron-800 font-semibold' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-saffron-600" />
                  Recommendations
                </Link>

                <Link
                  to="/documents"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/documents') ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  Document Vault
                </Link>

                <Link
                  to="/applications"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/applications') ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-indiaGreen-600" />
                  Tracker
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive('/admin') ? 'bg-red-50 text-red-800 font-semibold' : 'text-slate-600 hover:text-red-700 hover:bg-red-50/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-red-600" />
                Admin
              </Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Assistant Trigger */}
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-navy-800 to-navy-950 text-white shadow-sm hover:shadow hover:from-navy-900 hover:to-black transition-all"
            >
              <Bot className="w-4 h-4 text-saffron-400" />
              <span>Scheme AI Bot</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-xs">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-navy-900 hover:text-navy-950 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm transition-colors"
                >
                  Find My Schemes
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={onOpenAssistant}
              className="p-2 rounded-lg bg-navy-50 text-navy-900"
            >
              <Bot className="w-5 h-5 text-saffron-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore Schemes
          </Link>
          {user ? (
            <>
              <Link
                to="/recommendations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Personalized Recommendations
              </Link>
              <Link
                to="/documents"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Document Vault
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Application Tracker
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-red-50"
                >
                  Admin Portal
                </Link>
              )}
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-base font-medium text-navy-900 border border-slate-300 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-base font-semibold text-white bg-navy-900 rounded-lg"
              >
                Register & Check Eligibility
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
