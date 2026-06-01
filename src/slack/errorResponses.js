function redactSensitiveText(value) {
  return String(value ?? "")
    .replace(/\bxox[baprs]-[A-Za-z0-9-]+/g, "xox*-redacted")
    .replace(/\bxapp-[A-Za-z0-9-]+/g, "xapp-redacted")
    .replace(/\bsk-[A-Za-z0-9][A-Za-z0-9_-]{12,}/g, "sk-redacted")
    .replace(/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g, "jwt-redacted")
    .slice(0, 240);
}

function runtimeLabel(mode) {
  return String(mode || "local").trim().toLowerCase() === "mcp" ? "MCP stdio" : "local deterministic";
}

export function buildTriageErrorPayload({ error, runtimeMode = "local" } = {}) {
  const detail = redactSensitiveText(error?.message || error || "unknown_error");

  return {
    text: "SignalDesk could not build the incident brief. Check runtime setup and try again.",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "SignalDesk needs a runtime check",
          emoji: false
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `*Runtime:* ${runtimeLabel(runtimeMode)}`,
            "*Status:* incident brief was not posted.",
            `*Safe detail:* \`${detail || "runtime_error"}\``
          ].join("\n")
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*Before recording, verify:*",
            "- `npm.cmd run sandbox:doctor -- --strict` with real Slack tokens.",
            "- `npm.cmd run smoke:slack-mcp` when `SIGNALDESK_TRIAGE_MODE=mcp`.",
            "- The app is installed after manifest changes and Socket Mode is enabled."
          ].join("\n")
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "No tokens, stack traces, or raw private Slack data are shown in this error response."
          }
        ]
      }
    ]
  };
}
