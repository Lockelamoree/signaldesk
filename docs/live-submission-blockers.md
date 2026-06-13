# Live Submission Blockers

Current status: the public GitHub repo is ready, but the Devpost submission is not ready yet.

Public repo:

```text
https://github.com/Lockelamoree/signaldesk
```

## What Is Still Blocking

1. Slack sandbox is not proven live.
   - Install the Slack app from `manifest.json`.
   - Create an app-level token with Socket Mode enabled.
   - Keep tokens local. Do not paste them into chat, GitHub, Devpost, screenshots, or Slack messages.
   - Run the strict doctor before recording.

2. Judge access is not confirmed.
   - Invite `slackhack@salesforce.com` as a full workspace Member.
   - Invite `testing@devpost.com` as a full workspace Member.
   - After both invites are done, set `SIGNALDESK_JUDGE_ACCESS_CONFIRMED=1` locally for final checks.

3. Demo video is missing.
   - Record a public or unlisted video under 3 minutes.
   - Show the live Slack sandbox, `Runtime: MCP stdio`, incident channel creation, detections, report export, and terminal MCP proof.
   - Upload to YouTube, Vimeo, Facebook Video, or Youku.

4. Final Devpost project URL is missing.
   - Create or save the Devpost draft.
   - Copy the project URL.

5. Final URL replacement has not run.
   - `docs/devpost-form.md` still needs the demo video, Slack sandbox, and Devpost project URLs.
   - `docs/video-package.md` still needs the Devpost URL.

## Exact Local Commands

Set these only in the local PowerShell session:

```powershell
$env:SLACK_BOT_TOKEN="xoxb-redacted"
$env:SLACK_APP_TOKEN="xapp-redacted"
$env:SIGNALDESK_TRIAGE_MODE="mcp"
$env:SIGNALDESK_JUDGE_ACCESS_CONFIRMED="1"
```

Before recording:

```powershell
npm.cmd run sandbox:doctor -- --strict
npm.cmd run start
```

Token-safe helper:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\start-live-slack.ps1
```

Use Slack:

```text
/signaldesk proof
/signaldesk demo
```

After the video, sandbox URL, and Devpost URL exist:

```powershell
npm.cmd run submission:set-urls -- --repo https://github.com/Lockelamoree/signaldesk --video <demo-video-url> --sandbox <slack-sandbox-url> --devpost <devpost-project-url>
npm.cmd run submission:live-gates
npm.cmd run submission:final:check
npm.cmd run submission:final:online
```

## Pass Criteria

Do not click Submit until all of these are true:

- `npm.cmd run github:launch:strict` passes.
- `npm.cmd run sandbox:doctor -- --strict` passes with real local Slack token env vars.
- `npm.cmd run submission:live-gates` says `READY_TO_SUBMIT`.
- `npm.cmd run submission:final:check` passes.
- `npm.cmd run submission:final:online` passes.
- Public repo, demo video, Slack sandbox URL, and Devpost project URL open in a private browser session.
- The two judge emails are invited to the Slack sandbox.
