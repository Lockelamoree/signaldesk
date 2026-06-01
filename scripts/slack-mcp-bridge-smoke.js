import { buildBriefForSlack } from "../src/slack/triageRuntime.js";

const brief = await buildBriefForSlack({
  alertText: "Volunteer clicked a fake donor portal link at https://donor-login.example.bad/reset from 198.51.100.23, approved an MFA prompt, and pasted an access token.",
  reporter: "bridge-smoke",
  channel: "security-help",
  mode: "mcp"
});

if (brief.runtime?.mode !== "mcp") {
  throw new Error(`Expected MCP runtime, got ${brief.runtime?.mode ?? "missing"}`);
}
if (brief.evidenceValidation?.valid !== true) {
  throw new Error("MCP-backed Slack brief failed evidence validation");
}
if (!brief.detectionOpportunities?.length) {
  throw new Error("MCP-backed Slack brief did not include detection opportunities");
}
if ((brief.impactMetrics?.readinessScore ?? 0) < 85) {
  throw new Error("MCP-backed Slack brief did not include strong first-response readiness");
}

console.log(JSON.stringify({
  runtime: brief.runtime,
  summary: brief.summary,
  scenario: brief.scenario,
  severity: brief.severity,
  evidenceValidation: brief.evidenceValidation,
  impactReadinessScore: brief.impactMetrics.readinessScore,
  detectionCount: brief.detectionOpportunities.length,
  evidenceCount: brief.evidenceLedger.length
}, null, 2));
