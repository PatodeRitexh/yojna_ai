import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Shield, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/recommendations');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@yojanaai.gov.in');
    setPassword('Admin@YojanaAI2026');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-navy-900 text-saffron-400 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
            य
          </div>
          <h2 className="text-2xl font-bold text-navy-950">Welcome to Yojana AI</h2>
          <p className="text-xs text-slate-500">Sign in to check your personalized scheme recommendations</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. citizen@example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Login Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-navy-700" /> Evaluation / Demo Accounts:
            </span>
            <button
              onClick={handleFillDemoAdmin}
              className="text-[11px] text-navy-800 font-bold hover:underline"
            >
              Fill Admin
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            For academic review, use <strong>admin@yojanaai.gov.in</strong> / <strong>Admin@YojanaAI2026</strong> or create a new student account.
          </p>
        </div>

        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-semibold text-navy-900 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
