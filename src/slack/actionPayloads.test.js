import test from "node:test";
import assert from "node:assert/strict";
import { buildIncidentBrief } from "../core/incidentBrief.js";
import {
  buildFollowupActionBlocks,
  buildChecklistPayload,
  buildCreateChannelPayload,
  buildDetectionsPayload,
  buildEvidencePayload,
  buildGuardrailsPayload,
  buildMissingBriefPayload,
  buildOwnerAckPayload,
  buildReportPayload
} from "./actionPayloads.js";
import { assertSlackBlocksValid } from "./blockKitValidation.js";

const brief = buildIncidentBrief({
  alertText: "Volunteer clicked https://donor-login.example.bad/reset from 198.51.100.23 and pasted an access token.",
  reporter: "max",
  channel: "security-help",
  timestamp: "2026-06-01T12:00:00.000Z"
});

test("action payloads summarize the interactive incident workflow", () => {
  assert.match(buildOwnerAckPayload({ brief, user: "Max" }).text, /took incident ownership/);
  assert.match(buildCreateChannelPayload({ ok: true, channelName: "inc-token-exposure" }).text, /created #inc-token-exposure/);
  assert.match(buildChecklistPayload(brief).text, /SignalDesk evidence checklist/);
  assert.match(buildEvidencePayload(brief).text, /Claim audit/);
  assert.match(buildGuardrailsPayload(brief).text, /Confirm impact with logs/);
  assert.match(buildDetectionsPayload(brief).text, /DET-001/);
  assert.match(buildReportPayload(brief).text, /SignalDesk Incident Report/);
});

test("follow-up action payloads keep the Slack workflow interactive", () => {
  const payloads = [
    buildOwnerAckPayload({ brief, user: "Max" }),
    buildCreateChannelPayload({ ok: true, channelName: "inc-token-exposure" }, brief),
    buildChecklistPayload(brief),
    buildEvidencePayload(brief),
    buildGuardrailsPayload(brief),
    buildDetectionsPayload(brief),
    buildReportPayload(brief)
  ];

  for (const payload of payloads) {
    const rendered = JSON.stringify(payload.blocks);
    const result = assertSlackBlocksValid(payload.blocks);

    assert.equal(result.valid, true);
    assert.ok(rendered.includes("signaldesk_show_evidence"));
    assert.ok(rendered.includes("signaldesk_show_detections"));
    assert.ok(rendered.includes("signaldesk_export_report"));
  }
});

test("low-signal report exports an intake note with follow-up buttons", () => {
  const intakeBrief = buildIncidentBrief({
    alertText: "signaldesk im scared",
    reporter: "max",
    channel: "test",
    timestamp: "2026-06-13T15:19:00.204Z"
  });
  const payload = buildReportPayload(intakeBrief);
  const actionBlocks = buildFollowupActionBlocks(intakeBrief);

  assert.equal(intakeBrief.reportDecision.needed, false);
  assert.match(payload.text, /SignalDesk Intake Note/);
  assert.match(payload.text, /No incident report needed yet/);
  assert.ok(JSON.stringify(payload.blocks).includes("Intake note"));
  assert.equal(actionBlocks[0].elements[0].style, undefined);
});

test("missing brief payloads stay safe and ephemeral", () => {
  assert.deepEqual(buildMissingBriefPayload("Evidence details"), {
    response_type: "ephemeral",
    text: "Evidence details are no longer in memory for this local demo run."
  });
  assert.equal(buildEvidencePayload(undefined).response_type, "ephemeral");
  assert.equal(buildDetectionsPayload(undefined).response_type, "ephemeral");
  assert.equal(buildReportPayload(undefined).response_type, "ephemeral");
});
