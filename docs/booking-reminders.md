# Booking Reminders

Automated reminder notifications are sent to clients **24 hours** and **2 hours** before their confirmed appointment.

---

## How it works

1. **Trigger** — Any confirmation path (Stripe webhook, guest confirm, SMS/Instagram "YES", manual admin PATCH) calls `scheduleBookingReminders(bookingId)`.
2. **Channel resolution** — The scheduler checks `source_channel` on the booking, then falls back to whatever contact info the client has on record (`phone` → SMS, `instagram_id` → Instagram DM). Web-only clients with no phone or Instagram are skipped gracefully.
3. **Idempotency** — Each `(booking_id, reminder_type)` pair has a unique row in `booking_reminders`. Calling the scheduler twice never double-enqueues.
4. **Delayed BullMQ jobs** — Both reminders are enqueued immediately with a `delay` calculated from `starts_at`. BullMQ holds them in Redis until the fire time.
5. **Delivery** — The notification worker processes the job, calls Twilio or the Meta Graph API, and updates `booking_reminders.status` to `sent`.

---

## Environment variables

Add to `.env.local`:

```bash
# Redis (required for background jobs)
REDIS_URL=redis://localhost:6379       # default; change for production

# Twilio (SMS channel)
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Meta (Instagram channel)
META_PAGE_ACCESS_TOKEN=xxxx

# Supabase (for the worker process)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx         # preferred; allows worker to write booking_reminders
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx  # fallback if service role is unavailable
```

If `REDIS_URL` is missing or Redis is unreachable, the scheduler logs a clear warning in dev and never crashes the booking confirmation flow.

---

## Running the worker (development)

Install `ts-node` once if you don't have it:

```bash
npm install -D ts-node dotenv
```

Start the worker in a separate terminal:

```bash
npx ts-node --project tsconfig.server.json src/workers/notification-worker.ts
```

Or add a script to `package.json`:

```json
"scripts": {
  "worker": "ts-node --project tsconfig.server.json src/workers/notification-worker.ts"
}
```

Then run:

```bash
npm run worker
```

---

## Running the worker (production)

Build once, then run the compiled output:

```bash
npx tsc -p tsconfig.server.json
node dist/workers/notification-worker.js
```

For cloud deployments, run the worker as a separate process/container alongside your Next.js app. It reads the same env vars. A simple `Procfile` example:

```
web:    npm start
worker: node dist/workers/notification-worker.js
```

---

## Database migration

Apply before deploying:

```bash
psql "$DATABASE_URL" -f migrations/003_booking_reminders.sql
```

Or paste the contents into the Supabase SQL editor.

---

## Configuring reminder offsets

Offsets are defined as a constant in `src/lib/server/reminder-scheduler.ts`:

```ts
const REMINDER_OFFSETS_HOURS = [24, 2] as const;
```

Change the values there to adjust timing. Per-business JSON config can be added later by reading from `businesses.reminder_offsets_hours` and substituting the constant.

---

## Monitoring

Check `booking_reminders` to see the status of each scheduled reminder:

```sql
SELECT b.id, b.starts_at, r.reminder_type, r.status, r.scheduled_for, r.bullmq_job_id
FROM   booking_reminders r
JOIN   bookings b ON b.id = r.booking_id
ORDER  BY r.created_at DESC
LIMIT  50;
```

Possible statuses: `scheduled` → `sent` (success) or `failed` (all retries exhausted).
