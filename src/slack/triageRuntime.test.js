import test from "node:test";
import assert from "node:assert/strict";
import { buildBriefForSlack, buildBriefViaMcp } from "./triageRuntime.js";

const sampleAlert = "User clicked a fake OAuth link at https://login-example.bad and pasted an access token from 198.51.100.23.";

test("buildBriefForSlack defaults to local runtime", async () => {
  const brief = await buildBriefForSlack({
    alertText: sampleAlert,
    reporter: "runtime-test",
    channel: "security-help",
    mode: "local"
  });

  assert.equal(brief.scenario.id, "token_exposure");
  assert.equal(brief.runtime.mode, "local");
  assert.equal(brief.runtime.transport, "direct-module");
  assert.equal(brief.evidenceValidation.valid, true);
});

test("buildBriefViaMcp returns a valid MCP-backed Slack brief", async () => {
  const brief = await buildBriefViaMcp({
    alertText: sampleAlert,
    reporter: "runtime-test",
    channel: "security-help"
  });

  assert.equal(brief.scenario.id, "token_exposure");
  assert.equal(brief.runtime.mode, "mcp");
  assert.equal(brief.runtime.transport, "stdio");
  assert.equal(brief.runtime.tool, "triage_slack_alert");
  assert.equal(brief.evidenceValidation.valid, true);
  assert.ok(brief.detectionOpportunities.length >= 1);
});

test("buildBriefForSlack rejects unknown runtime modes", async () => {
  await assert.rejects(
    () => buildBriefForSlack({
      alertText: sampleAlert,
      mode: "definitely-not-a-runtime"
    }),
    /Unsupported SIGNALDESK_TRIAGE_MODE/
  );
});
