# Meta (Instagram) wiring — step-by-step

This guide matches **this codebase**: webhook at `GET|POST /api/webhooks/instagram`, `businesses.instagram_page_id`, and env vars `META_VERIFY_TOKEN` + `META_PAGE_ACCESS_TOKEN`.

---

## What you are wiring

| Piece | Purpose |
|--------|---------|
| **Webhook** | Meta sends inbound DMs → your server stores messages and enqueues AI processing. |
| **Verify token** | Meta `GET` challenge; must equal `META_VERIFY_TOKEN`. |
| **Page access token** | Used to **send** DMs (`graph.facebook.com/.../me/messages`) and fetch IG user `name`. |
| **`instagram_page_id`** | In Supabase `businesses`, must equal the **Page ID** Meta puts in webhook `entry.id` (see below). |

**Important:** Outbound sends use **`me/messages`** with a **Page** token — “me” is the Facebook Page linked to the Instagram account.

---

## Prerequisites

1. **Instagram account** in **Professional** mode (Business or Creator).
2. A **Facebook Page** linked to that Instagram account (**Settings → Instagram → Connect account** on the Page, or from IG app).
3. You are an **admin** of the Meta app and the Page.
4. **Public HTTPS URL** for webhooks (production domain or ngrok/Cloudflare Tunnel for dev).

---

## Step 1 — Create a Meta app

1. Go to [developers.facebook.com](https://developers.facebook.com/) → **My Apps** → **Create App**.
2. Choose a use case that allows **Instagram** and **Messenger** (e.g. **Business** type apps often use “Connect with customers” / messaging).
3. Note the **App ID** and **App Secret** (Settings → Basic).

You do **not** need the App Secret for the webhook verify flow in this repo, but you need it if you exchange codes for long-lived tokens via OAuth later.

---

## Step 2 — Add products and permissions

1. In the app dashboard, add **Instagram** (Instagram API / Instagram messaging features as offered by the dashboard).
2. Add **Messenger** if the dashboard requires it for Page messaging (Meta’s UI changes; messaging for IG DMs is often tied to the **Page**).

### Permissions / features to aim for

For **receiving** and **sending** Instagram DMs via the Graph API, your token typically needs (exact names vary by Meta version):

- `instagram_basic`
- `instagram_manage_messages` (often **Advanced Access** / App Review for production)
- `pages_show_list`
- `pages_messaging` (Page → send/receive)
- `pages_read_engagement` (sometimes required for webhook setup)

**Development:** You can test with roles (**App roles → Instagram testers / Developers**) on a Page/IG you control.

**Production:** Submit **App Review** for `instagram_manage_messages` and any restricted permissions Meta lists for your app type.

---

## Step 3 — Connect Instagram to the Facebook Page

1. Open **Meta Business Suite** or **Facebook Page settings**.
2. Ensure the **Instagram account** is connected to the **Facebook Page** you will use for messaging.
3. In **Instagram app settings** on the phone/desktop, confirm the account is **Professional** and messaging is allowed for customers.

---

## Step 4 — Get the Page ID

Your webhook handler loads the business with:

```ts
.eq('instagram_page_id', pageId) // pageId = entry.id from webhook
```

So you need the numeric **Facebook Page ID** (same ID Meta sends as `entry.id` for Page/Instagram messaging payloads).

**Ways to get it:**

- **Graph API Explorer:** `GET /me/accounts` with a User token that has `pages_show_list` → find the Page → `id`.
- Or Page **About** section / Page info tools (depending on UI).

Put that value in Supabase:

```sql
UPDATE businesses
SET instagram_page_id = 'YOUR_PAGE_ID_AS_STRING'
WHERE id = 'your-business-uuid';
```

Repeat per business if you run multi-tenant with **different** Pages (see **Multi-business note** below).

---

## Step 5 — Create a Page access token

Short version:

1. **Graph API Explorer** (developers.facebook.com/tools/explorer): select your app, add permissions above, **Generate access token** as a user who manages the Page.
2. Exchange for a **Page** token:  
   `GET /{page-id}?fields=access_token&access_token={user-short-lived-token}`  
   or use the Explorer’s “Page access token” picker for that Page.

For **production**, use a **long-lived** Page token or a **System User** token (Business Manager) so it does not expire in hours.

**Store in env:**

```env
META_PAGE_ACCESS_TOKEN=your_page_access_token_here
```

This repo uses **one** global `META_PAGE_ACCESS_TOKEN` in `notification-service.ts` and `instagram/route.ts`. That fits **one** Instagram/Page per deployment. Multiple businesses with **different** Pages require **per-business tokens** in the database (not implemented in current code).

---

## Step 6 — Set the webhook verify token

Pick a long random string (not guessable).

```env
META_VERIFY_TOKEN=your_random_verify_secret
```

Same value must be entered in the Meta **Webhook** configuration (see Step 7).

---

## Step 7 — Configure the webhook in Meta

1. In the app, open **Webhooks** (under Instagram and/or Messenger, depending on product layout).
2. **Callback URL:**  
   `https://YOUR_DOMAIN/api/webhooks/instagram`
3. **Verify token:** exact match to `META_VERIFY_TOKEN`.
4. Subscribe to fields that deliver **messaging** events (e.g. **messages**). Meta’s checklist may show `message`, `messaging_postbacks`, etc. — enable what your integration needs; inbound DMs require the messaging subscription for the **Page**.

5. Click **Verify and save**. Meta will call:

   `GET /api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...`

   Your app returns `hub.challenge` when the token matches (`src/app/api/webhooks/instagram/route.ts`).

---

## Step 8 — Deploy and environment

On your host (Vercel, etc.):

| Variable | Required | Notes |
|----------|----------|--------|
| `META_VERIFY_TOKEN` | Yes | Webhook verification. |
| `META_PAGE_ACCESS_TOKEN` | Yes | Send DMs + optional profile name fetch. |
| `REDIS_URL` | Yes for AI replies | See Step 9. |
| `OPENAI_API_KEY` | Yes for AI replies | Used by message processor. |
| `DATABASE_URL` / Supabase | Yes | `businesses`, `clients`, `conversations`, `messages`. |

Ensure **no** middleware blocks `/api/webhooks/instagram` for `GET` and `POST` without session cookies.

---

## Step 9 — Redis and the message worker (critical)

Inbound webhooks call:

`enqueueMessage(conversationId, messageId, 'instagram')` → BullMQ queue **`message-processing`**, job **`process-message`**.

There is **no in-repo consumer** for that queue documented in the main app. **Without a worker**, DMs will be stored but **AI will not reply**.

You must either:

1. **Run a worker** that subscribes to `message-processing` and calls the same logic as your Twilio/Instagram processing (e.g. `processMessage` from `ai-agent.ts`), **or**
2. **Refactor** to call `processMessage` directly from the webhook (trade-off: longer webhook response vs Meta timeouts — current code avoids this by queuing).

Until a worker exists, treat **Meta wiring as “receive-only + manual DB”** for messages, not full auto-reply.

---

## Step 10 — Test end-to-end

1. **Verify webhook:** Meta dashboard shows “Verified”; or curl:  
   `curl "https://YOUR_DOMAIN/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"`  
   → response body should be `test123`.

2. **Send a DM** from a test Instagram account (allowed as tester/developer) to the connected business IG.

3. **Check Supabase:** new row in `messages`, `conversations` updated, client upserted with `instagram_id`.

4. **Check worker logs:** job processed; assistant reply sent via Graph API.

5. **Confirmation flow:** If the AI sends copy that matches `isConfirmationMessage` in `ai-agent.ts`, user replying with that pattern triggers `handleInstagramConfirmation` (confirm pending booking, send confirmation text, optional upsell).

---

## Multi-business vs single Page token

| Setup | What to do |
|--------|------------|
| **One IG / one Page / one product** | One `META_PAGE_ACCESS_TOKEN`, one `instagram_page_id` row. |
| **SaaS: many businesses, many Pages** | Extend schema: store **encrypted** `page_access_token` per `businesses` row; pass token into `sendInstagramDM` instead of env; Meta app still one app with many Pages subscribed or separate webhook subscriptions per Page (Meta allows one callback URL with multiple subscriptions). |

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Webhook verify **403** | `META_VERIFY_TOKEN` mismatch or wrong callback URL. |
| Webhook **200** but no DB rows | `instagram_page_id` on `businesses` ≠ `entry.id` from payload; or subscription fields wrong. |
| Inbound saved, **no reply** | Worker not running or Redis down; or `OPENAI_API_KEY` missing. |
| Send fails **400/403** | Token missing permissions, expired token, or wrong token type (User token instead of Page). |
| **App not live** | Development mode: only testers; production needs review + switch app to Live. |

Use **Meta Webhook debugging** (Recent deliveries) to inspect JSON and response codes.

---

## Graph API version

This repo uses **v19.0** in URLs (`notification-service.ts`, `instagram/route.ts`). If Meta deprecates it, bump version strings consistently and retest send + profile fetch.

---

## Optional: Facebook login vs messaging

`FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` in `src/lib/auth.ts` are for **Better Auth user sign-in with Facebook**, not for Page messaging tokens. Keep messaging tokens separate.

---

## Quick checklist

- [ ] IG Professional + linked Facebook Page  
- [ ] Meta app created + Instagram/Messenger products  
- [ ] Permissions scoped; App Review for production  
- [ ] `instagram_page_id` set on correct `businesses` row  
- [ ] `META_VERIFY_TOKEN` + `META_PAGE_ACCESS_TOKEN` in env  
- [ ] Webhook URL `/api/webhooks/instagram` verified  
- [ ] `REDIS_URL` + **worker** for `message-processing` queue  
- [ ] Test DM → DB → AI reply → optional confirmation flow  

---

*Last updated for Rezerve/bookedup codebase. Meta’s developer UI and permission names change; always confirm in the current Meta documentation.*
