import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../services/api';
import {
  Building2,
  MapPin,
  Users,
  Search,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, [industryFilter]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (industryFilter) params.industry = industryFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await companyAPI.getCompanies(params);
      if (res.data.success) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Employer Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Top Tech Companies Hiring Now
          </h1>
          <p className="text-sm text-slate-300">
            Learn about corporate missions, technical cultures, and explore active engineering vacancies.
          </p>
        </div>

        {/* Search */}
        <div className="mt-6 bg-white p-2 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-2 text-slate-800 max-w-xl">
          <div className="flex items-center gap-2.5 px-3 py-2 w-full flex-1">
            <Search className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCompanies()}
              className="w-full text-xs sm:text-sm focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>
          <button
            onClick={fetchCompanies}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Search
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Companies Found"
          description="We couldn't find any employers matching your search query."
          actionText="Clear Search"
          onAction={() => {
            setSearchTerm('');
            setIndustryFilter('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp) => (
            <div
              key={comp._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {comp.logo ? (
                      <img src={comp.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  {comp.verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <Link
                    to={`/companies/${comp.slug || comp._id}`}
                    className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors"
                  >
                    {comp.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{comp.industry}</p>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {comp.description || 'Pioneering technology company empowering engineers worldwide.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {comp.location}
                  </span>
                  <span>•</span>
                  <span>{comp.companySize} employees</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/companies/${comp.slug || comp._id}`}
                  className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  View Profile & Jobs →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;

