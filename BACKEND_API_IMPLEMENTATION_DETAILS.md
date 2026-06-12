# RemXCall — Backend API & Integration Specifications

This document outlines all new endpoints, query parameters, payload shapes, and general standards implemented in the RemXCall Backend to address the mobile application developer requirements. 

---

## 1. General & Cross-cutting Standards

### A. Bearer Authentication
All endpoints (except registration, login, and password resets) require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_access_token>
```

### B. Consistent Pagination Envelope
All listing endpoints use a standardized wrapper:
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

### C. Media URL Resolution
All file fields (profile images, company logo, contact avatars, recordings, attachments) are served as absolute URLs. The backend dynamically resolves the host and appends the listening port (e.g. `8080` on staging) if it is missing from the Host header (behind reverse proxies):
* **Example:** `http://3.22.39.219:8080/uploads/avatars/avatar.jpg`

---

## 2. Subscription Endpoints

### 2A. `GET /v1/subscriptions/current`
Returns active subscription details of the logged-in agent's company.

* **Method:** `GET`
* **Route:** `/v1/subscriptions/current`
* **Response Payload (200 OK):**
```json
{
  "planId": 1,
  "planName": "Pro",
  "status": "active",
  "billingCycle": "monthly",
  "trialEndsAt": "2026-06-16T16:41:12.000Z",
  "discountPercent": "10.00",
  "price": 49.00,
  "currentPeriodEnd": "2026-06-16T16:41:12.000Z",
  "features": {
    "dialerEnabled": true,
    "chatEnabled": true,
    "recordingEnabled": true,
    "whiteLabelEnabled": true
  }
}
```

### 2B. `GET /v1/subscriptions/history`
Returns paginated billing history records for the user's company.

* **Method:** `GET`
* **Route:** `/v1/subscriptions/history?page=1&pageSize=20`
* **Response Payload (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "planName": "Pro",
      "action": "subscribed",
      "billingCycle": "monthly",
      "price": 49.00,
      "date": "2026-05-02T16:41:12.000Z",
      "status": "PAID"
    },
    {
      "id": 2,
      "planName": "Basic",
      "action": "upgraded",
      "billingCycle": "monthly",
      "price": 29.00,
      "date": "2026-04-02T16:41:12.000Z",
      "status": "PAID"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

---

## 3. Home / Dashboard Endpoints

### 3A. `GET /v1/dashboard/stats`
Returns call stats along with the percentage changes compared to the previous period.

* **Method:** `GET`
* **Route:** `/v1/dashboard/stats?period=30d`
* **Query Params:**
  - `period`: `30d`, `60d`, `90d`, `overall` (default is `30d`)
* **Response Payload (200 OK):**
```json
{
  "totalCalls": 1250,
  "totalCallsChangePercent": 12.5,
  "totalCallsChange": 12.5,
  "followUps": 200,
  "followUpsChangePercent": -3.2,
  "followUpsChange": -3.2,
  "agents": {
    "total": 5,
    "active": 2
  },
  "subscriptions": {
    "total": 1,
    "active": 1
  },
  "contacts": {
    "total": 7,
    "active": 6
  },
  "period": "30d"
}
```

### 3B. `GET /v1/dashboard/recent-calls`
Returns recent outbound/inbound call activity with call recordings.

* **Method:** `GET`
* **Route:** `/v1/dashboard/recent-calls?limit=5`
* **Response Payload (200 OK):**
```json
{
  "recentCalls": [
    {
      "callId": 1,
      "id": 1,
      "contactId": 5,
      "contactName": "Jane Smith",
      "contactAvatarUrl": "http://localhost:5000/uploads/avatars/jane.jpg",
      "phone": "+15551234567",
      "duration": 245,
      "durationSeconds": 245,
      "status": "completed",
      "direction": "outbound",
      "recordingUrl": "http://localhost:5000/uploads/recordings/call-jane.mp3",
      "calledAt": "2026-05-30T16:41:12.000Z",
      "contact": {
        "id": 5,
        "fullName": "Jane Smith",
        "phone": "+15551234567",
        "avatarUrl": "http://localhost:5000/uploads/avatars/jane.jpg"
      }
    }
  ],
  "data": [ ... ]
}
```

### 3C. `GET /v1/dashboard/follow-ups`
Returns contacts that need follow-ups based on their call status or date.

* **Method:** `GET`
* **Route:** `/v1/dashboard/follow-ups?page=1&pageSize=10`
* **Response Payload (200 OK):**
```json
{
  "totalFollowUps": 3,
  "data": [
    {
      "contactId": 1,
      "contactName": "John Doe",
      "contactAvatarUrl": "http://localhost:5000/uploads/avatars/john.jpg",
      "phone": "+15556667777",
      "followUpDate": "2026-06-02T16:41:12.000Z",
      "lastCallDate": "2026-05-31T16:41:12.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 3,
    "totalPages": 1
  }
}
```

### 3D. `GET /v1/dashboard/product-overview`
Returns product counts and sold statistics.

* **Method:** `GET`
* **Route:** `/v1/dashboard/product-overview?period=30d`
* **Query Params:**
  - `period`: `7d`, `14d`, `21d`, `30d`, `60d`, `90d`, `overall` (default: `30d`)
* **Response Payload (200 OK):**
```json
{
  "totalProducts": 10,
  "totalProductsChangePercent": 233.3,
  "soldProducts": 1675,
  "soldProductsChangePercent": 500.0
}
```

---

## 4. Contacts Endpoints

### 4A. `GET /v1/contacts` (Includes Filters)
Returns list of contacts. Enables subquery-based filtering of latest call status and contact dates.

* **Method:** `GET`
* **Route:** `/v1/contacts?tab=all&callStatus=answered&lastContacted=7d&page=1&pageSize=20`
* **Query Params:**
  - `tab`: `all`, `assigned`, `unassigned`
  - `callStatus`: `all`, `never_called`, `answered`, `missed`, `no_answer`, `failed`
  - `lastContacted`: `today`, `7d`, `30d`
* **Response Payload (200 OK):**
```json
{
  "contacts": [
    {
      "id": 11,
      "fullName": "John Doe",
      "phone": "+15556667777",
      "companyName": "Acme Corp",
      "status": "active",
      "assignedAgentId": 17,
      "avatarUrl": "http://localhost:5000/uploads/avatars/john.jpg",
      "followUpDate": "2026-06-02T16:41:12.000Z",
      "createdAt": "2026-06-01T16:41:12.000Z",
      "updatedAt": "2026-06-01T16:41:12.000Z",
      "assignedAgent": {
        "id": 17,
        "username": "agent_user",
        "email": "agent@fluttercraft.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### 4B. `GET /v1/contacts/:contactId/overview`
Returns summary call attempt and follow-up stats for a contact.

* **Method:** `GET`
* **Route:** `/v1/contacts/11/overview?period=30d`
* **Response Payload (200 OK):**
```json
{
  "contactId": 11,
  "followUpDate": "2026-06-02T16:41:12.000Z",
  "totalAttempts": 1,
  "attemptsChangePercent": -50.0,
  "lastCallDate": "2026-05-31T16:41:12.000Z",
  "lastCallStatus": "completed"
}
```

### 4C. `POST /v1/contacts/:contactId/flag-fraud`
Flags a contact as fraudulent.

* **Method:** `POST`
* **Route:** `/v1/contacts/11/flag-fraud`
* **Request Body:**
```json
{
  "note": "Suspicious chargeback reported during phone call."
}
```
* **Response Payload (201 Created):**
```json
{
  "id": 1,
  "contactId": 11,
  "note": "Suspicious chargeback reported during phone call.",
  "flaggedAt": "2026-06-01T17:10:00.000Z",
  "status": "pending_review"
}
```

### 4D. `POST /v1/contacts/:contactId/dispute`
Creates a billing or service dispute.

* **Method:** `POST`
* **Route:** `/v1/contacts/11/dispute`
* **Request Body:**
```json
{
  "disputeType": "incorrect_billing",
  "description": "Double billed for renewal."
}
```
* **Response Payload (201 Created):**
```json
{
  "id": 1,
  "contactId": 11,
  "disputeType": "incorrect_billing",
  "description": "Double billed for renewal.",
  "status": "pending_review",
  "createdAt": "2026-06-01T17:10:00.000Z"
}
```

### 4E. `GET /v1/contacts/dispute-types`
Returns list of accepted dispute reasons.

* **Method:** `GET`
* **Route:** `/v1/contacts/dispute-types`
* **Response Payload (200 OK):**
```json
{
  "disputeTypes": [
    "incorrect_billing",
    "service_not_provided",
    "other"
  ]
}
```

---

## 5. Products Endpoints

### 5A. `GET /v1/products/stats`
Product statistics over a given period (shares dashboard analytics shape).

* **Method:** `GET`
* **Route:** `/v1/products/stats?period=30d`
* **Response Payload (200 OK):**
```json
{
  "totalProducts": 10,
  "totalProductsChangePercent": 233.3,
  "soldProducts": 1675,
  "soldProductsChangePercent": 500.0
}
```

### 5B. `GET /v1/products/out-of-stock`
Returns paginated list of products where `qty = 0`.

* **Method:** `GET`
* **Route:** `/v1/products/out-of-stock?page=1&pageSize=20`
* **Response Payload (200 OK):**
```json
{
  "products": [
    {
      "id": 3,
      "name": "Basic Keyboard K-20",
      "category": "Electronics",
      "status": "Out of stock",
      "qty": 0,
      "price": "25.00"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

---

## 6. Notifications Endpoints

### 6A. `POST /v1/notifications/fcm-token`
Registers a new FCM device token for push notification routing.

* **Method:** `POST`
* **Route:** `/v1/notifications/fcm-token`
* **Request Body:**
```json
{
  "token": "fcm_token_string_here",
  "platform": "android",
  "deviceId": "android-device-unique-01"
}
```
* **Response Payload (201 Created):**
```json
{
  "message": "FCM Token registered successfully"
}
```

### 6B. `DELETE /v1/notifications/fcm-token`
Unregisters an FCM token (e.g. on logout).

* **Method:** `DELETE`
* **Route:** `/v1/notifications/fcm-token`
* **Request Body:**
```json
{
  "token": "fcm_token_string_here"
}
```
* **Response Payload (200 OK):**
```json
{
  "message": "FCM Token unregistered successfully"
}
```

### 6C. `GET /v1/notifications`
Lists notifications with filters.

* **Method:** `GET`
* **Route:** `/v1/notifications?filter=unread&page=1&pageSize=20`
* **Query Params:**
  - `filter`: `all`, `unread`, `read`, `archived` (default: `all`)
* **Response Payload (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "New call from Alice Johnson",
      "body": "Missed call at 10:30 AM",
      "type": "missed_call",
      "isRead": false,
      "isArchived": false,
      "contactId": 13,
      "createdAt": "2026-06-01T14:41:12.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "unreadCount": 1
}
```

### 6D. `PATCH /v1/notifications/:id/read`
Marks a single notification as read.

* **Method:** `PATCH`
* **Route:** `/v1/notifications/1/read`
* **Response Payload (200 OK):**
```json
{
  "message": "Notification marked as read"
}
```

### 6E. `PATCH /v1/notifications/:id/archive`
Archives a single notification.

* **Method:** `PATCH`
* **Route:** `/v1/notifications/1/archive`
* **Response Payload (200 OK):**
```json
{
  "message": "Notification archived successfully"
}
```

### 6F. `POST /v1/notifications/read-all`
Marks all active notifications of the authenticated user as read.

* **Method:** `POST`
* **Route:** `/v1/notifications/read-all`
* **Response Payload (200 OK):**
```json
{
  "markedCount": 3
}
```

---

## 7. Chat / Messages Endpoints

### 7A. `GET /v1/messages/peer`
Returns name, profile avatar, and ID of the support peer (Admin for Agents, Agent for Admin).

* **Method:** `GET`
* **Route:** `/v1/messages/peer`
* **Response Payload (200 OK):**
```json
{
  "peer": {
    "id": 16,
    "username": "admin_user",
    "email": "admin@fluttercraft.com",
    "role": "admin",
    "firstName": "ACME",
    "lastName": "Admin",
    "profileImageUrl": "http://localhost:5000/uploads/avatars/admin.jpg",
    "peerId": 16,
    "peerName": "ACME Admin",
    "peerAvatarUrl": "http://localhost:5000/uploads/avatars/admin.jpg"
  }
}
```

### 7B. `GET /v1/messages/conversations`
Allows agents (and admins) to get support threads. An agent calling this returns their active company discussion.

* **Method:** `GET`
* **Route:** `/v1/messages/conversations`
* **Response Payload (200 OK):**
```json
{
  "conversations": [
    {
      "company": {
        "id": 8,
        "name": "FlutterCraft LLC"
      },
      "agent": {
        "id": 17,
        "username": "agent_user",
        "email": "agent@fluttercraft.com"
      },
      "lastMessage": {
        "id": 5,
        "companyId": 8,
        "senderUserId": 17,
        "content": "Thank you so much! Let me review this template.",
        "status": "sent",
        "sentAt": "2026-06-01T15:41:12.000Z",
        "createdAt": "2026-06-01T16:41:12.000Z",
        "updatedAt": "2026-06-01T16:41:12.000Z",
        "attachmentUrl": null,
        "attachmentOriginalName": null,
        "sender": {
          "id": 17,
          "username": "agent_user",
          "email": "agent@fluttercraft.com",
          "role": "user"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}

---

## 8. Calls / Dialer Endpoints

### 8A. `POST /v1/calls/initiate`
Initiates an outbound call to the target contact (or arbitrary phone number) and bridges it to the agent's SIP extension via Asterisk AMI.

* **Method:** `POST`
* **Route:** `/v1/calls/initiate`
* **Request Body (via contactId):**
```json
{
  "contactId": 11,
  "sipExtension": "1001"
}
```
*Request Body (via raw phone number):*
```json
{
  "phoneNumber": "+15556667777",
  "sipExtension": "1001"
}
```
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Call origination requested successfully",
  "callId": 100,
  "voipResponse": "Originated successfully"
}
```
