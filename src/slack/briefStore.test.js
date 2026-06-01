import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildIncidentBrief } from "../core/incidentBrief.js";
import { createBriefStore } from "./briefStore.js";

function demoBrief(idSuffix = "one") {
  return buildIncidentBrief({
    alertText: `Volunteer clicked https://donor-login-${idSuffix}.example.bad/reset and pasted an access token.`,
    reporter: "max",
    channel: "security-help",
    timestamp: `2026-06-01T12:00:0${idSuffix === "one" ? "1" : "2"}.000Z`
  });
}

test("brief store keeps recent briefs in memory", () => {
  const store = createBriefStore({ persist: false, maxEntries: 1 });
  const first = demoBrief("one");
  const second = demoBrief("two");

  assert.equal(store.remember(first), true);
  assert.equal(store.get(first.id)?.id, first.id);
  assert.equal(store.remember(second), true);
  assert.equal(store.get(first.id), undefined);
  assert.equal(store.get(second.id)?.id, second.id);
});

test("brief store can recover synthetic demo state from private disk storage", () => {
  const directory = mkdtempSync(join(tmpdir(), "signaldesk-brief-store-"));
  const firstStore = createBriefStore({ persist: true, directory });
  const brief = demoBrief("one");

  assert.equal(firstStore.remember(brief), true);

  const recoveredStore = createBriefStore({ persist: true, directory });
  assert.equal(recoveredStore.get(brief.id)?.summary, brief.summary);

  rmSync(directory, { recursive: true, force: true });
});
