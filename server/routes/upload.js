import express from 'express';
import multer from 'multer';
import { uploadImage, getUploadHistory } from '../controllers/upload.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), uploadImage);
router.get('/upload-history', getUploadHistory);

export const uploadRouter = router; 