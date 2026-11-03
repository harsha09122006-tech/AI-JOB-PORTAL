import React, { useState, useEffect } from 'react';
import { savedJobAPI } from '../../services/api';
import JobCard from '../../components/jobs/JobCard';
import { JobCardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { BookmarkCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await savedJobAPI.getSavedJobs();
      if (res.data.success) {
        setSavedJobs(res.data.savedJobs || []);
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      toast.error('Failed to load saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (jobId) => {
    setSavedJobs(savedJobs.filter((item) => (item.job?._id || item.job) !== jobId));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Saved Opportunities</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Positions you've bookmarked to review or apply for later.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={BookmarkCheck}
          title="No Saved Jobs"
          description="You haven't bookmarked any jobs yet. When you browse listings, click the bookmark icon to save them here."
          actionText="Browse Job Listings"
          actionLink="/jobs"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((item) => {
            const jobData = { ...item.job, isSaved: true };
            return (
              <JobCard
                key={item._id}
                job={jobData}
                onSaveToggle={(jobId, isSaved) => {
                  if (!isSaved) handleRemove(jobId);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;

