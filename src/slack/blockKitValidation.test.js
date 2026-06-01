import test from "node:test";
import assert from "node:assert/strict";
import { buildIncidentBrief, buildSlackBlocks } from "../core/incidentBrief.js";
import { sampleIncidents } from "../core/sampleIncidents.js";
import { buildAppHomeView, buildHomeDemoGuideModal, buildHomeProofChecklistModal, buildSignalDeskHelp } from "./appHome.js";
import { assertSlackBlocksValid, validateSlackBlocks } from "./blockKitValidation.js";
import { buildTriageErrorPayload } from "./errorResponses.js";

test("SignalDesk Slack blocks fit message and element limits", () => {
  for (const sample of sampleIncidents) {
    const brief = buildIncidentBrief({
      alertText: sample.alertText,
      reporter: "block-kit-test",
      channel: "security-help"
    });
    const result = assertSlackBlocksValid(buildSlackBlocks(brief));

    assert.equal(result.valid, true, sample.id);
    assert.ok(result.summary.blocks <= 50, sample.id);
    assert.ok(result.summary.interactiveElements <= 50, sample.id);
  }
});

test("SignalDesk App Home blocks fit Block Kit limits", () => {
  const result = assertSlackBlocksValid(buildAppHomeView({ runtimeMode: "mcp" }).blocks);

  assert.equal(result.valid, true);
  assert.ok(result.summary.blocks <= 50);
});

test("SignalDesk help blocks fit Block Kit limits", () => {
  const result = assertSlackBlocksValid(buildSignalDeskHelp({ runtimeMode: "mcp" }).blocks);

  assert.equal(result.valid, true);
  assert.ok(result.summary.blocks <= 50);
});

test("SignalDesk App Home modal blocks fit Block Kit limits", () => {
  for (const modal of [
    buildHomeDemoGuideModal({ runtimeMode: "mcp" }),
    buildHomeProofChecklistModal({ runtimeMode: "mcp" })
  ]) {
    const result = assertSlackBlocksValid(modal.blocks);

    assert.equal(result.valid, true);
    assert.ok(result.summary.blocks <= 50);
  }
});

test("SignalDesk triage error blocks fit Block Kit limits", () => {
  const result = assertSlackBlocksValid(buildTriageErrorPayload({
    runtimeMode: "mcp",
    error: new Error("runtime unavailable")
  }).blocks);

  assert.equal(result.valid, true);
  assert.ok(result.summary.blocks <= 50);
});

test("validateSlackBlocks rejects oversized Slack payloads", () => {
  const result = validateSlackBlocks([
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "x".repeat(3001)
      }
    },
    {
      type: "actions",
      elements: Array.from({ length: 26 }, (_, index) => ({
        type: "button",
        text: {
          type: "plain_text",
          text: `Button ${index}`
        },
        action_id: `action_${index}`,
        value: "ok"
      }))
    }
  ]);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("blocks[0].text.text")));
  assert.ok(result.errors.some((error) => error.includes("blocks[1].elements has 26")));
});
