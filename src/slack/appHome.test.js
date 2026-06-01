import test from "node:test";
import assert from "node:assert/strict";
import {
  HOME_DEMO_GUIDE_ACTION,
  HOME_PROOF_CHECKLIST_ACTION,
  buildAppHomeView,
  buildHomeDemoGuideModal,
  buildHomeProofChecklistModal,
  buildSignalDeskHelp
} from "./appHome.js";
import { assertSlackBlocksValid } from "./blockKitValidation.js";

test("buildAppHomeView returns a valid judge onboarding home tab", () => {
  const view = buildAppHomeView({ runtimeMode: "mcp" });
  const serialized = JSON.stringify(view);
  const result = assertSlackBlocksValid(view.blocks);

  assert.equal(view.type, "home");
  assert.equal(result.valid, true);
  assert.ok(serialized.includes("Runtime: MCP stdio"));
  assert.ok(serialized.includes("Triage with SignalDesk"));
  assert.ok(serialized.includes("/signaldesk demo"));
  assert.ok(serialized.includes("/signaldesk"));
  assert.ok(serialized.includes(HOME_DEMO_GUIDE_ACTION));
  assert.ok(serialized.includes(HOME_PROOF_CHECKLIST_ACTION));
  assert.ok(serialized.includes("Evidence boundary"));
});

test("buildSignalDeskHelp returns valid no-input guidance", () => {
  const payload = buildSignalDeskHelp({ runtimeMode: "mcp" });
  const serialized = JSON.stringify(payload);
  const result = assertSlackBlocksValid(payload.blocks);

  assert.equal(result.valid, true);
  assert.ok(payload.text.includes("SignalDesk demo help"));
  assert.ok(serialized.includes("Runtime proof"));
  assert.ok(serialized.includes("MCP stdio"));
  assert.ok(serialized.includes("Sample commands"));
  assert.ok(serialized.includes("/signaldesk demo"));
  assert.ok(serialized.includes("First-response readiness"));
});

test("buildHomeDemoGuideModal returns valid clickable demo guidance", () => {
  const modal = buildHomeDemoGuideModal({ runtimeMode: "mcp" });
  const serialized = JSON.stringify(modal);
  const result = assertSlackBlocksValid(modal.blocks);

  assert.equal(modal.type, "modal");
  assert.equal(result.valid, true);
  assert.ok(serialized.includes("/signaldesk demo"));
  assert.ok(serialized.includes("MCP stdio"));
  assert.ok(serialized.includes("Full fallback command"));
});

test("buildHomeProofChecklistModal returns valid judge proof guidance", () => {
  const modal = buildHomeProofChecklistModal({ runtimeMode: "mcp" });
  const serialized = JSON.stringify(modal);
  const result = assertSlackBlocksValid(modal.blocks);

  assert.equal(modal.type, "modal");
  assert.equal(result.valid, true);
  assert.ok(serialized.includes("Judge proof signals"));
  assert.ok(serialized.includes("npm.cmd run smoke:slack-mcp"));
  assert.ok(serialized.includes("MCP stdio"));
});
