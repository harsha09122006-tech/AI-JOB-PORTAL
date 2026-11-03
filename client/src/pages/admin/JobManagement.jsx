import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, jobAPI } from '../../services/api';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  Search,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [approvalFilter, setApprovalFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [approvalFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (approvalFilter) params.approvalStatus = approvalFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await adminAPI.getJobs(params);
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
      toast.error('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (jobId, newStatus) => {
    setActionId(jobId);
    try {
      const res = await adminAPI.updateJobApproval(jobId, newStatus);
      if (res.data.success) {
        toast.success(`Job marked as ${newStatus}!`);
        setJobs(jobs.map((j) => (j._id === jobId ? res.data.job : j)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update approval status.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing permanently?')) {
      return;
    }

    try {
      const res = await jobAPI.deleteJob(jobId);
      if (res.data.success) {
        toast.success('Job listing removed.');
        setJobs(jobs.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove job.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Job Moderation & Approvals</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Approve, reject, or remove employer listings to maintain quality and prevent spam.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-medium"
            />
          </div>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none"
          >
            <option value="">All Approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={fetchJobs}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          Search
        </button>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading moderation queue...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Job Title & Employer</th>
                  <th className="py-3.5 px-4">Recruiter</th>
                  <th className="py-3.5 px-4">Approval</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Posted</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors block text-sm"
                      >
                        {job.title}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        {job.company?.name || 'Company'} • {job.location}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{job.recruiter?.name}</div>
                      <div className="text-[11px] text-slate-400">{job.recruiter?.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          job.approvalStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : job.approvalStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {job.approvalStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {job.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => handleApproval(job._id, 'approved')}
                            disabled={actionId === job._id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {job.approvalStatus !== 'rejected' && (
                          <button
                            onClick={() => handleApproval(job._id, 'rejected')}
                            disabled={actionId === job._id}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;

