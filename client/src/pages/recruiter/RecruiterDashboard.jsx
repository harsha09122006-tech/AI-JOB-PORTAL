import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recruiterAPI } from '../../services/api';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  PlusCircle,
  TrendingUp,
  BarChart3,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Loader2,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const STATUS_COLORS = {
  Applied: '#3B82F6',
  'Under Review': '#F59E0B',
  Shortlisted: '#10B981',
  Interview: '#8B5CF6',
  Selected: '#14B8A6',
  Rejected: '#EF4444',
};

export const RecruiterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, analRes] = await Promise.all([
        recruiterAPI.getDashboard(),
        recruiterAPI.getAnalytics(),
      ]);

      if (dashRes.data.success) {
        setStats(dashRes.data.stats);
        setRecentApplications(dashRes.data.recentApplications || []);
        setRecentJobs(dashRes.data.recentJobs || []);
      }

      if (analRes.data.success) {
        setAnalytics(analRes.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading recruiter dashboard...</p>
      </div>
    );
  }

  const pieData = analytics?.statusDistribution || [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Banner & Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Recruiter Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Hiring Management Hub</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage your open job listings, review AI-scored candidate resumes, and track talent conversion.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job Opening
        </Link>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.totalJobs || 0}</p>
          <p className="text-[10px] text-slate-400">Total listings created</p>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Active Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats?.activeJobs || 0}</p>
          <p className="text-[10px] text-slate-400">Live & accepting applicants</p>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Applications</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600">{stats?.totalApplications || 0}</p>
          <p className="text-[10px] text-slate-400">Total candidate resumes</p>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats?.pendingApplications || 0}</p>
          <p className="text-[10px] text-slate-400">Needs screening decision</p>
        </div>

        {/* Shortlisted */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Shortlisted</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600">{stats?.shortlistedCandidates || 0}</p>
          <p className="text-[10px] text-slate-400">Advanced to interviews</p>
        </div>
      </div>

      {/* 3. Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Application Status Distribution</h3>
            <span className="text-xs text-slate-400">{stats?.totalApplications || 0} total</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No application data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || '#64748B'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-slate-100 text-[11px]">
            {pieData.map((entry, idx) => (
              <span key={idx} className="flex items-center gap-1 text-slate-600">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] || '#64748B' }}
                />
                {entry.status} ({entry.count})
              </span>
            ))}
          </div>
        </div>

        {/* Top Jobs by Volume Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Job Inquiries & Applicant Volume</h3>
            <Link to="/recruiter/analytics" className="text-xs font-bold text-blue-600 hover:underline">
              Full Analytics →
            </Link>
          </div>

          <div className="h-64 w-full">
            {analytics?.topJobs && analytics.topJobs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topJobs} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active job applications to graph yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Recent Applicants Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Candidate Submissions</h3>
            <p className="text-xs text-slate-500">Latest applicants received across your open listings</p>
          </div>
          <Link
            to="/recruiter/applicants"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Manage Pipeline <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No candidate applications received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Position</th>
                  <th className="py-3 px-3">AI Match Score</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Applied Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                        {app.candidate?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <span>{app.candidate?.name}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{app.candidate?.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{app.job?.title}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
                        <Sparkles className="w-3 h-3" /> {app.aiMatchScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/recruiter/applicants?job=${app.job?._id}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Review Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;

