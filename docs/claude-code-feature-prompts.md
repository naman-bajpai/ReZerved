# Claude Code prompts — not live / not wired features

Copy each block below into **Claude Code** as a single task. Adjust scope if you want smaller PRs.

**Repo context:** Next.js App Router, Supabase, Better Auth, BullMQ (`src/lib/server/queue.ts`), Stripe on guest booking, AI in `src/lib/server/ai-agent.ts` and `/api/chat`.

---

## 1. Automated reminders

```text
Implement automated booking reminders for confirmed (and optionally pending-paid) appointments.

Context: src/lib/server/notification-service.ts has buildReminderMessage(); src/lib/server/queue.ts has enqueueNotification(). Nothing currently schedules reminders when a booking is confirmed.

Requirements:
- On booking transition to confirmed (or after successful Stripe webhook if that’s when status becomes confirmed), enqueue two notifications: e.g. 24h before and 2h before starts_at (configurable constants or per-business JSON later).
- Use existing enqueueNotification(channel, to, message, meta) — determine recipient from client phone / Instagram id based on booking source_channel or conversation.
- Add idempotency: don’t double-schedule if booking is updated; use a small reminders table or job id keyed by booking_id + reminder_type.
- If Redis/BullMQ is unavailable, log clearly in dev; document env vars.

Deliver: code paths, minimal migration if needed, and a short note in docs or README on running the worker (see prompt #2).
```

---

## 2. Background job worker (BullMQ consumer)

```text
Add a runnable worker process that consumes BullMQ queues defined in src/lib/server/queue.ts (notifications, slot-filler, and any others).

Requirements:
- New entry point e.g. scripts/worker.ts or src/worker/index.ts runnable via npm script "worker": "tsx scripts/worker.ts" (or node after build).
- Workers must call the same handlers the app expects: send notifications (reuse notification-service sendMessage / email paths), execute slot-filler jobs.
- Share Redis connection config with makeQueue() — single source of truth for connection options.
- Graceful shutdown on SIGTERM.
- Document in README: REDIS_URL, how to run worker alongside next dev.

Do not change queue names without updating all producers.
```

---

## 3. Conversations inbox (live data)

```text
Wire the dashboard Conversations page (src/app/(app)/conversations/page.tsx) to real API data.

Requirements:
- Add GET API route(s) under /api/conversations (with withBusiness) listing conversations for the authenticated business with pagination, filters (unread/pending), and last message preview.
- Add route to fetch messages for one conversation id; enforce business_id scoping on every query.
- Replace empty useState([]) with React Query or fetch + useEffect; loading and error states.
- Sending a reply from the UI should POST a message and optionally trigger channel send if you have outbound plumbing — if outbound isn’t ready, persist assistant message and document “send” as phase 2.

Match existing Supabase schema for conversations/messages tables; if columns differ, add a minimal migration.
```

---

## 4. Settings persisted to backend

```text
Persist Settings page toggles and AI options to the database and enforce them in server logic.

Current: src/app/(app)/settings/page.tsx only saves business name (and timezone via PATCH /api/settings). AI tone, auto-confirm, upsell, slot-fill, SMS/Instagram, notification toggles are local state only.

Requirements:
- Extend businesses table (or new business_settings JSONB) with fields: ai_tone, auto_confirm_bookings, upsell_enabled, slot_fill_enabled, sms_enabled, instagram_enabled, notify_new_booking, notify_cancel, notify_upsell (names can vary).
- Extend PATCH /api/settings (or POST /api/settings/preferences) to read/write these fields with validation.
- Load values in Settings page on mount from getMe() or new endpoint.
- Wire server paths: e.g. disable Instagram webhook auto-reply when instagram_enabled is false; respect auto_confirm in Twilio/Instagram flows where bookings are confirmed; respect upsell_enabled before sending upsell messages.

Keep backward compatibility: defaults for existing rows.
```

---

## 5. Booking slug editable in Settings

```text
Fix the booking slug field on Settings: it must display the current slug from getMe() and allow updating it safely.

Requirements:
- Bind the slug input to me.business.slug; load on mount.
- Add PATCH /api/creator/slug or extend existing /api/creator/slug to support UPDATE (not only POST create) with validation: lowercase, alphanumeric + hyphens, length limits, uniqueness check against businesses.slug.
- Show inline validation errors and success state.
- After change, show updated public URL /book/{slug}.

Do not break existing POST generate flow for businesses without a slug.
```

---

## 6. Human-in-the-loop (approve before AI sends)

```text
Add an optional human approval queue for outbound AI replies on messaging channels (Instagram/SMS).

Requirements:
- When a policy flag requires approval (new column on businesses or business_settings), processMessage should not call sendMessage directly; instead insert a pending_outbound_messages row (or reuse messages with status pending_approval).
- Dashboard: new section or Conversations UI shows pending AI drafts; Approve sends via existing channel; Reject discards or asks for edit.
- Audit: who approved, when.

Start minimal: one channel, one business flag require_ai_approval default false.
```

---

## 7. Website chat widget (embed)

```text
Add an embeddable booking/chat widget for third-party sites.

Requirements:
- Lightweight script or iframe embed that points to a public route e.g. /embed/{slug} with narrow layout (no app chrome).
- CORS and frame ancestors: allow configurable allowed_origins on business or env for MVP.
- Optional: postMessage to parent for height resize.
- Document embed snippet for creators to paste in Squarespace/Webflow.

Reuse guest auth + booking flow where possible; avoid loading full dashboard assets in embed.
```

---

## 8. WhatsApp integration

```text
Implement WhatsApp as a messaging channel (Twilio WhatsApp API or Meta Cloud API — pick one and document).

Requirements:
- Webhook route analogous to src/app/api/webhooks/twilio/route.ts or instagram for inbound messages.
- Map webhook sender to clients + conversations; reuse ai-agent processMessage where possible.
- Outbound send path in notification-service or parallel helper.
- Settings: replace “Soon” with toggle wired to business_settings.whatsapp_enabled (after prompt #4 schema exists).
- Env vars documented.

Phase 1 can be inbound-only echo + handoff to booking flow.
```

---

## 9. Standalone /book chat — tenant-scoped

```text
Fix src/app/book/page.tsx (standalone chat) to be tenant-aware instead of using the first business in /api/chat.

Requirements:
- Either redirect /book to /book/[slug] with instructions, or accept ?slug= query and scope all tool calls to that business’s services and availability.
- Remove “first business from supabase limit 1” anti-pattern from src/app/api/chat/route.ts; require business id or slug and validate.
- Align session handling with guest flow if needed, or keep anonymous session but always scoped to one business.

Acceptance: two businesses in DB get correct services and slots from the correct business only.
```

---

## 10. Delete account + data export (compliance)

```text
Implement self-serve account deletion and optional data export for creators.

Requirements:
- Wire Settings “Delete account” to a flow: confirm modal, type business name, call DELETE /api/account or POST /api/account/delete-request.
- Server: soft-delete or hard-delete profile + business according to policy; cancel Stripe subscriptions if any; anonymize or delete related bookings/clients per legal choice (document behavior).
- Add GET /api/account/export returning JSON zip or single JSON of business data the user owns (GDPR-style export).

Use withBusiness/withAuth; admin override separate if needed.
```

---

## 11. Multi-location and staff roles (RBAC)

```text
Introduce multi-location studios and staff roles without breaking single-owner businesses.

Requirements:
- Schema: locations table linked to business; optional location_id on bookings/services availability; staff_users or profiles with role enum (owner, staff, readonly).
- Auth: enforce business_id + role on API routes; staff cannot delete business.
- UI: location switcher in app shell; filter bookings by location.

Phase 1: roles only (owner vs staff) on single location; Phase 2: multiple locations.

Migration must set default location for existing businesses.
```

---

## How to use in Claude Code

1. Paste **one** prompt per session or branch to keep diffs reviewable.  
2. After each feature, update `docs/business-plan-and-pitch-deck.md` → **Current product gaps** to mark items shipped.  
3. Run `npm run build` and fix type errors before merging.

---

*Generated for Rezerve / bookedup codebase. Extend prompts if your deployment uses different infra (e.g. Inngest instead of BullMQ).*
