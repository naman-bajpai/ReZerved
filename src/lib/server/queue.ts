/**
 * BullMQ queue client for Next.js API routes.
 * Only used to ENQUEUE jobs — the worker process consumes them.
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

function makeQueue(name: string) {
  return new Queue(name, { connection: getConnection() });
}

export async function enqueueSlotFiller(
  businessId: string,
  bookingId: string | null,
  startsAt: string,
  endsAt: string | null
) {
  const q = makeQueue('slot-filler');
  await q.add(
    'fill-slot',
    { businessId, bookingId, startsAt, endsAt },
    { attempts: 2, backoff: { type: 'fixed', delay: 5000 }, removeOnComplete: 50 }
  );
}

/**
 * Enqueue a notification job.
 * @param delayMs  Optional delay in milliseconds (for scheduled reminders).
 * @returns        BullMQ job id, or null if the queue is unreachable.
 */
export async function enqueueNotification(
  channel: string,
  to: string,
  message: string,
  meta: Record<string, unknown> = {},
  delayMs = 0
): Promise<string | null> {
  const q = makeQueue('notifications');
  const job = await q.add(
    'send-notification',
    { channel, to, message, meta },
    {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 200,
      ...(delayMs > 0 ? { delay: delayMs } : {}),
    }
  );
  return job.id ?? null;
}
