import { Router } from 'express';
import * as nCtrl from '../controllers/notifications.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'COORDINATOR'), nCtrl.list);
router.patch('/:id/read', authenticate, nCtrl.markRead);
router.patch('/read-all', authenticate, nCtrl.markAllRead);

export default router;
