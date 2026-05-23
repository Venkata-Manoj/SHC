import { Router } from 'express';
import * as authCtrl from '../controllers/auth.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateAuth } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', validateAuth, authCtrl.register);
router.post('/login', loginLimiter, validateAuth, authCtrl.login);
router.get('/me', authenticate, authCtrl.getMe);
router.put('/profile', authenticate, authCtrl.updateProfile);
router.post('/invite', authenticate, authorize('ADMIN'), authCtrl.inviteCoordinator);
router.post('/accept-invite', authCtrl.acceptInvite);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);

export default router;
