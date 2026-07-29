import { Queue } from 'bullmq';
import { connection } from './redis';

export const emailQueue = new Queue('email-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s, 2s, 4s
    },
    removeOnComplete: true,
  },
});
