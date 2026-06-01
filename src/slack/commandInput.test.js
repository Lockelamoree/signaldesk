import test from "node:test";
import assert from "node:assert/strict";
import { DEMO_ALERT_TEXT } from "./appHome.js";
import { resolveSignalDeskInput } from "./commandInput.js";

test("resolveSignalDeskInput returns help for empty and help aliases", () => {
  assert.deepEqual(resolveSignalDeskInput(""), { type: "help" });
  assert.deepEqual(resolveSignalDeskInput("  help  "), { type: "help" });
  assert.deepEqual(resolveSignalDeskInput("?"), { type: "help" });
});

test("resolveSignalDeskInput returns the canonical demo fixture for demo aliases", () => {
  for (const alias of ["demo", "Sample", " example ", "test"]) {
    assert.deepEqual(resolveSignalDeskInput(alias), {
      type: "demo",
      alertText: DEMO_ALERT_TEXT
    });
  }
});

test("resolveSignalDeskInput returns proof for judge proof aliases", () => {
  for (const alias of ["proof", "Checklist", " judge ", "receipts", "verify"]) {
    assert.deepEqual(resolveSignalDeskInput(alias), { type: "proof" });
  }
});

test("resolveSignalDeskInput preserves arbitrary triage text", () => {
  assert.deepEqual(resolveSignalDeskInput(" suspicious oauth consent from 198.51.100.23 "), {
    type: "triage",
    alertText: "suspicious oauth consent from 198.51.100.23"
  });
});
