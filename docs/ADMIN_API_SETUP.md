# DiniLove Admin API setup — NOT DEPLOYED

This Worker source is a foundation, not a finished admin system. Do not deploy it over the existing Turnstile Worker. The current production Worker still verifies public-site Turnstile challenges and must remain unchanged.

## Verified Cloudflare state (2026-10-26)

- Access application exists: `dinilove-admin-api - Cloudflare Workers`.
- Access application ID: `06ded8de-5a33-48a7-979e-84ed3326a9b6`.
- Audience tag (set as Worker variable `ACCESS_AUD`): `b1a54443f094dcde88b311ea6c0dc54205216ab7c197a14776a00679c78f9ef4`.
- Allow policy `Dinilove - Nadine Admin` exists for `Nadine_geller@hotmail.de`.
- The Access app targets Worker ID `16f2269a0e7442deb3e74fd0f69b3b42` and is configured for production and preview traffic in the Cloudflare UI.
- Existing production Worker has only the `TURNSTILE_SECRET` binding. Admin API bindings are not configured yet.
- The actual Worker runtime has not been tested through an authenticated browser session. Creating an Access app does not by itself prove the whole flow works.

## Required Cloudflare Access setup

1. Keep the Access application restricted to the single intended admin email: `Nadine_geller@hotmail.de`. Do not add a public signup policy or a broad allow rule.
2. Ensure the Access application protects the exact API hostname used by the admin UI, including production traffic, and test that an unauthenticated request is redirected/blocked at the edge.
3. Set `ACCESS_AUD` to the audience tag above.
4. Set `ACCESS_TEAM_DOMAIN` to the Cloudflare Access team hostname (the `*.cloudflareaccess.com` hostname shown in Access settings; hostname only is accepted).
5. Configure the API as a separate Worker/service or a carefully reviewed route. Do not replace the existing Turnstile handler with this file; the public Turnstile endpoint must continue to work.

The Worker independently verifies `Cf-Access-Jwt-Assertion` and enforces `ADMIN_EMAIL` server-side. An email header alone is never accepted.

## Required Worker variables

Plain text variables:
- `ACCESS_TEAM_DOMAIN`
- `ACCESS_AUD`
- `ADMIN_EMAIL` (use `Nadine_geller@hotmail.de`; code has a same-address fallback)
- `CLOUDINARY_CLOUD_NAME` (existing Cloudinary cloud name: `oewvbiow`)
- `CLOUDINARY_API_KEY`

Secrets:
- `CLOUDINARY_API_SECRET`
- `TURNSTILE_SECRET` only if the separate public Turnstile endpoint needs it. Never expose it to browser code.

Do not put secrets in GitHub files, HTML, JavaScript, screenshots, or commit messages. The Cloudinary API secret has not been provided to this workflow and must be entered directly into Cloudflare's secret field.

## Cloudinary upload flow

The authenticated browser requests `POST /admin/cloudinary-signature`, then uploads directly to Cloudinary's signed upload endpoint using the returned cloud name, API key, timestamp, folder, and signature. Cloudinary API secret stays only in the Worker secret store.

The API currently does not implement listing, deleting, publishing/unpublishing, gallery metadata, or a complete admin UI. A signed upload is not the same as a finished gallery-management system. Confirm Cloudinary folder and upload restrictions before enabling uploads.

## Acceptance tests before deployment

- No Access token: API returns 401.
- Malformed, expired, wrong-issuer, wrong-audience, wrong-email, or invalid-signature Access JWT: API returns 401.
- Unapproved user blocked by Cloudflare Access before reaching Worker.
- Allowed origin succeeds; other origins cannot read responses.
- Missing Cloudinary settings returns 503 without revealing secrets.
- Valid authenticated request returns a signature that verifies with Cloudinary.
- Existing public Turnstile endpoint still accepts valid challenges and rejects invalid ones.
- No public create-account, password-reset, or admin UI path exposes privileged actions.
- Verify an actual signed upload with a harmless test image before enabling real content management.

## Status

Source is on feature branch `feature/admin-security-foundation-2026-10-25` only. No merge to `main`, no Worker deployment, and no live-site changes have been made. Access configuration is present, but Cloudinary credentials/bindings and end-to-end tests remain outstanding.
