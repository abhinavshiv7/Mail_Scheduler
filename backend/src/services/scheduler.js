"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCampaign = void 0;
const db_1 = __importDefault(require("../config/db"));
const queue_1 = require("../config/queue");
const scheduleCampaign = async (params) => {
    const { userId, subject, body, delayBetween, hourlyLimit, recipients, startDate } = params;
    // 1. Create the Campaign in the database
    const campaign = await db_1.default.campaign.create({
        data: {
            userId,
            subject,
            body,
            delayBetween,
            hourlyLimit,
            status: 'active'
        }
    });
    // 2. Calculate initial scheduling times for each recipient
    // Note: We don't need to mathematically space them out exactly here unless we want to.
    // BullMQ delayed jobs + worker rate limiting will naturally space them out.
    // But we can add a base delay offset for each subsequent email to respect `delayBetween` upfront.
    const scheduledEmailsData = recipients.map((email, index) => {
        // Base schedule time + (index * delayBetween)
        const exactTime = new Date(startDate.getTime() + (index * delayBetween * 1000));
        return {
            campaignId: campaign.id,
            recipientEmail: email,
            scheduledTime: exactTime,
            status: 'scheduled'
        };
    });
    // 3. Insert all Scheduled Emails into the database
    const createdEmails = await db_1.default.$transaction(scheduledEmailsData.map(data => db_1.default.scheduledEmail.create({ data })));
    // 4. Push jobs to BullMQ with the precise delay
    const now = Date.now();
    const jobs = createdEmails.map(email => {
        const delay = Math.max(0, email.scheduledTime.getTime() - now);
        return {
            name: 'send-email',
            data: { scheduledEmailId: email.id },
            opts: { delay } // BullMQ handles scheduling via Redis automatically
        };
    });
    await queue_1.emailQueue.addBulk(jobs);
    return campaign;
};
exports.scheduleCampaign = scheduleCampaign;
//# sourceMappingURL=scheduler.js.map