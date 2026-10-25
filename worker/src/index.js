/**
 * DiniLove private-ateliers API — scaffold only.
 *
 * Not deployed and not connected to production. All private routes fail closed
 * until a real authentication and storage implementation is added.
 * Never place Cloudinary API secrets or passwords in this file.
 */
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
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
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-max-age": "600",
    "vary": "Origin",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(request, env);

    // A browser origin that is not explicitly allowlisted is never reflected.
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
        mode: "scaffold",
        privateFeaturesEnabled: false,
      }, 200, cors);
    }

    // Fail closed: no login, surprise content, uploads or mutations are enabled.
    if (url.pathname.startsWith("/api/")) {
      return json({
        error: "not_configured",
        message: "Private API is intentionally disabled until authentication, authorization and storage are tested.",
      }, 503, cors);
    }

    return json({ error: "not_found" }, 404, cors);
  },
};
