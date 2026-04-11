-- Migration: booking_reminders
-- Stores a record per (booking, reminder_type) for idempotency and status tracking.
-- The worker updates `status` to 'sent' or 'failed' after delivery.

CREATE TABLE IF NOT EXISTS booking_reminders (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reminder_type   TEXT        NOT NULL CHECK (reminder_type IN ('24h', '2h')),
  status          TEXT        NOT NULL DEFAULT 'scheduled'
                              CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
  scheduled_for   TIMESTAMPTZ NOT NULL,
  bullmq_job_id   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS booking_reminders_booking_id_idx    ON booking_reminders (booking_id);
CREATE INDEX IF NOT EXISTS booking_reminders_scheduled_for_idx ON booking_reminders (scheduled_for);
