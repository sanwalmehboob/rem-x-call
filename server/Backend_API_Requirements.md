# RemXCall — Backend API Requirements

**From:** Mobile App Developer  
**To:** Backend Developer  
**Date:** May 15, 2026  
**Subject:** Missing APIs for Mobile App Integration

---

## Overview

I've reviewed the `REM-X-CALL API v1` Postman collection and `APIs_Documentation.md`. The current backend covers authentication, contacts, messaging, and branding — but several features required by the mobile app are **missing or incomplete**.

This document lists all the APIs needed to complete the mobile app integration.

---

## ✅ APIs That Are Ready (No Action Needed)

These are available and I can start integrating:

| Feature | Endpoints | Status |
|---------|-----------|--------|
| Login | `POST /auth/login` | ✅ Ready |
| Logout | `POST /auth/logout`, `POST /auth/logout-all` | ✅ Ready |
| Token Refresh | `POST /auth/refresh-tokens` | ✅ Ready |
| Get Profile | `GET /auth/me` | ✅ Ready |
| Update Profile | `PATCH /auth/me` | ✅ Ready |
| Upload Avatar | `POST /auth/me/avatar` | ✅ Ready |
| Sessions | `GET /auth/sessions`, `DELETE /auth/sessions/:sid` | ✅ Ready |
| Contacts List | `GET /contacts` | ✅ Ready |
| Contact CRUD | `POST`, `PATCH`, `DELETE /contacts/:id` | ✅ Ready |
| Contact Assign | `POST /contacts/:id/assign`, `/unassign` | ✅ Ready |
| Call Logs | `GET /contacts/call-logs` | ✅ Ready |
| Messages | `GET /messages`, `POST /messages` | ✅ Ready |
| Chat Attachments | `POST /messages/upload` | ✅ Ready |
| Unread Count | `GET /messages/unread-count` | ✅ Ready |
| Mark Read | `POST /messages/read` | ✅ Ready |
| Branding | `GET /companies/my-branding`, `PATCH /companies/my-branding` | ✅ Ready |
| Logo Upload | `POST /companies/upload-logo` | ✅ Ready |
| Subscription Plans | `GET /subscription-plans` | ✅ Ready |
| Health Check | `GET /health` | ✅ Ready |

---

## ❌ APIs That Are MISSING (Action Required)

### 1. Password Reset / Forgot Password Flow

**Priority:** 🔴 CRITICAL — Blocks password recovery

The mobile app has a complete forgot password flow (email → OTP → new password). I need:

| Method | Endpoint | Request Body | Description |
|--------|----------|--------------|-------------|
| `POST` | `/auth/forgot-password` | `{ "email": "user@example.com" }` | Send 6-digit OTP to user's email |
| `POST` | `/auth/verify-otp` | `{ "email": "...", "otp": "123456" }` | Verify OTP, return `resetToken` |
| `POST` | `/auth/reset-password` | `{ "resetToken": "...", "newPassword": "..." }` | Change password using reset token |

**Expected OTP Flow:**
1. User enters email → `POST /auth/forgot-password` → backend sends OTP email
2. User enters 6-digit code → `POST /auth/verify-otp` → returns `resetToken`
3. User enters new password → `POST /auth/reset-password` → password changed

---

### 2. Dashboard / Home Screen APIs

**Priority:** 🔴 HIGH — Home screen will be empty without this

| Method | Endpoint | Query Params | Description |
|--------|----------|--------------|-------------|
| `GET` | `/dashboard/stats` | `period` (30d/60d/90d/overall) | Returns `totalCalls`, `followUps`, `percentageChange` |
| `GET` | `/dashboard/recent-calls` | `limit` (default 5) | Recent call activity with contact info, duration, status, date |
| `GET` | `/dashboard/follow-ups` | `limit` (default 10) | List of contacts needing follow-up (name, avatar) |

**Example response for `/dashboard/stats`:**
```json
{
  "totalCalls": 1240,
  "totalCallsChange": 30.2,
  "followUps": 200,
  "followUpsChange": -12.5,
  "period": "30d"
}
```

---

### 3. Contact Details APIs

**Priority:** 🟡 MEDIUM — Contact detail screen needs dedicated endpoints

| Method | Endpoint | Query Params | Description |
|--------|----------|--------------|-------------|
| `GET` | `/contacts/:id` | — | Single contact with full details |
| `GET` | `/contacts/:id/overview` | `period` | Attempts count, follow-up date for this contact |
| `GET` | `/contacts/:id/calls` | `page`, `pageSize` | Paginated call history for this contact |
| `POST` | `/contacts/:id/flag-fraud` | — | Body: `{ "notes": "..." }` — Flag as fraud |
| `POST` | `/contacts/:id/dispute` | — | Body: `{ "type": "...", "description": "..." }` — Raise dispute |
| `POST` | `/contacts/:id/block` | — | Block the contact |
| `DELETE` | `/contacts/:id/block` | — | Unblock the contact |

**Note:** The existing `GET /contacts` returns a list. I need `GET /contacts/:id` for single contact detail, OR confirm if I should filter client-side.

---

### 4. Products Feature

**Priority:** 🟡 MEDIUM — Entire Products tab needs this

| Method | Endpoint | Query/Body | Description |
|--------|----------|------------|-------------|
| `GET` | `/products` | `search`, `page`, `pageSize`, `availability` | Paginated product list |
| `GET` | `/products/:id` | — | Single product with gallery, stats |
| `POST` | `/products` | Body: name, category, quantity, price, description | Create product |
| `PUT` | `/products/:id` | Body: any updatable fields | Update product |
| `DELETE` | `/products/:id` | — | Delete product |
| `POST` | `/products/:id/images` | multipart `file` | Upload product gallery images |
| `GET` | `/products/stats` | `period` | Total products, sold, out-of-stock counts |
| `GET` | `/products/out-of-stock` | `limit` | List of out-of-stock products (thumbnail, name) |
| `GET` | `/products/categories` | — | List of available categories |

---

### 5. Notifications Feature

**Priority:** 🟡 MEDIUM — Notifications screen + push notifications

#### 5.1 Notification List APIs

| Method | Endpoint | Query Params | Description |
|--------|----------|--------------|-------------|
| `GET` | `/notifications` | `filter` (all/unread/archived), `page`, `pageSize` | Paginated notification list |
| `PATCH` | `/notifications/:id/read` | — | Mark single notification as read |
| `PATCH` | `/notifications/:id/archive` | — | Archive single notification |
| `POST` | `/notifications/read-all` | — | Mark all notifications as read |

**Example notification object:**
```json
{
  "id": 1,
  "title": "New message from John",
  "subtitle": "Hey, are you available for a call?",
  "avatarUrl": "https://...",
  "isRead": false,
  "isArchived": false,
  "createdAt": "2026-05-15T10:30:00Z"
}
```

#### 5.2 FCM Push Token APIs

The mobile app will provide an FCM (Firebase Cloud Messaging) token. The backend needs to store it and use it to send push notifications.

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/notifications/fcm-token` | `{ "token": "fcm_device_token_here", "platform": "android" }` | Register FCM token for push notifications |
| `DELETE` | `/notifications/fcm-token` | `{ "token": "fcm_device_token_here" }` | Remove FCM token (on logout or token refresh) |

**Flow:**
1. App gets FCM token from Firebase SDK
2. App calls `POST /notifications/fcm-token` after login
3. Backend stores token linked to user
4. Backend sends push notifications to this token
5. On logout, app calls `DELETE /notifications/fcm-token`

---

### 6. VoIP / Calling APIs

**Priority:** 🟡 MEDIUM — Active Call screen

**Question:** Is VoIP being handled by a third-party service (Twilio, Vonage, etc.) or custom backend? I need to know:
- What SDK/service to integrate in the mobile app
- What credentials/tokens are needed

If custom backend, I need:

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/calls/initiate` | `{ "contactId": 123 }` | Start call, return session ID + SIP/WebRTC credentials |
| `POST` | `/calls/:sessionId/end` | — | End active call |
| `POST` | `/calls/:sessionId/mute` | `{ "muted": true/false }` | Toggle mute |
| `POST` | `/calls/:sessionId/record` | `{ "recording": true/false }` | Toggle recording |
| `GET` | `/calls/:sessionId/status` | — | Get current call state |
| `GET` | `/calls/:callId/recording` | — | Get recording URL for playback |

---

### 7. Subscription Status for Agent/User

**Priority:** 🟡 MEDIUM — Profile > Subscription Plan screen

The agent needs to see their own subscription status. Currently `GET /subscription-plans` lists available plans, but there's no way for a user to see **their own** active subscription.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subscriptions/current` | Returns the user's active subscription (plan name, status, expiry, features enabled) |

**Example response:**
```json
{
  "planId": 2,
  "planName": "Pro",
  "status": "active",
  "billingCycle": "monthly",
  "currentPeriodEnd": "2026-06-15T00:00:00Z",
  "features": {
    "dialerEnabled": true,
    "chatEnabled": true,
    "recordingEnabled": true,
    "whiteLabelEnabled": true
  }
}
```

#### ⚠️ Question: Subscription Billing

**How will subscription payments be handled?**

| Option | Description | What I Need |
|--------|-------------|-------------|
| **A. App Store / Play Store** | Users subscribe via Apple/Google in-app purchases | Receipt validation API: `POST /subscriptions/verify-receipt` |
| **B. Stripe / Direct Payment** | Users pay via Stripe, Google Pay, etc. in the app | Stripe integration APIs (create payment intent, confirm, etc.) |
| **C. Admin-managed** | Admin assigns subscriptions via dashboard (no user payment flow) | Just `GET /subscriptions/current` is enough |

Please confirm which approach so I can plan the integration.

---

### 8. Real-time Chat (WebSocket)

**Priority:** 🟢 LOW (can use polling initially)

For real-time message delivery without polling:

| Protocol | Endpoint | Description |
|----------|----------|-------------|
| WebSocket | `wss://api.example.com/ws/chat` | Real-time message delivery |

**Events needed:**
- `message:new` — new message received
- `message:status` — message status update (delivered, read)
- `typing:start` / `typing:stop` — typing indicators

If WebSocket isn't planned, I can use polling on `GET /messages` as a fallback.

---

## Summary: Priority List

| Priority | Feature | APIs Needed |
|----------|---------|-------------|
| 🔴 CRITICAL | Password Reset | 3 endpoints |
| 🔴 HIGH | Dashboard Stats | 3 endpoints |
| 🟡 MEDIUM | Contact Details | 7 endpoints |
| 🟡 MEDIUM | Products | 9 endpoints |
| 🟡 MEDIUM | Notifications | 6 endpoints (including FCM) |
| 🟡 MEDIUM | VoIP/Calling | 6 endpoints (or third-party SDK info) |
| 🟡 MEDIUM | Subscription Status | 1-2 endpoints |
| 🟢 LOW | WebSocket | 1 connection |

---

## Questions for Backend Developer

1. **Password Reset:** Can you implement the OTP flow? What's the timeline?

2. **Products:** Is the Products feature in scope for this backend? If not, should I remove it from the app?

3. **VoIP:** What service are we using for calling? Twilio? Vonage? Custom? I need SDK details.

4. **Subscriptions:** How are payments handled? (App stores / Stripe / Admin-managed)

5. **WebSocket:** Is real-time chat planned? Or should I use polling?

6. **Single Contact:** Does `GET /contacts` return enough detail, or should I use a separate `GET /contacts/:id`?

7. **Timeline:** Which APIs can be ready first so I can start integration?

---

## Contact

If you have questions about any of these requirements, let me know. I can provide more details on expected request/response formats, error handling, or UI flows.

---

*Document generated from mobile app requirements analysis.*
