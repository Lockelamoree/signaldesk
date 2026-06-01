import { mkdirSync, writeFileSync } from "node:fs";
import { buildIncidentReport, buildSlackBlocks } from "../src/core/incidentBrief.js";
import { sampleIncidents } from "../src/core/sampleIncidents.js";
import { buildBriefForSlack } from "../src/slack/triageRuntime.js";

const outDir = "artifacts/demo";
mkdirSync(outDir, { recursive: true });

const brief = await buildBriefForSlack({
  alertText: sampleIncidents[0].alertText,
  reporter: "demo-user",
  channel: "security-help",
  timestamp: "2026-06-01T12:00:00.000Z",
  mode: "mcp"
});
const slackBlocks = buildSlackBlocks(brief);
const report = buildIncidentReport(brief);

writeFileSync(`${outDir}/incident-brief.json`, `${JSON.stringify(brief, null, 2)}\n`);
writeFileSync(`${outDir}/slack-blocks.json`, `${JSON.stringify(slackBlocks, null, 2)}\n`);
writeFileSync(`${outDir}/incident-report.md`, `${report}\n`);
writeFileSync(`${outDir}/demo-summary.txt`, [
  "SignalDesk demo assets",
  `Runtime: ${brief.runtime.mode} (${brief.runtime.transport}, ${brief.runtime.tool})`,
  `Scenario: ${brief.scenario.label}`,
  `Severity: ${brief.severity.label.toUpperCase()} (${brief.severity.score}/100)`,
  `Indicators: ${Object.values(brief.indicators).reduce((count, values) => count + values.length, 0)}`,
  `Evidence IDs: ${brief.evidenceLedger.map((evidence) => evidence.id).join(", ")}`,
  `Claims: ${brief.claims.map((claim) => claim.id).join(", ")}`,
  `Detections: ${brief.detectionOpportunities.map((detection) => detection.id).join(", ")}`,
  `First-response readiness: ${brief.impactMetrics.readinessScore}/100 (${brief.impactMetrics.readinessLabel})`,
  "Expected live proof: /signaldesk brief, Create channel, Evidence, Detections, Report, Slack-to-MCP smoke."
].join("\n"));

console.log(`Demo assets written to ${outDir}`);
