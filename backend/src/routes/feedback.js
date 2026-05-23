import { Router } from 'express';
import * as fbCtrl from '../controllers/feedback.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', fbCtrl.create);
router.get('/', authenticate, authorize('ADMIN'), fbCtrl.list);
router.post('/:id/vote', fbCtrl.vote);

export default router;
