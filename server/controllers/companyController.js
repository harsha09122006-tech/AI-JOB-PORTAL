import Company from '../models/Company.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import Job from '../models/Job.js';

// @desc    List companies
// @route   GET /api/companies
// @access  Public
export const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query).skip(skip).limit(limitNum).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      companies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company with its jobs
// @route   GET /api/companies/:id
// @access  Public
export const getCompanyById = async (req, res, next) => {
  try {
    const isIdOrSlug = req.params.id;
    let company;
    if (isIdOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      company = await Company.findById(isIdOrSlug);
    } else {
      company = await Company.findOne({ slug: isIdOrSlug });
    }

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const activeJobs = await Job.find({ company: company._id, status: 'active', approvalStatus: 'approved' });

    res.status(200).json({
      success: true,
      company,
      activeJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create company profile
// @route   POST /api/companies
// @access  Private (Recruiter)
export const createCompany = async (req, res, next) => {
  try {
    const { name, website, industry, companySize, location, description, foundedYear, logo } = req.body;

    if (!name || !industry || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, industry, and location.',
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existing = await Company.findOne({ $or: [{ name }, { slug }] });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A company with this name already exists in the system.',
      });
    }

    const company = await Company.create({
      name,
      slug,
      website,
      industry,
      companySize,
      location,
      description,
      foundedYear: foundedYear ? Number(foundedYear) : undefined,
      logo: logo || '',
      createdBy: req.user._id,
      verified: true,
    });

    // Link company to recruiter profile
    await RecruiterProfile.findOneAndUpdate(
      { user: req.user._id },
      { company: company._id },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Company profile created successfully!',
      company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Recruiter owner or Admin)
export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    if (company.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this company.' });
    }

    const { name, website, industry, companySize, location, description, foundedYear, logo } = req.body;

    if (name) {
      company.name = name;
      company.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (website !== undefined) company.website = website;
    if (industry) company.industry = industry;
    if (companySize) company.companySize = companySize;
    if (location) company.location = location;
    if (description !== undefined) company.description = description;
    if (foundedYear !== undefined) company.foundedYear = Number(foundedYear);
    if (logo !== undefined) company.logo = logo;

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company details updated successfully.',
      company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload company logo
// @route   POST /api/companies/:id/logo
// @access  Private (Recruiter owner or Admin)
export const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { logo: logoUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Company logo uploaded successfully.',
      logoUrl,
      company,
    });
  } catch (error) {
    next(error);
  }
};

