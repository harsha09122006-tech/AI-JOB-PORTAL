import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, recruiterAPI } from '../../services/api';
import {
  Briefcase,
  Users,
  Edit2,
  Trash2,
  PlusCircle,
  ExternalLink,
  Loader2,
  CheckCircle,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  useEffect(() => {
    fetchRecruiterJobs();
  }, []);

  const fetchRecruiterJobs = async () => {
    setLoading(true);
    try {
      const res = await recruiterAPI.getDashboard();
      if (res.data.success) {
        // Fetch all jobs for recruiter
        const allJobsRes = await jobAPI.getJobs({ limit: 100 });
        if (allJobsRes.data.success) {
          setJobs(allJobsRes.data.jobs || []);
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (jobId, newStatus) => {
    setStatusUpdatingId(jobId);
    try {
      const res = await jobAPI.toggleJobStatus(jobId, newStatus);
      if (res.data.success) {
        toast.success(`Job marked as ${newStatus}.`);
        setJobs(jobs.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? All candidate applications will be removed.')) {
      return;
    }

    try {
      const res = await jobAPI.deleteJob(jobId);
      if (res.data.success) {
        toast.success('Job posting deleted successfully.');
        setJobs(jobs.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete job.');
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await jobAPI.updateJob(editingJob._id, editingJob);
      if (res.data.success) {
        toast.success('Job details updated successfully!');
        setJobs(jobs.map((j) => (j._id === editingJob._id ? res.data.job : j)));
        setEditingJob(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading your job listings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Manage Job Postings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View, edit, pause, or remove your company's active talent listings.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Jobs Posted Yet"
          description="Create your first job posting to start receiving AI-matched candidate applications."
          actionText="Create First Job"
          actionLink="/recruiter/post-job"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Job Title</th>
                  <th className="py-3.5 px-4">Type & Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applications</th>
                  <th className="py-3.5 px-4">Posted Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
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
                      <span className="text-[11px] text-slate-400">{job.industry}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{job.jobType} • {job.workplaceType}</div>
                      <div className="text-[11px] text-slate-400">{job.location}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={job.status}
                        disabled={statusUpdatingId === job._id}
                        onChange={(e) => handleStatusToggle(job._id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : job.status === 'paused'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        to={`/recruiter/applicants?job=${job._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applicationsCount || 0} Applicants</span>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingJob(job)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Edit Job"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Job Listing</h3>
              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Job Type</label>
                  <select
                    value={editingJob.jobType}
                    onChange={(e) => setEditingJob({ ...editingJob, jobType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;

