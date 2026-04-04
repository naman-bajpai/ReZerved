/**
 * Thin wrapper so the webhook route can enqueue messages without importing
 * the full queue module (which creates a Redis connection at import time).
 */

import { Queue } from 'bullmq';
import IORedis from 'ioredis';

let connection: IORedis | null = null;

function getConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }
  return connection;
}

export async function enqueueMessage(
  conversationId: string,
  messageId: string | null | undefined,
  channel: string
) {
  const q = new Queue('message-processing', { connection: getConnection() });
  await q.add(
    'process-message',
    { conversationId, messageId, channel },
    { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100, removeOnFail: 200 }
  );
}
