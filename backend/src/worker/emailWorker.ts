import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { connection } from '../config/redis';
import prisma from '../config/db';

export const startWorker = () => {
  const worker = new Worker('email-queue', async (job: Job) => {
    const { scheduledEmailId } = job.data;
    
    // Fetch the email job from DB
    const scheduledEmail = await prisma.scheduledEmail.findUnique({
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
    const currentCount = await connection.incr(rateLimitKey);
    if (currentCount === 1) {
      // Set TTL to 2 hours to avoid memory bloat
      await connection.expire(rateLimitKey, 7200);
    }

    if (currentCount > hourlyLimit) {
      // Limit Exceeded: Calculate time until next hour
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Top of the next hour
      const delayMs = nextHour.getTime() - now.getTime();

      console.log(`Rate limit exceeded for user ${user.id}. Delaying job ${job.id} by ${delayMs}ms.`);
      
      // Reschedule the job to the next hour natively without dropping it
      await job.moveToDelayed(Date.now() + delayMs, job.token!);
      
      // We throw a special error so BullMQ knows it didn't complete now, but it's safely delayed
      // Actually, moveToDelayed throws its own internal exception to stop execution in BullMQ v5+, 
      // but if it doesn't, we return to prevent sending.
      throw new Error('DELAYED_DUE_TO_RATE_LIMIT');
    }

    // Prepare Nodemailer transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: user.etherealUser,
        pass: user.etherealPass
      }
    });

    try {
      // Send the email
      const info = await transporter.sendMail({
        from: `"${user.name}" <${user.etherealUser}>`,
        to: scheduledEmail.recipientEmail,
        subject: campaign.subject,
        html: campaign.body,
      });

      console.log(`Email ${scheduledEmailId} sent successfully!`);
      console.log(`Ethereal Preview URL: %s`, nodemailer.getTestMessageUrl(info));

      // Mark as sent in DB
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmailId },
        data: {
          status: 'sent',
          sentTime: new Date()
        }
      });

      console.log(`Email ${scheduledEmailId} sent successfully.`);

    } catch (error: any) {
      // Mark as failed
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmailId },
        data: {
          status: 'failed',
          errorMessage: error.message
        }
      });
      throw error;
    }

  }, { 
    connection,
    concurrency: 5 // Configurable
  });

  worker.on('failed', (job, err) => {
    if (err.message !== 'DELAYED_DUE_TO_RATE_LIMIT') {
      console.error(`Job ${job?.id} failed:`, err);
    }
  });

  console.log('BullMQ Email Worker started.');
};
