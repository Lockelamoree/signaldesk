# SignalDesk Win Plan

Current date: June 1, 2026. Submission deadline: July 13, 2026 at 5:00 PM PDT, which is July 14, 2026 at 2:00 AM CEST.

## Event Facts

- Hackathon: Slack Agent Builder Challenge.
- Current public field size: active and competitive; Devpost participant counts are volatile and inconsistent across public tabs, so do not use the exact count as a submission claim.
- Required build: a Slack application that uses at least one of Slack AI capabilities, MCP server integration, or the Real-Time Search API.
- Tracks: New Slack Agent, Slack Agent for Good, Slack Agent for Organizations.
- Recommended track: Slack Agent for Good.
- Required artifacts: text description, public demo video under 3 minutes, architecture diagram, Slack developer sandbox URL, and test access for `slackhack@salesforce.com` and `testing@devpost.com`.
- Judging criteria: Technological Implementation, Design, Potential Impact, Quality of the Idea.

Sources:

- https://slackhack.devpost.com/
- https://slackhack.devpost.com/rules
- https://slackhack.devpost.com/resources
- https://slackhack.devpost.com/details/faq-slackagent-builder

## Judge Sentiment

Explicitly scored:

- Quality software development and required Slack technology usage.
- Thoughtful user experience with frontend/backend balance.
- Impact on the Slack community and beyond.
- Originality, especially improvement over existing concepts.

Inferred:

- Judges will punish generic AI wrappers.
- Judges will reward narrow, real Slack workflows with visible proof.
- The first 60 seconds of the demo matter because judges have limited time.
- Working end-to-end flow beats a prettier partial demo.

## Winning Product Bet

Build SignalDesk as a Slack-native first responder for security incidents affecting under-resourced organizations.

Primary user:

- A nonprofit operations lead, school IT admin, clinic coordinator, or volunteer manager who is suddenly handling a suspicious Slack message, leaked token, or account takeover report.

Core promise:

- "Give the team a safe first 15 minutes: preserve evidence, run the right detection checks, contain the obvious risk, assign owners, and avoid overclaiming before logs confirm impact."

Why Slack:

- Incident coordination already happens in Slack.
- The agent can post structured briefs where responders are already working.
- Slack permissions and sandbox testing make the demo realistic.
- MCP lets the Slack app delegate triage to auditable security tools rather than just vague chat responses.

## Build Phases

### June 1-7: Foundation

- Create Slack sandbox and app from `manifest.json`.
- Run `/signaldesk` in Slack using Socket Mode.
- Validate deterministic triage and detection opportunities against sample incidents.
- Record screenshots of first working flow.

### June 8-14: MCP Proof

- Install dependencies with `--ignore-scripts`.
- Verify `triage_slack_alert`, `build_detection_plan`, and the Slack-to-MCP bridge from an MCP-capable client path.
- Add transcript screenshots showing the MCP tool result and Slack brief match.
- Add sample incident fixtures for phishing, OAuth token leak, endpoint malware, and exfiltration.

### June 15-21: Slack Product UX

- Add interactive buttons for "Preserve evidence", "Assign owner", and "Create channel" if scopes allow.
- Add an incident state JSON artifact and detection-plan export for demo reproducibility.
- Harden Block Kit copy so a tired judge can understand it in 10 seconds.

### June 22-28: Impact Story

- Create the Agent for Good narrative around nonprofits and small teams.
- Add a before/after metric: time to first incident brief, action assignment completeness, evidence checklist coverage, detection-plan coverage, and first-response readiness.
- Prepare a 3-minute demo script.

### June 29-July 5: Polish and Verification

- Finalize tests, README, architecture diagram, and screenshots.
- Run a secrets scan before any public push.
- Verify Slack sandbox access with a non-owner test account.

### July 6-12: Submission Package

- Record and upload public demo video.
- Finalize Devpost text.
- Invite `slackhack@salesforce.com` and `testing@devpost.com` to the sandbox.
- Fill Devpost fields and verify all links in an incognito/browser session.

### July 13: Buffer

- Submit before 12:00 PM PDT if possible.
- Keep 5 hours for Devpost/video/sandbox weirdness, because "temporary" auth problems love deadlines.

## Score Targets

- Technological Implementation: working Slack app in MCP mode, working MCP server, tests, documented install path.
- Design: slash command, mention flow, concise Block Kit brief, no raw walls of AI text.
- Potential Impact: explicit under-resourced-team use case with measurable first-response benefit.
- Quality of Idea: security incident first responder grounded in evidence, not a generic chatbot.

## Side-Prize Targets

- Best UX: App Home onboarding, Demo guide, Proof checklist, `/signaldesk demo`, no-input help, and safe runtime-check guidance.
- Most Innovative Slack Agent: evidence-gated incident response workflow with evidence IDs, claim audits, detections, readiness metrics, and incident channel creation.
- Best Technological Implementation: Slack app in MCP mode, MCP stdio tools, full MCP tool transcript, Slack-to-MCP bridge smoke test, and local verification suite.

## Evidence Needed

- Slack video showing `/signaldesk` from alert to posted brief.
- Slack video showing incident channel creation and kickoff message.
- MCP transcript showing `triage_slack_alert`, `build_impact_summary`, `build_detection_plan`, and `smoke:slack-mcp`.
- Full MCP tool transcript from `docs/mcp-tool-transcript.md` showing every registered tool.
- Architecture diagram exported from `docs/architecture.md`.
- Test output from `npm.cmd test`.
- Supply-chain note for pinned dependencies and `--ignore-scripts`.
- Secrets scan output before public submission.
- Submission readiness output from `npm.cmd run submission:check`.
