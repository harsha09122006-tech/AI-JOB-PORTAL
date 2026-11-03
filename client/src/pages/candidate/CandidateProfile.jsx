import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { candidateAPI, authAPI } from '../../services/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  DollarSign,
  Globe,
  Github,
  Linkedin,
  Loader2,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CandidateProfile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Profile Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [expectedSalaryMin, setExpectedSalaryMin] = useState('');
  const [expectedSalaryMax, setExpectedSalaryMax] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');

  // Modals for adding education / experience
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '' });

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [newExp, setNewExp] = useState({ company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await candidateAPI.getProfile();
      if (res.data.success) {
        const p = res.data.profile || {};
        setName(user?.name || '');
        setPhone(user?.phone || '');
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setLocation(p.location || '');
        setPreferredRole(p.preferredRole || '');
        setExpectedSalaryMin(p.expectedSalary?.min || '');
        setExpectedSalaryMax(p.expectedSalary?.max || '');
        setGithub(p.github || '');
        setLinkedin(p.linkedin || '');
        setPortfolio(p.portfolio || '');
        setSkills(p.skills || []);
        setEducation(p.education || []);
        setExperience(p.experience || []);
        setResumeUrl(p.resumeUrl || '');
        setResumeName(p.resumeName || '');
      }
    } catch (err) {
      console.error('Error fetching candidate profile:', err);
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update basic auth user info
      await authAPI.updateProfile({ name, phone });

      // 2. Update extended candidate profile
      const res = await candidateAPI.updateProfile({
        headline,
        bio,
        location,
        preferredRole,
        expectedSalary: {
          min: Number(expectedSalaryMin) || 0,
          max: Number(expectedSalaryMax) || 0,
          currency: 'USD',
        },
        github,
        linkedin,
        portfolio,
        skills,
        education,
        experience,
      });

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const trimmed = newSkillInput.trim();
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    if (!newEdu.institution || !newEdu.degree) {
      return toast.error('Institution and degree are required.');
    }
    setEducation([...education, { ...newEdu }]);
    setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '' });
    setEduModalOpen(false);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleAddExperience = () => {
    if (!newExp.company || !newExp.title) {
      return toast.error('Company and title are required.');
    }
    setExperience([...experience, { ...newExp }]);
    setNewExp({ company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' });
    setExpModalOpen(false);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await candidateAPI.uploadResume(formData);
      if (res.data.success) {
        setResumeUrl(res.data.resumeUrl);
        setResumeName(res.data.resumeName);
        if (res.data.analysis?.skills) {
          const merged = Array.from(new Set([...skills, ...res.data.analysis.skills]));
          setSkills(merged);
        }
        toast.success('Resume uploaded & analyzed by AI!');
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading candidate profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Candidate Profile</h2>
          <p className="text-xs text-slate-500">
            Keep your professional profile updated for AI job recommendations and recruiter talent searches.
          </p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save Profile Changes
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* 1. Basic Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-blue-600" /> Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs p-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Full Stack Developer | React, Node.js, Express & MongoDB"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio & Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your professional background, passions, and achievements..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* 2. Resume & Role Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-purple-600" /> Resume & Career Preferences
          </h3>

          {/* Resume Upload Box */}
          <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              {uploadingResume ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {resumeUrl ? `Uploaded: ${resumeName}` : 'Upload Your Primary Resume'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                PDF or DOCX (Max 5MB). AI extracts your skills automatically upon upload.
              </p>
            </div>
            <label className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-purple-500/20 transition-all">
              Choose File
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Job Role</label>
              <input
                type="text"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Salary Min ($)</label>
              <input
                type="number"
                value={expectedSalaryMin}
                onChange={(e) => setExpectedSalaryMin(e.target.value)}
                placeholder="e.g. 90000"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Salary Max ($)</label>
              <input
                type="number"
                value={expectedSalaryMax}
                onChange={(e) => setExpectedSalaryMax(e.target.value)}
                placeholder="e.g. 130000"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* 3. Technical Skills */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Technical Skills & Tools ({skills.length})
            </h3>
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="Add skill (e.g. React, Node.js, TypeScript, Docker)..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Skill chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-blue-500 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 4. Experience & Education Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Work Experience */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" /> Work Experience
              </h3>
              <button
                type="button"
                onClick={() => setExpModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            </div>

            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No experience listed.</p>
            ) : (
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 relative group">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-xs font-bold text-slate-800">{exp.title}</p>
                    <p className="text-[11px] font-semibold text-blue-600">{exp.company}</p>
                    {exp.description && <p className="text-[11px] text-slate-500 mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" /> Education
              </h3>
              <button
                type="button"
                onClick={() => setEduModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Degree
              </button>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No education listed.</p>
            ) : (
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 relative group">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-xs font-bold text-slate-800">{edu.degree}</p>
                    <p className="text-[11px] font-semibold text-purple-600">{edu.institution}</p>
                    {edu.grade && <p className="text-[11px] text-slate-500">Grade: {edu.grade}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Web & Social Presence */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-slate-600" /> Online Profiles & Portfolio
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Github className="w-3.5 h-3.5" /> GitHub Profile
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Profile
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-600" /> Portfolio Website
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Add Education Modal */}
      {eduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">Add Education Entry</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Institution *
                </label>
                <input
                  type="text"
                  value={newEdu.institution}
                  onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Degree *</label>
                <input
                  type="text"
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                  placeholder="e.g. Bachelor of Science in Computer Science"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Start Year
                  </label>
                  <input
                    type="number"
                    value={newEdu.startYear}
                    onChange={(e) => setNewEdu({ ...newEdu, startYear: e.target.value })}
                    placeholder="2018"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    End Year
                  </label>
                  <input
                    type="number"
                    value={newEdu.endYear}
                    onChange={(e) => setNewEdu({ ...newEdu, endYear: e.target.value })}
                    placeholder="2022"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEduModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Save Education
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">Add Work Experience</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Company *</label>
                <input
                  type="text"
                  value={newExp.company}
                  onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                  placeholder="e.g. Acme Tech Labs"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Job Title *</label>
                <input
                  type="text"
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  placeholder="e.g. Software Engineer"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Description / Key Achievements
                </label>
                <textarea
                  rows={3}
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  placeholder="Built microservices, optimized queries..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setExpModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Save Experience
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfile;

