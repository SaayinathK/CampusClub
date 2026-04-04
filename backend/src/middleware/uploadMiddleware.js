import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, '../../uploads');

fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, uploadsDirectory);
  },
  filename(_req, file, callback) {
    const extension = path.extname(file.originalname) || '.jpg';
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();

    callback(
      null,
      `${Date.now()}-${safeBaseName || 'community'}${extension}`
    );
  }
});

function fileFilter(_req, file, callback) {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
    return;
  }

  callback(new Error('Only image files are allowed.'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const uploadCommunityImage = upload.single('image');
export const uploadEventImage = upload.single('image');
