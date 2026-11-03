import express from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  toggleUserBlockStatus,
  deleteUser,
  getAllJobsAdmin,
  updateJobApproval,
  getAllApplicationsAdmin,
  getReports,
  updateReportStatus,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserBlockStatus);
router.delete('/users/:id', deleteUser);

router.get('/jobs', getAllJobsAdmin);
router.patch('/jobs/:id/approval', updateJobApproval);

router.get('/applications', getAllApplicationsAdmin);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

export default router;

