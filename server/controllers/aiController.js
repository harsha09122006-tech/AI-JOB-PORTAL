import Job from '../models/Job.js';
import CandidateProfile from '../models/CandidateProfile.js';
import Resume from '../models/Resume.js';
import { extractTextFromFile } from '../services/pdfService.js';
import {
  analyzeResume,
  matchResumeWithJob,
  recommendJobsForCandidate,
  chatCareerAssistant,
} from '../services/aiService.js';

// @desc    Analyze uploaded resume file (PDF/DOCX/TXT) or text
// @route   POST /api/ai/resume-analysis
// @access  Public / Private
export const analyzeResumeEndpoint = async (req, res, next) => {
  try {
    let resumeText = '';

    // If file uploaded via Multer
    if (req.file) {
      resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else if (req.user) {
      // Fallback to user's saved resume if logged in
      const resumeDoc = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (resumeDoc) {
        resumeText = resumeDoc.parsedText;
      }
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid resume file (PDF, DOCX, or TXT) or paste resume text content.',
      });
    }

    const analysis = await analyzeResume(resumeText);

    // If user is logged in, store / update comprehensive analysis in Resume record
    if (req.user) {
      const resumeUpdateData = {
        originalName: req.file?.originalname || 'Text Resume',
        fileName: req.file?.filename || 'text-resume.txt',
        filePath: req.file?.path || '',
        fileSize: req.file?.size || resumeText.length,
        mimeType: req.file?.mimetype || 'text/plain',
        parsedText: resumeText.slice(0, 10000),
        extractedSkills: analysis.skills || [],
        softSkills: analysis.softSkills || [],
        extractedEducation: analysis.education || [],
        extractedExperience: analysis.experience || [],
        yearsOfExperience: analysis.yearsOfExperience || 0,
        currentRole: analysis.currentRole || '',
        preferredRoles: analysis.preferredRoles || [],
        projects: analysis.projects || [],
        certifications: analysis.certifications || [],
        qualityScore: analysis.qualityScore || 0,
        suggestions: analysis.suggestions || [],
        missingSkills: analysis.missingSkills || [],
        analysisSummary: analysis.analysisSummary || '',
      };

      await Resume.findOneAndUpdate(
        { user: req.user._id },
        resumeUpdateData,
        { upsert: true, new: true }
      );

      // Also sync candidate profile
      let profile = await CandidateProfile.findOne({ user: req.user._id });
      if (!profile) {
        profile = new CandidateProfile({ user: req.user._id });
      }

      if (req.file) {
        profile.resumeUrl = `/uploads/resumes/${req.file.filename}`;
        profile.resumeName = req.file.originalname;
      }

      if (analysis.skills && analysis.skills.length > 0) {
        const mergedSkills = Array.from(new Set([...(profile.skills || []), ...analysis.skills]));
        profile.skills = mergedSkills;
      }

      if (!profile.preferredRole && analysis.currentRole) {
        profile.preferredRole = analysis.currentRole;
      }

      profile.calculateCompletion();
      await profile.save();
    }

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Match candidate resume/skills against a job description
// @route   POST /api/ai/job-match
// @access  Public / Private
export const matchJobEndpoint = async (req, res, next) => {
  try {
    const { jobId, resumeText, candidateSkills = [] } = req.body;

    let targetJob = null;
    if (jobId) {
      targetJob = await Job.findById(jobId).populate('company');
    }

    if (!targetJob && (!req.body.jobTitle || !req.body.jobDescription)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a valid jobId or jobTitle and jobDescription.',
      });
    }

    const jobData = targetJob || {
      title: req.body.jobTitle,
      description: req.body.jobDescription,
      skillsRequired: req.body.skillsRequired || [],
      experienceLevel: req.body.experienceLevel || 'Mid-level',
      category: req.body.category || 'Technology',
    };

    let userResumeText = resumeText || '';
    let userSkills = candidateSkills;

    if (req.user) {
      const profile = await CandidateProfile.findOne({ user: req.user._id });
      if (profile) {
        userSkills = Array.from(new Set([...userSkills, ...(profile.skills || [])]));
      }
      if (!userResumeText) {
        const resumeDoc = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
        if (resumeDoc) {
          userResumeText = resumeDoc.parsedText;
          if (resumeDoc.extractedSkills && resumeDoc.extractedSkills.length > 0) {
            userSkills = Array.from(new Set([...userSkills, ...resumeDoc.extractedSkills]));
          }
        }
      }
    }

    const matchResult = await matchResumeWithJob(userResumeText, userSkills, jobData);

    res.status(200).json({
      success: true,
      job: targetJob,
      match: matchResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI job recommendations tailored to candidate profile with multi-factor scoring & filtering
// @route   GET /api/ai/recommendations
// @access  Private (Job Seeker)
export const getRecommendationsEndpoint = async (req, res, next) => {
  try {
    const { location, jobType, experienceLevel, workplaceType } = req.query;

    const [profile, latestResume] = await Promise.all([
      CandidateProfile.findOne({ user: req.user._id }),
      Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 }),
    ]);

    // Active, approved job postings from MongoDB
    const availableJobs = await Job.find({ status: 'active', approvalStatus: 'approved' })
      .populate('company', 'name logo slug industry location')
      .sort({ createdAt: -1 })
      .limit(60);

    const { recommendations, emptyGuidance } = await recommendJobsForCandidate(
      profile,
      latestResume,
      availableJobs,
      { location, jobType, experienceLevel, workplaceType }
    );

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
      emptyGuidance,
      activeFilters: {
        location: location || '',
        jobType: jobType || 'all',
        experienceLevel: experienceLevel || 'all',
        workplaceType: workplaceType || 'all',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Career Assistant chat
// @route   POST /api/ai/career-assistant
// @access  Public / Private
export const careerAssistantEndpoint = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    let candidateContext = {};
    if (req.user) {
      const [profile, latestResume] = await Promise.all([
        CandidateProfile.findOne({ user: req.user._id }),
        Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 }),
      ]);

      if (profile || latestResume) {
        candidateContext = {
          skills: Array.from(new Set([...(profile?.skills || []), ...(latestResume?.extractedSkills || [])])),
          preferredRole: profile?.preferredRole || latestResume?.currentRole || '',
          experienceCount: profile?.experience?.length || latestResume?.yearsOfExperience || 0,
        };
      }
    }

    const response = await chatCareerAssistant(message, history, candidateContext);

    res.status(200).json({
      success: true,
      reply: response.reply,
      isAiConfigured: response.isAiConfigured,
      aiNotice: response.aiNotice || null,
    });
  } catch (error) {
    next(error);
  }
};
