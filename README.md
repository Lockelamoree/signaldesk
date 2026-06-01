# SignalDesk

SignalDesk is a Slack incident helper for teams that do not have a security operations center on standby. When someone drops a suspicious link, leaked token, or half-explained alert into Slack, SignalDesk turns that messy moment into a usable first-response brief: what we know, what we do not know yet, who should own the next step, and which logs are worth checking first.

The project is aimed at the **Slack Agent for Good** track. The people I had in mind are nonprofits, schools, clinics, mutual-aid groups, and small public-interest teams that already coordinate in Slack but usually do not have dedicated incident response staff. The goal is simple: give them a safer first 15 minutes instead of a panic scroll.

There is also a backup fit for **New Slack Agent**, but the stronger story is social impact: helping small teams protect donors, students, patients, volunteers, and staff without pretending an agent replaces a real security team.

![SignalDesk Slack triage storyboard showing MCP runtime, first-response readiness, detections, and incident actions](docs/demo-preview.png)

This is a repo-local storyboard preview built from synthetic data. It is here so reviewers can understand the workflow quickly; the final Devpost video still needs live Slack developer sandbox footage.

## Why I Built It

Most small teams do not fail incident response because they lack a beautiful dashboard. They fail because the first thread gets noisy: nobody owns it, evidence gets lost, someone declares impact too early, and the useful log checks show up too late.

SignalDesk tries to make that first thread calmer. It gives responders a clear Slack brief, evidence IDs, candidate ATT&CK mappings, detection checks, response roles, guardrails, and a dedicated incident channel handoff. It is not trying to be an all-knowing analyst. It is trying to be the reliable teammate who says, "Before we speculate, here is what we can prove and what to check next."

For the Slack Agent Builder Challenge, the fit is:

- Technological Implementation: Slack Bolt, Block Kit, Socket Mode, and MCP server integration through `SIGNALDESK_TRIAGE_MODE=mcp`.
- Design: the workflow starts where the report already lives: slash command, app mention, message shortcut, App Home, and action buttons.
- Potential Impact: a repeatable first-response path for teams that cannot hire a full SOC.
- Quality of the Idea: a focused incident-response workflow in Slack, not another generic chatbot wearing a security hoodie.

## Demo Flow

1. A teammate runs `/signaldesk`, mentions the app, or uses the `Triage with SignalDesk` shortcut on a suspicious message.
2. SignalDesk extracts indicators, assigns a severity band, maps candidate ATT&CK techniques, and builds detection checks tied back to evidence.
3. The app posts a Block Kit incident brief with first-response readiness, response roles, suggested incident channel, evidence checklist, report export, and guardrails.
4. The App Home tab, `Demo guide`, `Proof checklist`, `/signaldesk demo`, `/signaldesk proof`, and no-input demo help give judges a low-friction way to test it.
5. For the judged demo, Slack runs in `SIGNALDESK_TRIAGE_MODE=mcp`, so the Slack path calls the MCP stdio server through `triage_slack_alert`.

## Repo Map

Security demos should come with receipts, not vibes. The main ones are:

- Start here: `docs/judge-one-pager.md`.
- Judge quickstart: `docs/judge-quickstart.md`.
- Architecture diagram: `docs/architecture.svg`, with `ARCHITECTURE.md` as the root overview.
- Devpost draft copy: `docs/devpost-copy.md`.
- Paste-ready Devpost form pack: `docs/devpost-form.md`.
- Rules compliance map: `docs/rules-compliance.md`.
- Generated Devpost paste bundle: `artifacts/submission/devpost-paste-bundle.md` from `npm.cmd run submission:bundle`.
- Live gate status packet: `artifacts/submission/live-gate-status.md` from `npm.cmd run submission:live-gates`.
- Agent for Good impact evaluation: `docs/impact-evaluation.md`.
- Demo transcript: `docs/demo-transcript.md`.
- Demo captions: `docs/demo-captions.vtt`.
- Static demo preview: `docs/demo-preview.html`.
- Static demo screenshot: `docs/demo-preview.png`.
- Recording readiness preflight: `docs/recording-readiness.md`.
- Recording take card: `docs/recording-take-card.md`.
- Video package: `docs/video-package.md`.
- Demo thumbnail: `docs/thumbnail.png` with editable source at `docs/thumbnail.svg`.
- Public repo settings: `docs/github-repo-settings.md`.
- GitHub launch checklist: `npm.cmd run github:launch:check`, then `npm.cmd run github:launch:strict` after public push.
- Live account-gate handoff for Max: `docs/live-gate-handoff.md`.
- Judge evidence matrix: `docs/judge-evidence-matrix.md`.
- Bonus prize map: `docs/bonus-prize-map.md`.
- Slack UX proof: `docs/slack-ux-proof.md`.
- Slack interaction transcript: `docs/slack-interaction-transcript.md`.
- Slack interaction visual preview: `docs/slack-interaction-preview.html`.
- MCP tool transcript: `docs/mcp-tool-transcript.md`.
- Judge proof pack: `docs/judge-proof.md`.
- Sample incident report: `docs/sample-incident-report.md`.
- Slack sandbox runbook: `docs/slack-sandbox-runbook.md`.
- Judge review and gaps: `docs/judge-review.md`.
- Validation report: `docs/validation-report.md`.
- Synthetic incident fixtures: `src/core/sampleIncidents.js`.

## Local Setup

Prerequisites:

- Node.js 20+.
- A Slack developer sandbox from the Slack Developer Program.
- A Slack app configured from `manifest.json`.

Install dependencies with scripts disabled first:

```powershell
npm.cmd install --package-lock-only --ignore-scripts
npm.cmd ci --ignore-scripts
```

Create local environment variables:

```powershell
Copy-Item .env.example .env
$env:SLACK_BOT_TOKEN="xoxb-your-token"
$env:SLACK_APP_TOKEN="xapp-your-token"
$env:SIGNALDESK_TRIAGE_MODE="mcp"
$env:SIGNALDESK_PERSIST_BRIEFS="0"
```

Run the Slack app:

```powershell
npm.cmd run start
```

Run the MCP server:

```powershell
npm.cmd run mcp
```

Run the local demo and proof scripts:

```powershell
npm.cmd run demo
npm.cmd run demo:assets
npm.cmd run demo:preview:screenshot
npm.cmd run demo:preview:check
npm.cmd run demo:thumbnail:check
npm.cmd run demo:captions:check
npm.cmd run devpost:form:check
npm.cmd run rules:check
npm.cmd run impact:evaluate
npm.cmd run recording:check
npm.cmd run judge:quickstart:check
npm.cmd run judge:matrix:check
npm.cmd run prize:check
npm.cmd run slack:ux:proof
npm.cmd run slack:interactions:proof
npm.cmd run sandbox:doctor
npm.cmd run check:block-kit
npm.cmd run check:syntax
npm.cmd run proof:pack
npm.cmd run repo:public:check
npm.cmd run github:launch:check
npm.cmd run report:sample
npm.cmd run scan:secrets
npm.cmd run smoke:mcp
npm.cmd run mcp:transcript
npm.cmd run smoke:slack-mcp
npm.cmd run validate:fixtures
npm.cmd run submission:check
npm.cmd run submission:live-gates
npm.cmd run submission:bundle
npm.cmd run submission:set-urls -- --dry-run --repo https://github.com/signaldesk-app/signaldesk --video https://youtube.com/watch?v=signaldesk123 --sandbox https://signaldesk-demo.slack.com --devpost https://devpost.com/software/signaldesk
npm.cmd run submission:final:check
npm.cmd run submission:final:online
npm.cmd test
npm.cmd run verify
```

## How Judges Can Test

1. Install dependencies without lifecycle scripts:

```powershell
npm.cmd ci --ignore-scripts
```

2. Run the local proof suite:

```powershell
npm.cmd run verify
npm.cmd run proof:pack
```

3. Create a Slack app from `manifest.json`, set `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, and `SIGNALDESK_TRIAGE_MODE=mcp`, then start SignalDesk:

```powershell
$env:SIGNALDESK_TRIAGE_MODE="mcp"
npm.cmd run sandbox:doctor -- --strict
npm.cmd run start
```

4. In the Slack sandbox, use the `Triage with SignalDesk` message shortcut on a suspicious message, or run the short demo command:

```text
/signaldesk demo
```

Expected result: App Home shows the judge test path plus clickable `Demo guide` and `Proof checklist` modals. `/signaldesk proof` posts the proof checklist, `/signaldesk demo` runs the synthetic incident, `/signaldesk` without text shows demo help, and the Slack workflow produces a Block Kit brief with `Runtime: MCP stdio`, severity, indicators, candidate ATT&CK techniques, evidence IDs, claim audit, detection checks, first-response readiness, response roles, and buttons for channel creation, ownership, checklist, evidence, detections, report, and guardrails.

## Security Notes

- Do not commit `.env`, Slack tokens, screenshots containing private workspace data, or Devpost/sandbox credentials.
- The first install path uses `--ignore-scripts` because `@slack/bolt` declares a lifecycle script in package metadata.
- The Slack app requests `channels:manage` only so the demo can create a dedicated public incident channel from a triage brief.
- `SIGNALDESK_TRIAGE_MODE=mcp` spawns the repo-local MCP stdio server for triage; use synthetic demo data only.
- `SIGNALDESK_PERSIST_BRIEFS=1` can recover synthetic demo button state after a local app restart by writing to `artifacts/private/brief-store`; keep it off for real Slack data unless explicit retention controls exist.
- `npm.cmd run check:block-kit` validates generated Slack blocks against message, section, action, and button limits before sandbox recording.
- `npm.cmd run sandbox:doctor -- --strict` validates real Slack token prefixes, manifest settings, scopes, and MCP demo mode before live recording.
- If triage fails during live testing, SignalDesk posts runtime-check guidance instead of a half-built incident brief, and it redacts token-shaped strings rather than leaking secrets or stack traces.
- Do not store real Slack message bodies outside the workspace for this hackathon demo unless explicit consent and retention controls are in place.

## Still Needed Before Devpost

- Public demo video under 3 minutes.
- Uploadable captions from `docs/demo-captions.vtt`.
- Architecture diagram from `docs/architecture.svg`.
- Rules compliance map from `docs/rules-compliance.md`.
- Slack developer sandbox URL.
- Test access for `slackhack@salesforce.com` and `testing@devpost.com`.
- Screenshots of `/signaldesk`, the MCP tool call, the detection plan, and the final incident brief.
- Static preview screenshot from `docs/demo-preview.png`, clearly labeled as repo-local storyboard proof.
- Judge quickstart from `docs/judge-quickstart.md`.
- Judge one-pager from `docs/judge-one-pager.md`.
- Recording readiness preflight from `docs/recording-readiness.md`.
- Judge proof pack from `npm.cmd run proof:pack`.
- Judge evidence matrix from `docs/judge-evidence-matrix.md`.
- Bonus prize map from `docs/bonus-prize-map.md`.
- Slack UX proof from `docs/slack-ux-proof.md`.
- Slack interaction transcript from `docs/slack-interaction-transcript.md`.
- Impact evaluation from `docs/impact-evaluation.md`.
- Public repo readiness output from `npm.cmd run repo:public:check`.
- GitHub launch check from `npm.cmd run github:launch:check`; after the first push, strict output from `npm.cmd run github:launch:strict`.
- Live gate status from `npm.cmd run submission:live-gates`.
- Live account-gate handoff from `docs/live-gate-handoff.md`.
- Demo thumbnail from `docs/thumbnail.png`, with editable source at `docs/thumbnail.svg`.
- Paste-ready Devpost fields from `docs/devpost-form.md`.
- Generated Devpost paste bundle from `npm.cmd run submission:bundle`.
- MCP smoke-test output from `npm.cmd run smoke:mcp`.
- Full MCP tool transcript from `docs/mcp-tool-transcript.md`.
- Slack-to-MCP bridge proof from `npm.cmd run smoke:slack-mcp`.
- Strict sandbox doctor output from `npm.cmd run sandbox:doctor -- --strict`.
- Block Kit constraints output from `npm.cmd run check:block-kit`.
- Fixture validation output from `npm.cmd run validate:fixtures`.
- CI output from `.github/workflows/ci.yml` once the repo is public.
- Final README polish and Devpost copy.

Final external-gate command:

```powershell
$env:SLACK_BOT_TOKEN="xoxb-redacted"
$env:SLACK_APP_TOKEN="xapp-redacted"
$env:SIGNALDESK_TRIAGE_MODE="mcp"
$env:SIGNALDESK_PUBLIC_REPO_URL="<public-repo-url>"
$env:SIGNALDESK_DEMO_VIDEO_URL="<demo-video-url>"
$env:SIGNALDESK_SLACK_SANDBOX_URL="<slack-sandbox-url>"
$env:SIGNALDESK_DEVPOST_PROJECT_URL="<devpost-project-url>"
npm.cmd run submission:set-urls
npm.cmd run submission:live-gates
npm.cmd run submission:final:check
npm.cmd run submission:final:online
```

These intentionally fail until public repo, demo video, Slack sandbox, and Devpost project URLs are filled into `docs/devpost-form.md` and `docs/video-package.md`. Use `submission:set-urls -- --dry-run ...` first if you want validation without rewriting files. The online variant also verifies public-link reachability and rejects localhost, private IP, and placeholder-style URLs.
