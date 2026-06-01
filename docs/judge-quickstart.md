# SignalDesk Judge Quickstart

Current event state checked on June 1, 2026.

This is the shortest path for a judge or reviewer to verify SignalDesk without guessing which artifact matters first. It proves repo-local behavior, then shows exactly what still requires the live Slack developer sandbox.

## 1. Local Proof

Install dependencies with lifecycle scripts disabled:

```powershell
npm.cmd ci --ignore-scripts
```

Run the full local proof suite:

```powershell
npm.cmd run verify
npm.cmd run proof:pack
```

Expected result:

- `npm.cmd run verify` passes.
- `npm.cmd run proof:pack` writes `docs/judge-proof.md`.
- The proof pack records secret scanning, syntax checks, Block Kit limits, Slack interaction transcript generation, Devpost form checks, impact evaluation, recording readiness, MCP smoke tests, Slack-to-MCP bridge proof, fixture validation, public repo readiness, and submission readiness.

## 2. What To Inspect First

Open these artifacts in this order:

1. `README.md` for the product summary and test path.
2. `docs/demo-preview.png` for the repo-local Slack storyboard preview.
3. `docs/judge-proof.md` for command evidence.
4. `docs/impact-evaluation.md` for Agent for Good impact readiness.
5. `docs/recording-readiness.md` for final video proof moments.
6. `docs/slack-interaction-transcript.md` for ownership, evidence, detections, report, guardrail, and channel button responses.
7. `docs/architecture.svg` for the architecture diagram.
8. `docs/rules-compliance.md` for official rules, video restrictions, and manual final attestations.
9. `docs/judge-evidence-matrix.md` for rubric-to-evidence mapping.

The static storyboard is synthetic repo-local proof. It is not a substitute for live Slack sandbox footage.

## 3. Required Technology Proof

Run:

```powershell
npm.cmd run slack:interactions:proof
npm.cmd run smoke:mcp
npm.cmd run mcp:transcript
npm.cmd run smoke:slack-mcp
```

Expected proof:

- `docs/slack-interaction-transcript.md` records the Slack button responses for ownership, channel creation, evidence, detections, report, and guardrails.
- MCP tools include `triage_slack_alert`, `build_response_checklist`, `build_impact_summary`, `export_evidence_ledger`, `build_detection_plan`, `generate_incident_report`, and `list_demo_incidents`.
- `docs/mcp-tool-transcript.md` records validated structured output from every registered MCP tool.
- Slack runtime proof shows `runtime.mode: mcp`, `runtime.transport: stdio`, and `runtime.tool: triage_slack_alert`.

## 4. Live Slack Sandbox Proof

The final Devpost submission still needs a real Slack developer sandbox. After creating the Slack app from `manifest.json`, set:

```powershell
$env:SLACK_BOT_TOKEN="xoxb-redacted"
$env:SLACK_APP_TOKEN="xapp-redacted"
$env:SIGNALDESK_TRIAGE_MODE="mcp"
npm.cmd run sandbox:doctor -- --strict
npm.cmd run start
```

In Slack, use the `Triage with SignalDesk` message shortcut on a synthetic suspicious message, or run the short demo command:

```text
/signaldesk demo
```

Expected Slack result:

- Opening SignalDesk App Home shows the judge test path, fallback command, proof signals, evidence boundary, and clickable `Demo guide` plus `Proof checklist` modals.
- Running `/signaldesk demo` or mentioning SignalDesk with `demo` triggers the canonical synthetic OAuth-phishing incident.
- Running `/signaldesk` without text or mentioning SignalDesk without context shows demo help with the same sample commands and proof signals.
- A Block Kit incident brief appears in Slack.
- The brief shows `Runtime: MCP stdio`.
- The brief includes severity, indicators, candidate ATT&CK techniques, evidence IDs, claim audit, detection checks, first-response readiness, response roles, and guardrails.
- The `Create channel` button creates an incident channel and posts the kickoff message.
- If runtime-check guidance appears instead of a brief, run `npm.cmd run sandbox:doctor -- --strict` and `npm.cmd run smoke:slack-mcp`, then confirm `SIGNALDESK_TRIAGE_MODE=mcp`.

## 5. Devpost Submission Gates

Before final submission:

```powershell
npm.cmd run recording:check
npm.cmd run rules:check
npm.cmd run submission:final:check
npm.cmd run submission:final:online
```

Expected state before URLs exist:

- `submission:final:check` fails because public repo, demo video, Slack sandbox, Devpost URLs, and real Slack token env vars are missing.

Expected state before clicking Submit:

- Public repo URL is reachable.
- Public or unlisted demo video URL is reachable.
- Demo video is hosted on YouTube, Vimeo, Facebook Video, or Youku.
- Slack sandbox URL is reachable or auth-gated for invited judges.
- Devpost project URL is reachable.
- `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, and `SIGNALDESK_TRIAGE_MODE=mcp` are set locally for strict checks.
- `slackhack@salesforce.com` and `testing@devpost.com` are invited to the sandbox as workspace Members.

## Rubric Map

- Technological Implementation: Slack Bolt app, MCP stdio server, Slack-to-MCP smoke test, Block Kit limits, and local unit tests.
- Design: App Home onboarding, message shortcut, `/signaldesk`, app mention flow, action buttons, incident channel creation, and readable Block Kit output.
- Potential Impact: Agent for Good focus for nonprofits, schools, clinics, and community teams, plus `docs/impact-evaluation.md`.
- Quality of the Idea: evidence-gated security workflow with claims, evidence IDs, detections, guardrails, and report export instead of a generic chatbot.

## Evidence Boundary

Confirmed locally: deterministic triage, MCP tool calls, Slack-to-MCP bridge behavior, fixture coverage, impact readiness, recording package readiness, public repo readiness, and submission artifact completeness.

Still external: live Slack sandbox install, judge access, public GitHub URL, public or unlisted demo video, Devpost project URL, and final online link reachability.
