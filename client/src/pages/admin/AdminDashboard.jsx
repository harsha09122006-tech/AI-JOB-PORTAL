import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  ShieldCheck,
  Users,
  Briefcase,
  FileText,
  AlertTriangle,
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboard();
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentUsers(res.data.recentUsers || []);
        setRecentJobs(res.data.recentJobs || []);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      toast.error('Failed to load admin analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading platform administration console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-purple-200 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Master Administration Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Control Center</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Moderate job postings, oversee registered candidates and recruiters, and maintain system integrity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/jobs"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Review Pending Jobs ({stats?.pendingJobApprovals || 0})
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
          <p className="text-[10px] text-slate-400">
            {stats?.totalCandidates || 0} candidates • {stats?.totalRecruiters || 0} recruiters
          </p>
        </div>

        {/* Total Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Platform Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-indigo-600">{stats?.totalJobs || 0}</p>
          <p className="text-[10px] text-slate-400">{stats?.activeJobs || 0} currently active</p>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Applications</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats?.totalApplications || 0}</p>
          <p className="text-[10px] text-slate-400">Submitted platform-wide</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{stats?.pendingJobApprovals || 0}</p>
          <p className="text-[10px] text-slate-400">Awaiting moderator check</p>
        </div>
      </div>

      {/* Tables: Recent Users & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registered Users */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Recent User Registrations</h3>
            <Link to="/admin/users" className="text-xs font-bold text-blue-600 hover:underline">
              Manage Users →
            </Link>
          </div>

          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u._id} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{u.name}</p>
                  <p className="text-slate-400 text-[11px]">{u.email}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : u.role === 'recruiter'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Recent Job Postings</h3>
            <Link to="/admin/jobs" className="text-xs font-bold text-blue-600 hover:underline">
              Review Jobs →
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.map((j) => (
              <div key={j._id} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{j.title}</p>
                  <p className="text-slate-400 text-[11px]">{j.company?.name || 'Company'}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    j.approvalStatus === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {j.approvalStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

