import multer from 'multer';
import { join } from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = join(process.cwd(), 'public', 'uploads', 'deliverables');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;