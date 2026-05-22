import { Router } from 'express';
import * as sCtrl from '../controllers/submissions.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { submissionLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', authenticate, submissionLimiter, upload.single('poster'), sCtrl.create);
router.get('/', authenticate, authorize('ADMIN', 'COORDINATOR'), sCtrl.listPending);
router.patch('/:id/review', authenticate, authorize('ADMIN', 'COORDINATOR'), sCtrl.review);
router.post('/bulk-review', authenticate, authorize('ADMIN'), sCtrl.bulkReview);

export default router;
