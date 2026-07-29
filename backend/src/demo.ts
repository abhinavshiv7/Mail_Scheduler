import prisma from './config/db';
import { scheduleCampaign } from './services/scheduler';
import nodemailer from 'nodemailer';
import { connection } from './config/redis';

async function runDemo() {
  console.log('=== ReachInbox Automated Demonstration ===\n');

  // 1. Ensure a demo user exists with Ethereal credentials
  const email = 'demo@reachinbox.test';
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log('Creating demo user...');
    const testAccount = await nodemailer.createTestAccount();
    user = await prisma.user.create({
      data: {
        email,
        name: 'Demo User',
        etherealUser: testAccount.user,
        etherealPass: testAccount.pass,
      }
    });
    console.log(`Demo user created with Ethereal User: ${testAccount.user}`);
  } else {
    console.log(`Using existing demo user: ${user.email} (${user.etherealUser})`);
  }

  // Clear any existing rate limit key in Redis for this user to ensure clean run
  const currentHour = new Date().toISOString().substring(0, 13);
  const rateLimitKey = `rate_limit:${user.id}:${currentHour}`;
  await connection.del(rateLimitKey);
  console.log('Cleared existing Redis rate-limit counters for a clean demo run.');

  // 2. Schedule a Campaign
  // 6 recipients, 5 seconds delay between each, rate limit of 3 emails/hour
  console.log('\nScheduling campaign:');
  console.log('- 6 recipients');
  console.log('- 5 seconds delay between each email');
  console.log('- Hourly limit of 3 emails (triggers rate-limiting after 3rd send)');

  const campaign = await scheduleCampaign({
    userId: user.id,
    subject: 'Demo Campaign - Rate Limiting & Restart Test',
    body: '<p>This is a test email sent from the ReachInbox demo script.</p>',
    delayBetween: 5,
    hourlyLimit: 3,
    recipients: [
      'recipient1@reachinbox.test',
      'recipient2@reachinbox.test',
      'recipient3@reachinbox.test',
      'recipient4@reachinbox.test',
      'recipient5@reachinbox.test',
      'recipient6@reachinbox.test',
    ],
    startDate: new Date(),
  });

  console.log(`Campaign created successfully! Campaign ID: ${campaign.id}`);

  // 3. Monitor function to print current status
  const monitorStatus = async () => {
    const emails = await prisma.scheduledEmail.findMany({
      where: { campaignId: campaign.id },
      orderBy: { scheduledTime: 'asc' }
    });

    console.log(`\n--- Status at ${new Date().toLocaleTimeString()} ---`);
    emails.forEach((email, idx) => {
      console.log(
        `Recipient ${idx + 1}: ${email.recipientEmail.padEnd(28)} | ` +
        `Status: ${(email.status.toUpperCase()).padEnd(10)} | ` +
        `Sched Time: ${email.scheduledTime.toLocaleTimeString()} | ` +
        `Sent Time: ${email.sentTime ? email.sentTime.toLocaleTimeString() : 'N/A'} | ` +
        `Error: ${email.errorMessage || 'None'}`
      );
    });
  };

  // Monitor status every 3 seconds for 15 seconds
  for (let i = 0; i < 5; i++) {
    await monitorStatus();
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n==================================================');
  console.log('DEMO RUN PHASE 1 COMPLETE.');
  console.log('To test the Restart Scenario, run Phase 2 using the main execution workflow.');
  console.log('==================================================');
  
  // Close database/Redis connections so script exits cleanly
  await prisma.$disconnect();
  await connection.quit();
}

runDemo().catch(async (err) => {
  console.error('Error running demo:', err);
  await prisma.$disconnect();
  await connection.quit();
});
