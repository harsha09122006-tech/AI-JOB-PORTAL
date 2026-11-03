import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';

// @desc    Save / bookmark a job
// @route   POST /api/saved-jobs
// @access  Private (Job Seeker)
export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Job is already saved in your bookmarks.' });
    }

    const saved = await SavedJob.create({
      user: req.user._id,
      job: jobId,
    });

    res.status(201).json({
      success: true,
      message: 'Job bookmarked successfully!',
      saved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved jobs
// @route   GET /api/saved-jobs
// @access  Private (Job Seeker)
export const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved job
// @route   DELETE /api/saved-jobs/:id
// @access  Private (Job Seeker)
export const removeSavedJob = async (req, res, next) => {
  try {
    const paramId = req.params.id;

    // Check if param is SavedJob _id or Job _id
    const deleted = await SavedJob.findOneAndDelete({
      $and: [
        { user: req.user._id },
        { $or: [{ _id: paramId.match(/^[0-9a-fA-F]{24}$/) ? paramId : null }, { job: paramId }] },
      ],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Saved job bookmark not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Job removed from bookmarks.',
    });
  } catch (error) {
    next(error);
  }
};

