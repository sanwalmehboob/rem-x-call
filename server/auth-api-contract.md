# Auth API Contract (Web + Mobile)

This API contract supports both clients through one auth backend.

## Token Model

- Access token: short-lived JWT used in `Authorization: Bearer <token>`.
- Refresh token: long-lived JWT stored securely by the client.
- Every login creates a `UserSession` row with device/app metadata.
- Refresh token rotation is enabled: each refresh call issues a new refresh token and invalidates the old one.

## Client Identification

Use `clientType` in request body:

- `web`
- `mobile`

Backward-compatible fallback: send `isMobile: true` if mobile cannot send `clientType` yet.

Recommended optional metadata:

- `deviceId`
- `deviceName`
- `platform` (example: `ios`, `android`, `web`)
- `appVersion`

Metadata can be sent in JSON body or `x-*` headers:

- `x-client-type`
- `x-is-mobile`
- `x-device-id`
- `x-device-name`
- `x-platform`
- `x-app-version`

## Endpoints

### `POST /v1/auth/login`

Body:

```json
{
  "email": "agent@acme.com",
  "password": "secret123",
  "clientType": "mobile",
  "deviceId": "ios-device-001",
  "platform": "ios",
  "appVersion": "1.0.0"
}
```

Returns `user` and `tokens` (`access`, `refresh`, `session`).

### `POST /v1/auth/register`

Body includes existing registration fields plus optional client metadata above.
Returns `user` and `tokens`.

### `POST /v1/auth/refresh-tokens`

Body:

```json
{
  "refreshToken": "<jwt-refresh-token>",
  "clientType": "mobile",
  "appVersion": "1.0.1"
}
```

Returns new `tokens` (`access`, `refresh`, `session`).

### `POST /v1/auth/logout`

Auth required (`Bearer access_token`).
Revokes current access token and current session if token has `sid`.

### `POST /v1/auth/logout-all`

Auth required.
Revokes current access token + all active sessions for current user.

### `GET /v1/auth/sessions`

Auth required.
Returns current active sessions (for "where am I logged in?" UI).

### `DELETE /v1/auth/sessions/:sid`

Auth required.
Revokes one specific session by `sid`.

## Security Notes

- Never store refresh tokens in plaintext DB; only store hash.
- For mobile, store refresh token in secure storage (Keychain/Keystore).
- Access token remains short-lived; refresh token handles session continuity.
- Keep API versioned (`/v1`) to avoid breaking older mobile builds.
