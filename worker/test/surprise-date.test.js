import test from "node:test";
import assert from "node:assert/strict";
import { berlinDateKey, isValidDateKey, surpriseTypeForDate } from "../src/surprise-date.js";

test("Berlin date key uses Europe/Berlin calendar", () => {
  assert.equal(berlinDateKey(new Date("2026-10-25T22:30:00.000Z")), "2026-10-26");
});

test("anniversary wins over monthly surprise on February 16", () => {
  assert.equal(surpriseTypeForDate("2026-02-16"), "anniversary");
});

test("birthday is October 30", () => {
  assert.equal(surpriseTypeForDate("2026-10-30"), "birthday");
});

test("Christmas date is December 24", () => {
  assert.equal(surpriseTypeForDate("2026-12-24"), "christmas");
});

test("other 16ths use monthly surprise", () => {
  assert.equal(surpriseTypeForDate("2026-11-16"), "monthly");
});

test("ordinary day uses daily surprise", () => {
  assert.equal(surpriseTypeForDate("2026-11-17"), "daily");
});

test("rejects malformed and impossible date keys", () => {
  assert.equal(isValidDateKey("2026-02-30"), false);
  assert.throws(() => surpriseTypeForDate("16-02-2026"), TypeError);
  assert.throws(() => surpriseTypeForDate("2026-02-30"), TypeError);
});
