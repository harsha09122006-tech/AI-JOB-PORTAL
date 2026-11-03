import express from 'express';
import {
  analyzeResumeEndpoint,
  matchJobEndpoint,
  getRecommendationsEndpoint,
  careerAssistantEndpoint,
} from '../controllers/aiController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = express.Router();

router.post('/resume-analysis', optionalAuth, uploadResume.single('resume'), analyzeResumeEndpoint);
router.post('/job-match', optionalAuth, matchJobEndpoint);
router.get('/recommendations', protect, authorize('jobseeker'), getRecommendationsEndpoint);
router.post('/career-assistant', optionalAuth, careerAssistantEndpoint);

export default router;

