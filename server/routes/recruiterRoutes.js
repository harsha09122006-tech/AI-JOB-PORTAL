import express from 'express';
import {
  getMyRecruiterProfile,
  updateRecruiterProfile,
  getRecruiterDashboard,
  getRecruiterAnalytics,
} from '../controllers/recruiterController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('recruiter', 'admin'));

router.get('/profile', getMyRecruiterProfile);
router.put('/profile', updateRecruiterProfile);
router.get('/dashboard', getRecruiterDashboard);
router.get('/analytics', getRecruiterAnalytics);

export default router;

