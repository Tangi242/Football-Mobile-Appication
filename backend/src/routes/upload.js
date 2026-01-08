import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.body.type || 'general'; // teams, players, coaches, news, products, etc.
    const uploadPath = path.join(uploadsDir, uploadType);
    
    // Create type-specific directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: type_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images, videos, and PDFs
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'application/pdf'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (for images/videos)
  },
  fileFilter: fileFilter
});

const router = Router();

// Single file upload endpoint
router.post('/single', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check PDF file size (5MB limit)
    if (req.file.mimetype === 'application/pdf' && req.file.size > 5 * 1024 * 1024) {
      // Delete the uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
      return res.status(400).json({ message: 'PDF file size must be less than 5MB' });
    }

    // Return the file path relative to uploads directory
    const filePath = `/uploads/${req.body.type || 'general'}/${req.file.filename}`;
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: filePath,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    next(error);
  }
});

// Multiple files upload endpoint
router.post('/multiple', upload.array('files', 10), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: `/uploads/${req.body.type || 'general'}/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    next(error);
  }
});

// Delete file endpoint
router.delete('/:type/:filename', (req, res, next) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(uploadsDir, type, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

