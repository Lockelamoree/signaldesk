# Devpost Copy

## Project Name

SignalDesk

## Tagline

Slack incident response for small teams that do not have a SOC.

## Elevator Pitch

SignalDesk helps nonprofits, schools, clinics, and community teams handle the first 15 minutes of a security scare in Slack. It turns a messy report into a structured incident brief with severity, indicators, candidate ATT&CK techniques, response roles, evidence-linked detection checks, an evidence checklist, and guardrails against overclaiming.

## Track

Slack Agent for Good

## Inspiration

I built SignalDesk around a very common security moment: someone posts "is this bad?" in Slack, and suddenly the team is trying to investigate in a thread while also doing their actual jobs.

For a large company, that thread probably gets routed to a SOC. For a nonprofit, school, clinic, or volunteer team, there may be no SOC. There may be one technical person, a busy operations lead, and a lot of uncertainty. SignalDesk exists to make that first response calmer: preserve evidence, assign an owner, check the right logs, and avoid declaring compromise before the facts are there.

## What It Does

SignalDesk adds a message shortcut, `/signaldesk` command, App Home, and app mention flow inside Slack. A responder can triage the suspicious message in place or paste alert text, then get a Block Kit incident brief that includes:

- Scenario classification such as token exposure, credential phishing, malware execution, or possible data exfiltration.
- Severity score and label.
- Extracted URLs, IP addresses, domains, email addresses, and hashes.
- Candidate MITRE ATT&CK techniques.
- Stable evidence IDs and claim-to-evidence audit trail.
- Evidence-linked detection opportunities with safe hunt queries for identity, Slack, proxy/DNS, OAuth, endpoint, and cloud logs.
- First-response readiness metrics that show whether evidence, claims, detections, roles, guardrails, and Slack coordination are prepared.
- First response actions.
- Markdown incident report export.
- One-click incident channel creation with a kickoff message.
- Suggested incident roles.
- Evidence checklist and safety guardrails.
- Interactive buttons for taking ownership, creating the incident channel, showing the evidence checklist, reviewing detection opportunities, exporting the report, and checking guardrails.

SignalDesk also includes a Slack App Home tab, clickable Demo guide and Proof checklist modals, `/signaldesk proof`, and no-input demo help. Those surfaces are mainly there to make the judge path honest and easy: here is the demo command, here is what proof to look for, here is the MCP runtime expectation, and here is what is still synthetic.

For the judged demo, the Slack app can run with `SIGNALDESK_TRIAGE_MODE=mcp`, so Slack triage delegates to the MCP stdio server through `triage_slack_alert`. The same Model Context Protocol server also exposes `build_response_checklist`, `build_impact_summary`, `export_evidence_ledger`, `build_detection_plan`, `generate_incident_report`, and `list_demo_incidents`.

## How We Built It

SignalDesk is a Node.js Slack app built with Bolt for JavaScript in Socket Mode. I kept the triage engine small and shared it between the Slack app and the MCP server, so the same logic powers the local tests, the Slack workflow, and the MCP tools. In MCP mode, Slack calls the `triage_slack_alert` tool for live Slack responses.

The MCP server uses the official Model Context Protocol TypeScript SDK over stdio. The synthetic fixtures cover the situations I wanted to support first: nonprofit OAuth phishing, school script execution, clinic exfiltration warning, and a low-signal community report.

Every brief includes an evidence ledger (`EV-001`, `EV-002`, etc.), claims (`CL-001`, `CL-002`, etc.), detection opportunities (`DET-001`, `DET-002`, etc.) that cite evidence IDs, and first-response readiness metrics (`IM-001`, `IM-002`, etc.). The validator rejects unknown evidence IDs and invalid field references, because security output should not be allowed to quietly drift away from its evidence.

Slack-only behavior is tested locally too: message shortcut extraction, Slack-safe channel names, channel creation, name-collision retry, missing-scope handling, and reusable action payloads. `docs/slack-interaction-transcript.md` records the ownership, channel creation, checklist, evidence, detections, report, and guardrail button responses; `docs/slack-interaction-preview.html` gives judges a visual interaction preview for those synthetic button states. Generated Block Kit payloads are checked against Slack message, section, action, and button limits before recording. The Slack-to-MCP bridge, rules compliance map, Agent for Good impact evaluation, and bonus-prize evidence map are included so the submission has receipts instead of hand-waving.

## Slack Technology Used

- Slack app with slash command and app mention flow.
- Slack message shortcut for triaging an existing message in place.
- Slack Block Kit incident brief.
- Slack interactivity buttons.
- MCP server integration for reusable security tools and optional MCP-backed Slack triage.

## Impact

SignalDesk is built for teams that protect donors, students, patients, volunteers, and community members without enterprise security staff. The impact is not "AI replaces responders." The impact is that the first responder gets a reliable checklist, a named owner, and a no-drama path to preserve evidence and contain obvious risk.

The repo includes `npm.cmd run impact:evaluate`, which generates `docs/impact-evaluation.md`. In the current fixture set, SignalDesk reaches 98.3/100 average first-response readiness across nonprofit operations, education, public health, and community safety scenarios while keeping the live-impact boundary explicit.

## What Makes It Different

SignalDesk is not a generic chatbot dropped into Slack. It is a narrow incident-response workflow for a place where incident coordination already happens. It deliberately avoids claiming compromise or attribution without evidence, which matters when a stressed team is trying not to make the situation worse.

## Challenges

The hardest design tradeoff was keeping the output useful without pretending the agent completed an investigation. SignalDesk labels ATT&CK matches as candidates, includes guardrails, and pushes responders back to logs before they call anything confirmed.

## Accomplishments

- Shared triage engine across Slack and MCP.
- Working MCP smoke test that spawns the server and calls the triage tool.
- Full MCP tool transcript for every registered SignalDesk MCP tool.
- Slack-to-MCP bridge smoke test proving the Slack runtime can call the MCP triage tool.
- Incident report export and evidence-linked detection plan for analyst handoff.
- First-response readiness metrics for Agent for Good impact proof.
- Reproducible impact evaluation across synthetic nonprofit, school, clinic, and community-team incidents.
- Recording readiness preflight for Slack proof, MCP runtime, evidence IDs, readiness, and sandbox access.
- Judge quickstart that separates repo-local evidence from live sandbox gates.
- Slack UX proof for App Home, help, modal, and safe-error Block Kit surfaces.
- Slack interaction transcript and visual preview for the button-driven handoff path.
- Rules compliance map for video host, sandbox access, sensitive-data controls, and final manual attestations.
- Synthetic fixture validation for multiple incident categories.
- Slack Block Kit response with roles, action buttons, and incident channel creation.
- App Home Demo guide and Proof checklist modals for low-friction judge verification.
- `/signaldesk demo`, `/signaldesk proof`, no-input `/signaldesk`, and app mention help for judges who need the demo command or proof checklist quickly.
- Safe runtime-check response if MCP or Slack setup fails, without exposing tokens or stack traces.
- Optional private synthetic-demo brief recovery so Slack buttons can survive a local app restart during recording without committing state.
- Submission-ready architecture and demo script.

## What We Learned

For security workflows, the most useful agent is not always the most autonomous one. A good agent should reduce uncertainty, preserve evidence, and help humans make better decisions before anyone takes an irreversible action.

## What's Next

- Add Slack Real-Time Search or Slack MCP retrieval for permission-aware thread context.
- Add integrations for identity provider logs and URL reputation lookups.
- Persist incident state with explicit retention controls for longer live response windows.
- Build a lightweight nonprofit onboarding template.

## Built With

Node.js, Slack Bolt, Slack Block Kit, Slack Socket Mode, Model Context Protocol, JavaScript.

## Testing Instructions

```powershell
npm.cmd ci --ignore-scripts
npm.cmd test
npm.cmd run check:block-kit
npm.cmd run demo:thumbnail:check
npm.cmd run smoke:mcp
npm.cmd run smoke:slack-mcp
npm.cmd run validate:fixtures
npm.cmd run report:sample
npm.cmd run proof:pack
npm.cmd run verify
```

For Slack testing, create an app from `manifest.json`, set `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, and `SIGNALDESK_TRIAGE_MODE=mcp`, then run:

```powershell
$env:SIGNALDESK_TRIAGE_MODE="mcp"
npm.cmd run start
```

Use the short demo command:

```text
/signaldesk demo
```
