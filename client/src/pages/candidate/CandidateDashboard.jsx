import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationAPI, savedJobAPI, aiAPI, candidateAPI } from '../../services/api';
import {
  FileText,
  Clock,
  CheckCircle,
  BookmarkCheck,
  Sparkles,
  ArrowRight,
  User,
  Bot,
  TrendingUp,
  AlertCircle,
  Loader2,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Plus,
  Send,
  X,
  Upload,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CandidateDashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [emptyGuidance, setEmptyGuidance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);

  // Recommendation Filters state
  const [filters, setFilters] = useState({
    location: '',
    jobType: 'all',
    experienceLevel: 'all',
    workplaceType: 'all',
  });
  const [expandedBreakdown, setExpandedBreakdown] = useState({});

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submittingApply, setSubmittingApply] = useState(false);

  // Quick Resume Upload state
  const [uploadingResume, setUploadingResume] = useState(false);

  // Initial load
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appRes, savedRes, recRes] = await Promise.all([
          applicationAPI.getMyApplications(),
          savedJobAPI.getSavedJobs(),
          aiAPI.getRecommendations(),
        ]);

        if (appRes.data.success) setApplications(appRes.data.applications || []);
        if (savedRes.data.success) setSavedJobs(savedRes.data.savedJobs || []);
        if (recRes.data.success) {
          setRecommendations(recRes.data.recommendations || []);
          setEmptyGuidance(recRes.data.emptyGuidance || null);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch / filter recommendations
  const fetchFilteredRecommendations = useCallback(async (currentFilters = filters) => {
    setRecLoading(true);
    try {
      const params = {};
      if (currentFilters.location) params.location = currentFilters.location;
      if (currentFilters.jobType && currentFilters.jobType !== 'all') params.jobType = currentFilters.jobType;
      if (currentFilters.experienceLevel && currentFilters.experienceLevel !== 'all') params.experienceLevel = currentFilters.experienceLevel;
      if (currentFilters.workplaceType && currentFilters.workplaceType !== 'all') params.workplaceType = currentFilters.workplaceType;

      const res = await aiAPI.getRecommendations(params);
      if (res.data.success) {
        setRecommendations(res.data.recommendations || []);
        setEmptyGuidance(res.data.emptyGuidance || null);
      }
    } catch (err) {
      console.error('Error filtering recommendations:', err);
      toast.error('Failed to update recommendations.');
    } finally {
      setRecLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    fetchFilteredRecommendations(updated);
  };

  const handleResetFilters = () => {
    const reset = {
      location: '',
      jobType: 'all',
      experienceLevel: 'all',
      workplaceType: 'all',
    };
    setFilters(reset);
    fetchFilteredRecommendations(reset);
  };

  // Toggle bookmark
  const handleSaveToggle = async (jobId) => {
    const isCurrentlySaved = savedJobs.some((s) => s.job?._id === jobId || s.job === jobId);
    try {
      if (isCurrentlySaved) {
        await savedJobAPI.removeSavedJob(jobId);
        setSavedJobs((prev) => prev.filter((s) => s.job?._id !== jobId && s.job !== jobId));
        toast.success('Removed from saved bookmarks.');
      } else {
        const res = await savedJobAPI.saveJob(jobId);
        if (res.data.success) {
          setSavedJobs((prev) => [...prev, res.data.savedJob]);
          toast.success('Job saved to your bookmarks!');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update bookmark.');
    }
  };

  // Open apply confirmation modal
  const handleOpenApplyModal = (jobItem) => {
    const job = jobItem.job || jobItem;
    // Check if already applied
    const alreadyApplied = applications.some((a) => a.job?._id === job._id || a.job === job._id);
    if (alreadyApplied) {
      toast('You have already submitted an application for this position.', { icon: 'ℹ️' });
      return;
    }
    setSelectedJobToApply(jobItem);
    setCoverLetter('');
    setResumeFile(null);
    setApplyModalOpen(true);
  };

  // Submit job application after confirmation
  const handleConfirmApplication = async (e) => {
    e.preventDefault();
    if (!selectedJobToApply) return;

    const job = selectedJobToApply.job || selectedJobToApply;
    setSubmittingApply(true);
    try {
      let finalResumeUrl = profile?.resumeUrl || '';
      let finalResumeName = profile?.resumeName || 'Resume.pdf';

      // If user uploaded a new resume inside modal
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const uploadRes = await candidateAPI.uploadResume(formData);
        if (uploadRes.data.success) {
          finalResumeUrl = uploadRes.data.resumeUrl;
          finalResumeName = uploadRes.data.resumeName;
          if (refreshProfile) refreshProfile();
        }
      }

      if (!finalResumeUrl) {
        setSubmittingApply(false);
        return toast.error('Please upload or provide a resume before submitting.');
      }

      const res = await applicationAPI.apply({
        jobId: job._id,
        resumeUrl: finalResumeUrl,
        resumeName: finalResumeName,
        coverLetter,
      });

      if (res.data.success) {
        toast.success('Application confirmed and submitted successfully! 🎉');
        setApplications((prev) => [res.data.application, ...prev]);
        setApplyModalOpen(false);
        setSelectedJobToApply(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingApply(false);
    }
  };

  // Quick Resume Upload directly from dashboard
  const handleQuickResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    const toastId = toast.loading('Extracting resume skills & updating AI recommendations...');
    try {
      const res = await candidateAPI.uploadResume(formData);
      if (res.data.success) {
        toast.success('Resume extracted! Re-matching jobs across active database...', { id: toastId });
        if (refreshProfile) refreshProfile();
        // Automatically refresh recommendations with updated resume data
        await fetchFilteredRecommendations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resume upload failed.', { id: toastId });
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (salary.min === 0 && salary.max === 0)) {
      return salary?.isNegotiable ? 'Negotiable' : 'Competitive';
    }
    const curr = salary.currency === 'USD' ? '$' : `${salary.currency} `;
    if (salary.min && salary.max) {
      return `${curr}${salary.min.toLocaleString()} - ${curr}${salary.max.toLocaleString()}`;
    }
    return `${curr}${(salary.max || salary.min).toLocaleString()}`;
  };

  const toggleBreakdown = (index) => {
    setExpandedBreakdown((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => ['Applied', 'Under Review'].includes(a.status)).length;
  const shortlistedApps = applications.filter((a) => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length;
  const completionPercentage = profile?.profileCompletedPercentage || 40;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading candidate dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Welcome & Profile Completion Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI-Powered Career Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-time multi-factor AI job matches, ATS resume analysis, and application tracking powered by MongoDB & Google Gemini.
          </p>
        </div>

        {/* Profile Completion Dial & Quick Resume */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-full md:w-72 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-200">Profile Completion</span>
            <span className="text-purple-300 font-black">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="pt-1 flex items-center justify-between gap-2 border-t border-white/10">
            <label className="text-[11px] font-bold text-blue-300 hover:text-white cursor-pointer flex items-center gap-1 transition-colors">
              <Upload className="w-3 h-3" />
              {uploadingResume ? 'Uploading...' : 'Quick Sync Resume'}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleQuickResumeUpload}
                disabled={uploadingResume}
                className="hidden"
              />
            </label>
            <Link
              to="/candidate/profile"
              className="text-[11px] text-slate-300 hover:text-white font-semibold flex items-center gap-1"
            >
              Profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalApps}</p>
          <p className="text-[11px] text-slate-400">Positions submitted & tracked</p>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{pendingApps}</p>
          <p className="text-[11px] text-slate-400">Under evaluation by recruiters</p>
        </div>

        {/* Shortlisted */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Shortlisted / Interview
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{shortlistedApps}</p>
          <p className="text-[11px] text-slate-400">Advanced candidate stage</p>
        </div>

        {/* Saved Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Saved Bookmarks
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-600">{savedJobs.length}</p>
          <p className="text-[11px] text-slate-400">Jobs saved for future review</p>
        </div>
      </div>

      {/* 3. Section E: Automatic Resume-Based Job Recommendations */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Transparent 4-Factor AI Matching Engine</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Top 10 AI Recommended Jobs
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Ranked dynamically by weighted skills (40%), experience (25%), education (15%), and role relevance (20%).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchFilteredRecommendations()}
              disabled={recLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${recLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/candidate/resume-analyzer"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Resume ATS Analyzer
            </Link>
          </div>
        </div>

        {/* Interactive Filter Bar (Requirement 10) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" /> Filter Recommendations
            </span>
            {(filters.location || filters.jobType !== 'all' || filters.experienceLevel !== 'all' || filters.workplaceType !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Location filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Location / City</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="e.g. Remote, San Francisco..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Job Type filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
              >
                <option value="all">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Experience Level filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Experience Level</label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
              >
                <option value="all">All Experience Levels</option>
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior-level">Senior-level</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            {/* Workplace filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Workplace Setting</label>
              <select
                value={filters.workplaceType}
                onChange={(e) => handleFilterChange('workplaceType', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
              >
                <option value="all">All Settings</option>
                <option value="Remote">Remote Only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recommendations Display */}
        {recLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Running multi-factor AI compatibility evaluation...</p>
          </div>
        ) : recommendations.length === 0 ? (
          /* Empty State & Guidance (Requirement 12) */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">
                {emptyGuidance?.message || 'No Matching Jobs Found for Current Criteria'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {emptyGuidance?.reason ||
                  'None of the active job postings match your selected filters or current resume competency profile.'}
              </p>
            </div>

            {/* Suggested in-demand skills */}
            {emptyGuidance?.suggestedSkills && emptyGuidance.suggestedSkills.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 max-w-lg mx-auto space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  💡 In-Demand Skills to Improve Your Compatibility Score
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {emptyGuidance.suggestedSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold"
                    >
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                Reset All Filters
              </button>
              <Link
                to="/candidate/resume-analyzer"
                className="px-5 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-all"
              >
                Update Resume & Skills
              </Link>
            </div>
          </div>
        ) : (
          /* Top 10 Ranked Recommendations (Requirements 6, 7, 8) */
          <div className="space-y-4">
            {recommendations.slice(0, 10).map((rec, index) => {
              const job = rec.job;
              const isSaved = savedJobs.some((s) => s.job?._id === job._id || s.job === job._id);
              const isApplied = applications.some((a) => a.job?._id === job._id || a.job === job._id);
              const isExpanded = !!expandedBreakdown[index];

              const matchColor =
                rec.matchPercentage >= 85
                  ? 'from-emerald-600 to-teal-600 text-emerald-600 bg-emerald-50 border-emerald-200'
                  : rec.matchPercentage >= 70
                  ? 'from-blue-600 to-indigo-600 text-blue-600 bg-blue-50 border-blue-200'
                  : 'from-purple-600 to-indigo-600 text-purple-600 bg-purple-50 border-purple-200';

              return (
                <div
                  key={job._id || index}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-purple-300 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Row: Rank, Company, Job Info & Match Percentage */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Company Logo or Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.company?.logo ? (
                          <img
                            src={job.company.logo}
                            alt={job.company.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            #{index + 1} Match
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {job.company?.name || 'Top Employer'}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Remote'}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {formatSalary(job.salary)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.jobType} • {job.workplaceType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score Gauge */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-sm shadow-purple-500/20">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{rec.matchPercentage}% Compatibility</span>
                        </div>
                        <button
                          onClick={() => toggleBreakdown(index)}
                          className="block text-[11px] font-bold text-purple-600 hover:underline mt-1 ml-auto"
                        >
                          {isExpanded ? 'Hide Score Breakdown ▲' : 'View Transparent Score ▼'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transparent 4-Part Scoring Breakdown (Requirement 5) */}
                  {isExpanded && rec.scoreBreakdown && (
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-purple-600" /> Transparent Multi-Factor Score Calculation:
                        </span>
                        <span className="text-[11px] text-purple-700 font-bold">Total: {rec.matchPercentage}%</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-2.5 rounded-xl bg-white border border-purple-100 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Skills (40%)</span>
                          <p className="text-sm font-black text-purple-900">{rec.scoreBreakdown.skillsScore}%</p>
                          <span className="text-[10px] text-slate-500">Weight contribution: +{Math.round(rec.scoreBreakdown.skillsScore * 0.4)}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-purple-100 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Experience (25%)</span>
                          <p className="text-sm font-black text-indigo-900">{rec.scoreBreakdown.experienceScore}%</p>
                          <span className="text-[10px] text-slate-500">Weight contribution: +{Math.round(rec.scoreBreakdown.experienceScore * 0.25)}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-purple-100 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Education (15%)</span>
                          <p className="text-sm font-black text-blue-900">{rec.scoreBreakdown.educationScore}%</p>
                          <span className="text-[10px] text-slate-500">Weight contribution: +{Math.round(rec.scoreBreakdown.educationScore * 0.15)}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-purple-100 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Role Fit (20%)</span>
                          <p className="text-sm font-black text-teal-900">{rec.scoreBreakdown.roleScore}%</p>
                          <span className="text-[10px] text-slate-500">Weight contribution: +{Math.round(rec.scoreBreakdown.roleScore * 0.2)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills Grid: Matching Skills & Missing Skills (Requirement 8) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Matching Skills */}
                    <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 uppercase tracking-wider">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Matching Required Skills ({rec.matchingSkills?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.matchingSkills && rec.matchingSkills.length > 0 ? (
                          rec.matchingSkills.map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold"
                            >
                              ✓ {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No exact skill matches identified.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing / Recommended Skills */}
                    <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 uppercase tracking-wider">
                        <Plus className="w-3.5 h-3.5 text-amber-600" /> Missing / Recommended Skills ({rec.missingSkills?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.missingSkills && rec.missingSkills.length > 0 ? (
                          rec.missingSkills.map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold"
                            >
                              + {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold">100% of required skills present!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Plain-English Explanation (Requirement 8) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block mb-0.5">Why This Job is Recommended:</span>
                      <p>{rec.explanation || rec.recommendationReason}</p>
                    </div>
                  </div>

                  {/* Actions Row: View Job & Apply Buttons (Requirements 8, 11) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleSaveToggle(job._id)}
                      className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                        isSaved
                          ? 'border-purple-300 bg-purple-50 text-purple-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      {isSaved ? 'Saved' : 'Save Job'}
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                      >
                        View Full Job
                      </Link>

                      {isApplied ? (
                        <span className="px-5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Already Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenApplyModal(rec)}
                          className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. AI Quick Power Tools & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Left 2 Cols: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Recent Application Activity
            </h4>
            <Link to="/candidate/applications" className="text-xs font-bold text-blue-600 hover:underline">
              View All Applications →
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
            {applications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No applications submitted yet. Browse recommendations above to apply!</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <div key={app._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-900">{app.job?.title || 'Tech Role'}</p>
                      <p className="text-xs text-slate-500">{app.job?.company?.name || 'Company'} • Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl ${
                        app.status === 'Shortlisted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'Interview'
                          ? 'bg-purple-100 text-purple-800'
                          : app.status === 'Selected'
                          ? 'bg-teal-100 text-teal-800'
                          : app.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: AI Quick Tools */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" /> AI Career Tools
          </h4>
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 text-white space-y-4 shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
              Accelerate Your Hiring
            </span>
            <h5 className="text-base font-bold">24/7 AI Career Guidance</h5>
            <div className="space-y-2.5">
              <Link
                to="/candidate/resume-analyzer"
                className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-300" /> AI Resume ATS Scanner
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/candidate/career-assistant"
                className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-300" /> AI Interview Prep Coach
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Review & Confirm Application Modal (Requirement 11) */}
      {applyModalOpen && selectedJobToApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Review & Confirm Application
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {(selectedJobToApply.job || selectedJobToApply).title}
                </h3>
                <p className="text-xs text-slate-500">
                  {(selectedJobToApply.job || selectedJobToApply).company?.name || 'Hiring Enterprise'} • {(selectedJobToApply.job || selectedJobToApply).location}
                </p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Compatibility Notice */}
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-2.5 text-xs text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>
                Your profile has a <strong>{selectedJobToApply.matchPercentage || 85}% AI match</strong> with this position.
              </span>
            </div>

            {/* Application Form */}
            <form onSubmit={handleConfirmApplication} className="space-y-4">
              {/* Resume Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Resume Attachment
                </label>
                {profile?.resumeName && !resumeFile && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                      📄 {profile.resumeName}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Active on Profile
                    </span>
                  </div>
                )}

                <div className="pt-1">
                  <label className="text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {resumeFile ? `Selected: ${resumeFile.name}` : 'Or attach a different resume (PDF / DOCX)'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Cover Letter Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Cover Letter / Introductory Note (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Highlight why your skills and experience make you an ideal candidate for this role..."
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium resize-none"
                />
              </div>

              {/* Important Review Confirmation Note (Requirement 11) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                ⚠️ <strong>Application Confirmation:</strong> Applications cannot be retracted once sent. Please review your details before submitting to the hiring team.
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApply}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingApply ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Confirm & Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
