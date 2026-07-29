import prisma from './config/db';
import { connection } from './config/redis';

async function checkStatus() {
  const latestCampaign = await prisma.campaign.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { scheduledEmails: { orderBy: { scheduledTime: 'asc' } } }
  });

  if (!latestCampaign) {
    console.log('No campaigns found.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Campaign ID: ${latestCampaign.id}`);
  console.log(`Subject: ${latestCampaign.subject}`);
  console.log(`Hourly Limit: ${latestCampaign.hourlyLimit}`);
  console.log(`Delay Between: ${latestCampaign.delayBetween}s`);
  console.log(`Created At: ${latestCampaign.createdAt.toLocaleTimeString()}`);
  console.log('\nEmails Status:');
  latestCampaign.scheduledEmails.forEach((email, idx) => {
    console.log(
      `Recipient ${idx + 1}: ${email.recipientEmail.padEnd(28)} | ` +
      `Status: ${(email.status.toUpperCase()).padEnd(10)} | ` +
      `Sched Time: ${email.scheduledTime.toLocaleTimeString()} | ` +
      `Sent Time: ${email.sentTime ? email.sentTime.toLocaleTimeString() : 'N/A'} | ` +
      `Error: ${email.errorMessage || 'None'}`
    );
  });

  await prisma.$disconnect();
}

checkStatus().catch(err => {
  console.error(err);
});
