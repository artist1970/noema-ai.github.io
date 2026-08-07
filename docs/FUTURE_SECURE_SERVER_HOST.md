# Future Secure Server Host Seam

NOEMA v0.6 remains a static GitHub Pages application.

It does **not** claim to provide secure remote accounts yet.

The code now contains a deliberately inactive server seam:

```text
config/server-config.js
adapters/account-server-client.js
sync/identity-sync.js
```

## Current mode

```text
enabled: false
baseUrl: ""
```

NOEMA therefore remains local-browser-only.

## Future mode

When a real account host exists, the deployment configuration can become:

```js
export const NOEMA_SERVER_CONFIG = normalizeServerConfig({
  enabled: true,
  baseUrl: "https://noema.example.org",
  apiPrefix: "/api/v1"
});
```

The configuration rejects ordinary remote HTTP.

HTTP is accepted only for localhost development.

## Authentication design boundary

The browser adapter is designed for server-created secure session cookies:

```text
Secure
HttpOnly
SameSite
```

The browser code does not intentionally store:
- passwords;
- bearer tokens;
- session IDs;
- database passwords;
- API secrets.

`credentials: "include"` is used so a future server may manage its own session cookie.

## Initial API contract

The adapter reserves:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout

GET  /api/v1/account/me

PUT  /api/v1/enrollment/profile

GET  /api/v1/mentor/relationship

GET  /health
```

The exact server implementation may evolve without changing the NOEMA identity model.

## Cross-device future

Today:

```text
browser A → local profile
browser B → different local profile
```

After a secure account server exists:

```text
browser A ─┐
           ├─ authenticated account ─ person ID ─ mentor ID
browser B ─┘
```

That is the seam v0.6 establishes.
