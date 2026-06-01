# SignalDesk Judge One-Pager

Current event state checked on June 1, 2026.

SignalDesk is a Slack-native security incident triage agent for nonprofits, schools, clinics, and community teams that coordinate in Slack but do not have a full SOC. It turns a messy suspicious message or alert into a structured Slack incident brief with evidence IDs, claim checks, detection opportunities, first-response roles, guardrails, and an incident channel handoff.

## 30-Second Read

- Track: `Slack Agent for Good`.
- Required technology: MCP server integration through `SIGNALDESK_TRIAGE_MODE=mcp`.
- Slack proof: App Home, `/signaldesk demo`, message shortcut, Block Kit brief, action buttons, and incident channel creation.
- Security proof: evidence IDs (`EV-*`), claim IDs (`CL-*`), detection IDs (`DET-*`), impact/readiness metrics (`IM-*`), and unsupported-claim guardrails.
- Impact proof: `npm.cmd run impact:evaluate` records 98.3/100 average first-response readiness across synthetic nonprofit, school, clinic, and community-team incidents.

## Why It Matters

Small public-interest teams often discover security issues inside Slack: a suspicious donor portal link, a leaked token, an OAuth consent trick, a script someone downloaded, or a possible data exposure. SignalDesk gives them a safe first 15 minutes: preserve evidence, name an owner, create a channel, generate detection checks, and avoid declaring compromise before logs prove it.

## What To Watch In The Demo

1. Slack is the work surface: App Home, slash command, app mention, or message shortcut starts the workflow.
2. The brief shows `Runtime: MCP stdio`, proving the Slack triage path can call the MCP `triage_slack_alert` tool.
3. The response includes severity, scenario, extracted indicators, candidate ATT&CK techniques, evidence IDs, claim audit, detections, readiness score, roles, and guardrails.
4. `Create channel` creates a dedicated incident channel and posts the kickoff message.
5. `Evidence`, `Detections`, and `Report` turn the Slack brief into an analyst handoff.
6. Terminal proof shows `npm.cmd run smoke:slack-mcp`, `npm.cmd run mcp:transcript`, and `npm.cmd run verify`.

## Rubric Fit

| Criterion | SignalDesk proof |
| --- | --- |
| Technological Implementation | Slack Bolt app, Socket Mode, Block Kit, MCP stdio server, `triage_slack_alert`, full MCP transcript, Slack-to-MCP smoke test, unit tests, secret scan, and CI. |
| Design | App Home judge path, short demo command, no-input help, readable Block Kit brief, action buttons, safe runtime-check guidance, and button transcript. |
| Potential Impact | Agent for Good focus for under-resourced teams plus measurable first-response readiness across nonprofit, education, public health, and community scenarios. |
| Quality of the Idea | Narrow evidence-gated incident response workflow inside Slack, not a generic chatbot. It preserves assumptions and turns conversation into coordinated action. |

## Fast Local Verification

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run verify
npm.cmd run proof:pack
npm.cmd run submission:live-gates
```

High-signal proof files:

- `docs/judge-proof.md`: command receipts.
- `docs/mcp-tool-transcript.md`: every MCP tool call.
- `docs/slack-interaction-transcript.md`: Slack button and channel workflow.
- `docs/impact-evaluation.md`: Agent for Good readiness evaluation.
- `docs/judge-evidence-matrix.md`: full rubric-to-evidence map.
- `docs/live-gate-handoff.md`: account-bound steps still owned by Max.

## Evidence Boundary

Confirmed repo-local today:

- MCP tools are callable and return validated structured output.
- Slack runtime can call MCP-backed triage.
- Block Kit payloads pass local Slack limits.
- Synthetic fixture coverage spans token exposure, phishing, malware execution, possible data exfiltration, and low-signal reports.
- Secret scan and public repo readiness checks pass locally.

Still required before Devpost submit:

- Public GitHub repo URL.
- Live Slack developer sandbox install.
- Judge access for `slackhack@salesforce.com` and `testing@devpost.com`.
- Public or unlisted demo video under 3 minutes.
- Devpost project URL.
- Passing `npm.cmd run submission:final:check` and `npm.cmd run submission:final:online`.

