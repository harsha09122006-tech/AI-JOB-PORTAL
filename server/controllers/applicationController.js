import Application from '../models/Application.js';
import Job from '../models/Job.js';
import CandidateProfile from '../models/CandidateProfile.js';
import Notification from '../models/Notification.js';
import { matchResumeWithJob } from '../services/aiService.js';

// @desc    Candidate applies for a job
// @route   POST /api/applications
// @access  Private (Job Seeker)
export const applyJob = async (req, res, next) => {
  try {
    const { jobId, resumeUrl, resumeName = 'Resume.pdf', coverLetter = '' } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required.' });
    }

    const job = await Job.findById(jobId).populate('company');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    if (job.status !== 'active' || job.approvalStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'This job posting is no longer accepting new applications.' });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this position.',
      });
    }

    // Fetch candidate profile for AI matching
    const candidateProfile = await CandidateProfile.findOne({ user: req.user._id });
    const finalResumeUrl = resumeUrl || candidateProfile?.resumeUrl;
    const finalResumeName = resumeName || candidateProfile?.resumeName || 'Resume.pdf';

    if (!finalResumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload or provide a resume to apply for this job.',
      });
    }

    // Compute AI match score between candidate and job
    let aiMatchScore = 70;
    let aiFeedback = '';
    try {
      const matchResult = await matchResumeWithJob('', candidateProfile?.skills || [], job);
      aiMatchScore = matchResult.matchPercentage || 70;
      aiFeedback = matchResult.explanation || '';
    } catch (err) {
      console.warn('AI matching error during application submission:', err.message);
    }

    // Create Application
    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      recruiter: job.recruiter,
      company: job.company._id,
      resumeUrl: finalResumeUrl,
      resumeName: finalResumeName,
      coverLetter,
      status: 'Applied',
      aiMatchScore,
      aiFeedback,
      history: [
        {
          status: 'Applied',
          changedAt: new Date(),
          remarks: 'Application submitted by candidate.',
        },
      ],
    });

    // Increment job applications count
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    // Send notification to recruiter
    await Notification.create({
      recipient: job.recruiter,
      sender: req.user._id,
      type: 'new_application',
      title: 'New Application Received',
      message: `${req.user.name} applied for "${job.title}". Match Score: ${aiMatchScore}%`,
      link: `/recruiter/applicants?job=${job._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate gets their own applications
// @route   GET /api/applications/my
// @access  Private (Job Seeker)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        select: 'title slug location jobType workplaceType salary status',
        populate: { path: 'company', select: 'name logo location' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Recruiter gets applications for their jobs
// @route   GET /api/applications/recruiter
// @access  Private (Recruiter)
export const getRecruiterApplications = async (req, res, next) => {
  try {
    const { jobId, status, search } = req.query;

    const query = { recruiter: req.user._id };

    if (jobId) {
      query.job = jobId;
    }

    if (status) {
      query.status = status;
    }

    let applications = await Application.find(query)
      .populate('candidate', 'name email phone avatar')
      .populate('job', 'title location jobType workplaceType salary')
      .populate('company', 'name logo')
      .sort({ createdAt: -1 });

    // Filter candidate profile skills & search
    if (search && search.trim()) {
      const term = search.toLowerCase();
      applications = applications.filter((app) => {
        const candidateName = app.candidate?.name?.toLowerCase() || '';
        const jobTitle = app.job?.title?.toLowerCase() || '';
        return candidateName.includes(term) || jobTitle.includes(term);
      });
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private (Candidate, Recruiter, Admin)
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email phone avatar')
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location website' },
      })
      .populate('recruiter', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Access authorization check
    const isOwnerCandidate = application.candidate._id.toString() === req.user._id.toString();
    const isOwnerRecruiter = application.recruiter._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerCandidate && !isOwnerRecruiter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this application.',
      });
    }

    // Also fetch candidate's extended profile for the recruiter
    let candidateProfile = null;
    if (isOwnerRecruiter || isAdmin) {
      candidateProfile = await CandidateProfile.findOne({ user: application.candidate._id });
    }

    res.status(200).json({
      success: true,
      application,
      candidateProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Recruiter updates application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter, Admin)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks = '', notes = '' } = req.body;
    const allowedStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status provided.' });
    }

    const application = await Application.findById(req.params.id).populate('job', 'title');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Recruiter ownership or Admin check
    if (application.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this application.' });
    }

    application.status = status;
    if (notes) application.notes = notes;

    application.history.push({
      status,
      changedAt: new Date(),
      remarks: remarks || `Status changed to ${status} by recruiter.`,
    });

    await application.save();

    // Create notification for candidate
    await Notification.create({
      recipient: application.candidate,
      sender: req.user._id,
      type: 'application_status',
      title: `Application Status Updated: ${status}`,
      message: `Your application for "${application.job?.title}" is now marked as ${status}.`,
      link: `/candidate/applications`,
    });

    res.status(200).json({
      success: true,
      message: `Application marked as ${status}.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate withdraws application
// @route   DELETE /api/applications/:id
// @access  Private (Job Seeker)
export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only withdraw your own applications.' });
    }

    if (['Interview', 'Selected', 'Rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that is already in '${application.status}' stage.`,
      });
    }

    // Decrement job count
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
    });
  } catch (error) {
    next(error);
  }
};

