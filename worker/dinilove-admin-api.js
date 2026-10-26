/**
 * DiniLove Admin API — security-first foundation.
 *
 * Deploy only after configuring:
 * - Cloudflare Access application for this Worker hostname, restricted to
 *   Nadine_geller@hotmail.de.
 * - ACCESS_TEAM_DOMAIN (e.g. your-team.cloudflareaccess.com)
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET (secret)
 * - TURNSTILE_SECRET (secret), if Turnstile is used by the admin UI.
 *
 * Cloudflare Access must protect the Worker hostname at the edge. This code
 * independently verifies the signed Access JWT; it never trusts an email
 * header alone. No public signup or password reset is implemented.
 *
 * This initial endpoint signs Cloudinary uploads only after Access validation.
 * Do not deploy until the configuration and acceptance tests in the docs pass.
 */
const ALLOWED_ORIGINS = new Set([
  "https://dinilove.de",
  "https://www.dinilove.de",
]);

function json(data, status = 200, origin = "") {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "vary": "Origin",
  };
  if (ALLOWED_ORIGINS.has(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-credentials"] = "true";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

function decodeJsonPart(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));
}

async function verifyAccessJwt(request, env) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.ACCESS_TEAM_DOMAIN) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  let header, claims;
  try {
    header = decodeJsonPart(parts[0]);
    claims = decodeJsonPart(parts[1]);
  } catch {
    return false;
  }

  if (header.alg !== "RS256" || typeof header.kid !== "string") return false;

  const team = env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const issuer = "https://" + team;
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== issuer || !Array.isArray(claims.aud) ||
      !env.ACCESS_AUD || !claims.aud.includes(env.ACCESS_AUD) ||
      typeof claims.exp !== "number" || claims.exp <= now ||
      typeof claims.iat !== "number" || claims.iat > now + 60) return false;

  const jwksResponse = await fetch(issuer + "/cdn-cgi/access/certs", {
    headers: { accept: "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!jwksResponse.ok) return false;
  const jwks = await jwksResponse.json();
  const jwk = jwks.keys?.find(k => k.kid === header.kid && k.kty === "RSA");
  if (!jwk) return false;

  const key = await crypto.subtle.importKey(
    "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
  );
  const signed = new TextEncoder().encode(parts[0] + "." + parts[1]);
  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", key, base64UrlToBytes(parts[2]), signed
  );
}

async function sha1Hex(value) {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (!ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": origin,
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "600",
          "vary": "Origin",
        },
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "dinilove-admin-api" }, 200, origin);
    }

    if (!ALLOWED_ORIGINS.has(origin)) return json({ ok: false, error: "Origin nicht erlaubt" }, 403);

    let authenticated = false;
    try {
      authenticated = await verifyAccessJwt(request, env);
    } catch {
      authenticated = false;
    }
    if (!authenticated) return json({ ok: false, error: "Anmeldung erforderlich" }, 401, origin);

    if (request.method === "POST" && url.pathname === "/admin/cloudinary-signature") {
      if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        return json({ ok: false, error: "Cloudinary ist noch nicht konfiguriert" }, 503, origin);
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "dinilove";
      const paramsToSign = "folder=" + folder + "&timestamp=" + timestamp;
      const signature = await sha1Hex(paramsToSign + env.CLOUDINARY_API_SECRET);
      return json({
        ok: true,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        timestamp,
        folder,
        signature,
      }, 200, origin);
    }

    return json({ ok: false, error: "Nicht gefunden" }, 404, origin);
  },
};
