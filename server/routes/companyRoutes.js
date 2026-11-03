import express from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  uploadCompanyLogo,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCompanies);
router.get('/:id', getCompanyById);

router.post('/', protect, authorize('recruiter', 'admin'), createCompany);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateCompany);
router.post('/:id/logo', protect, authorize('recruiter', 'admin'), uploadImage('logos').single('logo'), uploadCompanyLogo);

export default router;

