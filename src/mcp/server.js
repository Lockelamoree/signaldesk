import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { buildIncidentBrief, buildIncidentReport } from "../core/incidentBrief.js";
import { sampleIncidents } from "../core/sampleIncidents.js";

const server = new McpServer({
  name: "signaldesk-security-tools",
  version: "0.1.0"
});

server.registerTool(
  "triage_slack_alert",
  {
    title: "Triage Slack Alert",
    description: "Convert Slack alert or suspicious-message context into an evidence-gated incident brief.",
    inputSchema: {
      alertText: z.string().min(1).max(6000),
      reporter: z.string().optional(),
      channel: z.string().optional(),
      timestamp: z.string().optional()
    }
  },
  async ({ alertText, reporter = "mcp-client", channel = "mcp", timestamp }) => {
    const brief = buildIncidentBrief({ alertText, reporter, channel, timestamp });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(brief, null, 2)
        }
      ],
      structuredContent: brief
    };
  }
);

server.registerTool(
  "build_response_checklist",
  {
    title: "Build Response Checklist",
    description: "Return the first response checklist for a suspected phishing, token exposure, or incident report.",
    inputSchema: {
      alertText: z.string().min(1).max(6000)
    }
  },
  async ({ alertText }) => {
    const brief = buildIncidentBrief({ alertText, reporter: "mcp-client", channel: "mcp" });
    const output = {
      reportDecision: brief.reportDecision,
      severity: brief.severity,
      actions: brief.recommendedActions,
      evidence: brief.evidenceChecklist,
      impactMetrics: brief.impactMetrics,
      guardrails: brief.guardrails
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output, null, 2)
        }
      ],
      structuredContent: output
    };
  }
);

server.registerTool(
  "build_impact_summary",
  {
    title: "Build Impact Summary",
    description: "Return deterministic first-response readiness metrics for a Slack alert.",
    inputSchema: {
      alertText: z.string().min(1).max(6000),
      reporter: z.string().optional(),
      channel: z.string().optional()
    }
  },
  async ({ alertText, reporter = "mcp-client", channel = "mcp" }) => {
    const brief = buildIncidentBrief({ alertText, reporter, channel });
    const output = {
      impactMetrics: brief.impactMetrics,
      reportDecision: brief.reportDecision,
      scenario: brief.scenario,
      severity: brief.severity,
      evidenceValidation: brief.evidenceValidation
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output, null, 2)
        }
      ],
      structuredContent: output
    };
  }
);

server.registerTool(
  "export_evidence_ledger",
  {
    title: "Export Evidence Ledger",
    description: "Return SignalDesk evidence IDs, claim mappings, and validation result for a Slack alert.",
    inputSchema: {
      alertText: z.string().min(1).max(6000),
      reporter: z.string().optional(),
      channel: z.string().optional()
    }
  },
  async ({ alertText, reporter = "mcp-client", channel = "mcp" }) => {
    const brief = buildIncidentBrief({ alertText, reporter, channel });
    const output = {
      evidenceLedger: brief.evidenceLedger,
      claims: brief.claims,
      validation: brief.evidenceValidation
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output, null, 2)
        }
      ],
      structuredContent: output
    };
  }
);

server.registerTool(
  "build_detection_plan",
  {
    title: "Build Detection Plan",
    description: "Return evidence-linked detection opportunities and safe hunt queries for a Slack alert.",
    inputSchema: {
      alertText: z.string().min(1).max(6000),
      reporter: z.string().optional(),
      channel: z.string().optional()
    }
  },
  async ({ alertText, reporter = "mcp-client", channel = "mcp" }) => {
    const brief = buildIncidentBrief({ alertText, reporter, channel });
    const output = {
      detectionOpportunities: brief.detectionOpportunities,
      evidenceValidation: brief.evidenceValidation,
      reportDecision: brief.reportDecision,
      scenario: brief.scenario,
      severity: brief.severity,
      indicators: brief.indicators
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output, null, 2)
        }
      ],
      structuredContent: output
    };
  }
);

server.registerTool(
  "generate_incident_report",
  {
    title: "Generate Incident Report",
    description: "Generate an evidence-gated Markdown incident report for a Slack alert.",
    inputSchema: {
      alertText: z.string().min(1).max(6000),
      reporter: z.string().optional(),
      channel: z.string().optional()
    }
  },
  async ({ alertText, reporter = "mcp-client", channel = "mcp" }) => {
    const brief = buildIncidentBrief({ alertText, reporter, channel });
    const report = buildIncidentReport(brief);
    const output = {
      report,
      evidenceValidation: brief.evidenceValidation,
      impactMetrics: brief.impactMetrics,
      reportDecision: brief.reportDecision,
      scenario: brief.scenario,
      severity: brief.severity
    };

    return {
      content: [
        {
          type: "text",
          text: report
        }
      ],
      structuredContent: output
    };
  }
);

server.registerTool(
  "list_demo_incidents",
  {
    title: "List Demo Incidents",
    description: "Return synthetic incident scenarios used to validate SignalDesk during the hackathon demo.",
    inputSchema: {}
  },
  async () => {
    const output = sampleIncidents.map(({ id, title, alertText, expectedScenario, expectedSeverity, expectedTechniques }) => ({
      id,
      title,
      alertText,
      expectedScenario,
      expectedSeverity,
      expectedTechniques
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output, null, 2)
        }
      ],
      structuredContent: { incidents: output }
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
