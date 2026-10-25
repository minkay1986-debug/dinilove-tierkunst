/**
 * DiniLove private-ateliers API — Cloudflare Access gate scaffold.
 *
 * Not deployed. Requires Access to protect the Worker hostname and the
 * environment variables documented in worker/README.md. No private feature
 * is enabled by this file. Never put secrets in source control.
 */
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
};

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return origin && allowed.includes(origin) ? origin : null;
}

function corsHeaders(request, env) {
  const origin = allowedOrigin(request, env);
  if (!origin) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "600",
    "vary": "Origin",
  };
}

function decodeBase64Url(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJsonPart(input) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(input)));
}

async function verifyAccessIdentity(request, env) {
  const assertion = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!assertion || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD ||
      !env.ADMIN_EMAIL) return null;

  const parts = assertion.split(".");
  if (parts.length !== 3) return null;

  let header, claims;
  try {
    header = decodeJsonPart(parts[0]);
    claims = decodeJsonPart(parts[1]);
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || typeof header.kid !== "string") return null;

  const issuer = env.ACCESS_TEAM_DOMAIN.replace(/\/$/, "");
  if (claims.iss !== issuer || !Array.isArray(claims.aud) ||
      !claims.aud.includes(env.ACCESS_AUD)) return null;

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== "number" || claims.exp <= now ||
      (typeof claims.nbf === "number" && claims.nbf > now + 60)) return null;

  let keys;
  try {
    const response = await fetch(`${issuer}/cdn-cgi/access/certs`, {
      headers: { "accept": "application/json" },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!response.ok) return null;
    keys = await response.json();
  } catch {
    return null;
  }

  const jwk = Array.isArray(keys.keys)
    ? keys.keys.find((candidate) => candidate.kid === header.kid &&
        candidate.kty === "RSA" && candidate.use === "sig")
    : null;
  if (!jwk) return null;

  let validSignature = false;
  try {
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signedContent = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    validSignature = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      decodeBase64Url(parts[2]),
      signedContent
    );
  } catch {
    return null;
  }
  if (!validSignature) return null;

  const email = typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";
  const allowedEmail = env.ADMIN_EMAIL.trim().toLowerCase();
  if (!email || email !== allowedEmail || claims.email_verified !== true) return null;

  return { email };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(request, env);

    if (origin && !allowedOrigin(request, env)) {
      return json({ error: "origin_not_allowed" }, 403);
    }

    if (request.method === "OPTIONS") {
      if (!origin || !allowedOrigin(request, env)) {
        return json({ error: "origin_not_allowed" }, 403);
      }
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "dinilove-atelier-api",
        mode: "access-gated-scaffold",
        privateFeaturesEnabled: false,
      }, 200, cors);
    }

    if (url.pathname === "/api/admin/me" && request.method === "GET") {
      const identity = await verifyAccessIdentity(request, env);
      if (!identity) return json({ error: "unauthorized" }, 401, cors);
      return json({
        authenticated: true,
        role: "admin",
        privateFeaturesEnabled: false,
      }, 200, cors);
    }

    // All content and mutation routes remain disabled until storage and
    // authorization tests have been completed.
    if (url.pathname.startsWith("/api/")) {
      return json({
        error: "not_configured",
        message: "Private content, uploads and mutations remain disabled.",
      }, 503, cors);
    }

    return json({ error: "not_found" }, 404, cors);
  },
};
