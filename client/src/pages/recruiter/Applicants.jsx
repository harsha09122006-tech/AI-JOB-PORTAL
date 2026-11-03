import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationAPI, jobAPI } from '../../services/api';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  FileText,
  Mail,
  Phone,
  Eye,
  Loader2,
  Calendar,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

export const Applicants = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('job') || '';

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Application detail modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusRemarks, setStatusRemarks] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [selectedJob, selectedStatus]);

  const fetchJobs = async () => {
    try {
      const res = await jobAPI.getJobs({ limit: 100 });
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedJob) params.jobId = selectedJob;
      if (selectedStatus && selectedStatus !== 'All') params.status = selectedStatus;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await applicationAPI.getRecruiterApplications(params);
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      toast.error('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await applicationAPI.updateStatus(applicationId, {
        status: newStatus,
        remarks: statusRemarks || `Status changed to ${newStatus} by recruiter.`,
      });

      if (res.data.success) {
        toast.success(`Candidate marked as ${newStatus}!`);
        setApplications(
          applications.map((app) => (app._id === applicationId ? res.data.application : app))
        );
        if (selectedApp?._id === applicationId) {
          setSelectedApp(res.data.application);
        }
        setStatusRemarks('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setStatusUpdating(false);
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
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
          styles[status] || 'bg-slate-100 text-slate-800'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Talent Pipeline & Applicants</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review candidates, inspect AI match scores, evaluate resumes, and manage hiring stages.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Job Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Filter by Job Posting
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none"
            >
              <option value="">All Active Listings</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Hiring Stage
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Search by candidate */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Search Candidate Name
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading applicant profiles...</p>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Applicants Found"
          description="There are currently no candidates matching your selected filter criteria."
          actionText="Clear Filters"
          onAction={() => {
            setSelectedJob('');
            setSelectedStatus('All');
            setSearchTerm('');
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Job Role</th>
                  <th className="py-3.5 px-4">AI Match</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applied</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {app.candidate?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{app.candidate?.name}</p>
                          <p className="text-[11px] text-slate-400">{app.candidate?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {app.job?.title}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" /> {app.aiMatchScore}% Match
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Candidate Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-base flex items-center justify-center">
                  {selectedApp.candidate?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedApp.candidate?.name}</h3>
                  <p className="text-xs text-slate-500">
                    Applying for: <span className="font-semibold text-slate-800">{selectedApp.job?.title}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* AI Compatibility Highlight */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> AI Compatibility Score: {selectedApp.aiMatchScore}%
                </span>
                <span className="text-[11px] text-purple-700 font-semibold">Stage: {selectedApp.status}</span>
              </div>
              <p className="text-purple-800 leading-relaxed">
                {selectedApp.aiFeedback || 'Candidate possesses relevant technical background for this position.'}
              </p>
            </div>

            {/* Contact Details & Resume */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Email</p>
                <p className="font-medium text-slate-800 mt-0.5">{selectedApp.candidate?.email}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Phone</p>
                <p className="font-medium text-slate-800 mt-0.5">{selectedApp.candidate?.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Cover Letter */}
            {selectedApp.coverLetter && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cover Letter</p>
                <p className="text-xs text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                  {selectedApp.coverLetter}
                </p>
              </div>
            )}

            {/* Resume Link */}
            <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-bold text-slate-800">{selectedApp.resumeName || 'Resume.pdf'}</p>
                  <p className="text-[10px] text-slate-400">Attached applicant credentials</p>
                </div>
              </div>
              {selectedApp.resumeUrl && (
                <a
                  href={selectedApp.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> View Resume
                </a>
              )}
            </div>

            {/* Stage Decision Actions */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Update Candidate Stage:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map((stage) => (
                  <button
                    key={stage}
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange(selectedApp._id, stage)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedApp.status === stage
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Mark {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;

