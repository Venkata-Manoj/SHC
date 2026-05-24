import { Router } from 'express';
import * as fbCtrl from '../controllers/feedback.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { voteLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', fbCtrl.create);
router.get('/', authenticate, authorize('ADMIN'), fbCtrl.list);
router.post('/:id/vote', voteLimiter, fbCtrl.vote);

export default router;
