import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const env = { ALLOWED_ORIGINS: "https://minkay1986-debug.github.io" };

test("health reports scaffold and private features disabled", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/health"),
    env
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.mode, "access-gated-scaffold");
  assert.equal(body.privateFeaturesEnabled, false);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("private API remains disabled even for allowed origin", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/api/admin", {
      method: "GET",
      headers: { Origin: "https://minkay1986-debug.github.io" },
    }),
    env
  );
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "not_configured");
});

test("rejects an unapproved browser origin", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/api/admin", {
      method: "POST",
      headers: { Origin: "https://attacker.example" },
    }),
    env
  );
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "origin_not_allowed");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
});

test("preflight only succeeds for the configured origin", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/api/admin", {
      method: "OPTIONS",
      headers: { Origin: "https://minkay1986-debug.github.io" },
    }),
    env
  );
  assert.equal(response.status, 204);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "https://minkay1986-debug.github.io"
  );
});

test("unknown paths return 404", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/not-a-route"),
    env
  );
  assert.equal(response.status, 404);
});

test("admin identity route fails closed when Access configuration is absent", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/api/admin/me", {
      headers: { Origin: "https://minkay1986-debug.github.io" },
    }),
    env
  );
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "unauthorized");
});

test("private content routes remain disabled even with no identity", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/api/surprise/today", {
      headers: { Origin: "https://minkay1986-debug.github.io" },
    }),
    env
  );
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "not_configured");
});
