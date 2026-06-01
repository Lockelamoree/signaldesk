import { writeFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { sampleIncidents } from "../src/core/sampleIncidents.js";

const expectedTools = [
  "triage_slack_alert",
  "build_response_checklist",
  "build_impact_summary",
  "export_evidence_ledger",
  "build_detection_plan",
  "generate_incident_report",
  "list_demo_incidents"
];

const alertText = sampleIncidents[0].alertText;
const baseArgs = {
  alertText,
  reporter: "mcp-transcript",
  channel: "security-help"
};

const toolCalls = [
  {
    name: "triage_slack_alert",
    arguments: {
      ...baseArgs,
      timestamp: "2026-06-01T12:00:00.000Z"
    }
  },
  {
    name: "build_response_checklist",
    arguments: {
      alertText
    }
  },
  {
    name: "build_impact_summary",
    arguments: baseArgs
  },
  {
    name: "export_evidence_ledger",
    arguments: baseArgs
  },
  {
    name: "build_detection_plan",
    arguments: baseArgs
  },
  {
    name: "generate_incident_report",
    arguments: baseArgs
  },
  {
    name: "list_demo_incidents",
    arguments: {}
  }
];

function tableEscape(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ");
}

function summarizeTool(name, structuredContent) {
  if (name === "triage_slack_alert") {
    return [
      `${structuredContent.severity?.label ?? "unknown"} ${structuredContent.severity?.score ?? "?"}/100`,
      structuredContent.scenario?.label,
      `${structuredContent.evidenceLedger?.length ?? 0} evidence`,
      `${structuredContent.detectionOpportunities?.length ?? 0} detections`,
      `${structuredContent.impactMetrics?.readinessScore ?? 0}/100 readiness`
    ].filter(Boolean).join("; ");
  }

  if (name === "build_response_checklist") {
    return [
      `${structuredContent.actions?.length ?? 0} actions`,
      `${structuredContent.evidence?.length ?? 0} evidence prompts`,
      `${structuredContent.guardrails?.length ?? 0} guardrails`,
      `${structuredContent.impactMetrics?.readinessScore ?? 0}/100 readiness`
    ].join("; ");
  }

  if (name === "build_impact_summary") {
    return [
      `${structuredContent.impactMetrics?.readinessScore ?? 0}/100 readiness`,
      structuredContent.impactMetrics?.impactClaim,
      `validation ${structuredContent.evidenceValidation?.valid === true ? "valid" : "invalid"}`
    ].filter(Boolean).join("; ");
  }

  if (name === "export_evidence_ledger") {
    return [
      `${structuredContent.evidenceLedger?.length ?? 0} evidence IDs`,
      `${structuredContent.claims?.length ?? 0} claims`,
      `validation ${structuredContent.validation?.valid === true ? "valid" : "invalid"}`
    ].join("; ");
  }

  if (name === "build_detection_plan") {
    return [
      `${structuredContent.detectionOpportunities?.length ?? 0} evidence-linked detections`,
      `${structuredContent.indicators?.urls?.length ?? 0} URL`,
      `${structuredContent.indicators?.ips?.length ?? 0} IP`
    ].join("; ");
  }

  if (name === "generate_incident_report") {
    return [
      `${structuredContent.report?.split("\n").length ?? 0} report lines`,
      `${structuredContent.impactMetrics?.readinessScore ?? 0}/100 readiness`,
      `validation ${structuredContent.evidenceValidation?.valid === true ? "valid" : "invalid"}`
    ].join("; ");
  }

  if (name === "list_demo_incidents") {
    return `${structuredContent.incidents?.length ?? 0} synthetic incidents listed`;
  }

  return Object.keys(structuredContent ?? {}).join(", ");
}

function validateToolResult(name, structuredContent) {
  if (!structuredContent || typeof structuredContent !== "object") {
    throw new Error(`${name} did not return structuredContent`);
  }

  if (name === "triage_slack_alert") {
    if (structuredContent.evidenceValidation?.valid !== true) throw new Error(`${name} evidence validation failed`);
    if (!structuredContent.candidateTechniques?.some((technique) => technique.id === "T1528")) {
      throw new Error(`${name} did not return token-theft ATT&CK candidate`);
    }
  }

  if (name === "build_response_checklist") {
    if (!structuredContent.actions?.length || !structuredContent.evidence?.length) {
      throw new Error(`${name} did not return response actions and evidence prompts`);
    }
  }

  if (name === "build_impact_summary") {
    if ((structuredContent.impactMetrics?.readinessScore ?? 0) < 85) {
      throw new Error(`${name} did not return strong readiness`);
    }
    if (!structuredContent.impactMetrics?.impactClaim?.includes("live impact still requires")) {
      throw new Error(`${name} must preserve live-impact evidence boundary`);
    }
  }

  if (name === "export_evidence_ledger" && structuredContent.validation?.valid !== true) {
    throw new Error(`${name} validation failed`);
  }

  if (name === "build_detection_plan") {
    if (!structuredContent.detectionOpportunities?.length) throw new Error(`${name} returned no detections`);
    if (!structuredContent.detectionOpportunities.every((detection) => detection.evidenceIds?.includes("EV-001"))) {
      throw new Error(`${name} detections must cite source evidence`);
    }
  }

  if (name === "generate_incident_report") {
    if (!structuredContent.report?.includes("SignalDesk Incident Report")) {
      throw new Error(`${name} did not return the incident report`);
    }
  }

  if (name === "list_demo_incidents") {
    if ((structuredContent.incidents?.length ?? 0) < 4) {
      throw new Error(`${name} did not list the expected synthetic incidents`);
    }
  }
}

const client = new Client({
  name: "signaldesk-tool-transcript",
  version: "0.1.0"
});

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["src/mcp/server.js"]
});

await client.connect(transport);

try {
  const { tools } = await client.listTools();
  const toolNames = tools.map((tool) => tool.name);
  const missingTools = expectedTools.filter((name) => !toolNames.includes(name));
  if (missingTools.length) {
    throw new Error(`Missing MCP tools: ${missingTools.join(", ")}`);
  }

  const rows = [];
  for (const call of toolCalls) {
    const result = await client.callTool(call);
    validateToolResult(call.name, result.structuredContent);
    rows.push({
      tool: call.name,
      structuredKeys: Object.keys(result.structuredContent ?? {}).join(", "),
      summary: summarizeTool(call.name, result.structuredContent)
    });
  }

  const markdown = [
    "# SignalDesk MCP Tool Transcript",
    "",
    "Generated by `npm.cmd run mcp:transcript`.",
    "",
    "This transcript proves the repo-local MCP stdio server exposes and successfully executes every SignalDesk security tool used by the Slack demo. It uses synthetic data and does not prove live Slack delivery.",
    "",
    "## Tool Inventory",
    "",
    ...expectedTools.map((name) => `- \`${name}\``),
    "",
    "## Tool Call Receipts",
    "",
    "| Tool | Structured Output Keys | Result Summary |",
    "| --- | --- | --- |",
    ...rows.map((row) => `| \`${row.tool}\` | ${tableEscape(row.structuredKeys)} | ${tableEscape(row.summary)} |`),
    "",
    "## Evidence Boundary",
    "",
    "These calls validate MCP tool availability, structured outputs, evidence validation, detection references, report generation, and readiness metrics over stdio. They do not replace the live Slack sandbox proof, which still requires real Slack app credentials and judge-accessible sandbox delivery."
  ].join("\n");

  writeFileSync("docs/mcp-tool-transcript.md", `${markdown}\n`);

  console.log("| Tool | Result | Summary |");
  console.log("| --- | --- | --- |");
  for (const row of rows) {
    console.log(`| ${row.tool} | PASS | ${tableEscape(row.summary)} |`);
  }
  console.log("\nMCP tool transcript written to docs/mcp-tool-transcript.md.");
} finally {
  await client.close();
}
