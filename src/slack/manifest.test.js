import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../manifest.json", import.meta.url), "utf8"));

test("manifest defines SignalDesk Slack entry points", () => {
  assert.equal(manifest.features.app_home.home_tab_enabled, true);
  assert.ok(manifest.features.slash_commands.some((command) => command.command === "/signaldesk"));
  assert.ok(manifest.features.shortcuts.some((shortcut) =>
    shortcut.callback_id === "signaldesk_triage_message" && shortcut.type === "message"
  ));
});

test("manifest includes scopes needed for demo workflow", () => {
  const scopes = new Set(manifest.oauth_config.scopes.bot);

  assert.ok(scopes.has("commands"));
  assert.ok(scopes.has("chat:write"));
  assert.ok(scopes.has("app_mentions:read"));
  assert.ok(scopes.has("channels:manage"));
});

test("manifest keeps socket mode and interactivity enabled", () => {
  assert.equal(manifest.settings.socket_mode_enabled, true);
  assert.equal(manifest.settings.interactivity.is_enabled, true);
  assert.ok(manifest.settings.event_subscriptions.bot_events.includes("app_home_opened"));
});
