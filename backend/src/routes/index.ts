import { Router } from 'express';
import authRoutes from './auth';
import campaignRoutes from './campaign';

const router = Router();

router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);

export default router;
