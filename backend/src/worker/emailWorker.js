"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorker = void 0;
const bullmq_1 = require("bullmq");
const nodemailer_1 = __importDefault(require("nodemailer"));
const redis_1 = require("../config/redis");
const db_1 = __importDefault(require("../config/db"));
const startWorker = () => {
    const worker = new bullmq_1.Worker('email-queue', async (job) => {
        const { scheduledEmailId } = job.data;
        // Fetch the email job from DB
        const scheduledEmail = await db_1.default.scheduledEmail.findUnique({
            where: { id: scheduledEmailId },
            include: {
                campaign: {
                    include: { user: true }
                }
            }
        });
        if (!scheduledEmail) {
            console.warn(`Scheduled email ${scheduledEmailId} not found.`);
            return;
        }
        const { campaign } = scheduledEmail;
        const { user } = campaign;
        if (!user.etherealUser || !user.etherealPass) {
            throw new Error(`User ${user.id} lacks Ethereal credentials`);
        }
        // Rate Limiting Logic (Fixed Window via Redis)
        const currentHour = new Date().toISOString().substring(0, 13); // e.g., '2026-07-29T10'
        const rateLimitKey = `rate_limit:${user.id}:${currentHour}`;
        const hourlyLimit = campaign.hourlyLimit || parseInt(process.env.MAX_EMAILS_PER_HOUR || '200');
        // Atomically increment the counter
        const currentCount = await redis_1.connection.incr(rateLimitKey);
        if (currentCount === 1) {
            // Set TTL to 2 hours to avoid memory bloat
            await redis_1.connection.expire(rateLimitKey, 7200);
        }
        if (currentCount > hourlyLimit) {
            // Limit Exceeded: Calculate time until next hour
            const now = new Date();
            const nextHour = new Date(now);
            nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Top of the next hour
            const delayMs = nextHour.getTime() - now.getTime();
            console.log(`Rate limit exceeded for user ${user.id}. Delaying job ${job.id} by ${delayMs}ms.`);
            // Reschedule the job to the next hour natively without dropping it
            await job.moveToDelayed(Date.now() + delayMs, job.token);
            // We throw a special error so BullMQ knows it didn't complete now, but it's safely delayed
            // Actually, moveToDelayed throws its own internal exception to stop execution in BullMQ v5+, 
            // but if it doesn't, we return to prevent sending.
            throw new Error('DELAYED_DUE_TO_RATE_LIMIT');
        }
        // Prepare Nodemailer transport
        const transporter = nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: user.etherealUser,
                pass: user.etherealPass
            }
        });
        try {
            // Send the email
            await transporter.sendMail({
                from: `"${user.name}" <${user.etherealUser}>`,
                to: scheduledEmail.recipientEmail,
                subject: campaign.subject,
                html: campaign.body,
            });
            // Mark as sent in DB
            await db_1.default.scheduledEmail.update({
                where: { id: scheduledEmailId },
                data: {
                    status: 'sent',
                    sentTime: new Date()
                }
            });
            console.log(`Email ${scheduledEmailId} sent successfully.`);
            // Handle Per-Email delay if configured
            if (campaign.delayBetween > 0) {
                // Sleep the worker to enforce delay before it picks up the next job
                await new Promise(resolve => setTimeout(resolve, campaign.delayBetween * 1000));
            }
        }
        catch (error) {
            // Mark as failed
            await db_1.default.scheduledEmail.update({
                where: { id: scheduledEmailId },
                data: {
                    status: 'failed',
                    errorMessage: error.message
                }
            });
            throw error;
        }
    }, {
        connection: redis_1.connection,
        concurrency: 5 // Configurable
    });
    worker.on('failed', (job, err) => {
        if (err.message !== 'DELAYED_DUE_TO_RATE_LIMIT') {
            console.error(`Job ${job?.id} failed:`, err);
        }
    });
    console.log('BullMQ Email Worker started.');
};
exports.startWorker = startWorker;
//# sourceMappingURL=emailWorker.js.map