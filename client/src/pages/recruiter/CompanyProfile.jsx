import React, { useState, useEffect } from 'react';
import { recruiterAPI, companyAPI } from '../../services/api';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  CheckCircle2,
  Upload,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Software & Technology');
  const [companySize, setCompanySize] = useState('11-50');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Recruiter fields
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await recruiterAPI.getProfile();
      if (res.data.success) {
        setProfile(res.data.profile);
        const comp = res.data.profile?.company;
        setCompany(comp);

        setDesignation(res.data.profile?.designation || '');
        setDepartment(res.data.profile?.department || '');

        if (comp) {
          setName(comp.name || '');
          setWebsite(comp.website || '');
          setIndustry(comp.industry || 'Software & Technology');
          setCompanySize(comp.companySize || '11-50');
          setLocation(comp.location || '');
          setDescription(comp.description || '');
          setFoundedYear(comp.foundedYear || '');
          setLogoUrl(comp.logo || '');
        }
      }
    } catch (err) {
      console.error('Error fetching recruiter company:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !industry || !location) {
      return toast.error('Company name, industry, and location are required.');
    }

    setSaving(true);
    try {
      // 1. Update recruiter profile
      await recruiterAPI.updateProfile({ designation, department });

      // 2. Create or update company
      if (company?._id) {
        await companyAPI.updateCompany(company._id, {
          name,
          website,
          industry,
          companySize,
          location,
          description,
          foundedYear,
        });
      } else {
        const createRes = await companyAPI.createCompany({
          name,
          website,
          industry,
          companySize,
          location,
          description,
          foundedYear,
        });
        if (createRes.data.success) {
          setCompany(createRes.data.company);
        }
      }

      toast.success('Company and recruiter profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !company?._id) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await companyAPI.uploadLogo(company._id, formData);
      if (res.data.success) {
        setLogoUrl(res.data.logoUrl);
        toast.success('Company logo uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading company details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Company & Recruiter Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Provide complete branding so job seekers recognize and trust your job postings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Company Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Employer Information
            </h3>
            {company?.verified && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Employer
              </span>
            )}
          </div>

          {/* Logo Section */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">Company Brand Logo</p>
              <p className="text-[11px] text-slate-400">PNG, JPG, or SVG up to 2MB</p>
              {company?._id && (
                <label className="inline-block mt-1 px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Tech Corporation"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry *</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Software & Technology">Software & Technology</option>
                <option value="Artificial Intelligence & Cloud">Artificial Intelligence & Cloud</option>
                <option value="Financial Technology">Financial Technology</option>
                <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Education Technology">Education Technology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">HQ / Office Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Founded Year</label>
              <input
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="e.g. 2020"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Overview</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell candidates about your company mission, culture, and core engineering problems..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Recruiter Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            Recruiter Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Role / Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Head of Talent Acquisition"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Human Resources"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save Company Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;

