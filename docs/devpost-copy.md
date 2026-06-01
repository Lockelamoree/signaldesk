# Devpost Copy

## Project Name

SignalDesk

## Tagline

Slack-native security incident triage for teams without a SOC.

## Elevator Pitch

SignalDesk gives nonprofits, schools, clinics, and community teams a safe first 15 minutes when a suspicious Slack message, leaked token, or incident report appears. It turns messy alert text into a structured Slack incident brief with severity, indicators, likely ATT&CK techniques, response roles, evidence-linked detection checks, evidence checklist, and guardrails against overclaiming.

## Track

Slack Agent for Good

## Inspiration

Many public-interest teams coordinate real work in Slack but do not have dedicated security responders. When someone reports a phishing link, OAuth consent trick, suspicious script, or possible data exposure, the first response is often a chaotic thread: unclear owner, missing evidence, premature impact claims, and delayed containment. SignalDesk exists to make that first response calmer, faster, and more evidence-driven.

## What It Does

SignalDesk adds a message shortcut, `/signaldesk` command, and app mention flow inside Slack. A user can triage the suspicious Slack message in place or paste alert text, and SignalDesk produces a Block Kit incident brief that includes:

- Scenario classification such as token exposure, credential phishing, malware execution, or possible data exfiltration.
- Severity score and label.
- Extracted URLs, IP addresses, domains, email addresses, and hashes.
- Candidate MITRE ATT&CK techniques.
- Stable evidence IDs and claim-to-evidence audit trail.
- Evidence-linked detection opportunities with safe hunt queries for identity, Slack, proxy/DNS, OAuth, endpoint, and cloud logs.
- First-response readiness metrics that show whether evidence, claims, detections, roles, guardrails, and Slack coordination are prepared.
- First response actions.
- Evidence-gated Markdown incident report export.
- One-click public incident channel creation with kickoff message.
- Suggested incident roles.
- Suggested incident channel name and kickoff message.
- Evidence checklist and safety guardrails.
- Interactive buttons for taking ownership, creating the incident channel, showing the evidence checklist, reviewing detection opportunities, exporting the report, and checking guardrails.

SignalDesk also publishes a Slack App Home tab, clickable Demo guide and Proof checklist modals, `/signaldesk proof`, and no-input demo help that give judges and responders the `/signaldesk demo` command, full synthetic fallback command, expected proof signals, MCP runtime expectation, and evidence boundary before they run the workflow.

For the judged demo, the Slack app can run with `SIGNALDESK_TRIAGE_MODE=mcp`, so Slack triage delegates to the MCP stdio server through `triage_slack_alert`. The MCP server also exposes `build_response_checklist`, `build_impact_summary`, `export_evidence_ledger`, `build_detection_plan`, `generate_incident_report`, and `list_demo_incidents`.

## How We Built It

SignalDesk is a Node.js Slack app built with Bolt for JavaScript in Socket Mode. The core triage engine is dependency-light and shared between the Slack app and the MCP server, and the Slack runtime has an MCP-backed mode that calls the MCP `triage_slack_alert` tool for live Slack responses.

The MCP server uses the official Model Context Protocol TypeScript SDK over stdio. Synthetic validation fixtures cover several incident types: nonprofit OAuth phishing, school script execution, clinic exfiltration warning, and a low-signal community report.

Every incident brief includes an evidence ledger (`EV-001`, `EV-002`, etc.), claims (`CL-001`, `CL-002`, etc.), detection opportunities (`DET-001`, `DET-002`, etc.) that cite evidence IDs, and first-response readiness metrics (`IM-001`, `IM-002`, etc.) that separate output completeness from live impact proof. The validator rejects unknown evidence IDs and invalid field references.

Slack-only workflow behavior is also covered locally: message shortcut text extraction, Slack-safe channel naming, channel creation success, name-collision retry, missing-scope handling, and reusable action payloads are tested with fake Slack clients before the live sandbox run. `docs/slack-interaction-transcript.md` records the ownership, channel creation, checklist, evidence, detections, report, and guardrail button responses; `docs/slack-interaction-preview.html` gives judges a visual contact sheet for those synthetic button states.
Generated Block Kit payloads are also checked against Slack message, section, action, and button limits before recording.

## Slack Technology Used

- Slack app with slash command and app mention flow.
- Slack message shortcut for triaging an existing message in place.
- Slack Block Kit incident brief.
- Slack interactivity buttons.
- MCP server integration for reusable security tools and optional MCP-backed Slack triage.

## Impact

SignalDesk is built for teams that protect donors, students, patients, volunteers, and community members without enterprise security staff. The impact is not "AI replaces responders." The impact is that the first responder gets a reliable checklist, a named owner, and a no-drama path to preserve evidence and contain obvious risk.

The repo includes `npm.cmd run impact:evaluate`, which generates `docs/impact-evaluation.md`. In the current deterministic fixture set, SignalDesk reaches 98.3/100 average first-response readiness across nonprofit operations, education, public health, and community safety scenarios while keeping the live-impact boundary explicit.

## What Makes It Different

SignalDesk is not a generic chatbot inside Slack. It is a narrow incident-response workflow where Slack is the right place for the work to happen. It also deliberately avoids claiming compromise or attribution without evidence. That makes it safer for real teams during stressful moments.

## Challenges

The hardest design tradeoff was keeping the output useful without pretending deterministic triage is a full investigation. SignalDesk intentionally labels its ATT&CK matches as candidates, includes guardrails, and asks responders to validate impact with logs.

## Accomplishments

- Shared triage engine across Slack and MCP.
- Working MCP smoke test that spawns the server and calls the triage tool.
- Full MCP tool transcript that exercises every registered SignalDesk MCP tool and records structured output.
- Slack-to-MCP bridge smoke test proving the Slack runtime can call the MCP triage tool.
- Evidence-gated incident report export.
- Evidence-linked detection plan for analyst handoff.
- Deterministic first-response readiness metrics for Agent for Good impact proof.
- Reproducible Agent for Good impact evaluation across synthetic nonprofit, school, clinic, and community-team incidents.
- Recording readiness preflight that verifies the final video package shows Slack proof, MCP runtime, evidence IDs, readiness, and sandbox access requirements before the final take.
- Judge quickstart that gives reviewers the shortest local proof path and separates repo-local evidence from live sandbox gates.
- Slack UX proof artifact that validates App Home, help, modal, and safe-error Block Kit surfaces before live sandbox recording.
- Slack interaction transcript and visual preview proving the button-driven handoff path before live sandbox recording.
- Rules compliance map for video host, sandbox access, sensitive-data controls, and final manual attestations.
- Synthetic fixture validation for multiple incident categories.
- Slack Block Kit response with clear roles and action buttons.
- Slack App Home onboarding surface for the judge test path.
- App Home Demo guide and Proof checklist modals for low-friction judge verification.
- `/signaldesk demo`, `/signaldesk proof`, no-input `/signaldesk`, and app mention help for judges who need the synthetic demo command or proof checklist without typing a long fixture.
- Safe runtime-check response if MCP or Slack setup fails during live testing, without exposing tokens or stack traces.
- Optional private synthetic-demo brief recovery so Slack buttons can survive a local app restart during recording without committing state.
- Slack channel creation action for incident coordination.
- Submission-ready architecture and demo script.

## What We Learned

For security workflows, the fastest path is not always the most autonomous one. A good agent should reduce uncertainty, preserve evidence, and help humans make better decisions before taking irreversible action.

## What's Next

- Add Slack Real-Time Search or Slack MCP retrieval for permission-aware thread context.
- Add optional incident state storage with explicit retention controls.
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
