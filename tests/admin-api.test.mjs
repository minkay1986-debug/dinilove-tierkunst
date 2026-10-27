import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/dinilove-admin-api.js";

const origin = "https://dinilove.de";
const baseEnv = {
  ACCESS_TEAM_DOMAIN: "team.cloudflareaccess.com",
  ACCESS_AUD: "test-audience",
  ADMIN_EMAIL: "Nadine_geller@hotmail.de",
  ADMIN_PASSWORD: "test-only-password",
  ADMIN_SESSION_SECRET: "test-session-secret-long-enough",
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  CLOUDINARY_API_KEY: "test-key",
  CLOUDINARY_API_SECRET: "test-secret",
};

test("health endpoint is no-store and reports service", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/health", { headers: { Origin: origin } }),
    {}
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { ok: true, service: "dinilove-admin-api" });
});

test("rejects requests from an unapproved origin", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/admin/cloudinary-signature", {
      method: "POST",
      headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
      body: "{}",
    }),
    baseEnv
  );
  assert.equal(response.status, 403);
});

test("preflight permits only approved origins", async () => {
  const allowed = await worker.fetch(new Request("https://api.example/admin/cloudinary-signature", {
    method: "OPTIONS", headers: { Origin: origin },
  }), {});
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get("access-control-allow-origin"), origin);
  assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");

  const denied = await worker.fetch(new Request("https://api.example/admin/cloudinary-signature", {
    method: "OPTIONS", headers: { Origin: "https://evil.example" },
  }), {});
  assert.equal(denied.status, 403);
});

test("requires Access JWT before issuing Cloudinary signatures", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/admin/cloudinary-signature", {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: "{}",
    }),
    baseEnv
  );
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { ok: false, error: "Bitte anmelden." });
});

test("unknown authenticated-only routes never reveal configuration", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/admin/delete-all", {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: "{}",
    }),
    baseEnv
  );
  assert.equal(response.status, 401);
});

test("gallery and delete routes require Access JWT", async () => {
  const list = await worker.fetch(new Request("https://api.example/admin/assets", {
    headers: { Origin: origin },
  }), baseEnv);
  assert.equal(list.status, 401);

  const remove = await worker.fetch(new Request("https://api.example/admin/delete-asset", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ publicId: "dinilove/test-image" }),
  }), baseEnv);
  assert.equal(remove.status, 401);
});

test("password login issues a session token and protects admin routes", async () => {
  const bad = await worker.fetch(new Request("https://api.example/admin/login", {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "nadine_geller@hotmail.de", password: "wrong" }),
  }), baseEnv);
  assert.equal(bad.status, 401);

  const login = await worker.fetch(new Request("https://api.example/admin/login", {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "Nadine_geller@hotmail.de", password: "test-only-password" }),
  }), baseEnv);
  assert.equal(login.status, 200);
  const session = await login.json();
  assert.equal(session.ok, true);
  assert.equal(typeof session.token, "string");

  const authenticated = await worker.fetch(new Request("https://api.example/admin/not-a-route", {
    headers: { Origin: origin, Authorization: "Bearer " + session.token },
  }), baseEnv);
  assert.equal(authenticated.status, 404);
});
