import { buildIncidentReport, buildSlackBlocks } from "../src/core/incidentBrief.js";
import { sampleIncidents } from "../src/core/sampleIncidents.js";
import { buildBriefForSlack } from "../src/slack/triageRuntime.js";

const sampleAlert = sampleIncidents[0].alertText;

const brief = await buildBriefForSlack({
  alertText: sampleAlert,
  reporter: "demo-user",
  channel: "security-help",
  mode: "mcp"
});

console.log(JSON.stringify({
  brief,
  slackBlocks: buildSlackBlocks(brief),
  markdownReport: buildIncidentReport(brief)
}, null, 2));
