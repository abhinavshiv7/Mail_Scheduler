"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaignController_1 = require("../controllers/campaignController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// All campaign routes require authentication
router.use(auth_1.requireAuth);
router.post('/', campaignController_1.createCampaign);
router.get('/scheduled', campaignController_1.getScheduledEmails);
router.get('/sent', campaignController_1.getSentEmails);
router.put('/email/:id/star', campaignController_1.toggleStarEmail);
exports.default = router;
