import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { jobAPI } from '../services/api';
import JobCard from '../components/jobs/JobCard';
import { JobCardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];
const WORKPLACE_TYPES = ['Remote', 'Hybrid', 'On-site'];
const EXPERIENCE_LEVELS = ['Entry-level', 'Mid-level', 'Senior-level', 'Director/Executive'];
const DATE_POSTED_OPTIONS = [
  { label: 'Anytime', value: '' },
  { label: 'Past 24 Hours', value: 'today' },
  { label: 'Past Week', value: 'past_week' },
  { label: 'Past Month', value: 'past_month' },
];

export const JobListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedJobTypes, setSelectedJobTypes] = useState(
    searchParams.get('jobType') ? searchParams.get('jobType').split(',') : []
  );
  const [selectedWorkplaces, setSelectedWorkplaces] = useState(
    searchParams.get('workplaceType') ? searchParams.get('workplaceType').split(',') : []
  );
  const [selectedExperience, setSelectedExperience] = useState(
    searchParams.get('experienceLevel') ? searchParams.get('experienceLevel').split(',') : []
  );
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');
  const [datePosted, setDatePosted] = useState(searchParams.get('datePosted') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Data state
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Sync state to URL and fetch
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        sort,
      };

      if (search) params.search = search;
      if (location) params.location = location;
      if (selectedJobTypes.length > 0) params.jobType = selectedJobTypes.join(',');
      if (selectedWorkplaces.length > 0) params.workplaceType = selectedWorkplaces.join(',');
      if (selectedExperience.length > 0) params.experienceLevel = selectedExperience.join(',');
      if (industry) params.industry = industry;
      if (datePosted) params.datePosted = datePosted;

      const res = await jobAPI.getJobs(params);
      if (res.data.success) {
        setJobs(res.data.jobs || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, sort, selectedJobTypes, selectedWorkplaces, selectedExperience, industry, datePosted]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setSelectedJobTypes([]);
    setSelectedWorkplaces([]);
    setSelectedExperience([]);
    setIndustry('');
    setDatePosted('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  const toggleArrayItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Real-Time Job Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Discover Your Next Tech Venture
          </h1>
          <p className="text-sm text-slate-300">
            Browse verified career postings with automated ATS skill matching and instant application workflows.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 bg-white p-2 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-2 text-slate-800"
        >
          <div className="flex items-center gap-2.5 px-3 py-2 w-full sm:flex-1 border-b sm:border-b-0 sm:border-r border-slate-200">
            <Search className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by job title, skill, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 w-full sm:w-60">
            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Location or Remote..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            Find Jobs
          </button>
        </form>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* DESKTOP FILTERS SIDEBAR */}
        <aside className="hidden lg:block w-72 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 flex-shrink-0 shadow-sm sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filter Jobs
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Job Types */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Type</h4>
            <div className="space-y-1.5">
              {JOB_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJobTypes.includes(type)}
                    onChange={() => toggleArrayItem(selectedJobTypes, setSelectedJobTypes, type)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Workplace Type */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Workplace</h4>
            <div className="space-y-1.5">
              {WORKPLACE_TYPES.map((wp) => (
                <label key={wp} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedWorkplaces.includes(wp)}
                    onChange={() => toggleArrayItem(selectedWorkplaces, setSelectedWorkplaces, wp)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>{wp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Experience Level</h4>
            <div className="space-y-1.5">
              {EXPERIENCE_LEVELS.map((exp) => (
                <label key={exp} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedExperience.includes(exp)}
                    onChange={() => toggleArrayItem(selectedExperience, setSelectedExperience, exp)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>{exp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Posted */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Date Posted</h4>
            <select
              value={datePosted}
              onChange={(e) => {
                setDatePosted(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-500"
            >
              {DATE_POSTED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* RESULTS CONTENT */}
        <div className="flex-1 w-full space-y-6">
          {/* Top Control Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Showing <span className="font-bold text-blue-600">{jobs.length}</span> of{' '}
                <span className="font-bold text-slate-900">{totalCount}</span> available positions
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                <Filter className="w-4 h-4" /> Filters
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="salary_high">Salary: High to Low</option>
                  <option value="salary_low">Salary: Low to High</option>
                  <option value="applications">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No matching job listings"
              description="We couldn't find any opportunities matching your active search and filter combinations."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;

