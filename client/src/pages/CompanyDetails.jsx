import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { companyAPI } from '../services/api';
import {
  Building2,
  MapPin,
  Globe,
  Calendar,
  Users,
  CheckCircle2,
  Briefcase,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await companyAPI.getCompanyById(id);
      if (res.data.success) {
        setCompany(res.data.company);
        setActiveJobs(res.data.activeJobs || []);
      }
    } catch (err) {
      console.error('Error fetching company details:', err);
      toast.error('Failed to load company details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading company profile...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Company Not Found</h2>
        <Link to="/companies" className="mt-4 inline-block text-blue-600 text-sm font-semibold">
          Return to Company Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </Link>
      </div>

      {/* Header Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {company.logo ? (
                <img src={company.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{company.name}</h1>
                {company.verified && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" title="Verified Employer" />
                )}
              </div>
              <p className="text-sm font-semibold text-blue-600">{company.industry}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {company.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {company.companySize} employees
                </span>
                {company.foundedYear && (
                  <>
                    <span>•</span>
                    <span>Founded {company.foundedYear}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-4 h-4" /> Company Website ↗
            </a>
          )}
        </div>

        {/* Company Description */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h3 className="text-sm font-bold text-slate-800">About {company.name}</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {company.description || 'Pioneering technology enterprise hiring top software talent.'}
          </p>
        </div>
      </div>

      {/* Open Positions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" /> Active Job Openings ({activeJobs.length})
          </h3>
        </div>

        {activeJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Active Job Listings"
            description={`${company.name} does not have any publicly listed job vacancies at this moment.`}
            actionText="Browse Other Positions"
            actionLink="/jobs"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeJobs.map((job) => (
              <JobCard key={job._id} job={{ ...job, company }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;

