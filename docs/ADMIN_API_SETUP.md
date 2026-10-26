# DiniLove Admin API setup — NOT DEPLOYED

This Worker source is a foundation, not a finished admin system. It must not be deployed until each item below is completed and tested.

## Required Cloudflare Access setup
1. Create a Cloudflare Access self-hosted application protecting the exact Worker hostname (and any admin route).
2. Add an allow policy for only the intended admin email: Nadine_geller@hotmail.de. Do not create a public signup policy.
3. Copy the Access application Audience (AUD) tag into the Worker variable `ACCESS_AUD`.
4. Set `ACCESS_TEAM_DOMAIN` to the team hostname, e.g. `example.cloudflareaccess.com` (hostname only is accepted; code normalizes an optional https:// prefix).

Access must be enabled at the edge. The Worker independently verifies `Cf-Access-Jwt-Assertion`; an email header alone is never accepted.

## Required Worker variables
Plain text variables:
- `ACCESS_TEAM_DOMAIN`
- `ACCESS_AUD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`

Secrets:
- `CLOUDINARY_API_SECRET`
- `TURNSTILE_SECRET` only if the frontend uses Turnstile as an additional bot check. Turnstile is not a replacement for admin authentication.

Do not put secrets in GitHub files, HTML, JavaScript, screenshots, or commit messages.

## Cloudinary upload flow
The authenticated browser requests `POST /admin/cloudinary-signature`, then uploads directly to Cloudinary's signed upload endpoint using the returned cloud name, API key, timestamp, folder, and signature. Cloudinary API secret stays only in the Worker secret store. The API currently does not implement listing, deleting, publishing/unpublishing, or a database for gallery metadata.

## Acceptance tests before deployment
- No Access token: API returns 401.
- Malformed, expired, wrong-issuer, wrong-audience, or invalid-signature Access JWT: API returns 401.
- Unapproved user blocked by Cloudflare Access before reaching Worker.
- Allowed origin succeeds; other origins cannot read responses.
- Missing Cloudinary settings returns 503 without revealing secrets.
- Valid authenticated request returns signature; signature verifies with Cloudinary.
- No public create-account, password, reset, or admin UI path exposes privileged actions.
- Current Turnstile endpoint and public site continue to work.
- Confirm actual Cloudinary folder/policy and upload restrictions before enabling uploads.

## Status
Source added to the feature branch `feature/admin-security-foundation-2026-10-25` only. No merge to `main`, no Worker deployment, and no live-site changes have been made. The code has not yet been executed against a staging Cloudflare Access application or Cloudinary account.
