import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { buildIncidentBrief } from "../core/incidentBrief.js";

const LOCAL_MODE = "local";
const MCP_MODE = "mcp";

function normalizeMode(mode) {
  return String(mode || LOCAL_MODE).trim().toLowerCase();
}

function withRuntime(brief, runtime) {
  return {
    ...brief,
    runtime
  };
}

export async function buildBriefForSlack({
  alertText,
  reporter,
  channel,
  timestamp,
  mode = process.env.SIGNALDESK_TRIAGE_MODE
}) {
  const normalizedMode = normalizeMode(mode);

  if (normalizedMode === MCP_MODE) {
    return buildBriefViaMcp({ alertText, reporter, channel, timestamp });
  }

  if (normalizedMode !== LOCAL_MODE) {
    throw new Error(`Unsupported SIGNALDESK_TRIAGE_MODE: ${mode}`);
  }

  return withRuntime(
    buildIncidentBrief({ alertText, reporter, channel, timestamp }),
    {
      mode: LOCAL_MODE,
      transport: "direct-module",
      tool: "buildIncidentBrief"
    }
  );
}

export async function buildBriefViaMcp({
  alertText,
  reporter = "slack-app",
  channel = "slack",
  timestamp,
  serverCommand = process.execPath,
  serverArgs = ["src/mcp/server.js"]
}) {
  const client = new Client({
    name: "signaldesk-slack-bridge",
    version: "0.1.0"
  });
  const transport = new StdioClientTransport({
    command: serverCommand,
    args: serverArgs
  });

  await client.connect(transport);

  try {
    const result = await client.callTool({
      name: "triage_slack_alert",
      arguments: {
        alertText,
        reporter,
        channel,
        timestamp
      }
    });
    const brief = result.structuredContent;

    if (!brief?.summary || brief.evidenceValidation?.valid !== true) {
      throw new Error("MCP triage returned an invalid incident brief");
    }

    return withRuntime(brief, {
      mode: MCP_MODE,
      transport: "stdio",
      tool: "triage_slack_alert",
      server: serverArgs.join(" ")
    });
  } finally {
    await client.close();
  }
}
