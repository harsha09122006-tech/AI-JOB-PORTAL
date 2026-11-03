import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Lock, Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const performLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);

    if (result?.success) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        const role = result.user?.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'recruiter') navigate('/recruiter/dashboard');
        else navigate('/candidate/dashboard');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    await performLogin(email, password);
  };

  // Instant 1-Click Evaluation Login
  const handleOneClickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    await performLogin(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to access your AI Career Connect dashboard
          </p>
        </div>

        {/* Demo Quick Fill Box for Evaluation */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-blue-600" /> 1-Click Evaluation Demo Logins:
          </p>
          <p className="text-[11px] text-blue-700">Click any role to immediately sign in and transition to its dashboard:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOneClickDemo('alex.rivera@example.com', 'Password@123')}
              className="py-2 px-2.5 bg-white rounded-xl border border-blue-300 text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition-all shadow-xs flex items-center justify-center gap-1 disabled:opacity-50"
            >
              Candidate
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOneClickDemo('sarah.jenkins@techcorp.io', 'Password@123')}
              className="py-2 px-2.5 bg-white rounded-xl border border-blue-300 text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition-all shadow-xs flex items-center justify-center gap-1 disabled:opacity-50"
            >
              Recruiter
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOneClickDemo('admin@aicareerconnect.com', 'Admin@123456')}
              className="py-2 px-2.5 bg-white rounded-xl border border-purple-300 text-purple-700 font-bold hover:bg-purple-600 hover:text-white transition-all shadow-xs flex items-center justify-center gap-1 disabled:opacity-50"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-200/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:underline">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
