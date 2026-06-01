import test from "node:test";
import assert from "node:assert/strict";
import { buildIncidentBrief } from "../core/incidentBrief.js";
import {
  buildChecklistPayload,
  buildCreateChannelPayload,
  buildDetectionsPayload,
  buildEvidencePayload,
  buildGuardrailsPayload,
  buildMissingBriefPayload,
  buildOwnerAckPayload,
  buildReportPayload
} from "./actionPayloads.js";

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

test("missing brief payloads stay safe and ephemeral", () => {
  assert.deepEqual(buildMissingBriefPayload("Evidence details"), {
    response_type: "ephemeral",
    text: "Evidence details are no longer in memory for this local demo run."
  });
  assert.equal(buildEvidencePayload(undefined).response_type, "ephemeral");
  assert.equal(buildDetectionsPayload(undefined).response_type, "ephemeral");
  assert.equal(buildReportPayload(undefined).response_type, "ephemeral");
});
