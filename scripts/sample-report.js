import { buildIncidentReport } from "../src/core/incidentBrief.js";
import { sampleIncidents } from "../src/core/sampleIncidents.js";
import { buildBriefForSlack } from "../src/slack/triageRuntime.js";

const brief = await buildBriefForSlack({
  alertText: sampleIncidents[0].alertText,
  reporter: "demo-user",
  channel: "security-help",
  timestamp: "2026-06-01T12:00:00.000Z",
  mode: "mcp"
});

console.log(buildIncidentReport(brief));
