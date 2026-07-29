"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleStarEmail = exports.getSentEmails = exports.getScheduledEmails = exports.createCampaign = void 0;
const db_1 = __importDefault(require("../config/db"));
const scheduler_1 = require("../services/scheduler");
const createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, body, delayBetween, hourlyLimit, recipients, startDate } = req.body;
        if (!subject || !body || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ error: 'Missing required fields or recipients' });
        }
        const campaign = await (0, scheduler_1.scheduleCampaign)({
            userId,
            subject,
            body,
            delayBetween: delayBetween || 0,
            hourlyLimit: hourlyLimit || 200,
            recipients,
            startDate: startDate ? new Date(startDate) : new Date()
        });
        res.status(201).json({ message: 'Campaign scheduled successfully', campaign });
    }
    catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to schedule campaign' });
    }
};
exports.createCampaign = createCampaign;
const getScheduledEmails = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch all scheduled emails for this user's campaigns that are NOT sent yet
        const emails = await db_1.default.scheduledEmail.findMany({
            where: {
                campaign: { userId },
                status: { in: ['scheduled', 'failed'] }
            },
            include: { campaign: true },
            orderBy: { scheduledTime: 'asc' }
        });
        res.json(emails);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch scheduled emails' });
    }
};
exports.getScheduledEmails = getScheduledEmails;
const getSentEmails = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch all sent emails
        const emails = await db_1.default.scheduledEmail.findMany({
            where: {
                campaign: { userId },
                status: 'sent'
            },
            include: { campaign: true },
            orderBy: { sentTime: 'desc' }
        });
        res.json(emails);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch sent emails' });
    }
};
exports.getSentEmails = getSentEmails;
const toggleStarEmail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const emailId = id;
        // Verify ownership
        const email = await db_1.default.scheduledEmail.findUnique({
            where: { id: emailId },
            include: { campaign: true }
        });
        if (!email || email.campaign.userId !== userId) {
            return res.status(404).json({ error: 'Email not found' });
        }
        const updated = await db_1.default.scheduledEmail.update({
            where: { id: emailId },
            data: { isStarred: !email.isStarred }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to toggle star status' });
    }
};
exports.toggleStarEmail = toggleStarEmail;
