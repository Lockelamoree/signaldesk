# Architecture

```mermaid
flowchart LR
  User["Slack user reports suspicious message or incident"] --> Command["/signaldesk or @SignalDesk mention"]
  Command --> Bolt["Slack Bolt app in Socket Mode"]
  Bolt --> Runtime["Triage runtime local or MCP mode"]
  Runtime --> MCPCall["Optional MCP stdio call"]
  MCPCall --> MCP
  Runtime --> Core
  Core["Deterministic triage core"]
  Core --> Blocks["Slack Block Kit incident brief"]
  Core --> Evidence["Evidence checklist and guardrails"]
  Core --> Detections["Evidence-linked detection opportunities"]
  Core --> Impact["First-response readiness metrics"]
  Core --> Mitre["Candidate MITRE ATT&CK mapping"]
  Blocks --> Channel["Incident channel or current Slack thread"]

  AgentClient["MCP-capable agent client"] --> MCP["SignalDesk MCP server"]
  MCP --> Core

  Admin["Judge or tester"] --> Sandbox["Slack developer sandbox"]
  Sandbox --> Command
```

## Trust Boundaries

- Slack workspace data enters through slash commands or app mentions.
- Slack tokens remain in environment variables and must not be committed.
- MCP requests are local stdio by default, avoiding an exposed network service during the initial demo.
- In `SIGNALDESK_TRIAGE_MODE=mcp`, the Slack app delegates triage to the repo-local MCP stdio server.
- SignalDesk triage output is evidence-gated and must not claim compromise without log validation.
- First-response readiness measures output completeness; it does not prove real-world containment or incident impact.
- Detection opportunities are recommendations for human analysts; they do not imply the queried logs have already confirmed compromise.

## Current Components

- `src/slack/app.js`: Slack Bolt Socket Mode app.
- `src/slack/triageRuntime.js`: local/MCP runtime selector for Slack triage.
- `src/mcp/server.js`: MCP stdio server exposing security triage tools.
- `src/core/incidentBrief.js`: dependency-free triage engine shared by Slack and MCP.
- `scripts/demo.js`: reproducible local demo payload.
- `docs/architecture.svg`: submission-ready architecture diagram.

## Next Architecture Upgrade

- Add Slack RTS or Slack MCP retrieval for permission-aware channel/thread context.
- Add incident state storage with explicit retention controls.
- Add optional identity, proxy, and SaaS log connectors for live detection validation.
