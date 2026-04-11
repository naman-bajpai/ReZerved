/**
 * Notification Worker
 *
 * Standalone Node.js process that consumes jobs from the 'notifications'
 * BullMQ queue and delivers them via Twilio (SMS) or Meta Graph API (Instagram).
 *
 * Run with:
 *   npx ts-node --project tsconfig.server.json src/workers/notification-worker.ts
 * or (after build):
 *   node dist/workers/notification-worker.js
 *
 * Required env vars:
 *   REDIS_URL              — Redis connection string (default: redis://localhost:6379)
 *   TWILIO_ACCOUNT_SID     — Twilio credentials for SMS
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER
 *   META_PAGE_ACCESS_TOKEN — Meta Graph API token for Instagram
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY for read-only)
 */

import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import { sendMessage } from '../lib/server/notification-service';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Use service-role key so the worker can update booking_reminders
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const worker = new Worker(
  'notifications',
  async (job: Job) => {
    const { channel, to, message, meta } = job.data as {
      channel: string;
      to: string;
      message: string;
      meta: Record<string, unknown>;
    };

    console.log(`[notification-worker] job ${job.id}: ${channel} → ${to}`);
    await sendMessage(channel, to, message, {
      fromNumber: meta.fromNumber as string | undefined,
      pageAccessToken: (meta.pageAccessToken as string | undefined) ?? process.env.META_PAGE_ACCESS_TOKEN,
    });

    // Update reminder status to 'sent' if this job was for a reminder
    const { bookingId, reminderType } = meta as { bookingId?: string; reminderType?: string };
    if (bookingId && reminderType) {
      await supabase
        .from('booking_reminders')
        .update({ status: 'sent' })
        .eq('booking_id', bookingId)
        .eq('reminder_type', reminderType);
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`[notification-worker] job ${job.id} completed`);
});

worker.on('failed', async (job, err) => {
  console.error(`[notification-worker] job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);

  // Mark reminder as failed after all retries are exhausted
  if (job && job.attemptsMade >= (job.opts.attempts ?? 5)) {
    const { bookingId, reminderType } = (job.data.meta ?? {}) as {
      bookingId?: string;
      reminderType?: string;
    };
    if (bookingId && reminderType) {
      await supabase
        .from('booking_reminders')
        .update({ status: 'failed' })
        .eq('booking_id', bookingId)
        .eq('reminder_type', reminderType);
    }
  }
});

worker.on('error', (err) => {
  console.error('[notification-worker] worker error:', err);
});

console.log('[notification-worker] started — listening on queue: notifications');
console.log('[notification-worker] Redis:', process.env.REDIS_URL || 'redis://localhost:6379');

process.on('SIGTERM', async () => {
  console.log('[notification-worker] shutting down...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[notification-worker] shutting down...');
  await worker.close();
  process.exit(0);
});
