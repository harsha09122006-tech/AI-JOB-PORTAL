import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Bookmark,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { savedJobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const JobCard = ({ job, onSaveToggle, matchScore }) => {
  const { user, isJobSeeker } = useAuth();
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to save jobs.');
      navigate('/login');
      return;
    }

    if (!isJobSeeker) {
      toast.error('Only job seekers can bookmark positions.');
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await savedJobAPI.removeSavedJob(job._id);
        setIsSaved(false);
        toast.success('Removed from saved jobs.');
      } else {
        await savedJobAPI.saveJob(job._id);
        setIsSaved(true);
        toast.success('Job saved to your bookmarks!');
      }
      if (onSaveToggle) onSaveToggle(job._id, !isSaved);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bookmark.');
    } finally {
      setSaving(false);
    }
  };

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

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/80 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Top Banner & Match Indicator */}
      {matchScore && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3" /> {matchScore}% AI Match
        </div>
      )}

      <div>
        {/* Company Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
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
            <div>
              <Link
                to={`/companies/${job.company?.slug || job.company?._id}`}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors block"
              >
                {job.company?.name || 'Top Enterprise'}
              </Link>
              <Link
                to={`/jobs/${job._id}`}
                className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={saving}
            className={`p-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Save Job'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
          </button>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            {job.jobType}
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            {formatSalary()}
          </span>
          {job.workplaceType && (
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                job.workplaceType === 'Remote'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : job.workplaceType === 'Hybrid'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {job.workplaceType}
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="mt-3 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Chips */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skillsRequired.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skillsRequired.length > 4 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[11px] font-medium">
                +{job.skillsRequired.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3.5 h-3.5" /> Posted {timeAgo(job.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <Link
            to={`/jobs/${job._id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 transition-all shadow-sm"
          >
            Apply Now <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

