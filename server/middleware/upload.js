import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to ensure target folder exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'uploads', subfolder);
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(sanitizedName);
      const base = path.basename(sanitizedName, ext).substring(0, 30);
      cb(null, `${base}-${uniqueSuffix}${ext}`);
    },
  });

// Resume Upload Config
export const uploadResume = multer({
  storage: createStorage('resumes'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowedExts = /pdf|doc|docx|txt/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;

    if (
      allowedExts.test(ext) &&
      (mime.includes('pdf') ||
        mime.includes('word') ||
        mime.includes('officedocument') ||
        mime.includes('text') ||
        mime.includes('octet-stream'))
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
});

// Image Upload Config (Avatar / Logo)
export const uploadImage = (subfolder = 'avatars') =>
  multer({
    storage: createStorage(subfolder),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
    fileFilter: (req, file, cb) => {
      const allowedExts = /jpeg|jpg|png|webp|svg/;
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      if (allowedExts.test(ext) && file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and SVG images are allowed.'));
      }
    },
  });

