import test from "node:test";
import assert from "node:assert/strict";
import { buildIncidentBrief, buildImpactMetrics, buildIncidentReport, buildSlackBlocks, classifyScenario, extractIndicators, mapMitreTechniques, validateEvidenceClaims } from "./incidentBrief.js";
import { sampleIncidents } from "./sampleIncidents.js";

const sampleAlert = "User clicked a fake OAuth consent page at https://login-example.bad/oauth from 198.51.100.23 and pasted an access token.";

test("extractIndicators finds core IOC types", () => {
  const indicators = extractIndicators(sampleAlert);

  assert.deepEqual(indicators.ips, ["198.51.100.23"]);
  assert.equal(indicators.urls[0], "https://login-example.bad/oauth");
  assert.ok(indicators.domains.includes("login-example.bad"));
});

test("mapMitreTechniques maps credential and token language", () => {
  const techniques = mapMitreTechniques(sampleAlert).map((technique) => technique.id);

  assert.ok(techniques.includes("T1566"));
  assert.ok(techniques.includes("T1528"));
});

test("buildIncidentBrief returns actionable triage", () => {
  const brief = buildIncidentBrief({
    alertText: sampleAlert,
    reporter: "max",
    channel: "security-help"
  });

  assert.equal(brief.reporter, "max");
  assert.equal(brief.channel, "security-help");
  assert.equal(brief.scenario.id, "token_exposure");
  assert.equal(brief.severity.label, "high");
  assert.ok(brief.recommendedActions.some((action) => action.includes("Revoke or rotate")));
  assert.ok(brief.roleAssignments.some((assignment) => assignment.role === "Containment lead"));
  assert.equal(brief.slackPlan.suggestedChannelName, "inc-token-exposure");
  assert.equal(brief.evidenceValidation.valid, true);
  assert.ok(brief.evidenceLedger.some((evidence) => evidence.id === "EV-001"));
  assert.ok(brief.claims.every((claim) => claim.evidenceIds.length > 0));
  assert.ok(brief.detectionOpportunities.length >= 3);
  const knownEvidenceIds = new Set(brief.evidenceLedger.map((evidence) => evidence.id));
  assert.ok(brief.detectionOpportunities.every((detection) => detection.evidenceIds.every((id) => knownEvidenceIds.has(id))));
  assert.ok(brief.detectionOpportunities.some((detection) => detection.logSource.includes("OAuth")));
  assert.equal(brief.impactMetrics.readinessLabel, "strong");
  assert.ok(brief.impactMetrics.readinessScore >= 85);
  assert.equal(brief.impactMetrics.counters.detectionChecks, brief.detectionOpportunities.length);
  assert.ok(brief.impactMetrics.signals.some((signal) => signal.id === "IM-003" && signal.evidenceIds.includes("EV-001")));
  assert.ok(brief.guardrails.length >= 2);
});

test("buildSlackBlocks returns Slack block kit payload", () => {
  const brief = buildIncidentBrief({ alertText: sampleAlert });
  const blocks = buildSlackBlocks(brief);

  assert.equal(blocks[0].type, "header");
  assert.ok(blocks.some((block) => block.type === "section"));
  assert.ok(blocks.some((block) => block.type === "actions"));
  for (const block of blocks.filter((item) => item.type === "actions")) {
    assert.ok(block.elements.length <= 5, "Slack action blocks allow at most 5 elements");
  }
  assert.ok(JSON.stringify(blocks).includes("Evidence IDs"));
  assert.ok(JSON.stringify(blocks).includes("Detection Checks"));
  assert.ok(JSON.stringify(blocks).includes("First-Response Readiness"));
  assert.ok(JSON.stringify(blocks).includes("signaldesk_create_channel"));
  assert.ok(JSON.stringify(blocks).includes("signaldesk_show_detections"));
  assert.ok(JSON.stringify(blocks).includes("signaldesk_export_report"));
});

test("buildImpactMetrics separates readiness from live impact proof", () => {
  const brief = buildIncidentBrief({
    alertText: sampleAlert,
    reporter: "max",
    channel: "security-help"
  });
  const metrics = buildImpactMetrics({
    evidenceLedger: brief.evidenceLedger,
    claims: brief.claims,
    evidenceValidation: brief.evidenceValidation,
    detectionOpportunities: brief.detectionOpportunities,
    roleAssignments: brief.roleAssignments,
    evidenceChecklist: brief.evidenceChecklist,
    recommendedActions: brief.recommendedActions,
    guardrails: brief.guardrails,
    slackPlan: brief.slackPlan
  });

  assert.equal(metrics.readinessLabel, "strong");
  assert.ok(metrics.readinessScore >= 85);
  assert.match(metrics.impactClaim, /live impact still requires/i);
  assert.ok(metrics.signals.every((signal) => Array.isArray(signal.evidenceIds)));
});

test("classifyScenario returns a safe fallback for weak reports", () => {
  const scenario = classifyScenario("Someone saw a strange message but no link was shared.");

  assert.equal(scenario.id, "security_report");
});

test("sample incidents satisfy expected scenario, severity, and techniques", () => {
  for (const sample of sampleIncidents) {
    const brief = buildIncidentBrief({
      alertText: sample.alertText,
      reporter: "fixture",
      channel: "fixture"
    });
    const techniqueIds = brief.candidateTechniques.map((technique) => technique.id);

    assert.equal(brief.scenario.id, sample.expectedScenario, sample.id);
    assert.equal(brief.severity.label, sample.expectedSeverity, sample.id);
    assert.equal(brief.evidenceValidation.valid, true, sample.id);
    assert.ok(brief.detectionOpportunities.length >= 1, `${sample.id} missing detection opportunities`);
    for (const expectedTechnique of sample.expectedTechniques) {
      assert.ok(techniqueIds.includes(expectedTechnique), `${sample.id} missing ${expectedTechnique}`);
    }
  }
});

test("validateEvidenceClaims rejects unknown evidence references", () => {
  const result = validateEvidenceClaims({
    evidenceLedger: [{ id: "EV-001", type: "source_report", source: "test", fields: { alertText: "x" } }],
    claims: [{
      id: "CL-X",
      status: "candidate",
      text: "bad ref",
      evidenceIds: ["EV-999"],
      fieldRefs: ["EV-001.fields.missing"]
    }]
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 2);
});

test("buildIncidentReport exports evidence-gated markdown", () => {
  const brief = buildIncidentBrief({
    alertText: sampleAlert,
    reporter: "max",
    channel: "security-help"
  });
  const report = buildIncidentReport(brief);

  assert.ok(report.startsWith("# SignalDesk Incident Report"));
  assert.ok(report.includes("## Evidence Ledger"));
  assert.ok(report.includes("## First-Response Readiness"));
  assert.ok(report.includes("EV-001"));
  assert.ok(report.includes("## Claim Audit"));
  assert.ok(report.includes("## Detection Opportunities"));
  assert.ok(report.includes("DET-001"));
  assert.ok(report.includes("Evidence claim validation passed."));
});
