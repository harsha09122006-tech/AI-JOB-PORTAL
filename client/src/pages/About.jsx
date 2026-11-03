import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  Bot,
  ShieldCheck,
  Cpu,
  Database,
  Code2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const About = () => {
  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Academic Full-Stack Project</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          AI Career <span className="text-blue-600">Connect</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          A modern full-stack MERN job portal engineered to revolutionize recruitment matching using artificial intelligence, automated resume parsing, and interactive candidate coaching.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Modern Frontend</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Engineered with React 18, Vite, Tailwind CSS, Lucide icons, and Recharts. Features reactive state, responsive mobile drawers, and zero layout shift.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Secure Backend APIs</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            RESTful micro-architecture in Node.js and Express. Features JWT in HttpOnly secure cookies, bcrypt password hashing, Multer file sanitization, and Helmet protection.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Real AI Integration</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Direct backend connectivity with Google Gemini LLMs and high-precision semantic NLP pipelines for ATS score calculation, resume text extraction, and interview coaching.
          </p>
        </div>
      </div>

      {/* Core Objectives & Roles */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
          Three Dedicated Role Portals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-600">
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-blue-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 1. Job Seeker
            </h4>
            <p>
              Candidates can register, build detailed profiles, upload resumes, receive ATS quality scores, view personalized AI job recommendations, and track real-time hiring stage updates.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-purple-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 2. Recruiter / Employer
            </h4>
            <p>
              Recruiters manage company branding, post job vacancies, review applicants, inspect AI candidate match percentages, download verified resumes, and advance candidates through pipeline stages.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 3. Administrator
            </h4>
            <p>
              Administrative controls allow moderation of all user accounts, approval and rejection of employer listings, inspection of system-wide analytics, and resolution of user reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

