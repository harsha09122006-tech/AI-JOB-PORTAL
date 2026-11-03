import RecruiterProfile from '../models/RecruiterProfile.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';

// @desc    Get recruiter profile & company
// @route   GET /api/recruiters/profile
// @access  Private (Recruiter)
export const getMyRecruiterProfile = async (req, res, next) => {
  try {
    let profile = await RecruiterProfile.findOne({ user: req.user._id }).populate('company');

    if (!profile) {
      profile = await RecruiterProfile.create({
        user: req.user._id,
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recruiter profile
// @route   PUT /api/recruiters/profile
// @access  Private (Recruiter)
export const updateRecruiterProfile = async (req, res, next) => {
  try {
    const { designation, department, phone, linkedin } = req.body;

    let profile = await RecruiterProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new RecruiterProfile({ user: req.user._id });
    }

    if (designation) profile.designation = designation;
    if (department) profile.department = department;
    if (phone !== undefined) profile.phone = phone;
    if (linkedin !== undefined) profile.linkedin = linkedin;

    await profile.save();
    const populated = await RecruiterProfile.findById(profile._id).populate('company');

    res.status(200).json({
      success: true,
      message: 'Recruiter profile updated successfully.',
      profile: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Recruiter Dashboard statistics
// @route   GET /api/recruiters/dashboard
// @access  Private (Recruiter)
export const getRecruiterDashboard = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    const totalJobs = await Job.countDocuments({ recruiter: recruiterId });
    const activeJobs = await Job.countDocuments({ recruiter: recruiterId, status: 'active', approvalStatus: 'approved' });
    const totalApplications = await Application.countDocuments({ recruiter: recruiterId });
    const pendingApplications = await Application.countDocuments({
      recruiter: recruiterId,
      status: { $in: ['Applied', 'Under Review'] },
    });
    const shortlistedCandidates = await Application.countDocuments({
      recruiter: recruiterId,
      status: 'Shortlisted',
    });

    const recentApplications = await Application.find({ recruiter: recruiterId })
      .populate('candidate', 'name email avatar')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentJobs = await Job.find({ recruiter: recruiterId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        shortlistedCandidates,
      },
      recentApplications,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Recruiter Analytics Charts Data
// @route   GET /api/recruiters/analytics
// @access  Private (Recruiter)
export const getRecruiterAnalytics = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    // Applications by status
    const statusDistribution = await Application.aggregate([
      { $match: { recruiter: recruiterId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top jobs by application volume
    const topJobs = await Job.find({ recruiter: recruiterId })
      .sort({ applicationsCount: -1 })
      .limit(5)
      .select('title applicationsCount');

    // Monthly applications distribution
    const applicationsTrend = await Application.aggregate([
      { $match: { recruiter: recruiterId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        statusDistribution: statusDistribution.map((s) => ({ status: s._id, count: s.count })),
        topJobs: topJobs.map((j) => ({ title: j.title, applications: j.applicationsCount })),
        trend: applicationsTrend.map((t) => ({ month: t._id, count: t.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

