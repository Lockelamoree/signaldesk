# Devpost Form Pack

Use this as the final copy/paste source when filling Devpost. Replace the `TODO_*` placeholders only after the public repo, demo video, Devpost URL, and Slack sandbox URL exist.

## Project Name

SignalDesk

## Elevator Pitch

MCP-backed Slack incident triage for nonprofits and small teams without a SOC.

## Track

Slack Agent for Good

## Project URL Fields

- Public repository: `TODO_PUBLIC_REPO_URL`
- Demo video: `TODO_DEMO_VIDEO_URL`
- Slack developer sandbox: `TODO_SLACK_SANDBOX_URL`
- Devpost project: `TODO_DEVPOST_PROJECT_URL`

## Built With

Node.js, JavaScript, Slack Bolt, Slack Block Kit, Slack Socket Mode, Model Context Protocol, Zod, PowerShell, GitHub Actions.

## Try It

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run verify
npm.cmd run proof:pack
```

For live Slack testing, create the app from `manifest.json`, install it in a Slack developer sandbox, invite `slackhack@salesforce.com` and `testing@devpost.com`, then run:

```powershell
$env:SLACK_BOT_TOKEN="xoxb-redacted"
$env:SLACK_APP_TOKEN="xapp-redacted"
$env:SIGNALDESK_TRIAGE_MODE="mcp"
npm.cmd run sandbox:doctor -- --strict
npm.cmd run start
```

Fast demo command:

```text
/signaldesk demo
```

## Inspiration

Nonprofits, schools, clinics, and volunteer teams often coordinate security incidents in Slack without a dedicated SOC. When someone reports a phishing link, OAuth consent trick, suspicious script, or possible data exposure, the first response can turn into a chaotic thread: no clear owner, missing evidence, premature impact claims, and delayed containment. SignalDesk gives those teams a calm, evidence-driven first 15 minutes.

## What It Does

SignalDesk adds a Slack App Home tab, clickable App Home demo/proof modals, message shortcut, `/signaldesk demo` shortcut command, `/signaldesk proof` proof checklist, no-input demo help, and app mention flow for security incident triage. The App Home, proof, and help payloads give judges the test path and proof signals, while the triage flows convert messy alert text into a Block Kit incident brief with scenario, severity, indicators, candidate MITRE ATT&CK techniques, evidence IDs, claim audit, detection checks, first-response readiness, response roles, and buttons for ownership, evidence, detections, report export, guardrails, and incident channel creation.

For the judged demo, SignalDesk runs with `SIGNALDESK_TRIAGE_MODE=mcp`, so Slack triage calls the MCP `triage_slack_alert` tool over stdio. The MCP server also exposes `build_response_checklist`, `build_impact_summary`, `export_evidence_ledger`, `build_detection_plan`, `generate_incident_report`, and `list_demo_incidents`.

## How We Built It

SignalDesk is a Node.js Slack app built with Bolt for JavaScript in Socket Mode. The triage core is shared by the Slack app and MCP server, and the Slack runtime can delegate triage through MCP for the live demo. Deterministic parsing extracts URLs, IPs, domains, emails, and hashes; maps likely scenario and candidate ATT&CK techniques; generates evidence IDs, claim IDs, detection IDs, and impact metric IDs; and validates claim-to-evidence references before output is accepted.

The repo includes a judge quickstart, synthetic fixtures, an Agent for Good impact evaluation, rules compliance map, a recording readiness preflight, MCP smoke tests, Slack-to-MCP bridge proof, Slack interaction transcript, Block Kit constraint checks, secret scanning, syntax checks, a judge proof pack, judge evidence matrix, bonus-prize evidence map, architecture diagram, sample report, upload-ready demo thumbnail, uploadable captions, and sandbox runbook.

## Challenges

The hardest tradeoff was making the agent useful without pretending it completed an investigation. SignalDesk deliberately says "candidate" technique, preserves evidence IDs, and labels compromise, attribution, and data impact as unconfirmed until logs validate them. Security agents should reduce uncertainty, not generate confident fan fiction. Ah yes, the classic enterprise feature: hallucinated certainty.

## Accomplishments

- Slack app with App Home onboarding, slash command, proof checklist, app mention flow, message shortcut, Block Kit brief, and interactive buttons.
- MCP-backed Slack triage mode through `triage_slack_alert`.
- Evidence ledger, claim audit, detection opportunities, and Markdown incident report export.
- First-response readiness metrics that quantify evidence, detection, role, guardrail, and Slack coordination coverage without claiming live impact.
- `npm.cmd run impact:evaluate` records 98.3/100 average first-response readiness across nonprofit, school, clinic, and community-team fixtures.
- Dedicated incident channel creation with kickoff message.
- Tests for scenario classification, evidence validation, Slack workflow helpers, MCP bridge, and Block Kit limits.
- `npm.cmd run proof:pack` produces a judge-facing evidence receipt.

## What We Learned

For security workflows, the fastest path is not always the most autonomous one. A good agent should preserve evidence, name assumptions, keep humans in control, and make the next log checks obvious. Slack is the right surface because the incident coordination is already happening there.

## What's Next

- Add Slack Real-Time Search or Slack MCP retrieval for permission-aware thread context.
- Add optional identity provider, DNS/proxy, endpoint, and SaaS log connectors.
- Add persistent incident state with explicit retention controls.
- Build nonprofit onboarding templates for common phishing, token exposure, and data-handling incidents.

## Required Evidence Checklist

- `docs/architecture.svg` uploaded as the architecture diagram.
- `docs/thumbnail.png` used as the video thumbnail; `docs/thumbnail.svg` kept as the editable source.
- `docs/demo-captions.vtt` uploaded after the final cut timing is confirmed.
- `docs/rules-compliance.md` checked with `npm.cmd run rules:check`.
- `docs/judge-quickstart.md` available as the shortest judge test path.
- `docs/judge-proof.md` generated after `npm.cmd run proof:pack`.
- `docs/judge-evidence-matrix.md` available as the rubric-to-proof map.
- `docs/bonus-prize-map.md` available as the Best UX, Most Innovative Slack Agent, and Best Technological Implementation proof map.
- `docs/slack-interaction-transcript.md` generated after `npm.cmd run slack:interactions:proof`.
- `docs/impact-evaluation.md` generated after `npm.cmd run impact:evaluate`.
- `docs/recording-readiness.md` generated after `npm.cmd run recording:check`.
- Strict sandbox doctor output captured after `npm.cmd run sandbox:doctor -- --strict`.
- Final strict external-gate check passed with `npm.cmd run submission:final:check`.
- Public-link reachability check passed with `npm.cmd run submission:final:online`.
- Demo video under 3 minutes showing live Slack sandbox, MCP runtime, incident channel creation, detections, report export, and terminal proof.
- Slack sandbox URL with `slackhack@salesforce.com` and `testing@devpost.com` invited as full members.
