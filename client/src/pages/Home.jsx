import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  Briefcase,
  Building2,
  TrendingUp,
  ShieldCheck,
  Bot,
  FileCheck2,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { jobAPI, companyAPI } from '../services/api';
import JobCard from '../components/jobs/JobCard';
import { JobCardSkeleton } from '../components/common/LoadingSkeleton';

export const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, catRes, compRes] = await Promise.all([
          jobAPI.getFeaturedJobs(),
          jobAPI.getCategories(),
          companyAPI.getCompanies({ limit: 4 }),
        ]);

        if (jobsRes.data.success) setFeaturedJobs(jobsRes.data.jobs || []);
        if (catRes.data.success) setCategories(catRes.data.categories || []);
        if (compRes.data.success) setTopCompanies(compRes.data.companies || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (locationTerm.trim()) params.append('location', locationTerm.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/20 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-purple-500/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI-Driven Career Matching & Resume Intelligence Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Connecting Ambitious Talent with <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Future-Defining Careers
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Automate your job search with deep resume parsing, dynamic ATS scoring, real-time Gemini AI interview coaching, and instant compatibility matching.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-3xl mx-auto bg-white/95 backdrop-blur-lg p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2.5 text-slate-800"
          >
            <div className="flex items-center gap-3 px-3.5 py-2.5 w-full sm:flex-1 border-b sm:border-b-0 sm:border-r border-slate-200">
              <Search className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title, tech skills (e.g. React, MERN), or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 px-3.5 py-2.5 w-full sm:w-60">
              <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="City, State, or Remote..."
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              Search Jobs
            </button>
          </form>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-white">5,000+</p>
              <p className="text-xs text-slate-300">Live Opportunities</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-purple-400">94.8%</p>
              <p className="text-xs text-slate-300">ATS Match Precision</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-blue-400">1,200+</p>
              <p className="text-xs text-slate-300">Vetted Tech Companies</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-emerald-400">24/7</p>
              <p className="text-xs text-slate-300">AI Career Assistant</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Explore by Industry</h2>
            <p className="text-sm text-slate-500 mt-1">Discover roles tailored across leading tech specializations</p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            All Categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(categories.length > 0 ? categories : [
            { name: 'Software & Technology', count: 24 },
            { name: 'Artificial Intelligence & Cloud', count: 18 },
            { name: 'Financial Technology', count: 12 },
            { name: 'Full-Stack Development', count: 16 },
            { name: 'Cybersecurity & Infrastructure', count: 9 },
            { name: 'Data Engineering & Analytics', count: 14 },
            { name: 'Product Management & UI/UX', count: 11 },
            { name: 'Healthcare & Biotech', count: 8 },
          ]).map((cat, idx) => (
            <Link
              key={idx}
              to={`/jobs?industry=${encodeURIComponent(cat.name)}`}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all group flex items-start justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors mb-3">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{cat.count} openings</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED JOBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> High-Priority Positions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Job Openings</h2>
            <p className="text-sm text-slate-500 mt-1">Directly vetted positions from verified recruiting partners</p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            Explore All Jobs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* 4. AI CAPABILITIES SHOWCASE */}
      <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Next-Generation Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Engineered with Real AI at Every Touchpoint
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Experience the power of Google Gemini LLM combined with deterministic semantic NLP pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-purple-500/60 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Resume Analyzer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload PDF or DOCX resumes. Automatically extract technical competencies, check ATS formatting, and receive actionable 100-point scoring.
              </p>
              <Link
                to="/candidate/resume-analyzer"
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Scan Resume <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/60 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Resume-Job Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare your credentials against any job posting. Instantly uncover matching skills, missing keywords, and tailored interview advice.
              </p>
              <Link
                to="/jobs"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Try Matcher <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/60 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Career Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive AI mentor generates tailored interview questions, STAR-method answers, salary negotiation tactics, and career roadmaps.
              </p>
              <Link
                to="/candidate/career-assistant"
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Start Chatting <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/60 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Smart Recommendations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our recommendation algorithms continuously align your profile skills and preferences with fresh openings for maximum interview conversion.
              </p>
              <Link
                to="/candidate/dashboard"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View Matches <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOP COMPANIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Employers</h2>
          <p className="text-sm text-slate-500 mt-1">Leading innovators actively recruiting through AI Career Connect</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topCompanies.map((company) => (
            <Link
              key={company._id}
              to={`/companies/${company.slug || company._id}`}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all group flex items-start gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {company.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{company.industry}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {company.location}
                  </span>
                  <span>•</span>
                  <span>{company.companySize} employees</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Accelerate Your Career or Hiring?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Join thousands of engineers and hiring teams leveraging AI-driven matching to land dream roles and assemble stellar teams.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-blue-200">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Free Candidate Registration
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Instant Resume Parsing
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Verified Recruiters
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            <Link
              to="/register?role=jobseeker"
              className="px-6 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-lg transition-all text-center w-full sm:w-auto"
            >
              Sign Up as Candidate
            </Link>
            <Link
              to="/register?role=recruiter"
              className="px-6 py-3.5 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white border border-white/20 font-bold text-sm backdrop-blur-md transition-all text-center w-full sm:w-auto"
            >
              Hire Top Talent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

