import { DEMO_ALERT_TEXT } from "./appHome.js";

const DEMO_ALIASES = new Set(["demo", "sample", "example", "test"]);
const HELP_ALIASES = new Set(["help", "--help", "-h", "?"]);

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

  return {
    type: "triage",
    alertText: String(text).trim()
  };
}
