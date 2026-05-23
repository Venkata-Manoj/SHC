import { Router } from 'express';
import * as hCtrl from '../controllers/hackathons.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateHackathon } from '../middleware/validate.js';

const router = Router();

router.get('/', hCtrl.list);
router.get('/deleted', authenticate, authorize('ADMIN'), hCtrl.listDeleted);
router.get('/check-duplicate', hCtrl.checkDuplicate);
router.get('/:id', hCtrl.getById);
router.post('/', authenticate, authorize('ADMIN', 'COORDINATOR'), validateHackathon, hCtrl.create);
router.put('/:id', authenticate, authorize('ADMIN', 'COORDINATOR'), hCtrl.update);
router.delete('/:id', authenticate, authorize('ADMIN'), hCtrl.remove);
router.delete('/:id/permanent', authenticate, authorize('ADMIN'), hCtrl.permanentDelete);
router.patch('/:id/archive', authenticate, authorize('ADMIN'), hCtrl.toggleArchive);
router.patch('/:id/restore', authenticate, authorize('ADMIN'), hCtrl.restore);

export default router;
