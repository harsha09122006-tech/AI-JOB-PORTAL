import express from 'express';
import {
  getJobs,
  getFeaturedJobs,
  getJobCategories,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
} from '../controllers/jobController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/categories', getJobCategories);
router.get('/:id', optionalAuth, getJobById);

router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), toggleJobStatus);

export default router;

