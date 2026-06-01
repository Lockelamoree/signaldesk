# Judge Evidence Matrix

Current event state checked on June 1, 2026.

This is the fast judge map: each official criterion, required artifact, and winner-benchmark signal points to concrete SignalDesk evidence. Confirmed means repo-local evidence exists today. Pending live proof means the final Slack sandbox or public URL still has to be produced before Devpost submission.

## Sources

- Current challenge page: https://slackhack.devpost.com/
- Official rules: https://slackhack.devpost.com/rules
- FAQ and sandbox guidance: https://slackhack.devpost.com/details/faq-slackagent-builder
- Salesforce hackathon benchmark: https://info.devpost.com/customer-stories/salesforce-hackathons-on-devpost
- Digital HQ Slackathon winner gallery: https://slack.devpost.com/project-gallery

## Official Criteria

| Criterion | What judges ask | SignalDesk answer | Evidence | Status |
| --- | --- | --- | --- | --- |
| Technological Implementation | Quality software development and use of Slack AI, MCP server integration, or Real-Time Search API. | Slack Bolt app, Block Kit workflow, Socket Mode, MCP stdio tools, full MCP tool-call transcript, and safe runtime-check guidance for live setup failures. Slack can run in `SIGNALDESK_TRIAGE_MODE=mcp` and call `triage_slack_alert`. | `src/slack/app.js`, `src/slack/errorResponses.js`, `src/slack/triageRuntime.js`, `src/mcp/server.js`, `docs/mcp-tool-transcript.md`, `npm.cmd run smoke:mcp`, `npm.cmd run mcp:transcript`, `npm.cmd run smoke:slack-mcp`, `docs/judge-proof.md`. | Confirmed repo-local; live Slack sandbox proof pending. |
| Design | Thoughtful user experience with balanced frontend and backend. | Triage starts from App Home onboarding, clickable Demo guide and Proof checklist modals, `/signaldesk proof`, no-input demo help, `/signaldesk demo`, app mention, or a message shortcut. Output is a concise Slack Block Kit brief with action buttons, roles, detection checks, First-Response Readiness, and guardrails. Button responses are factored into reusable payload builders and captured in an interaction transcript. | `src/slack/appHome.js`, `src/slack/actionPayloads.js`, `src/slack/commandInput.js`, `src/core/incidentBrief.js`, `src/slack/blockKitValidation.js`, `docs/slack-ux-proof.md`, `docs/slack-interaction-transcript.md`, `npm.cmd run slack:interactions:proof`, `npm.cmd run check:block-kit`, `docs/demo-preview.html`, `docs/thumbnail.png`. | Confirmed repo-local; final video proof pending. |
| Potential Impact | Impact on Slack community and beyond the target community. | Agent for Good positioning for nonprofits, schools, clinics, mutual-aid groups, and small public-interest teams without a SOC, plus deterministic First-Response Readiness metrics that show prepared evidence, detections, roles, guardrails, and Slack coordination. | `src/core/incidentBrief.js`, `docs/impact-evaluation.md`, `docs/devpost-form.md`, `docs/devpost-copy.md`, `README.md`, `docs/video-package.md`, `npm.cmd run impact:evaluate`, `npm.cmd run smoke:mcp`. | Confirmed repo-local; live demo still needed. |
| Quality of the Idea | Originality and improvement over existing concepts. | Narrow incident-response workflow, not a generic chatbot. It preserves evidence IDs, labels assumptions, creates an incident channel, and produces evidence-linked detection checks. | `src/core/incidentBrief.js`, `docs/sample-incident-report.md`, `docs/judge-proof.md`, `npm.cmd run validate:fixtures`. | Confirmed repo-local; public video still needed. |

## Required Submission Artifacts

| Artifact | SignalDesk file or action | Evidence state |
| --- | --- | --- |
| Project Track | `Slack Agent for Good` in `docs/devpost-form.md` and `docs/devpost-copy.md`. | Confirmed. |
| Text description | Paste-ready story sections in `docs/devpost-form.md`; long-form copy in `docs/devpost-copy.md`. | Confirmed. |
| Judge quickstart | Use `docs/judge-quickstart.md` for clone-to-proof commands and live sandbox gates. | Confirmed repo-local. |
| Agent for Good impact explanation | Nonprofit, school, clinic, and community-team first-response narrative. | Confirmed. |
| Impact evaluation | Run `npm.cmd run impact:evaluate` and reference `docs/impact-evaluation.md`. | Confirmed repo-local; proves synthetic readiness, not live outcomes. |
| Around 3-minute working demo video | `docs/demo-script.md`, `docs/demo-transcript.md`, `docs/demo-captions.vtt`, `docs/demo-preview.png`, and `docs/video-package.md`. | Planned; recording pending. |
| Recording readiness preflight | Run `npm.cmd run recording:check` and keep `docs/recording-readiness.md` open during the final take. | Confirmed repo-local; live footage pending. |
| Working Project footage | Must show live Slack sandbox, App Home judge path, `Runtime: MCP stdio`, incident channel creation, detections, report export, and MCP smoke output. | Pending live sandbox. |
| Architecture diagram | Upload `docs/architecture.svg`; explain with `ARCHITECTURE.md` and `docs/architecture.md`. | Confirmed. |
| Slack developer sandbox URL | Paste into `docs/devpost-form.md` after sandbox exists. | Pending external Slack sandbox. |
| Judge access | Invite `slackhack@salesforce.com` and `testing@devpost.com` as full members. | Pending external Slack sandbox. |
| Public repository | Use `docs/github-repo-settings.md`, then verify with `npm.cmd run repo:public:check`. | Repo-local ready; public URL pending. |
| Rules compliance | Use `docs/rules-compliance.md`, then run `npm.cmd run rules:check` before final upload/submission. | Repo-local ready; manual eligibility and final media review pending. |
| Final external gate | Run `npm.cmd run submission:final:check` after URLs and real Slack tokens are set, then `npm.cmd run submission:final:online` to verify public-link reachability. | Expected to fail until live gates exist. |

## Winner Benchmark Signals

| Benchmark signal | Source pattern | SignalDesk response |
| --- | --- | --- |
| Slack should be the primary work surface. | Salesforce's Digital HQ Slackathon highlight names Get Together as a winner because it scheduled meetings directly in Slack without app toggling. | SignalDesk starts and completes the first-response workflow inside Slack: triage, owner, checklist, detections, report, and incident channel. |
| Platform integration must be visible. | Current challenge explicitly rewards Slack AI, MCP, or Real-Time Search API usage; Salesforce hackathon examples highlight platform-specific agents and MCP-backed analytics. | `Runtime: MCP stdio` appears in the Slack brief, `smoke:mcp` proves MCP tools including `build_impact_summary`, and `smoke:slack-mcp` proves the Slack runtime can call MCP triage. |
| The user and impact must be specific. | Current Agent for Good track asks for meaningful social impact in areas such as accessibility, education, public health, and nonprofit operations. | SignalDesk is framed around nonprofits, schools, clinics, and community teams handling phishing, token exposure, malware, and data-exposure reports without full SOC staffing. |
| Winners show a complete workflow, not a feature fragment. | Digital HQ Slackathon gallery winners cluster around complete workflows: scheduling, access requests, standups, accessibility, support, and operational handoffs. | SignalDesk moves from suspicious message to evidence-gated brief, response roles, incident channel, detection plan, and report export. |

## Side-Prize Positioning

| Side prize | SignalDesk angle | Evidence |
| --- | --- | --- |
| Best UX | Judges get App Home onboarding, clickable Demo guide and Proof checklist modals, `/signaldesk proof`, `/signaldesk demo`, no-input help, compact Block Kit actions, button-response proof, and safe runtime-check guidance. | `docs/bonus-prize-map.md`, `docs/slack-ux-proof.md`, `docs/slack-interaction-transcript.md`, `npm.cmd run prize:check`, `npm.cmd run slack:ux:proof`, `npm.cmd run slack:interactions:proof`, `npm.cmd run check:block-kit`. |
| Most Innovative Slack Agent | SignalDesk is a narrow evidence-gated first responder that turns messy incident context into Slack-native action, not a generic assistant response. | `docs/bonus-prize-map.md`, `docs/impact-evaluation.md`, `docs/slack-interaction-transcript.md`, `docs/sample-incident-report.md`, `src/core/incidentBrief.js`, `npm.cmd run impact:evaluate`. |
| Best Technological Implementation | MCP is central and testable: Slack can run in MCP mode, the MCP server exposes every security tool, and the Slack runtime bridge is smoke-tested. | `docs/bonus-prize-map.md`, `docs/mcp-tool-transcript.md`, `docs/judge-proof.md`, `npm.cmd run mcp:transcript`, `npm.cmd run smoke:slack-mcp`, `npm.cmd run verify`. |

## First 60 Seconds Demo Obligations

| Time | Proof to show | Why it matters |
| --- | --- | --- |
| 0:00-0:12 | User and problem: small team, suspicious Slack message, no SOC. | Establishes Agent for Good impact before features. |
| 0:12-0:28 | App Home proof path, `/signaldesk proof`, message shortcut, or `/signaldesk` in Slack sandbox. | Proves Slack is the product surface and gives judges an immediate checklist. |
| 0:28-0:45 | App Home proof path or brief header with `Runtime: MCP stdio`, severity, indicators, and ATT&CK candidates. | Proves required technology and technical depth. |
| 0:45-1:00 | Evidence IDs, claim audit, detection checks, and First-Response Readiness. | Proves this is evidence-gated security workflow with measurable Agent for Good impact, not generic AI text. |

## Evidence Boundary

Confirmed today:

- `npm.cmd run verify` passes repo-local proof.
- `npm.cmd run proof:pack` writes `docs/judge-proof.md`.
- `npm.cmd run judge:quickstart:check` confirms `docs/judge-quickstart.md` gives judges the local proof path, MCP smoke path, live Slack sandbox path, and final submission gates.
- App Home onboarding, Demo guide modal, Proof checklist modal, `/signaldesk proof`, `/signaldesk demo`, and no-input demo help are validated through unit and Block Kit checks.
- `npm.cmd run slack:ux:proof` writes `docs/slack-ux-proof.md`, a public receipt for App Home, help, modal, and safe-error Block Kit surfaces.
- `npm.cmd run slack:interactions:proof` writes `docs/slack-interaction-transcript.md`, proving ownership, channel creation, evidence, detections, report, and guardrail button responses with synthetic data.
- Safe runtime-check guidance is validated through Block Kit checks and avoids exposing token-shaped strings.
- MCP stdio tools are discoverable and callable.
- `npm.cmd run mcp:transcript` writes `docs/mcp-tool-transcript.md`, proving every SignalDesk MCP tool returns validated structured output.
- Slack-to-MCP bridge smoke test proves the Slack runtime can call `triage_slack_alert`.
- `build_impact_summary` returns first-response readiness while preserving the live-impact evidence boundary.
- `npm.cmd run impact:evaluate` records 98.3/100 average first-response readiness across synthetic nonprofit, school, clinic, and community-team fixtures in `docs/impact-evaluation.md`.
- `npm.cmd run recording:check` records that the demo package contains the first-30-second Slack proof, MCP runtime proof, recording assets, and judge sandbox access reminders in `docs/recording-readiness.md`.
- `npm.cmd run rules:check` records that official rules requirements are mapped to repo-local evidence and manual final attestations.
- Block Kit payloads pass local Slack constraint checks.
- Demo thumbnail and captions are validated.
- Static demo screenshot is validated as repo-local storyboard proof.

Still required before clicking Devpost Submit:

- Install the app in a Slack developer sandbox.
- Run `npm.cmd run sandbox:doctor -- --strict` with real Slack tokens.
- Record the live Slack demo and upload it as public or unlisted.
- Invite `slackhack@salesforce.com` and `testing@devpost.com`.
- Publish the repo and verify the public URL from a private browser session.
- Replace `TODO_*` placeholders in `docs/devpost-form.md` and `docs/video-package.md`.
- Run `npm.cmd run submission:final:check` and `npm.cmd run submission:final:online`, then keep both passing outputs.
