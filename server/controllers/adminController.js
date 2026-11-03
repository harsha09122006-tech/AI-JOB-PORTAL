import User from '../models/User.js';
import CandidateProfile from '../models/CandidateProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';

// @desc    Admin Dashboard Analytics & Platform Overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'jobseeker' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active', approvalStatus: 'approved' });
    const pendingJobApprovals = await Job.countDocuments({ approvalStatus: 'pending' });
    const totalApplications = await Application.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Recent user registrations
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    // Recent jobs
    const recentJobs = await Job.find().populate('company', 'name').sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalJobs,
        activeJobs,
        pendingJobApprovals,
        totalApplications,
        totalCompanies,
        pendingReports,
      },
      recentUsers,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all platform users with filtering & search
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, isBlocked, page = 1, limit = 15 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or Unblock user
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
export const toggleUserBlockStatus = async (req, res, next) => {
  try {
    const { isBlocked } = req.body;

    // Prevent blocking oneself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot block your own administrative account.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: Boolean(isBlocked) },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own administrative account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Clean up related profiles and data
    await CandidateProfile.deleteOne({ user: user._id });
    await RecruiterProfile.deleteOne({ user: user._id });
    await Job.deleteMany({ recruiter: user._id });
    await Application.deleteMany({ $or: [{ candidate: user._id }, { recruiter: user._id }] });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User account and all associated records deleted permanently.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (including pending approvals)
// @route   GET /api/admin/jobs
// @access  Private (Admin)
export const getAllJobsAdmin = async (req, res, next) => {
  try {
    const { approvalStatus, status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (status) query.status = status;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name logo')
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject job posting
// @route   PATCH /api/admin/jobs/:id/approval
// @access  Private (Admin)
export const updateJobApproval = async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status.' });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { approvalStatus },
      { new: true }
    ).populate('recruiter', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    // Notify recruiter
    await Notification.create({
      recipient: job.recruiter._id,
      type: approvalStatus === 'approved' ? 'job_approved' : 'job_rejected',
      title: `Job Listing ${approvalStatus.toUpperCase()}`,
      message: `Your job posting "${job.title}" has been ${approvalStatus} by the administrative team.`,
      link: `/recruiter/jobs`,
    });

    res.status(200).json({
      success: true,
      message: `Job posting marked as ${approvalStatus}.`,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform applications
// @route   GET /api/admin/applications
// @access  Private (Admin)
export const getAllApplicationsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('candidate', 'name email avatar')
      .populate('job', 'title location')
      .populate('company', 'name')
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find().populate('reporter', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status
// @route   PATCH /api/admin/reports/:id
// @access  Private (Admin)
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, resolutionNotes },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Report status updated.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

