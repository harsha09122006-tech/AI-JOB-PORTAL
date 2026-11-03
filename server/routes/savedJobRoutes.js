import express from 'express';
import { saveJob, getSavedJobs, removeSavedJob } from '../controllers/savedJobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('jobseeker'));

router.post('/', saveJob);
router.get('/', getSavedJobs);
router.delete('/:id', removeSavedJob);

export default router;

