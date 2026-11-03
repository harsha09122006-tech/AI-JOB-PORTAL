import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Sparkles, Heart, Shield, Cpu, Database } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                AI Career <span className="text-blue-400">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Bridging premier talent and visionary recruiters through real-time AI resume intelligence, automated compatibility scoring, and interactive career coaching.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Full-Stack MERN
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> MongoDB Atlas
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> JWT HttpOnly
              </span>
            </div>
          </div>

          {/* Job Seekers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Explore Jobs
                </Link>
              </li>
              <li>
                <Link to="/candidate/resume-analyzer" className="hover:text-white transition-colors flex items-center gap-1">
                  Resume Analyzer <Sparkles className="w-3 h-3 text-purple-400" />
                </Link>
              </li>
              <li>
                <Link to="/candidate/career-assistant" className="hover:text-white transition-colors">
                  AI Career Coach
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition-colors">
                  Browse Companies
                </Link>
              </li>
            </ul>
          </div>

          {/* Recruiters */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">For Recruiters</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/recruiter/post-job" className="hover:text-white transition-colors">
                  Post a Vacancy
                </Link>
              </li>
              <li>
                <Link to="/recruiter/applicants" className="hover:text-white transition-colors">
                  Talent Pipeline
                </Link>
              </li>
              <li>
                <Link to="/recruiter/analytics" className="hover:text-white transition-colors">
                  Recruitment Analytics
                </Link>
              </li>
              <li>
                <Link to="/register?role=recruiter" className="hover:text-white transition-colors">
                  Recruiter Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Academic */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Project
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <span className="text-slate-500">MERN Academic Project</span>
              </li>
              <li>
                <span className="text-slate-500">Gemini LLM Integration</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AI Career Connect. All rights reserved. MERN Stack Academic Project.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Next-Gen Career Discovery.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

