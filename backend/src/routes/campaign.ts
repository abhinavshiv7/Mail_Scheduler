import { Router } from 'express';
import { createCampaign, getScheduledEmails, getSentEmails, toggleStarEmail, getEmail } from '../controllers/campaignController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// All campaign routes require authentication
router.use(requireAuth);

router.post('/', createCampaign);
router.get('/scheduled', getScheduledEmails);
router.get('/sent', getSentEmails);
router.get('/email/:id', getEmail);
router.put('/email/:id/star', toggleStarEmail);

export default router;
