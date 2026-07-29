import prisma from './config/db';
import { scheduleCampaign } from './services/scheduler';
import nodemailer from 'nodemailer';
import { connection } from './config/redis';

async function runDemo() {
  console.log('=== ReachInbox Restart Scenario Demo ===\n');

  const email = 'demo@reachinbox.test';
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const testAccount = await nodemailer.createTestAccount();
    user = await prisma.user.create({
      data: {
        email,
        name: 'Demo User',
        etherealUser: testAccount.user,
        etherealPass: testAccount.pass,
      }
    });
  }

  // Clear rate limits
  const currentHour = new Date().toISOString().substring(0, 13);
  const rateLimitKey = `rate_limit:${user.id}:${currentHour}`;
  await connection.del(rateLimitKey);

  console.log('Scheduling campaign with 4 emails (10s delay between each)...');

  const campaign = await scheduleCampaign({
    userId: user.id,
    subject: 'Restart Scenario Campaign',
    body: '<p>Testing server restarts.</p>',
    delayBetween: 10,
    hourlyLimit: 100, // No rate limiting for this test
    recipients: [
      'restart1@reachinbox.test',
      'restart2@reachinbox.test',
      'restart3@reachinbox.test',
      'restart4@reachinbox.test',
    ],
    startDate: new Date(),
  });

  console.log(`Campaign created! ID: ${campaign.id}`);
  console.log('Instructions:');
  console.log('1. Wait for Email 1 to send.');
  console.log('2. Stop the backend service immediately.');
  console.log('3. Wait 15 seconds.');
  console.log('4. Start the backend service again.');
  console.log('5. Check status to see that Email 2, 3, 4 still send successfully.');

  await prisma.$disconnect();
  await connection.quit();
}

runDemo().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  await connection.quit();
});
