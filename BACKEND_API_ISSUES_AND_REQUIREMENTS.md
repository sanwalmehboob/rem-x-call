# RemXCall — Backend API Issues, Missing Endpoints & Requirements

**Date:** May 22, 2026
**From:** Mobile Team (Flutter / Android)
**For:** Backend Developer
**Postman Collection Reference:** `REM-X-CALL API v2.postman_collection.json` (exported 2026-05-18)
**Base URL (Staging):** `http://3.22.39.219:8080/v1`
**Mobile App Design (Figma):** [Call System — Owner Mobile](https://www.figma.com/design/o24y2ybjpqawp6axKbwLwc/Call-System?node-id=305-76750)

---

## How to read this document

- **MISSING API** — Endpoint does not exist in Postman v2; mobile is blocked until it is built.
- **IMPROVEMENT** — Endpoint exists but is missing fields, filters, or data the mobile UI needs.
- **DUMMY DATA NEEDED** — API exists but returns empty results; please seed sample rows so mobile can build/test models.
- **NEEDS CONFIRMATION** — Unclear behavior; please confirm how it should work.

Each section includes: what the mobile app needs, the expected request/response shape, and any notes.

---

## Table of Contents

1. [Subscription](#1-subscription)
2. [Home / Dashboard](#2-home--dashboard)
3. [Contacts](#3-contacts)
4. [Contact Details](#4-contact-details)
5. [Products](#5-products)
6. [Notifications](#6-notifications)
7. [Chat / Messages](#7-chat--messages)
8. [VoIP / Active Call](#8-voip--active-call)
9. [General / Cross-cutting](#9-general--cross-cutting)

---

## 1. Subscription

### 1A. IMPROVEMENT — `GET /subscriptions/current` is missing `price` field

**Current response** (verified on staging):

```json
{
  "planId": 1,
  "planName": "Pro",
  "status": "trial",
  "billingCycle": "monthly",
  "trialEndsAt": "2026-05-31T20:43:28.000Z",
  "discountPercent": "10.00",
  "features": {
    "dialerEnabled": true,
    "chatEnabled": true,
    "recordingEnabled": true,
    "whiteLabelEnabled": true
  }
}
```

**What's missing:** The response has no `price` / `priceMonthly` field. The mobile UI design shows a payment amount on the subscription card.

**Requested addition:**

```json
{
  "planId": 1,
  "planName": "Pro",
  "status": "trial",
  "billingCycle": "monthly",
  "trialEndsAt": "2026-05-31T20:43:28.000Z",
  "discountPercent": "10.00",
  "price": 49.00,
  "currentPeriodEnd": "2026-06-15T00:00:00Z",
  "features": { ... }
}
```

| New field | Type | Description |
|-----------|------|-------------|
| `price` | number | Plan price (monthly or yearly depending on `billingCycle`) |
| `currentPeriodEnd` | ISO 8601 string (nullable) | When the current billing period ends (for active plans, not just trial) |

---

### 1B. MISSING API — `GET /subscriptions/history`

**Purpose:** The mobile design has a **"Billing History"** section on the subscription screen. It shows previous plan changes, renewals, and billing events.

**Suggested endpoint:**

```
GET /v1/subscriptions/history?page=1&pageSize=20
```

**Expected response:**

```json
{
  "data": [
    {
      "id": 1,
      "planName": "Pro",
      "action": "subscribed",
      "billingCycle": "monthly",
      "price": 49.00,
      "date": "2026-04-15T00:00:00Z",
      "status": "paid"
    },
    {
      "id": 2,
      "planName": "Basic",
      "action": "upgraded",
      "billingCycle": "monthly",
      "price": 29.00,
      "date": "2026-03-01T00:00:00Z",
      "status": "paid"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "totalItems": 2
  }
}
```

| Field | Description |
|-------|-------------|
| `action` | `subscribed` / `renewed` / `upgraded` / `downgraded` / `cancelled` |
| `status` | `paid` / `pending` / `refunded` |

---

## 2. Home / Dashboard

### 2A. IMPROVEMENT — `GET /dashboard/stats` — need percentage change fields

**Existing Postman endpoint:**

```
GET /v1/dashboard/stats?period=30d
```

Description says: *"Returns totalCalls, followUps, and percentage changes for the requested period."*

**What mobile needs** (matching the UI design — see Figma Home screen):

```json
{
  "totalCalls": 1250,
  "totalCallsChangePercent": 12.5,
  "followUps": 200,
  "followUpsChangePercent": -3.2
}
```

| Field | Type | Description |
|-------|------|-------------|
| `totalCalls` | integer | Total calls in the period |
| `totalCallsChangePercent` | number | % change compared to previous period (positive = up, negative = down) |
| `followUps` | integer | Follow-ups due in the period |
| `followUpsChangePercent` | number | % change compared to previous period |

**DUMMY DATA NEEDED:** Please seed some sample data so these numbers are non-zero. The mobile UI shows "Total Calls" and "Follow-Ups" cards with up/down percentage arrows.

**Filter values used by mobile:** `30d`, `60d`, `90d`, `overall` (already in Postman query param).

---

### 2B. IMPROVEMENT — `GET /dashboard/follow-ups` — need contact image + name

**Existing Postman endpoint:**

```
GET /v1/dashboard/follow-ups?limit=10
```

Description says: *"Contacts needing follow-up based on call outcomes."*

**What mobile needs** (UI shows: count header + list of contact avatar + name):

```json
{
  "totalFollowUps": 200,
  "data": [
    {
      "contactId": 1,
      "contactName": "John Doe",
      "contactAvatarUrl": "http://3.22.39.219:8080/uploads/avatars/john.jpg",
      "phone": "+15556667777",
      "followUpDate": "2026-05-22T10:00:00Z",
      "lastCallDate": "2026-05-20T14:30:00Z"
    }
  ]
}
```

**DUMMY DATA NEEDED:** Please add some follow-up contacts so the list is not empty. The mobile UI shows "200 follow-ups — Today follow-ups with your customers are listed below" with each row showing customer image and name.

**NEEDS CONFIRMATION:** How do follow-ups work? Is it based on call outcome (e.g., "no answer" → auto follow-up), or does the agent manually set a follow-up date? Mobile just displays what the API returns.

---

### 2C. IMPROVEMENT — `GET /dashboard/recent-calls` — need call recording URL

**Existing Postman endpoint:**

```
GET /v1/dashboard/recent-calls?limit=5
```

Description says: *"Recent call activity with contact info, duration, and status."*

**What mobile needs** (UI shows recent call with play button for recording):

```json
{
  "data": [
    {
      "callId": 1,
      "contactId": 5,
      "contactName": "Jane Smith",
      "contactAvatarUrl": "http://...",
      "phone": "+15551234567",
      "duration": 245,
      "status": "answered",
      "direction": "outbound",
      "recordingUrl": "http://3.22.39.219:8080/uploads/recordings/call-123.mp3",
      "calledAt": "2026-05-22T15:30:00Z"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `duration` | integer | Call duration in seconds |
| `status` | string | `answered` / `missed` / `no_answer` / `failed` |
| `direction` | string | `inbound` / `outbound` |
| `recordingUrl` | string (nullable) | URL to the call recording audio file (the mobile UI has a play button to listen) |

**DUMMY DATA NEEDED:** Please seed some recent call records. The mobile UI shows "View Call Details" and a voice recording player.

**NEEDS CONFIRMATION:** The UI shows a "View Call Details" link on each recent call. Do we have a dedicated screen/API for viewing a single call's full details, or does the app just navigate to the contact details + call history? If no separate call detail screen is needed, we will remove that CTA from the UI.

---

### 2D. MISSING API — `GET /dashboard/product-overview`

**Purpose:** The Home screen has a **"Product Overview"** section with filtering (last 7d / 14d / 21d / 30d) showing:
- Total Products (count + % change)
- Sold Products (count + % change)

**Suggested endpoint:**

```
GET /v1/dashboard/product-overview?period=7d
```

**Expected response:**

```json
{
  "totalProducts": 150,
  "totalProductsChangePercent": 5.2,
  "soldProducts": 45,
  "soldProductsChangePercent": -2.1
}
```

**Filter values:** `7d`, `14d`, `21d`, `30d`

**Note:** This might alternatively be served by `GET /products/stats` with a `period` param — either approach works for mobile, as long as the fields above are returned.

---

## 3. Contacts

### 3A. IMPROVEMENT — `GET /contacts` — additional filter params needed

**Existing Postman endpoint:**

```
GET /v1/contacts?tab=unassigned&search=&page=1&pageSize=20
```

**Current `tab` values:** `unassigned` (and presumably `all`, `assigned`, etc.)

**Additional filters needed by mobile UI:**

| Filter param | Values | Description |
|-------------|--------|-------------|
| `callStatus` | `all`, `never_called`, `answered`, `missed`, `no_answer`, `failed` | Filter contacts by their last call outcome |
| `lastContacted` | `today`, `7d`, `30d` | Filter by when the contact was last called |

**Suggested approach:** Either add these as query params to the existing `GET /contacts` endpoint:

```
GET /v1/contacts?tab=all&search=&page=1&pageSize=20&callStatus=answered&lastContacted=7d
```

Or rename `tab` to accept these combined filter values. Up to backend preference — mobile will use whatever params are provided.

---

### 3B. DUMMY DATA NEEDED — `GET /contacts` and `GET /contacts/:contactId`

The contact list API exists but please ensure there are **sample contacts with realistic data** (name, phone, company, different statuses, some with call history) so mobile can build and test the list + detail models.

**`GET /contacts/:contactId`** is now in Postman v2 — please confirm it returns the full contact object (including any fields not in the list response like `email`, `notes`, `tags`, etc.).

---

## 4. Contact Details

### 4A. MISSING API — `GET /contacts/:contactId/overview`

**Purpose:** When you tap a contact, the detail screen shows an overview section with:
- Follow-up date (next scheduled follow-up)
- Attempts (total call attempts to this contact)
- Percentage change vs last month (up/down indicator)

**Suggested endpoint:**

```
GET /v1/contacts/:contactId/overview?period=30d
```

**Expected response:**

```json
{
  "contactId": 5,
  "followUpDate": "2026-05-25T10:00:00Z",
  "totalAttempts": 12,
  "attemptsChangePercent": 8.5,
  "lastCallDate": "2026-05-20T14:30:00Z",
  "lastCallStatus": "answered"
}
```

---

### 4B. DUMMY DATA NEEDED — `GET /contacts/:contactId/calls`

**Existing Postman endpoint:**

```
GET /v1/contacts/:contactId/calls?page=1&pageSize=20
```

**Please seed sample call history** for at least a few contacts. The mobile UI shows a full call history section with:
- Date/time of call
- Duration
- Status (answered/missed/no_answer/failed)
- Direction (inbound/outbound)
- Recording URL (if available)

**Expected response per call entry:**

```json
{
  "callId": 1,
  "contactId": 5,
  "duration": 180,
  "status": "answered",
  "direction": "outbound",
  "recordingUrl": "http://..../recording.mp3",
  "calledAt": "2026-05-20T14:30:00Z"
}
```

---

### 4C. MISSING API — `POST /contacts/:contactId/flag-fraud`

**Purpose:** The mobile app has a "Flag Fraud" bottom sheet where the agent enters a note and submits it.

**Suggested endpoint:**

```
POST /v1/contacts/:contactId/flag-fraud
```

**Request body:**

```json
{
  "note": "Customer used a stolen credit card number during the call."
}
```

**Expected response:**

```json
{
  "id": 1,
  "contactId": 5,
  "note": "...",
  "flaggedAt": "2026-05-22T10:00:00Z",
  "status": "pending_review"
}
```

---

### 4D. MISSING API — `POST /contacts/:contactId/dispute`

**Purpose:** The mobile app has a "Raise a Dispute" bottom sheet with a dispute type dropdown and description field.

**Suggested endpoint:**

```
POST /v1/contacts/:contactId/dispute
```

**Request body:**

```json
{
  "disputeType": "incorrect_billing",
  "description": "Customer was charged twice for the same service."
}
```

**NEEDS CONFIRMATION:** What are the allowed dispute types? The mobile UI has a dropdown. Currently using placeholders: `Incorrect Billing`, `Service Not Provided`, `Other`. Please provide the real list, or provide a `GET /dispute-types` endpoint.

**Expected response:**

```json
{
  "id": 1,
  "contactId": 5,
  "disputeType": "incorrect_billing",
  "description": "...",
  "status": "pending_review",
  "createdAt": "2026-05-22T10:00:00Z"
}
```

---

### 4E. NEEDS CONFIRMATION — Call recording playback

The mobile UI for both **Recent Call Activity** (Home) and **Contact Call History** (Contact Details) shows a play button to listen to call recordings.

**Questions:**
1. Are call recordings stored as audio files (MP3/WAV) accessible via URL?
2. Does the recording URL come from `GET /dashboard/recent-calls` and `GET /contacts/:contactId/calls`?
3. Does playback need auth headers (Bearer token), or are recording URLs public/pre-signed?

---

## 5. Products

### 5A. EXISTING APIs — `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`

These are in Postman v2 and appear functional. Good.

### 5B. MISSING API — `GET /products/stats`

**Purpose:** The Products screen has an overview section at the top showing:
- Total Products (count + % change)
- Sold Products (count + % change)
- Filter: last 30d / 60d / 90d

**Suggested endpoint:**

```
GET /v1/products/stats?period=30d
```

**Expected response:**

```json
{
  "totalProducts": 150,
  "totalProductsChangePercent": 5.2,
  "soldProducts": 45,
  "soldProductsChangePercent": -2.1
}
```

**Filter values:** `30d`, `60d`, `90d`

---

### 5C. MISSING API — `GET /products/out-of-stock`

**Purpose:** The Products screen has an "Out of Stock" section showing products with `qty = 0` (or below a threshold).

**Suggested endpoint:**

```
GET /v1/products/out-of-stock?page=1&pageSize=20
```

**Expected response:** Same shape as `GET /products` but filtered to out-of-stock items only.

```json
{
  "data": [
    {
      "id": 3,
      "name": "Basic Headset",
      "image": "http://...",
      "category": "Electronics",
      "qty": 0,
      "price": 25.00,
      "status": "out_of_stock"
    }
  ],
  "pagination": { ... }
}
```

---

### 5D. DUMMY DATA NEEDED — Products

Please seed **sample products** (at least 10-15) with realistic names, images, categories, prices, and quantities — including some with `qty: 0` for out-of-stock testing. This helps mobile build and verify the product list, grid, and detail UIs.

---

## 6. Notifications

### 6A. MISSING API — `POST /notifications/fcm-token` (Register FCM Token)

**Purpose:** After login, the mobile app sends its Firebase Cloud Messaging token to the backend so push notifications can be delivered.

**Suggested endpoint:**

```
POST /v1/notifications/fcm-token
```

**Request body:**

```json
{
  "token": "fcm-device-token-string...",
  "platform": "android",
  "deviceId": "android-device-001"
}
```

**Expected response:** `200 OK` or `201 Created`

---

### 6B. MISSING API — `DELETE /notifications/fcm-token` (Unregister on Logout)

**Purpose:** When the user logs out, the mobile app should unregister the FCM token so they stop receiving push notifications.

**Suggested endpoint:**

```
DELETE /v1/notifications/fcm-token
```

**Request body:**

```json
{
  "token": "fcm-device-token-string..."
}
```

---

### 6C. MISSING API — `GET /notifications` (List Notifications)

**Purpose:** The mobile app has a Notifications screen with filter tabs: **All**, **Unread**, **Archived** (or similar).

**Suggested endpoint:**

```
GET /v1/notifications?filter=all&page=1&pageSize=20
```

**Filter values:** `all`, `unread`, `read`, `archived`

**Expected response:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "New call from John Doe",
      "body": "Missed call at 3:30 PM",
      "type": "missed_call",
      "isRead": false,
      "isArchived": false,
      "contactId": 5,
      "createdAt": "2026-05-22T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "totalItems": 5
  },
  "unreadCount": 3
}
```

| Field | Description |
|-------|-------------|
| `type` | `missed_call` / `follow_up_reminder` / `new_message` / `system` / etc. |
| `contactId` | Nullable — for navigation to contact details on tap |
| `unreadCount` | Total unread across all filters (for badge) |

---

### 6D. MISSING API — `PATCH /notifications/:id/read` (Mark as Read)

```
PATCH /v1/notifications/:id/read
```

No body needed. Returns `200 OK`.

---

### 6E. MISSING API — `PATCH /notifications/:id/archive` (Archive Notification)

```
PATCH /v1/notifications/:id/archive
```

No body needed. Returns `200 OK`.

---

### 6F. MISSING API — `POST /notifications/read-all` (Mark All as Read)

```
POST /v1/notifications/read-all
```

No body needed. Returns `200 OK` with `{ "markedCount": 5 }`.

---

### 6G. NEEDS CONFIRMATION — Real-time notifications

**Question:** Will push notifications be sent via **FCM only** (backend pushes to device token), or is there also a **WebSocket / SSE** channel for real-time in-app notification updates?

**Mobile preference:** FCM for push + periodic `GET /notifications` polling is simplest. WebSocket can be added later if real-time badge updates are needed while the app is in the foreground.

---

## 7. Chat / Messages

### Important context: Agent ↔ Admin chat only

The mobile app is for **agents only** (not admins). In the chat feature:
- **Agent chats with Admin only** (1-to-1 conversation with the admin of their company)
- **Admin chats with all agents** (from the web dashboard — not the mobile app)
- There is **no agent-to-agent** or **agent-to-contact** chat

So from the mobile app's perspective, the agent opens the chat tab and sees their single conversation thread with the admin. The existing message APIs should work, but we need to confirm they are scoped correctly for the agent role.

### 7A. EXISTING APIs (Postman v2)

These endpoints exist in the collection:

| Method | Endpoint | Postman label | Agent use? |
|--------|----------|---------------|------------|
| `GET` | `/messages/conversations` | "List Conversations **(Admin)**" | **Needs agent version** — see 7B |
| `GET` | `/messages/unread-count` | OK | Yes — agent's unread count |
| `GET` | `/messages/peer?companyId=` | OK | Yes — get admin peer info |
| `GET` | `/messages?companyId=&page=&pageSize=` | OK | Yes — load chat messages |
| `POST` | `/messages` | OK | Yes — agent sends message to admin |
| `POST` | `/messages/read` | OK | Yes — mark messages as read |
| `PATCH` | `/messages/:messageId/status` | OK | Yes — update message status |
| `POST` | `/messages/upload` | OK | Yes — upload attachment |

### 7B. NEEDS CONFIRMATION — What does `GET /messages/peer?companyId=` return?

The mobile app needs to display the **admin's name and avatar** on received messages (left side of the chat). The agent's own name/avatar we already have from `ProfileProvider`.

**Question:** What exactly does `GET /messages/peer?companyId=` return? We need at minimum:

```json
{
  "peerId": 1,
  "peerName": "ACME Corp",
  "peerAvatarUrl": "http://3.22.39.219:8080/uploads/avatars/admin.jpg"
}
```

If this endpoint doesn't return the admin's avatar, please add it — the chat UI shows the admin's image next to every received message.

---

### 7C. IMPROVEMENT — Agent needs a conversation endpoint (or the existing one should work for agents too)

`GET /messages/conversations` is labelled **"List Conversations (Admin)"** in Postman.

**What agent mobile needs:** When the agent opens the Chat tab, we need to know their `companyId` to call `GET /messages?companyId=`. Options:

**Option A:** The same `GET /messages/conversations` endpoint returns only the agent's own conversation when called with an agent Bearer token (backend auto-filters by role). This is simplest.

**Option B:** The agent already knows their `companyId` from `GET /auth/me` response → mobile uses that directly to call `GET /messages?companyId=` without needing a conversations list at all (since the agent has only one conversation).

**Please confirm which approach works**, or if we need a new endpoint.

---

### 7D. NEEDS CONFIRMATION — What does each message object look like?

The mobile app needs to determine: **who sent each message** (agent or admin) to render it on the correct side.

**Expected message object from `GET /messages?companyId=&page=&pageSize=`:**

```json
{
  "id": 1,
  "companyId": 5,
  "content": "Give me some data on erp system",
  "attachmentUrl": null,
  "attachmentOriginalName": null,
  "status": "sent",
  "createdAt": "2026-05-22T11:20:00Z",
  "sender": {
    "id": 3,
    "name": "Christine Willson",
    "avatarUrl": "http://..."
  }
}
```

**Key question:** Does each message have a `sender.id`? Mobile compares `sender.id` with the logged-in user's `id` (from `GET /auth/me`) to decide `isMe` (right side) vs admin message (left side). If the field is named differently (e.g. `senderId`, `userId`, `fromUserId`), please let us know.

---

### 7E. NEEDS CONFIRMATION — Real-time message delivery

**Question:** How does the agent receive new messages from admin in real-time?

| Approach | Description | Status |
|----------|-------------|--------|
| **WebSocket** | Persistent connection — server pushes new messages instantly | Is this available or planned? If so, please share the WS endpoint URL and event format |
| **FCM Push + REST** | Backend sends FCM notification on new message → app calls `GET /messages` to refresh | Works with existing APIs; near real-time; low battery usage |
| **Polling** | Mobile calls `GET /messages` every 3-5 seconds while chat is open | Simplest but least efficient |

**Mobile preference:** WebSocket is best for chat UX. If not available now, **FCM push + REST** is a good MVP approach (backend sends push notification when admin sends a message, mobile refreshes the chat). Plain polling is the fallback.

**Please confirm which approach the backend supports or plans to support.**

---

### 7F. DUMMY DATA NEEDED — Chat Messages

Please seed **sample messages between an agent and their admin** (at least 5-10 messages, including one with an attachment) so mobile can build the chat model parser and test the UI.

The mobile chat UI shows per message:
- Message text (or attachment)
- Sender avatar (agent avatar on right, admin avatar on left)
- Timestamp
- Sender label ("You" for agent, company/admin name for admin)

---

## 8. VoIP / Active Call

### 8A. NEEDS CONFIRMATION — VoIP approach

**Question:** What is the plan for VoIP? Options:
- **Twilio** (SDK integration)
- **Vonage** (SDK integration)
- **Custom WebRTC** (SIP/SRTP)
- **Other third-party service**

The mobile app has a full **Active Call screen** with: mute, hold, record, keypad, speaker, end call buttons. Once the VoIP provider is decided, we can integrate the SDK.

**APIs we expect to need eventually:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/calls/initiate` | Start a call (returns session/token for VoIP SDK) |
| `POST` | `/calls/:sessionId/end` | End a call |
| `GET` | `/calls/:callId/recording` | Get recording URL after call ends |

This is **not blocking** current work. Just flagging for planning.

---

## 9. General / Cross-cutting

### 9A. IMPROVEMENT — Media URL port issue

**Issue:** Upload and branding APIs return URLs like `http://3.22.39.219/uploads/...` (port 80), but files are actually served on **port 8080** (`http://3.22.39.219:8080/uploads/...`). Port 80 returns nginx HTML, not the file.

**Request:** Either:
- Return **relative paths** (`/uploads/...`) and let the client prepend the API base, OR
- Return **full URLs with the correct port** (`http://3.22.39.219:8080/uploads/...`)

Mobile has a workaround, but fixing this server-side prevents issues for other clients (web dashboard, etc.).

---

### 9B. IMPROVEMENT — Consistent pagination shape

Some endpoints seem to use flat arrays, others may use paginated wrappers. A consistent pagination envelope helps mobile build reusable parsers:

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

Or at minimum, include `totalItems` / `totalPages` so mobile knows when to stop paginating.

---

### 9C. IMPROVEMENT — Tag/label APIs by role in Postman collection

**Request:** Please add **tags or folder labels** to each API in the Postman collection indicating which role uses it:

| Tag | Meaning |
|-----|---------|
| `[Agent]` | Used by the mobile agent app |
| `[Admin]` | Used by the web admin dashboard only |
| `[Both]` | Used by both agent and admin |

Currently, endpoints like `GET /messages/conversations` are labelled "(Admin)" but it's unclear whether agents can also call them. Other endpoints have no role indicator at all.

**Suggested approach:** Either:
- Add a prefix to each API name: e.g. `[Agent] List Products`, `[Admin] List Companies`, `[Agent] Get Current Subscription`
- Or organize into separate Postman folders: `Agent APIs` / `Admin APIs` / `Shared APIs`

This makes it much easier for the mobile team to identify which endpoints to integrate without reading through admin-only APIs.

---

### 9D. IMPROVEMENT — Dispute types endpoint or documentation

The "Raise a Dispute" UI has a dropdown for dispute type. Currently hardcoded: `Incorrect Billing`, `Service Not Provided`, `Other`.

**Options:**
1. Provide a `GET /dispute-types` endpoint (most flexible), OR
2. Document the fixed list of dispute type values that `POST /contacts/:contactId/dispute` accepts

---

## Summary — Priority Order

| Priority | Item | Type |
|----------|------|------|
| **HIGH** | Add `price` to `GET /subscriptions/current` | IMPROVEMENT |
| **HIGH** | Create `GET /subscriptions/history` | MISSING API |
| **HIGH** | Seed dummy data for dashboard stats, follow-ups, recent calls | DUMMY DATA |
| **HIGH** | Seed dummy data for contacts + call history | DUMMY DATA |
| **HIGH** | Create `GET /products/stats` | MISSING API |
| **HIGH** | Create `GET /products/out-of-stock` | MISSING API |
| **HIGH** | Seed dummy data for products | DUMMY DATA |
| **HIGH** | Create all notification APIs (6A–6F) | MISSING API |
| **MEDIUM** | Create `GET /contacts/:contactId/overview` | MISSING API |
| **MEDIUM** | Create `POST /contacts/:contactId/flag-fraud` | MISSING API |
| **MEDIUM** | Create `POST /contacts/:contactId/dispute` | MISSING API |
| **MEDIUM** | Add `callStatus` + `lastContacted` filters to `GET /contacts` | IMPROVEMENT |
| **MEDIUM** | Create `GET /dashboard/product-overview` | MISSING API |
| **MEDIUM** | Confirm dispute types list | NEEDS CONFIRMATION |
| **MEDIUM** | Confirm what `GET /messages/peer` returns — need admin name + avatar (7B) | NEEDS CONFIRMATION |
| **MEDIUM** | Confirm agent conversation loading approach (7C) | NEEDS CONFIRMATION |
| **MEDIUM** | Confirm message object shape — need `sender.id` for isMe logic (7D) | NEEDS CONFIRMATION |
| **MEDIUM** | Real-time chat: WebSocket vs FCM push vs polling? (7E) | NEEDS CONFIRMATION |
| **MEDIUM** | Seed sample chat messages between agent and admin (7F) | DUMMY DATA |
| **MEDIUM** | Tag all Postman APIs by role: `[Agent]` / `[Admin]` / `[Both]` (9C) | IMPROVEMENT |
| **LOW** | Fix media URL port (9A) | IMPROVEMENT |
| **LOW** | Consistent pagination envelope (9B) | IMPROVEMENT |
| **LOW** | VoIP provider decision (8A) | NEEDS CONFIRMATION |
| **LOW** | Real-time notification mechanism (6G) | NEEDS CONFIRMATION |
| **LOW** | Call recording playback confirmation (4E) | NEEDS CONFIRMATION |

---

**Figma Design Reference:** [Call System — Owner Mobile](https://www.figma.com/design/o24y2ybjpqawp6axKbwLwc/Call-System?node-id=305-76750)

Please review the Figma link above for any UI-related confusion about what data is displayed and where.

---

*Document created: May 22, 2026*
