import express from 'express';
import {
  getMyCandidateProfile,
  updateCandidateProfile,
  uploadResumeFile,
  getCandidates,
  getCandidateById,
  downloadResumeFile,
} from '../controllers/candidateController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = express.Router();

router.get('/profile', protect, authorize('jobseeker'), getMyCandidateProfile);
router.put('/profile', protect, authorize('jobseeker'), updateCandidateProfile);
router.post('/resume', protect, authorize('jobseeker'), uploadResume.single('resume'), uploadResumeFile);
router.get('/resume/download/:filename', protect, downloadResumeFile);

router.get('/', protect, authorize('recruiter', 'admin'), getCandidates);
router.get('/:id', protect, authorize('recruiter', 'admin'), getCandidateById);

export default router;

