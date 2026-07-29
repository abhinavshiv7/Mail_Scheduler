import { Router } from 'express';
import { createCampaign, getScheduledEmails, getSentEmails, toggleStarEmail } from '../controllers/campaignController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// All campaign routes require authentication
router.use(requireAuth);

router.post('/', createCampaign);
router.get('/scheduled', getScheduledEmails);
router.get('/sent', getSentEmails);
router.put('/email/:id/star', toggleStarEmail);

export default router;
