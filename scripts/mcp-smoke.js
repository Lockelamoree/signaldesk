import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({
  name: "signaldesk-smoke",
  version: "0.1.0"
});

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["src/mcp/server.js"]
});

await client.connect(transport);

try {
  const { tools } = await client.listTools();
  const names = tools.map((tool) => tool.name);

  if (!names.includes("triage_slack_alert")) {
    throw new Error(`triage_slack_alert tool missing; found ${names.join(", ")}`);
  }
  if (!names.includes("list_demo_incidents")) {
    throw new Error(`list_demo_incidents tool missing; found ${names.join(", ")}`);
  }
  if (!names.includes("export_evidence_ledger")) {
    throw new Error(`export_evidence_ledger tool missing; found ${names.join(", ")}`);
  }
  if (!names.includes("generate_incident_report")) {
    throw new Error(`generate_incident_report tool missing; found ${names.join(", ")}`);
  }
  if (!names.includes("build_detection_plan")) {
    throw new Error(`build_detection_plan tool missing; found ${names.join(", ")}`);
  }
  if (!names.includes("build_impact_summary")) {
    throw new Error(`build_impact_summary tool missing; found ${names.join(", ")}`);
  }

  const result = await client.callTool({
    name: "triage_slack_alert",
    arguments: {
      alertText: "User clicked a fake OAuth link at https://login-example.bad and pasted an access token from 198.51.100.23.",
      reporter: "smoke-test",
      channel: "mcp-smoke"
    }
  });

  const summary = result.structuredContent?.summary;
  if (!summary || !summary.toLowerCase().includes("token")) {
    throw new Error(`Unexpected MCP result summary: ${summary ?? "missing"}`);
  }
  if (result.structuredContent.evidenceValidation?.valid !== true) {
    throw new Error("MCP triage result did not include a valid evidence audit");
  }

  const ledger = await client.callTool({
    name: "export_evidence_ledger",
    arguments: {
      alertText: "Suspicious OAuth consent link at https://login-example.bad from 198.51.100.23.",
      reporter: "smoke-test",
      channel: "mcp-smoke"
    }
  });
  if (ledger.structuredContent.validation?.valid !== true) {
    throw new Error("Evidence ledger validation failed");
  }
  const detections = await client.callTool({
    name: "build_detection_plan",
    arguments: {
      alertText: "Suspicious OAuth consent link at https://login-example.bad from 198.51.100.23.",
      reporter: "smoke-test",
      channel: "mcp-smoke"
    }
  });
  if (!detections.structuredContent.detectionOpportunities?.length) {
    throw new Error("Detection plan did not return detection opportunities");
  }
  if (!detections.structuredContent.detectionOpportunities.every((detection) => detection.evidenceIds?.includes("EV-001"))) {
    throw new Error("Detection opportunities must cite source evidence");
  }

  const impact = await client.callTool({
    name: "build_impact_summary",
    arguments: {
      alertText: "User clicked a fake OAuth link at https://login-example.bad and pasted an access token from 198.51.100.23.",
      reporter: "smoke-test",
      channel: "mcp-smoke"
    }
  });
  if ((impact.structuredContent.impactMetrics?.readinessScore ?? 0) < 85) {
    throw new Error("Impact summary did not return strong first-response readiness");
  }
  if (!impact.structuredContent.impactMetrics?.impactClaim?.includes("live impact still requires")) {
    throw new Error("Impact summary must separate readiness from live impact proof");
  }

  const report = await client.callTool({
    name: "generate_incident_report",
    arguments: {
      alertText: "User clicked a fake OAuth link at https://login-example.bad and pasted an access token from 198.51.100.23.",
      reporter: "smoke-test",
      channel: "mcp-smoke"
    }
  });
  if (!report.structuredContent.report?.includes("SignalDesk Incident Report")) {
    throw new Error("Incident report generation failed");
  }

  console.log(JSON.stringify({
    tools: names,
    summary,
    severity: result.structuredContent.severity,
    scenario: result.structuredContent.scenario,
    candidateTechniques: result.structuredContent.candidateTechniques,
    evidenceValidation: result.structuredContent.evidenceValidation,
    ledgerEvidenceCount: ledger.structuredContent.evidenceLedger.length,
    detectionCount: detections.structuredContent.detectionOpportunities.length,
    impactReadinessScore: impact.structuredContent.impactMetrics.readinessScore,
    reportLines: report.structuredContent.report.split("\n").length
  }, null, 2));
} finally {
  await client.close();
}
