# Bonus Prize Map

Current event state checked on June 1, 2026.

SignalDesk's primary target is **Slack Agent for Good**. This map keeps the side-prize story explicit without overclaiming anything that still needs live Slack sandbox proof.

## Side-Prize Targets

| Prize | Judge signal | SignalDesk proof | Evidence | Boundary |
| --- | --- | --- | --- | --- |
| Best UX | The Slack experience is easy to test, readable, and action-oriented. | App Home onboarding, clickable Demo guide and Proof checklist modals, `/signaldesk proof`, `/signaldesk demo`, no-input help, safe runtime-check guidance, compact Block Kit action buttons, and a full button-response transcript. | `src/slack/appHome.js`, `src/slack/actionPayloads.js`, `src/slack/commandInput.js`, `src/slack/errorResponses.js`, `docs/slack-ux-proof.md`, `docs/slack-interaction-transcript.md`, `npm.cmd run slack:ux:proof`, `npm.cmd run slack:interactions:proof`, `npm.cmd run check:block-kit`. | Repo-local proof exists; final video must show the live sandbox UX. |
| Most Innovative Slack Agent | The agent is more than a chatbot: it turns unstructured incident context into an evidence-gated response workflow inside Slack. | Evidence IDs, claim audits, candidate ATT&CK mapping, evidence-linked detection checks, first-response readiness metrics, response roles, incident channel creation, button-driven handoff, and report export. | `src/core/incidentBrief.js`, `src/slack/actionPayloads.js`, `docs/sample-incident-report.md`, `docs/impact-evaluation.md`, `docs/slack-interaction-transcript.md`, `docs/judge-evidence-matrix.md`, `docs/demo-preview.png`, `npm.cmd run impact:evaluate`, `npm.cmd run validate:fixtures`. | Synthetic readiness is proven; live operational impact must not be claimed without real responder evidence. |
| Best Technological Implementation | The required technology is central, testable, and visible. | Slack Bolt app in Socket Mode, MCP stdio server, Slack-to-MCP runtime bridge, full MCP tool transcript, unit tests, secret scan, Block Kit validation, and final submission gates. | `src/slack/app.js`, `src/slack/triageRuntime.js`, `src/mcp/server.js`, `docs/mcp-tool-transcript.md`, `docs/judge-proof.md`, `npm.cmd run mcp:transcript`, `npm.cmd run smoke:slack-mcp`, `npm.cmd run verify`. | MCP and repo-local behavior are proven; Slack event delivery still requires sandbox credentials and judge-accessible installation. |

## Demo Placement

- Open with the Agent for Good user and the live Slack surface.
- Show App Home or `/signaldesk proof` before `/signaldesk demo` and terminal proof so Best UX is visible early.
- Show `Runtime: MCP stdio`, evidence IDs, detection checks, and first-response readiness before the one-minute mark.
- Use the terminal proof only after the Slack workflow is visibly working.
- Close with the safety boundary: SignalDesk prepares the first response and avoids unsupported compromise claims.

## Submission Copy Guardrail

Use these prizes as evidence structure, not as entitlement language. Say SignalDesk is **designed to compete for** Best UX, Most Innovative Slack Agent, and Best Technological Implementation; do not say it deserves or has won them.
