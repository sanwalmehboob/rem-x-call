# RemXCall — Backend API & Integration Round 2 Changes

This document outlines the API updates, specifications, and integrations implemented during **Round 2** to resolve the blockers and clarifications for the Mobile (Flutter/Android) Team.

---

## 1. Pagination Response Key Standardization

To support a single generic paginated JSON parser on the mobile app while keeping absolute backward compatibility with the React Web Dashboard, all list endpoints have been updated to return a standardized `data` key **alongside** their existing domain-specific keys.

### Affected Endpoints

1. **`GET /v1/contacts`**
   * **Domain Key:** `contacts`
   * **Payload Structure:**
     ```json
     {
       "data": [ { "id": 1, "name": "Jane Doe", ... } ],
       "contacts": [ { "id": 1, "name": "Jane Doe", ... } ],
       "pagination": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
     }
     ```
2. **`GET /v1/contacts/:contactId/calls`**
   * **Domain Key:** `calls`
   * **Payload Structure:**
     ```json
     {
       "data": [ { "id": 12, "outcome": "Connected", ... } ],
       "calls": [ { "id": 12, "outcome": "Connected", ... } ],
       "pagination": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
     }
     ```
3. **`GET /v1/contacts/agents` (List Assignable Agents)**
   * **Domain Key:** `agents`
   * **Payload Structure:**
     ```json
     {
       "data": [ { "id": 5, "username": "agent1", ... } ],
       "agents": [ { "id": 5, "username": "agent1", ... } ],
       "pagination": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
     }
     ```
4. **`GET /v1/products`**
   * **Domain Key:** `products`
   * **Payload Structure:**
     ```json
     {
       "data": [ { "id": 2, "name": "Premium Headset", ... } ],
       "products": [ { "id": 2, "name": "Premium Headset", ... } ],
       "pagination": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
     }
     ```
5. **`GET /v1/products/out-of-stock`**
   * **Domain Key:** `products`
   * **Payload Structure:**
     ```json
     {
       "data": [ { "id": 4, "name": "Out of stock item", "qty": 0, ... } ],
       "products": [ { "id": 4, "name": "Out of stock item", "qty": 0, ... } ],
       "pagination": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
     }
     ```
6. **`GET /v1/messages/conversations`**
   * **Domain Key:** `conversations`
   * **Payload Structure:**
     ```json
     {
       "data": [ { "company": { "id": 1 }, "lastMessage": { ... } } ],
       "conversations": [ { "company": { "id": 1 }, "lastMessage": { ... } } ],
       "pagination": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
     }
     ```
7. **`GET /v1/messages`**
   * **Domain Key:** `messages`
   * **Payload Structure:**
     ```json
     {
       "data": [ { "id": 40, "messageText": "Hello", ... } ],
       "messages": [ { "id": 40, "messageText": "Hello", ... } ],
       "pagination": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
     }
     ```

---

## 2. Calls API & Asterisk Originate Flow

### `POST /v1/calls/initiate`
Initiates an outbound call via Asterisk AMI.

* **Method:** `POST`
* **Route:** `/v1/calls/initiate`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "contactId": 14,       // Optional. Links the call to a contact
    "phoneNumber": "...",  // Optional. Required if contactId is omitted
    "sipExtension": "1001" // Optional. Defaults to agent's user profile sipExtension
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "message": "Call origination requested successfully",
    "callId": 89,
    "voipResponse": "Success: Originate successfully queued"
  }
  ```

### Key Integration FAQs:

1. **Where does `sipExtension` come from?**
   It is assigned to the agent. It is returned under the `sipExtension` attribute of the user profile via `GET /v1/auth/me`. The Web Settings UI now provides an input to modify this extension.
2. **What is the Asterisk Call Origination flow?**
   When the API is called, Asterisk starts Leg A by calling the agent's device at their `sipExtension` (e.g. `1001`). The agent's mobile app must be registered on the Asterisk SIP server and will receive an **incoming SIP call**. When the agent answers, Asterisk dials the customer's phone number (Leg B) and bridges the call.
3. **Is auth required for call recording playback?**
   **No**. Recordings are served as public static assets under `/uploads/recordings/` (e.g. `http://3.22.39.219:8080/uploads/recordings/call-jane.mp3`). The mobile app's audio player can play/stream them directly without headers.

---

## 3. Real-Time Chat Messaging (WebSockets)

Real-time chat is powered by Socket.io on the root server.

### Connection & Auth
Pass the JWT access token in the `Authorization` header during connection or via the `auth` parameter:
```javascript
const socket = io("http://3.22.39.219:8080", {
  auth: {
    token: "YOUR_JWT_ACCESS_TOKEN"
  }
});
```

### Protocol & Events

1. **Join Company Thread:**
   To listen to messages, client must join their company room:
   * **Emit Event:** `messages:join`
   * **Payload:** `{ "companyId": 2 }`
   * **Expected Response Event:** `messages:joined` (Payload: `{ "companyId": 2 }`)

2. **Receive New Message:**
   When a message is sent (via API `POST /v1/messages`), the server emits this event to all sockets in the room:
   * **Listen Event:** `messages:created`
   * **Payload:** `{ "message": { "id": 1, "messageText": "Hello", "sender": { "id": 10 }, ... } }`

3. **Message Status Updates (Read/Delivered Receipts):**
   When a message status is updated (via API `POST /v1/messages/:messageId/status`):
   * **Listen Event:** `messages:status-updated`
   * **Payload:** `{ "message": { "id": 1, "status": "read", ... } }`

4. **Typing Status Indicator:**
   * **Emit Event to start typing:** `typing:start` (Payload: `{ "companyId": 2 }`)
   * **Emit Event to stop typing:** `typing:stop` (Payload: `{ "companyId": 2 }`)
   * **Listen Event for typing state changes:** `messages:typing` (Payload: `{ "companyId": 2, "userId": 10, "typing": true }`)
