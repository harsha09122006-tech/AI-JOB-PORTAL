import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Bookmark,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Upload,
  AlertCircle,
  Users,
  Check,
  Send,
  Loader2,
} from 'lucide-react';
import { jobAPI, applicationAPI, savedJobAPI, aiAPI, candidateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/jobs/JobCard';
import toast from 'react-hot-toast';

export const JobDetails = () => {
  const { id } = useParams();
  const { user, isJobSeeker } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [userApplication, setUserApplication] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState('');
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // AI Matching state
  const [aiMatch, setAiMatch] = useState(null);
  const [aiMatchLoading, setAiMatchLoading] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await jobAPI.getJobById(id);
      if (res.data.success) {
        setJob(res.data.job);
        setHasApplied(res.data.hasApplied);
        setUserApplication(res.data.userApplication);
        setIsSaved(res.data.isSaved);
        setSimilarJobs(res.data.similarJobs || []);

        // If candidate logged in, run AI match
        if (user && isJobSeeker) {
          runAiMatch(res.data.job);
          fetchCandidateProfile();
        }
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      toast.error('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateProfile = async () => {
    try {
      const res = await candidateAPI.getProfile();
      if (res.data.success) {
        setCandidateProfile(res.data.profile);
        if (res.data.profile?.resumeUrl) {
          setSelectedResumeUrl(res.data.profile.resumeUrl);
        }
      }
    } catch {
      // ignore
    }
  };

  const runAiMatch = async (jobData) => {
    setAiMatchLoading(true);
    try {
      const res = await aiAPI.matchJob({ jobId: jobData._id });
      if (res.data.success) {
        setAiMatch(res.data.match);
      }
    } catch (err) {
      console.warn('AI matching failed:', err.message);
    } finally {
      setAiMatchLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.error('Please log in to save jobs.');
      return navigate('/login');
    }
    try {
      if (isSaved) {
        await savedJobAPI.removeSavedJob(job._id);
        setIsSaved(false);
        toast.success('Job removed from saved.');
      } else {
        await savedJobAPI.saveJob(job._id);
        setIsSaved(true);
        toast.success('Job saved to your bookmarks!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update bookmark.');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to apply.');
      return navigate('/login');
    }

    if (!isJobSeeker) {
      return toast.error('Only job seekers can apply for positions.');
    }

    setSubmitting(true);
    try {
      let finalResumeUrl = selectedResumeUrl;
      let finalResumeName = candidateProfile?.resumeName || 'Resume.pdf';

      // If user uploaded a new resume inside modal
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const uploadRes = await candidateAPI.uploadResume(formData);
        if (uploadRes.data.success) {
          finalResumeUrl = uploadRes.data.resumeUrl;
          finalResumeName = uploadRes.data.resumeName;
        }
      }

      if (!finalResumeUrl) {
        setSubmitting(false);
        return toast.error('Please upload or select a resume before submitting.');
      }

      const res = await applicationAPI.apply({
        jobId: job._id,
        resumeUrl: finalResumeUrl,
        resumeName: finalResumeName,
        coverLetter,
      });

      if (res.data.success) {
        toast.success('Application submitted successfully!');
        setHasApplied(true);
        setUserApplication(res.data.application);
        setApplyModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Job Posting Not Found</h2>
        <Link to="/jobs" className="mt-4 inline-block text-blue-600 font-semibold text-sm">
          Return to Job Listings
        </Link>
      </div>
    );
  }

  const formatSalary = () => {
    if (!job.salary || (job.salary.min === 0 && job.salary.max === 0)) {
      return job.salary?.isNegotiable ? 'Negotiable' : 'Competitive';
    }
    const curr = job.salary.currency === 'USD' ? '$' : `${job.salary.currency} `;
    if (job.salary.min && job.salary.max) {
      return `${curr}${job.salary.min.toLocaleString()} - ${curr}${job.salary.max.toLocaleString()}`;
    }
    return `${curr}${(job.salary.max || job.salary.min).toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search Results
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-1">
              <Link
                to={`/companies/${job.company?.slug || job.company?._id}`}
                className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                {job.company?.name} <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.jobType}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {formatSalary()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleBookmarkToggle}
              className={`p-3 rounded-2xl border transition-all ${
                isSaved
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Job'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-blue-600' : ''}`} />
            </button>

            {hasApplied ? (
              <div className="px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" /> Applied ({userApplication?.status || 'Active'})
              </div>
            ) : (
              <button
                onClick={() => setApplyModalOpen(true)}
                className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                Apply for Position
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Details & AI Matcher Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: Job Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Job Description
              </h2>
              <div className="mt-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Key Responsibilities
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Requirements & Qualifications
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Required Skills & Technologies
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Similar Opportunities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarJobs.map((simJob) => (
                  <JobCard key={simJob._id} job={simJob} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COL: AI Matcher & Company Snapshot */}
        <div className="space-y-6">
          {/* AI MATCH CARD */}
          {user && isJobSeeker ? (
            <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden space-y-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-purple-200 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Compatibility Scan
                </span>
                {aiMatchLoading && <Loader2 className="w-4 h-4 animate-spin text-purple-300" />}
              </div>

              {aiMatch ? (
                <>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-white">
                      {aiMatch.matchPercentage}%
                    </span>
                    <span className="text-xs text-purple-200 pb-1 font-semibold">Match Score</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{aiMatch.explanation}</p>

                  {/* Matching Skills */}
                  {aiMatch.matchingSkills?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Matching Skills ({aiMatch.matchingSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiMatch.matchingSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-[11px]"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {aiMatch.missingSkills?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                        Missing Required Skills ({aiMatch.missingSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiMatch.missingSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-200 border border-pink-500/30 text-[11px]"
                          >
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-4 text-center text-xs text-purple-200">
                  Analyzing compatibility against your candidate profile...
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 rounded-3xl p-6 text-white text-center space-y-3">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
              <h4 className="font-bold text-sm">Want AI Resume-Job Matching?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in as a Job Seeker to instantly compare your resume skills and calculate match compatibility!
              </p>
              <Link
                to="/login"
                className="inline-block mt-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Sign In to Match
              </Link>
            </div>
          )}

          {/* Company Snapshot Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800">About the Employer</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                {job.company?.logo ? (
                  <img src={job.company.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{job.company?.name}</p>
                <p className="text-xs text-slate-500">{job.company?.industry}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {job.company?.description || 'Leading enterprise building innovative tech solutions.'}
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
              <p>📍 {job.company?.location}</p>
              <p>👥 {job.company?.companySize} team members</p>
              {job.company?.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline block pt-1"
                >
                  Visit Website ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* APPLY MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Apply for Position</h3>
                <p className="text-xs text-slate-500">{job.title} at {job.company?.name}</p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              {/* Existing Resume Selection */}
              {candidateProfile?.resumeUrl && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-blue-900">Use Saved Resume</p>
                    <p className="text-blue-700">{candidateProfile.resumeName || 'Resume.pdf'}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-blue-600 text-white font-bold text-[10px]">
                    Active
                  </span>
                </div>
              )}

              {/* Upload New Resume */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {candidateProfile?.resumeUrl ? 'Or Upload a New Resume (PDF / DOCX)' : 'Upload Resume (Required)'}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cover Letter (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a great fit for this position..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Application
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

export default JobDetails;

