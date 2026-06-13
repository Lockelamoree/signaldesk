# Slack Sandbox Runbook

Use this runbook to produce the live Slack proof required for the Slack Agent Builder Challenge submission.

Official references:

- Slack app manifests: https://docs.slack.dev/app-manifests/configuring-apps-with-app-manifests
- Bolt for JavaScript app setup: https://docs.slack.dev/tools/bolt-js/creating-an-app
- Bolt Socket Mode: https://docs.slack.dev/tools/bolt-js/concepts/socket-mode
- Devpost requirements: https://slackhack.devpost.com/

## 1. Create the Sandbox App

1. Join the Slack Developer Program and open your developer sandbox.
2. Go to Slack app creation and choose to create an app from a manifest.
3. Paste `manifest.json`.
4. Confirm the summary includes:
   - App name: SignalDesk.
   - Slash command: `/signaldesk`.
   - Message shortcut: `Triage with SignalDesk`.
   - Bot scopes: `commands`, `chat:write`, `app_mentions:read`, `channels:manage`.
   - Socket Mode enabled.
   - Interactivity enabled.
5. Create the app.

## 2. Generate Tokens

1. Install the app to the sandbox workspace.
2. Copy the Bot User OAuth Token that starts with `xoxb-`.
3. In Basic Information, create an app-level token with `connections:write`.
4. Copy the App-Level Token that starts with `xapp-`.

Do not paste real tokens into GitHub, Devpost, screenshots, or shared Slack channels. Nothing says enterprise security like leaking the bot token in the victory lap.

## 3. Run Locally

In PowerShell:

```powershell
npm.cmd ci --ignore-scripts
$env:SLACK_BOT_TOKEN="xoxb-redacted"
$env:SLACK_APP_TOKEN="xapp-redacted"
$env:SIGNALDESK_TRIAGE_MODE="mcp"
npm.cmd run sandbox:doctor -- --strict
npm.cmd run start
```

Or use the local prompt helper, which keeps tokens in the current PowerShell process and does not write them to disk:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\start-live-slack.ps1
```

Optional synthetic-demo recovery:

```powershell
$env:SIGNALDESK_PERSIST_BRIEFS="1"
$env:SIGNALDESK_BRIEF_STORE_DIR="artifacts/private/brief-store"
```

Use this only for synthetic demo data if you want Slack buttons to recover after a local app restart. Keep it disabled for real Slack data unless explicit retention controls exist.

Expected terminal signal:

```text
SignalDesk Slack app started on port 3000
```

## 4. Demo Command

In the sandbox Slack workspace, post a synthetic suspicious message:

```text
Volunteer clicked a fake donor portal link at https://donor-login.example.bad/reset from 198.51.100.23, approved an MFA prompt, and pasted an access token. This may affect donor records and payroll.
```

Use the message context menu and select `Triage with SignalDesk`.

Fast demo command:

```text
/signaldesk demo
```

Judge proof command:

```text
/signaldesk proof
```

Expected Slack output:

- App Home shows the judge test path, fallback command, proof signals, synthetic-data boundary, and clickable `Demo guide` plus `Proof checklist` modals.
- `/signaldesk proof` shows the proof checklist as a Slack message if App Home is not visible during recording.
- `/signaldesk demo` and app mentions containing `demo` trigger the canonical synthetic OAuth-phishing incident.
- `/signaldesk` without text and empty app mentions show demo help with the same fallback commands.
- Header: `SignalDesk: HIGH triage`.
- Runtime: `MCP stdio`.
- Scenario: Token or OAuth Exposure.
- Indicators: URL, IP, and domain.
- Candidate techniques: `T1566 Phishing`, `T1528 Steal Application Access Token`.
- Evidence IDs: `EV-001` through `EV-004`.
- Claim audit: `CL-001` through `CL-004`.
- Detection checks: `DET-001` through `DET-005`.
- First-response readiness: strong readiness with evidence, detections, roles, guardrails, and Slack coordination represented.
- Buttons: Create channel, Take owner, Show checklist, Evidence, Detections, Report, Guardrails.

## 5. Button Proof

Click each button during recording:

- App Home `Demo guide`: opens the modal with `/signaldesk demo`, runtime target, and full fallback command.
- App Home `Proof checklist`: opens the modal with runtime, EV/CL/DET/IM, detection, readiness, channel, and terminal receipt checks.
- `Create channel`: creates a public incident channel such as `#inc-token-exposure` and posts a kickoff message.
- `Take owner`: posts an in-channel owner acknowledgement.
- `Show checklist`: shows an ephemeral evidence checklist.
- `Evidence`: shows evidence ledger and claim audit.
- `Detections`: shows evidence-linked detection checks and safe hunt queries.
- `Report`: shows a Markdown incident handoff report.
- `Guardrails`: shows attribution/privacy/impact guardrails.

## 6. MCP Proof

In another terminal:

```powershell
npm.cmd run smoke:mcp
npm.cmd run smoke:slack-mcp
```

Capture output showing the available tools:

- `triage_slack_alert`
- `build_response_checklist`
- `build_impact_summary`
- `export_evidence_ledger`
- `build_detection_plan`
- `generate_incident_report`
- `list_demo_incidents`

Capture `smoke:slack-mcp` showing runtime mode `mcp`; this proves the Slack triage runtime can call the MCP-backed `triage_slack_alert` tool.

## 7. Judge Access

Before submitting:

1. Invite `slackhack@salesforce.com` to the sandbox as a full workspace Member, not a guest.
2. Invite `testing@devpost.com` to the sandbox as a full workspace Member, not a guest.
3. Confirm the SignalDesk app is installed in the same sandbox.
4. Put the sandbox URL into Devpost.

## 8. Evidence to Save

Save these files or screenshots for submission packaging:

- Slack command before submission.
- Full SignalDesk Slack brief.
- Button responses for owner/checklist/evidence/detections/guardrails.
- Terminal with `npm.cmd run verify`.
- Terminal with `npm.cmd run recording:check`.
- Terminal with `npm.cmd run sandbox:doctor -- --strict`.
- Terminal or `docs/judge-proof.md` from `npm.cmd run proof:pack`.
- `docs/judge-evidence-matrix.md` for the rubric-to-proof map.
- `docs/impact-evaluation.md` from `npm.cmd run impact:evaluate` for the Potential Impact proof.
- Terminal with `npm.cmd run smoke:mcp`.
- Terminal with `npm.cmd run smoke:slack-mcp`.
- `docs/thumbnail.png` for video upload, with `docs/thumbnail.svg` as the editable source.
- `docs/demo-captions.vtt` after final video timing is confirmed.
- `docs/demo-preview.png` as repo-local storyboard proof only; do not use it as a substitute for live Slack footage.
- `docs/architecture.svg`.
- Public demo video URL.
- Updated `docs/devpost-form.md` with public repo, demo video, sandbox, and Devpost URLs.
- Passing `npm.cmd run submission:final:check` output after public URLs and real Slack token env vars are set.
- Passing `npm.cmd run submission:final:online` output after public URLs are reachable.
- Passing `npm.cmd run repo:public:check` output before publishing the GitHub URL.

## Troubleshooting

- If slash command does not respond, reinstall the app after changing the manifest.
- If app starts but receives no events, verify Socket Mode is enabled and the `xapp-` token has `connections:write`.
- If buttons do nothing, verify Interactivity is enabled and the app process is still running.
- If channel creation fails with `missing_scope`, reinstall the app after adding `channels:manage`.
- If channel creation fails with `restricted_action`, the workspace does not allow this app/user to create channels.
- If Slack says the command is unknown, confirm `/signaldesk` exists under Slash Commands and the app is installed to the sandbox.
- If the message shortcut is missing, confirm `Triage with SignalDesk` exists under Interactivity & Shortcuts and reinstall the app after manifest changes.
- If SignalDesk posts runtime-check guidance instead of a brief, run `npm.cmd run sandbox:doctor -- --strict` and `npm.cmd run smoke:slack-mcp`, then confirm `SIGNALDESK_TRIAGE_MODE=mcp`.

Before live testing, run:

```powershell
npm.cmd run verify
npm.cmd run check:block-kit
npm.cmd run demo:preview:screenshot
npm.cmd run demo:thumbnail:check
npm.cmd run demo:captions:check
npm.cmd run devpost:form:check
npm.cmd run impact:evaluate
npm.cmd run recording:check
npm.cmd run judge:matrix:check
npm.cmd run sandbox:doctor
npm.cmd run repo:public:check
```

This checks shortcut parsing, channel creation behavior, Slack-to-MCP bridge behavior, and generated Block Kit payload limits locally. It does not replace the live sandbox proof.

After the public URLs exist and real Slack tokens are set, run:

```powershell
$env:SLACK_BOT_TOKEN="xoxb-redacted"
$env:SLACK_APP_TOKEN="xapp-redacted"
$env:SIGNALDESK_TRIAGE_MODE="mcp"
$env:SIGNALDESK_PUBLIC_REPO_URL="<public-repo-url>"
$env:SIGNALDESK_DEMO_VIDEO_URL="<demo-video-url>"
$env:SIGNALDESK_SLACK_SANDBOX_URL="<slack-sandbox-url>"
$env:SIGNALDESK_DEVPOST_PROJECT_URL="<devpost-project-url>"
npm.cmd run submission:set-urls
npm.cmd run submission:final:check
npm.cmd run submission:final:online
```

The URL setter validates public URL shape and allowed demo video hosts before it rewrites `docs/devpost-form.md` and `docs/video-package.md`. These strict final checks should pass only when the external submission gates are ready. The online check rejects localhost/private URLs and verifies the public repo, demo video, sandbox, and Devpost URLs are reachable.
