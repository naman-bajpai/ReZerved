# Rezerve — Business Plan & Pitch Deck

This document summarizes the **business plan** and maps it to **pitch deck slides** so you can align narrative, metrics, and fundraising materials.

---

## Executive summary

**Rezerve** is an AI-assisted booking layer for independent service businesses (nails, lashes, hair, aesthetics, and similar). It turns inbound messages (Instagram DMs, SMS, web) into **confirmed appointments** with **real availability**, **pricing**, **deposits**, and **reminders**—so owners stop losing revenue to slow replies and no-shows.

**Ask (optional):** [e.g. seed round, amount, use of funds — fill in when fundraising.]

---

## Business plan highlights

### 1. Problem

- Service pros lose bookings when DMs and texts pile up during appointments.
- Manual back-and-forth on price, duration, and slots burns time and drops conversion.
- No-shows and late cancellations hurt margin; deposits and reminders are inconsistent.
- Generic booking links don’t match how clients actually discover and message businesses today.

### 2. Solution

- **Conversational booking** that answers in the business’s voice with guardrails (approval rules, thresholds).
- **Calendar-aware** slot offers tied to real services and duration.
- **Deposits + reminders** automated in the flow.
- **Shareable booking link** for bio and campaigns; returning clients can manage bookings with email verification.
- **Creator dashboard** for bookings, clients, analytics, and booking link management.

### 3. Target customer (ICP)

- **Primary:** Solo artists and small studios (1–10 providers) with high Instagram / SMS volume.
- **Secondary:** Multi-location studios standardizing intake across channels.
- **Geography:** Start English-first markets with strong Instagram commerce behavior (e.g. US metros); expand from proof.

### 4. Market & opportunity

- Large TAM in local services + beauty; wedge is **message-to-paid-booking** for independents underserved by heavy salon software.
- **SAM/SOM:** [Insert your narrowed segments and year-1 geography — replace placeholder.]

### 5. Product & differentiation

| Theme | Rezerve angle |
|--------|----------------|
| **Channel** | Meets clients where they already message (DM, text, web). |
| **Intelligence** | AI for speed and consistency; human-in-the-loop where configured. |
| **Revenue protection** | Deposits, reminders, and optional upsells at the right moment. |
| **Trust** | Business controls rules; audit trail in dashboard. |

### 6. Business model

- **Primary:** SaaS subscription per business / seat (tier by volume, channels, AI usage).
- **Secondary:** Take rate on payments processed via integrated checkout (if applicable to your stack).
- **Add-ons:** Priority support, multi-location, white-label link, API / integrations.

*[Fill in: price points, annual vs monthly, trial length.]*

### 7. Go-to-market

- **Organic:** Booking link in bio; case studies with before/after reply time and booking rate.
- **Partnerships:** Educators, supplier brands, influencer stylists as referrers.
- **Paid:** Narrow geo + profession keywords; retargeting site visitors.
- **Community:** Discord / creator groups where booking pain is loud.

### 8. Traction & milestones

*[Replace with your real numbers: MRR, businesses live, bookings/month, payment volume, NPS, churn.]*

| Milestone | Target date | Status |
|-----------|-------------|--------|
| [e.g. 50 paying businesses] | | |
| [e.g. $X MRR] | | |
| [e.g. Stripe / channel GA] | | |

### 9. Team

*[Founders, key hires, advisors — one line each.]*

### 10. Financial snapshot

- **Use of funds:** Product (core booking + reliability), GTM, support, compliance basics.
- **18–24 month view:** Revenue, burn, runway — *[attach spreadsheet or summarize here when ready].*

### 11. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Platform dependency (Meta, etc.) | Multi-channel from day one; own the booking link and email identity. |
| AI trust / brand voice | Approvals, logs, and clear “AI handled” UX where needed. |
| Payments & disputes | Clear policies, Stripe-native flows, transparent receipts. |

---

## Pitch deck — slide-by-slide highlights

Use **one idea per slide**; these bullets are what investors should remember after each slide.

### Slide 1 — Title

- **Company:** Rezerve  
- **Tagline:** AI booking for service pros — from DM to deposit without the inbox tax.  
- **Contact:** [name, email, link]

### Slide 2 — Hook / vision

- Service businesses run on **messages**; the calendar should catch every one.  
- Vision: **default infrastructure** for “message → paid booking” for independents.

### Slide 3 — Problem

- Bookings die in the DM stack.  
- Owners are **on the floor**, not on their phone.  
- Tools built for chains don’t match **solo workflow** or **social discovery**.

### Slide 4 — Solution (product)

- AI layer that **quotes, schedules, collects deposit, reminds**—in brand voice with **guardrails**.  
- **Shareable link** + dashboard for humans to review and override.

### Slide 5 — How it works (simple flow)

1. Client messages or opens link.  
2. Verify / identify client.  
3. Pick service → real slot → pay → confirm.  
4. Show up in **Bookings** and **Clients** for the business.

### Slide 6 — Product demo / screenshots

- Conversation + confirmation card; booking link page; dashboard bookings list.  
- Caption: **speed + control**.

### Slide 7 — Why now

- **Social commerce** normalized DM as storefront.  
- **Payments + identity** (email/OTP, cards) are table stakes.  
- **LLMs** make reliable structured extraction possible with oversight.

### Slide 8 — Market

- TAM / SAM / SOM with **wedge** clearly labeled (beauty & personal services first).  
- Expand adjacent verticals with same motion: **high-touch, appointment-based, message-led**.

### Slide 9 — Business model

- Subscription + [payment/usage if any].  
- **Land:** booking link. **Expand:** more channels, seats, locations.

### Slide 10 — Traction

- Logos or quotes; **core metrics** (bookings facilitated, GMV, activation, retention).  
- Short **before/after** story (reply time, conversion).

### Slide 11 — Go-to-market

- Channels that match ICP: Instagram-native pros, educators, partnerships.  
- **CAC assumptions** and what you’re testing this quarter.

### Slide 12 — Competition

- 2×2: **message-native vs form-native** × **solo-friendly vs enterprise**.  
- Rezerve owns **message-first + AI + deposits** for independents.

### Slide 13 — Moat (early)

- Workflow depth (calendar + payments + reminders in one loop).  
- Data on **what converts** per vertical; prompt + policy library.  
- Brand trust through **transparent AI + human override**.

### Slide 14 — Team

- Why this team wins: domain, distribution, or technical depth.  
- Key hires next.

### Slide 15 — Roadmap (12–18 months)

- Reliability, integrations, multi-location, analytics depth.  
- **One bold bet** (e.g. waitlist refill, cross-channel identity).

### Slide 16 — The ask

- Round, amount, **use of funds** (%, bullets).  
- Runway target and milestones unlocked by this capital.

### Slide 17 — Appendix pointer

- Detailed financials, cohort charts, tech architecture, security — **appendix only**.

---

## Current product gaps (vs. vision)

Use this as a **build roadmap** and to keep pitch language aligned with what actually ships. Status reflects the codebase as of the last doc update.

### Not built or not wired end-to-end

| Area | Gap |
|------|-----|
| **Automated reminders** | Helpers exist (`buildReminderMessage`, `enqueueNotification`), but **nothing enqueues reminder jobs** when a booking is confirmed. The “two reminders” story is **not live** yet. |
| **Background jobs** | BullMQ **queues** are defined (e.g. notifications, slot-filler), but there is **no in-repo worker process** consuming them. Without a deployed worker, **queued work may never run**. |
| **Conversations inbox** | The dashboard **Conversations** UI is **not connected to live data** (list starts empty; no API-backed thread loading). |
| **Settings → backend** | **Only** business name (and timezone via API) persist. **AI tone**, **auto-confirm**, **upsell**, **slot-fill** toggles, **SMS/Instagram** switches, and **notification** toggles are **UI state only**—they do not change server behavior today. |
| **Booking slug in Settings** | The slug field is **not bound** to saved data (placeholder / non-functional for editing the real slug). |
| **Human-in-the-loop approvals** | No **review queue** or “approve before AI sends” flow in the product—pitch guardrails are **aspirational** until built. |
| **Website chat widget** | No **embeddable widget** flow for arbitrary sites (marketing mentions channels; public path is mainly **`/book/[slug]`** + messaging webhooks). |
| **WhatsApp** | Explicitly **“coming soon”** in Settings; **not implemented**. |
| **Standalone `/book` chat** | The generic chat page uses **the first business in the database**, not a tenant-specific slug—**not** equivalent to a white-label “your business only” assistant. |
| **Account / compliance** | **Delete account** is a **non-wired** button; no self-serve data export evident in-app. |
| **Multi-location & roles** | No clear **multi-studio** or **staff RBAC** in the current app surface—single-business creator model. |

### Partially implemented (real, but incomplete)

| Area | Reality |
|------|--------|
| **Instagram / SMS automation** | **Webhook handlers** and **AI agent** paths exist for messaging flows, but **dashboard toggles don’t configure** them; behavior depends on env + Meta/Twilio setup, not Settings. |
| **Deposits** | **Stripe checkout** on the **guest `/book/[slug]`** path is a real flow; not all “deposit everywhere / every channel” scenarios are unified in one UX. |
| **Slot-fill** | **Queue enqueue** on cancel exists in the booking engine; **effectiveness depends on a worker** + downstream logic being deployed. |
| **Upsells** | Logic appears in **webhook** paths; not guaranteed for **all** booking creation paths or configurable from Settings. |

### Pitch / landing page alignment

If the homepage or deck promises **automatic multi-reminder sequences**, **full inbox management in-app**, **one-click channel toggles**, or **approval workflows**, call those **roadmap** until the rows above are closed.

---

## How to use this doc

- **Business plan:** Expand each numbered section into prose or a Notion/Google Doc; add real numbers as you ship.  
- **Pitch deck:** One slide per section above; keep body text to **3–5 bullets max** per slide.  
- **Sync:** When metrics change, update Slide 10 and the traction table in the plan in the same pass.

---

*Last updated: fill date when you revise. Replace all `[bracketed]` placeholders with your actual figures and names.*
