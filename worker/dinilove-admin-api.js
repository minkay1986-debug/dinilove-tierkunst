/**
 * DiniLove Admin API — password-protected test implementation.
 *
 * Configure ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET as Worker
 * variables/secrets. Cloudinary credentials must remain secret_text bindings.
 * The admin endpoints issue short-lived signed sessions and never expose the
 * Cloudinary API secret to the browser. No public signup or password reset.
 *
 * This is a separate admin API. It does not modify the public website.
 */
const ALLOWED_ORIGINS = new Set([
  "https://dinilove.de",
  "https://www.dinilove.de",
]);
const DEFAULT_ADMIN_EMAIL = "nadine_geller@hotmail.de";
const SESSION_SECONDS = 60 * 60;
// Per-isolate throttle; supplementary only, not a globally consistent rate limit.
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
function clientKey(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function loginBlocked(request) {
  const now = Date.now(), key = clientKey(request), entry = loginAttempts.get(key);
  if (!entry || now - entry.startedAt >= LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { startedAt: now, count: 0 });
    return false;
  }
  return entry.count >= LOGIN_MAX_ATTEMPTS;
}
function recordLoginFailure(request) {
  const now = Date.now(), key = clientKey(request);
  let entry = loginAttempts.get(key);
  if (!entry || now - entry.startedAt >= LOGIN_WINDOW_MS) entry = { startedAt: now, count: 0 };
  entry.count += 1;
  loginAttempts.set(key, entry);
}
function clearLoginFailures(request) { loginAttempts.delete(clientKey(request)); }

function json(data, status = 200, origin = "") {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "vary": "Origin",
    "x-content-type-options": "nosniff",
  };
  if (ALLOWED_ORIGINS.has(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-credentials"] = "true";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

async function issueSession(env) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ email: (env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(), exp: expires })));
  const signature = toBase64Url(await hmac(env.ADMIN_SESSION_SECRET, payload));
  return { token: payload + "." + signature, expires };
}

async function verifySession(request, env) {
  if (!env.ADMIN_SESSION_SECRET) return false;
  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  let payload;
  try { const raw = parts[0].replace(/-/g, "+").replace(/_/g, "/"); payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw + "=".repeat((4 - raw.length % 4) % 4)), c => c.charCodeAt(0)))); } catch { return false; }
  if (!payload || typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return false;
  if (payload.email !== (env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase()) return false;
  const expected = toBase64Url(await hmac(env.ADMIN_SESSION_SECRET, parts[0]));
  if (expected.length !== parts[1].length) return false;
  let diff = 0; for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts[1].charCodeAt(i);
  return diff === 0;
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
          "access-control-allow-headers": "content-type, authorization",
          "access-control-allow-credentials": "true",
          "access-control-max-age": "600",
          "vary": "Origin",
        },
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "dinilove-admin-api" }, 200, origin);
    }

    if (!ALLOWED_ORIGINS.has(origin)) {
      return json({ ok: false, error: "Origin nicht erlaubt" }, 403);
    }

    if (request.method === "POST" && url.pathname === "/admin/login") {
      if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return json({ ok: false, error: "Login ist serverseitig noch nicht konfiguriert" }, 503, origin);
      if (loginBlocked(request)) return json({ ok: false, error: "Zu viele Anmeldeversuche. Bitte in 10 Minuten erneut versuchen." }, 429, origin);
      let body;
      try { body = await request.json(); } catch { return json({ ok: false, error: "Ungültige Anfrage" }, 400, origin); }
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      const expectedEmail = (env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
      if (email !== expectedEmail || !password || password !== env.ADMIN_PASSWORD) {
        recordLoginFailure(request);
        return json({ ok: false, error: "E-Mail oder Passwort stimmt nicht." }, 401, origin);
      }
      clearLoginFailures(request);
      const session = await issueSession(env);
      return json({ ok: true, token: session.token, expires: session.expires }, 200, origin);
    }

    if (request.method === "POST" && url.pathname === "/admin/logout") return json({ ok: true }, 200, origin);

    if (request.method === "GET" && url.pathname === "/public/gallery") {
      if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        return json({ ok: false, error: "Galerie ist vorübergehend nicht verfügbar" }, 503, origin);
      }
      const auth = "Basic " + btoa(env.CLOUDINARY_API_KEY + ":" + env.CLOUDINARY_API_SECRET);
      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/" + encodeURIComponent(env.CLOUDINARY_CLOUD_NAME) +
          "/resources/image?type=upload&prefix=dinilove%2F&max_results=100",
        { headers: { authorization: auth, accept: "application/json" } }
      );
      if (!cloudinaryResponse.ok) {
        console.error("Public gallery request failed", { status: cloudinaryResponse.status });
        return json({ ok: false, error: "Galerie konnte nicht geladen werden" }, 502, origin);
      }
      const data = await cloudinaryResponse.json();
      return json({
        ok: true,
        assets: (data.resources || []).map(asset => ({
          publicId: asset.public_id,
          url: asset.secure_url,
          format: asset.format,
          width: asset.width,
          height: asset.height,
          createdAt: asset.created_at
        }))
      }, 200, origin);
    }

    let authenticated = false;
    try { authenticated = await verifySession(request, env); } catch { authenticated = false; }
    if (!authenticated) return json({ ok: false, error: "Bitte anmelden." }, 401, origin);

    if (request.method === "GET" && url.pathname === "/admin/assets") {
      if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        return json({ ok: false, error: "Cloudinary ist noch nicht konfiguriert" }, 503, origin);
      }
      const auth = "Basic " + btoa(env.CLOUDINARY_API_KEY + ":" + env.CLOUDINARY_API_SECRET);
      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/" + encodeURIComponent(env.CLOUDINARY_CLOUD_NAME) +
          "/resources/image?type=upload&prefix=dinilove%2F&max_results=100",
        { headers: { authorization: auth, accept: "application/json" } }
      );
      if (!cloudinaryResponse.ok) {
        let detail = "";
        try {
          const errorBody = await cloudinaryResponse.json();
          const message = errorBody?.error?.message;
          if (typeof message === "string") detail = message.slice(0, 240);
        } catch {}
        // Safe diagnostic only: never return credentials or authorization headers.
        console.error("Cloudinary gallery request failed", {
          status: cloudinaryResponse.status,
          cloudNameConfigured: Boolean(env.CLOUDINARY_CLOUD_NAME),
          apiKeyConfigured: Boolean(env.CLOUDINARY_API_KEY),
          apiSecretConfigured: Boolean(env.CLOUDINARY_API_SECRET),
          detail,
        });
        return json({
          ok: false,
          error: "Cloudinary-Galerie konnte nicht geladen werden",
          diagnostic: {
            status: cloudinaryResponse.status,
            detail: detail || "Cloudinary hat keine lesbare Fehlerbeschreibung zurückgegeben",
          },
        }, 502, origin);
      }
      const data = await cloudinaryResponse.json();
      return json({
        ok: true,
        assets: (data.resources || []).map(asset => ({
          publicId: asset.public_id,
          url: asset.secure_url,
          createdAt: asset.created_at,
          format: asset.format,
          width: asset.width,
          height: asset.height,
        })),
      }, 200, origin);
    }

    if (request.method === "POST" && url.pathname === "/admin/delete-asset") {
      if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        return json({ ok: false, error: "Cloudinary ist noch nicht konfiguriert" }, 503, origin);
      }
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: "Ungültige Anfrage" }, 400, origin);
      }
      const publicId = typeof body.publicId === "string" ? body.publicId : "";
      if (!publicId.startsWith("dinilove/") || publicId.length > 250 || /[?#]/.test(publicId)) {
        return json({ ok: false, error: "Ungültige Bildreferenz" }, 400, origin);
      }
      const auth = "Basic " + btoa(env.CLOUDINARY_API_KEY + ":" + env.CLOUDINARY_API_SECRET);
      const query = new URLSearchParams({ "public_ids[]": publicId, invalidate: "true" });
      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/" + encodeURIComponent(env.CLOUDINARY_CLOUD_NAME) +
          "/resources/image/upload?" + query.toString(),
        { method: "DELETE", headers: { authorization: auth, accept: "application/json" } }
      );
      if (!cloudinaryResponse.ok) {
        return json({ ok: false, error: "Cloudinary konnte das Bild nicht löschen" }, 502, origin);
      }
      const result = await cloudinaryResponse.json();
      if (!result.deleted || !Object.prototype.hasOwnProperty.call(result.deleted, publicId)) {
        return json({ ok: false, error: "Cloudinary hat das Löschen nicht bestätigt" }, 502, origin);
      }
      return json({ ok: true, result: result.deleted[publicId] }, 200, origin);
    }

    if (request.method === "POST" && url.pathname === "/admin/cloudinary-signature") {
      if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        return json({ ok: false, error: "Cloudinary ist noch nicht konfiguriert" }, 503, origin);
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "dinilove";
      const allowed_formats = "jpg,png,webp,avif";
      const max_file_size = 8388608;
      const paramsToSign = "allowed_formats=" + allowed_formats + "&folder=" + folder + "&timestamp=" + timestamp;
      const signature = await sha1Hex(paramsToSign + env.CLOUDINARY_API_SECRET);
      return json({
        ok: true,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        timestamp,
        folder,
        allowed_formats,
        max_file_size,
        signature,
      }, 200, origin);
    }

    return json({ ok: false, error: "Nicht gefunden" }, 404, origin);
  },
};
