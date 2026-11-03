import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../../services/api';
import {
  FileText,
  Clock,
  CheckCircle,
  Building2,
  Calendar,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationAPI.getMyApplications();
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This cannot be undone.')) {
      return;
    }

    setWithdrawingId(applicationId);
    try {
      const res = await applicationAPI.withdraw(applicationId);
      if (res.data.success) {
        toast.success('Application withdrawn successfully.');
        setApplications(applications.filter((a) => a._id !== applicationId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Applied: 'bg-blue-100 text-blue-800 border-blue-200',
      'Under Review': 'bg-amber-100 text-amber-800 border-amber-200',
      Shortlisted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Interview: 'bg-purple-100 text-purple-800 border-purple-200',
      Selected: 'bg-teal-100 text-teal-800 border-teal-200',
      Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
          styles[status] || 'bg-slate-100 text-slate-800 border-slate-200'
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Application Pipeline</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track real-time hiring decisions, recruitment stage updates, and interview invites.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Submitted Applications"
          description="You haven't submitted any job applications yet. Discover matching opportunities and apply directly."
          actionText="Explore Job Openings"
          actionLink="/jobs"
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isExpanded = expandedId === app._id;
            const canWithdraw = ['Applied', 'Under Review'].includes(app.status);

            return (
              <div
                key={app._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {app.job?.company?.logo ? (
                        <img src={app.job?.company?.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/jobs/${app.job?._id}`}
                          className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {app.job?.title || 'Position'}
                        </Link>
                      </div>
                      <p className="text-xs text-slate-500">
                        {app.job?.company?.name} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {getStatusBadge(app.status)}
                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        disabled={withdrawingId === app._id}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Withdraw Application"
                      >
                        {withdrawingId === app._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Match Score & Resume Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                      <Sparkles className="w-3.5 h-3.5" /> {app.aiMatchScore}% Match
                    </span>
                    <span className="text-slate-400">Resume: {app.resumeName}</span>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app._id)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {isExpanded ? 'Hide Status History' : 'View Timeline & Details'}
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded Details: Timeline & Cover Letter */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                    {/* Cover Letter */}
                    {app.coverLetter && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Submitted Cover Letter:
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Stage Timeline & Remarks:
                      </p>
                      <div className="space-y-2">
                        {app.history && app.history.length > 0 ? (
                          app.history.map((hist, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-700"
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="font-bold text-slate-900">{hist.status}</span>
                                <span className="text-[11px] text-slate-400 ml-2">
                                  {new Date(hist.changedAt).toLocaleString()}
                                </span>
                                {hist.remarks && (
                                  <p className="text-[11px] text-slate-600 mt-0.5">{hist.remarks}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400">Application pending initial review.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;

