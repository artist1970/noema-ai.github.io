# Provider Security Boundary

## Browser

The public browser may know:
- configured provider URL;
- safe provider status;
- session-cookie presence indirectly through authenticated responses.

The public browser must not contain:
- API keys;
- database passwords;
- secret provider credentials;
- hidden administrator passwords.

## Server

A future secure server may:
- authenticate the user;
- hold provider credentials;
- choose the upstream model;
- perform live research retrieval;
- return normalized results.

The server still does not become the authority over NOEMA's Constitution.

## Cookies

The future HTTPS provider adapter is designed for server-managed secure session cookies with `credentials: include`.

It does not require localStorage bearer tokens.
