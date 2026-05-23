import { Router } from 'express';
import * as aCtrl from '../controllers/analytics.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), aCtrl.getAnalytics);
router.get('/export', authenticate, authorize('ADMIN'), aCtrl.exportCSV);
router.get('/export/pdf', authenticate, authorize('ADMIN'), aCtrl.exportPDF);
router.post('/:id/click', aCtrl.trackClick);

export default router;
