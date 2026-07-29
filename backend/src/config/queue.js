"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
exports.emailQueue = new bullmq_1.Queue('email-queue', {
    connection: redis_1.connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000, // 1s, 2s, 4s
        },
        removeOnComplete: true,
    },
});
//# sourceMappingURL=queue.js.map