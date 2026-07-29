import { Router } from 'express';
import { googleLogin, loginEmail, registerEmail } from '../controllers/authController';

const router = Router();

router.post('/google', googleLogin);
router.post('/login-email', loginEmail);
router.post('/register-email', registerEmail);

export default router;
