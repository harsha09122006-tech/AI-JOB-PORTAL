import path from 'path';
import fs from 'fs';
import CandidateProfile from '../models/CandidateProfile.js';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Application from '../models/Application.js';
import { extractTextFromFile } from '../services/pdfService.js';
import { analyzeResume } from '../services/aiService.js';

// @desc    Get candidate profile of currently logged in user
// @route   GET /api/candidates/profile
// @access  Private (Job Seeker)
export const getMyCandidateProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');

    if (!profile) {
      profile = await CandidateProfile.create({
        user: req.user._id,
      });
      profile = await profile.populate('user', 'name email phone avatar');
    }

    const latestResume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      profile,
      latestResume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate profile
// @route   PUT /api/candidates/profile
// @access  Private (Job Seeker)
export const updateCandidateProfile = async (req, res, next) => {
  try {
    const {
      headline,
      bio,
      location,
      skills,
      education,
      experience,
      expectedSalary,
      preferredRole,
      github,
      linkedin,
      portfolio,
    } = req.body;

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (education !== undefined) profile.education = education;
    if (experience !== undefined) profile.experience = experience;
    if (expectedSalary !== undefined) profile.expectedSalary = expectedSalary;
    if (preferredRole !== undefined) profile.preferredRole = preferredRole;
    if (github !== undefined) profile.github = github;
    if (linkedin !== undefined) profile.linkedin = linkedin;
    if (portfolio !== undefined) profile.portfolio = portfolio;

    profile.calculateCompletion();
    await profile.save();

    const populated = await CandidateProfile.findById(profile._id).populate('user', 'name email phone avatar');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      profile: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload candidate resume and perform automatic AI extraction
// @route   POST /api/candidates/resume
// @access  Private (Job Seeker)
export const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a resume file to upload.' });
    }

    const file = req.file;
    const fileUrl = `/uploads/resumes/${file.filename}`;

    // Extract text from uploaded document
    const extractedText = await extractTextFromFile(file.path, file.mimetype);

    // Run AI analysis
    const aiAnalysis = await analyzeResume(extractedText);

    // Save resume record in DB
    const resumeRecord = await Resume.create({
      user: req.user._id,
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      parsedText: extractedText.slice(0, 10000),
      extractedSkills: aiAnalysis.skills || [],
      softSkills: aiAnalysis.softSkills || [],
      extractedEducation: aiAnalysis.education || [],
      extractedExperience: aiAnalysis.experience || [],
      yearsOfExperience: aiAnalysis.yearsOfExperience || 0,
      currentRole: aiAnalysis.currentRole || '',
      preferredRoles: aiAnalysis.preferredRoles || [],
      projects: aiAnalysis.projects || [],
      certifications: aiAnalysis.certifications || [],
      qualityScore: aiAnalysis.qualityScore || 0,
      suggestions: aiAnalysis.suggestions || [],
      missingSkills: aiAnalysis.missingSkills || [],
      analysisSummary: aiAnalysis.analysisSummary || '',
    });

    // Update candidate profile with new resume and extracted skills
    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    profile.resumeUrl = fileUrl;
    profile.resumeName = file.originalname;

    if (aiAnalysis.skills && aiAnalysis.skills.length > 0) {
      const merged = Array.from(new Set([...(profile.skills || []), ...aiAnalysis.skills]));
      profile.skills = merged;
    }
    if (!profile.preferredRole && aiAnalysis.currentRole) {
      profile.preferredRole = aiAnalysis.currentRole;
    }

    profile.calculateCompletion();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully!',
      resumeUrl: fileUrl,
      resumeName: file.originalname,
      resumeRecord,
      analysis: aiAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List candidate profiles (Recruiter/Admin talent search)
// @route   GET /api/candidates
// @access  Private (Recruiter, Admin)
export const getCandidates = async (req, res, next) => {
  try {
    const { skills, location, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let profiles = await CandidateProfile.find(query)
      .populate('user', 'name email phone avatar isBlocked')
      .skip(skip)
      .limit(limitNum);

    if (search && search.trim()) {
      const term = search.toLowerCase();
      profiles = profiles.filter((p) => {
        const name = p.user?.name?.toLowerCase() || '';
        const headline = p.headline?.toLowerCase() || '';
        return name.includes(term) || headline.includes(term);
      });
    }

    const total = await CandidateProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      count: profiles.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      profiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate profile by ID
// @route   GET /api/candidates/:id
// @access  Private (Recruiter, Admin)
export const getCandidateById = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findById(req.params.id).populate('user', 'name email phone avatar');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found.' });
    }

    const latestResume = await Resume.findOne({ user: profile.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      profile,
      latestResume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Secure download authorized resume
// @route   GET /api/candidates/resume/download/:filename
// @access  Private (Owner, Recruiter who received application, Admin)
export const downloadResumeFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'server', 'uploads', 'resumes', safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found on server.' });
    }

    // Security check: verify who is downloading
    const resumeDoc = await Resume.findOne({ fileName: safeFilename });
    if (resumeDoc) {
      const isOwner = resumeDoc.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      let isRecruiterOfCandidate = false;
      if (req.user.role === 'recruiter') {
        const app = await Application.findOne({
          candidate: resumeDoc.user,
          recruiter: req.user._id,
        });
        if (app) isRecruiterOfCandidate = true;
      }

      if (!isOwner && !isAdmin && !isRecruiterOfCandidate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to download this resume.',
        });
      }
    }

    res.download(filePath, resumeDoc?.originalName || safeFilename);
  } catch (error) {
    next(error);
  }
};

