import { DEMO_ALERT_TEXT } from "./appHome.js";

const DEMO_ALIASES = new Set(["demo", "sample", "example", "test"]);
const HELP_ALIASES = new Set(["help", "--help", "-h", "?"]);
const PROOF_ALIASES = new Set(["proof", "checklist", "judge", "receipts", "verify"]);

function normalizedCommandText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function resolveSignalDeskInput(text) {
  const normalized = normalizedCommandText(text);

  if (!normalized || HELP_ALIASES.has(normalized)) {
    return { type: "help" };
  }

  if (DEMO_ALIASES.has(normalized)) {
    return {
      type: "demo",
      alertText: DEMO_ALERT_TEXT
    };
  }

  if (PROOF_ALIASES.has(normalized)) {
    return { type: "proof" };
  }

  return {
    type: "triage",
    alertText: String(text).trim()
  };
}
