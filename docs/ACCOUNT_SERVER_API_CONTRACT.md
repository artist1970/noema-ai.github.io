# NOEMA Account Server API Contract — Draft v1

This document describes the expected shape of a future server. It is not an active server.

## Health

`GET /health`

Example:

```json
{
  "ok": true,
  "service": "noema-account-server",
  "version": "1.0.0"
}
```

## Register

`POST /api/v1/auth/register`

Production rules:
- HTTPS only;
- credentials handled by the server;
- no password returned;
- no password written to logs;
- child/teen pathway validated before account activation;
- server creates secure session only after permitted verification.

## Login

`POST /api/v1/auth/login`

Expected result:
- server validates credentials;
- server sets an HttpOnly secure session cookie;
- response contains safe account metadata only.

## Current account

`GET /api/v1/account/me`

Returns safe authenticated identity metadata.

## Enrollment

`PUT /api/v1/enrollment/profile`

Accepts the enrollment contract and stores the profile for the authenticated person.

## Mentor relationship

`GET /api/v1/mentor/relationship`

Returns the authenticated person's adopted mentor relationship.

The public NOEMA browser must never be trusted as the final authority for guardian, age, permission or authentication decisions. A future production server must revalidate all consequential account state.
