import test from "node:test";
import assert from "node:assert/strict";
import { getTodaySurprise } from "../src/surprise-repository.js";

function fakeDb(row) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      calls.push({ sql });
      return {
        bind(...values) {
          calls.push({ values });
          return { first: async () => row };
        },
      };
    },
  };
}

test("queries only the server-derived Berlin date", async () => {
  const db = fakeDb({ surprise_date: "2026-02-16", message: "Beispiel", surprise_type: "anniversary" });
  const result = await getTodaySurprise(db, new Date("2026-02-15T23:30:00.000Z"));
  assert.equal(result.date, "2026-02-16");
  assert.equal(result.type, "anniversary");
  assert.equal(result.message, "Beispiel");
  assert.deepEqual(db.calls[1].values, ["2026-02-16"]);
  assert.match(db.calls[0].sql, /WHERE surprise_date = \?1/);
});

test("does not expose any message when today's row is missing", async () => {
  const result = await getTodaySurprise(fakeDb(null), new Date("2026-11-17T12:00:00.000Z"));
  assert.equal(result.available, false);
  assert.equal(result.message, null);
});

test("requires a configured D1 binding", async () => {
  await assert.rejects(() => getTodaySurprise(null), TypeError);
});
