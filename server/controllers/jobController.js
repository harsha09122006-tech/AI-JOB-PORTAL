import Job from '../models/Job.js';
import Company from '../models/Company.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import SavedJob from '../models/SavedJob.js';
import Application from '../models/Application.js';

// @desc    Get all active & approved jobs with advanced search and filters
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      skills,
      jobType,
      workplaceType,
      experienceLevel,
      industry,
      salaryMin,
      salaryMax,
      datePosted,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      status: 'active',
      approvalStatus: 'approved',
    };

    // Keyword Search
    if (search && search.trim()) {
      const term = search.trim();
      // Search matching companies first to allow searching by company name
      const matchingCompanies = await Company.find({
        name: { $regex: term, $options: 'i' },
      }).select('_id');

      const companyIds = matchingCompanies.map((c) => c._id);

      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { skillsRequired: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { company: { $in: companyIds } },
      ];
    }

    // Location Filter
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Skills Filter
    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      query.skillsRequired = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
    }

    // Job Type Filter
    if (jobType) {
      const types = jobType.split(',');
      query.jobType = { $in: types };
    }

    // Workplace Type (Remote, Hybrid, On-site)
    if (workplaceType) {
      const wpTypes = workplaceType.split(',');
      query.workplaceType = { $in: wpTypes };
    }

    // Experience Level
    if (experienceLevel) {
      const expLevels = experienceLevel.split(',');
      query.experienceLevel = { $in: expLevels };
    }

    // Industry Filter
    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    // Salary Filters
    if (salaryMin) {
      query['salary.max'] = { $gte: Number(salaryMin) };
    }
    if (salaryMax) {
      query['salary.min'] = { $lte: Number(salaryMax) };
    }

    // Date Posted Filter
    if (datePosted) {
      const now = new Date();
      if (datePosted === 'today') {
        const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: past24h };
      } else if (datePosted === 'past_week') {
        const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: past7d };
      } else if (datePosted === 'past_month') {
        const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: past30d };
      }
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'salary_high') {
      sortOptions = { 'salary.max': -1 };
    } else if (sort === 'salary_low') {
      sortOptions = { 'salary.min': 1 };
    } else if (sort === 'applications') {
      sortOptions = { applicationsCount: -1 };
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name logo slug industry location website')
      .populate('recruiter', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // If candidate logged in, check which jobs are saved
    let savedJobIds = [];
    if (req.user) {
      const saved = await SavedJob.find({ user: req.user._id }).select('job');
      savedJobIds = saved.map((s) => s.job.toString());
    }

    const transformedJobs = jobs.map((j) => {
      const obj = j.toObject();
      obj.isSaved = savedJobIds.includes(j._id.toString());
      return obj;
    });

    res.status(200).json({
      success: true,
      count: transformedJobs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      jobs: transformedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured jobs for homepage
// @route   GET /api/jobs/featured
// @access  Public
export const getFeaturedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'active', approvalStatus: 'approved' })
      .populate('company', 'name logo slug industry location')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job categories summary
// @route   GET /api/jobs/categories
// @access  Public
export const getJobCategories = async (req, res, next) => {
  try {
    const categories = await Job.aggregate([
      { $match: { status: 'active', approvalStatus: 'approved' } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map((c) => ({ name: c._id, count: c.count })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('recruiter', 'name email avatar');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    let hasApplied = false;
    let isSaved = false;
    let userApplication = null;

    if (req.user) {
      const app = await Application.findOne({ job: job._id, candidate: req.user._id });
      if (app) {
        hasApplied = true;
        userApplication = app;
      }

      const saved = await SavedJob.findOne({ job: job._id, user: req.user._id });
      if (saved) {
        isSaved = true;
      }
    }

    // Similar jobs
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      industry: job.industry,
      status: 'active',
      approvalStatus: 'approved',
    })
      .populate('company', 'name logo slug')
      .limit(3);

    res.status(200).json({
      success: true,
      job,
      hasApplied,
      isSaved,
      userApplication,
      similarJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter)
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requirements = [],
      responsibilities = [],
      skillsRequired = [],
      jobType,
      workplaceType,
      experienceLevel,
      salaryMin = 0,
      salaryMax = 0,
      salaryCurrency = 'USD',
      isNegotiable = false,
      location,
      industry,
      vacancies = 1,
      deadline,
    } = req.body;

    // Retrieve recruiter company
    const recruiterProfile = await RecruiterProfile.findOne({ user: req.user._id }).populate('company');
    if (!recruiterProfile || !recruiterProfile.company) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your company profile before posting a job vacancy.',
      });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const job = await Job.create({
      title,
      slug,
      company: recruiterProfile.company._id,
      recruiter: req.user._id,
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements.split('\n').filter(Boolean),
      responsibilities: Array.isArray(responsibilities) ? responsibilities : responsibilities.split('\n').filter(Boolean),
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
      jobType,
      workplaceType,
      experienceLevel,
      salary: {
        min: Number(salaryMin) || 0,
        max: Number(salaryMax) || 0,
        currency: salaryCurrency,
        isNegotiable: Boolean(isNegotiable),
      },
      location,
      industry: industry || recruiterProfile.company.industry,
      vacancies: Number(vacancies) || 1,
      deadline: deadline ? new Date(deadline) : null,
      approvalStatus: 'approved', // Auto-approved for verified recruiters
    });

    res.status(201).json({
      success: true,
      message: 'Job posting published successfully!',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job posting
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter owner or Admin)
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    // Ownership check
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this job listing.',
      });
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      skillsRequired,
      jobType,
      workplaceType,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      isNegotiable,
      location,
      industry,
      vacancies,
      deadline,
      status,
    } = req.body;

    if (title) job.title = title;
    if (description) job.description = description;
    if (requirements !== undefined) job.requirements = Array.isArray(requirements) ? requirements : requirements.split('\n').filter(Boolean);
    if (responsibilities !== undefined) job.responsibilities = Array.isArray(responsibilities) ? responsibilities : responsibilities.split('\n').filter(Boolean);
    if (skillsRequired !== undefined) job.skillsRequired = Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(',').map((s) => s.trim()).filter(Boolean);
    if (jobType) job.jobType = jobType;
    if (workplaceType) job.workplaceType = workplaceType;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (location) job.location = location;
    if (industry) job.industry = industry;
    if (vacancies !== undefined) job.vacancies = Number(vacancies);
    if (deadline !== undefined) job.deadline = deadline ? new Date(deadline) : null;
    if (status) job.status = status;

    if (salaryMin !== undefined || salaryMax !== undefined || salaryCurrency !== undefined || isNegotiable !== undefined) {
      job.salary = {
        min: salaryMin !== undefined ? Number(salaryMin) : job.salary.min,
        max: salaryMax !== undefined ? Number(salaryMax) : job.salary.max,
        currency: salaryCurrency || job.salary.currency,
        isNegotiable: isNegotiable !== undefined ? Boolean(isNegotiable) : job.salary.isNegotiable,
      };
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully.',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter owner or Admin)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job posting.',
      });
    }

    // Clean up applications and saved jobs
    await Application.deleteMany({ job: job._id });
    await SavedJob.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting and associated applications removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle job status (active, paused, closed)
// @route   PATCH /api/jobs/:id/status
// @access  Private (Recruiter owner or Admin)
export const toggleJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'paused', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    job.status = status;
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job status updated to ${status}.`,
      job,
    });
  } catch (error) {
    next(error);
  }
};

