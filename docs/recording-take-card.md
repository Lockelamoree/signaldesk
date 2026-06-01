# SignalDesk Recording Take Card

Use this as the on-screen operator card during the final Devpost recording. It is shorter than the full runbook on purpose: the goal is to keep the live take under three minutes while proving Slack, MCP, impact, and safety.

## Before The Take

- Use the live Slack developer sandbox, not `docs/demo-preview.png`.
- Run `npm.cmd run sandbox:doctor -- --strict` with real Slack tokens set in the environment.
- Run `npm.cmd run rules:check` and keep `docs/rules-compliance.md` available for manual final attestations.
- Keep `docs/judge-proof.md`, `docs/slack-interaction-transcript.md`, and `docs/impact-evaluation.md` open as backup proof.
- Hide tokens, invite screens, private workspace data, and browser/account notifications.
- Use only synthetic SignalDesk demo data.

## Live Shot Order

| Time | Show | Say |
| --- | --- | --- |
| 0:00-0:12 | Slack channel with a synthetic suspicious message. | Small nonprofits, schools, clinics, and community teams coordinate incidents in Slack without a full SOC. SignalDesk gives them a safe first 15 minutes. |
| 0:12-0:28 | SignalDesk App Home, `Demo guide` or `Proof checklist`, then `/signaldesk proof`. | This is the judge path: the app names exactly what proof to look for before the workflow starts. |
| 0:28-0:45 | `/signaldesk demo` or `Triage with SignalDesk` message shortcut. | The live Slack flow sends synthetic incident context through SignalDesk. |
| 0:45-1:10 | Incident brief with `Runtime: MCP stdio`, evidence IDs, claim audit, detection checks, and first-response readiness. | MCP-backed triage produces evidence-linked security work, not a generic assistant answer. |
| 1:10-1:35 | Click `Create channel`, then show `#inc-token-exposure` and the kickoff message. | SignalDesk turns triage into coordination: owner, evidence lead, comms lead, and next actions. |
| 1:35-2:05 | Click `Evidence`, `Detections`, and `Report`. | The buttons turn the brief into an analyst handoff: source evidence, hunt queries, guardrails, and report export. |
| 2:05-2:30 | Terminal with `npm.cmd run smoke:slack-mcp`, `npm.cmd run mcp:transcript`, and `npm.cmd run impact:evaluate`. | The same workflow is testable through MCP tools, including `triage_slack_alert`, `build_detection_plan`, `generate_incident_report`, and `build_impact_summary`. |
| 2:30-2:50 | `docs/impact-evaluation.md` showing 98.3/100 readiness, then return to Slack. | The Agent for Good story is measurable: preparedness for under-resourced teams, without claiming live containment or confirmed compromise. |
| 2:50-2:55 | Slack brief or incident channel final frame. | SignalDesk keeps humans in control and gives them a safer first response inside Slack. |

## Must-Capture Proof

- `/signaldesk proof` appears before the triage flow.
- `Runtime: MCP stdio` is readable in Slack.
- EV/CL/DET/IM IDs or labels are visible.
- `Create channel` is clicked and the incident kickoff message appears.
- `Evidence`, `Detections`, and `Report` are shown.
- `smoke:slack-mcp`, `mcp:transcript`, and `impact:evaluate` appear in terminal proof.
- `98.3/100` readiness appears in impact proof.
- The final video stays under three minutes.

## Do Not Show

- Slack bot tokens, app tokens, `.env`, browser password managers, or Devpost account internals.
- Real donor, student, patient, employee, customer, or workspace data.
- Private invite acceptance screens for `slackhack@salesforce.com` or `testing@devpost.com`.
- Claims of confirmed compromise, breach impact, containment, or attribution before logs prove them.

## After The Take

- Upload to YouTube, Vimeo, Facebook Video, or Youku as public or unlisted.
- Verify the video in a private/incognito browser.
- Upload `docs/thumbnail.png` and `docs/demo-captions.vtt`.
- Invite `slackhack@salesforce.com` and `testing@devpost.com` to the Slack sandbox as full Members.
- Run `npm.cmd run submission:set-urls -- --repo <public-repo-url> --video <demo-video-url> --sandbox <slack-sandbox-url> --devpost <devpost-project-url>`.
- Run `npm.cmd run submission:final:check` and `npm.cmd run submission:final:online`.
