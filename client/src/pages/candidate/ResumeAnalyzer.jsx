import React, { useState } from 'react';
import { aiAPI } from '../../services/api';
import {
  Sparkles,
  Upload,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Loader2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!file && !resumeText.trim()) {
      return toast.error('Please upload a resume document or paste resume text.');
    }

    setAnalyzing(true);
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        res = await aiAPI.analyzeResume(formData);
      } else {
        res = await aiAPI.analyzeResume({ resumeText });
      }

      if (res.data.success) {
        setAnalysisResult(res.data.analysis);
        toast.success('Resume analyzed successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  const score = analysisResult?.qualityScore || 0;
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 60) return 'text-blue-500 stroke-blue-500';
    if (score >= 40) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI ATS Screener & Quality Evaluator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">AI Resume Analyzer</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Scan your resume for ATS compatibility, keyword density, structure, and missing industry skills.
          </p>
        </div>
      </div>

      {/* Upload & Input Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload Zone */}
            <div className="p-6 border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl bg-slate-50/70 text-center space-y-3 transition-colors flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {file ? file.name : 'Upload PDF or DOCX Resume'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Drag and drop or browse from disk (Max 5MB)'}
                </p>
              </div>
              <label className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-purple-500/20 transition-all">
                Browse File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Paste Text Fallback */}
            <div className="space-y-2 flex flex-col">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Paste Resume Text Content
              </label>
              <textarea
                rows={6}
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setFile(null);
                }}
                placeholder="Paste the raw text of your resume here if you don't have a document handy..."
                className="w-full flex-1 text-xs p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600" /> Powered by Gemini LLM & Semantic NLP
            </span>
            <button
              type="submit"
              disabled={analyzing}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run AI Analysis
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* AI Engine Status Notice */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-purple-900">
                {analysisResult.isAiConfigured
                  ? 'Real-Time Gemini AI Generative Insights'
                  : 'Processed by Built-In Semantic NLP Engine'}
              </p>
              <p className="text-purple-700 mt-0.5">
                {analysisResult.aiNotice ||
                  'Deep analysis completed with extracted skills, ATS structure scores, and tailored feedback.'}
              </p>
            </div>
          </div>

          {/* Top Score & Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Radial Score Gauge */}
            <div className="text-center md:border-r border-slate-100 md:pr-6 space-y-2">
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={getScoreColor()}
                    strokeDasharray={`${score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900">{score}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">out of 100</span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-800">Overall ATS Score</h4>
            </div>

            {/* Summary */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-base font-bold text-slate-900">Executive ATS Summary</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {analysisResult.analysisSummary ||
                  'Your resume shows solid structural clarity. Incorporating recommended keywords and quantifiable metric highlights will significantly raise recruiter screening conversion.'}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                  ✓ {analysisResult.skills?.length || 0} Technical Skills
                </span>
                <span className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold">
                  ✓ {analysisResult.softSkills?.length || 0} Soft Skills
                </span>
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">
                  ✓ {analysisResult.yearsOfExperience || 0} Yrs Experience
                </span>
                {analysisResult.currentRole && (
                  <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold">
                    Role: {analysisResult.currentRole}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grid: Technical Skills & Soft Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Extracted Technical Skills */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Extracted Technical Skills ({analysisResult.skills?.length || 0})
              </h3>
              {analysisResult.skills && analysisResult.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No skills identified in sample text.</p>
              )}
            </div>

            {/* Extracted Soft Skills */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-4 h-4 text-purple-600" /> Soft Skills & Interpersonal Strengths
              </h3>
              {analysisResult.softSkills && analysisResult.softSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.softSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold"
                    >
                      ★ {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No explicit soft skills detected.</p>
              )}
            </div>
          </div>

          {/* Grid: Extracted Education, Projects & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Education & Qualifications */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                🎓 Education & Qualifications
              </h3>
              <div className="space-y-1.5">
                {analysisResult.education && analysisResult.education.length > 0 ? (
                  analysisResult.education.map((edu, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-700">
                      {edu}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Standard computer science degree inferred.</p>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                💼 Projects & Highlights
              </h3>
              <div className="space-y-1.5">
                {analysisResult.projects && analysisResult.projects.length > 0 ? (
                  analysisResult.projects.map((proj, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-700">
                      • {proj}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Hands-on software projects detected.</p>
                )}
              </div>
            </div>

            {/* Certifications & Target Roles */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                🏆 Certifications & Target Roles
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target Roles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(analysisResult.preferredRoles || [analysisResult.currentRole]).filter(Boolean).map((r, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                {analysisResult.certifications && analysisResult.certifications.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Certifications:</span>
                    <div className="space-y-1 mt-1">
                      {analysisResult.certifications.map((c, idx) => (
                        <div key={idx} className="text-xs font-medium text-slate-700">
                          ✓ {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Missing Skills & Actionable Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Suggested Missing Skills */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> High-Demand Missing Skills
              </h3>
              {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.missingSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold"
                    >
                      + {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">All core standard skills matched!</p>
              )}
            </div>

            {/* Actionable Improvement Suggestions */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" /> Actionable ATS Suggestions
              </h3>
              <div className="space-y-2">
                {analysisResult.suggestions?.map((sug, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick CTA to Dashboard Recommendations */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <h4 className="text-base font-bold">Discover AI Jobs Matched to Your Resume</h4>
              <p className="text-xs text-slate-300">
                Your extracted skills and qualifications have been synchronized. Check your top 10 recommended openings.
              </p>
            </div>
            <a
              href="/candidate/dashboard"
              className="px-6 py-2.5 rounded-2xl bg-white text-blue-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-md flex-shrink-0"
            >
              Go to Candidate Dashboard →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;

