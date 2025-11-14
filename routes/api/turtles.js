import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getTurtles,
  getTurtleById,
  createTurtle,
  launchManagedTurtle,
  updateTurtle,
  deleteTurtle,
  regenerateTurtleSecret
} from '../../controllers/turtlesController.js';
import { ensureAdmin, ensureAuth } from '../../middleware/auth.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

const optionalProfileUpload = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return upload.single('profile_photo')(req, res, next);
  }
  return next();
};

router.get('/', getTurtles);
router.post('/launch', ensureAuth, optionalProfileUpload, launchManagedTurtle);
router.get('/:id', getTurtleById);
router.post('/', ensureAuth, ensureAdmin, upload.single('profile_photo'), createTurtle);
router.put('/:id', ensureAuth, ensureAdmin, optionalProfileUpload, updateTurtle);
router.delete('/:id', ensureAuth, ensureAdmin, deleteTurtle);
router.post('/:id/secret', ensureAuth, ensureAdmin, regenerateTurtleSecret);

export default router;
