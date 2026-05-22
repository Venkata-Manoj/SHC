import { Router } from 'express';
import * as uCtrl from '../controllers/upload.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', authenticate, upload.single('file'), uCtrl.uploadFile);

export default router;
