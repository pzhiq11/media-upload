import express from 'express';
import multer from 'multer';
import { uploadImage, getUploadHistory, getRandomImage } from '../controllers/upload.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), uploadImage);
router.get('/upload-history', getUploadHistory);
router.get('/random-image', getRandomImage);

export const uploadRouter = router; 