# Live Gate Handoff

This file is the short handoff for the account-bound work Codex cannot complete without Max's logged-in GitHub, Slack, YouTube/Vimeo, and Devpost sessions.

Current status: repo-local proof is ready; external submission gates are pending.

## Max-Owned Actions

1. Create the public GitHub repository.
   - Visibility: public.
   - Suggested name: `signaldesk`.
   - Description: `MCP-backed Slack incident triage for teams without a SOC`.
   - Topics: `slack`, `mcp`, `incident-response`, `security`, `hackathon`, `agent-for-good`, `block-kit`, `soc`.
   - Return to Codex with the remote URL, for example `https://github.com/<owner>/signaldesk.git`.

2. Create and install the Slack sandbox app.
   - Join the Slack Developer Program and open the developer sandbox.
   - Create an app from `manifest.json`.
   - Install it to the sandbox.
   - Create the `xoxb-` bot token and `xapp-` app-level token.
   - Do not paste tokens into GitHub, Devpost, screenshots, or Slack messages.

3. Invite the judges to the Slack sandbox.
   - Invite `slackhack@salesforce.com` as a full workspace Member.
   - Invite `testing@devpost.com` as a full workspace Member.
   - Confirm SignalDesk is installed in the same sandbox.

4. Record and upload the demo video.
   - Use only synthetic demo data.
   - Keep the final cut under 3 minutes.
   - Show live Slack sandbox footage, `Runtime: MCP stdio`, evidence IDs, detection checks, incident channel creation, report export, and terminal MCP proof.
   - Upload to YouTube, Vimeo, Facebook Video, or Youku as public or unlisted.
   - Check the video URL in a private browser.

5. Create or save the Devpost project draft.
   - Track: `Slack Agent for Good`.
   - Use `docs/devpost-form.md` for paste-ready text.
   - Upload `docs/architecture.svg` as the architecture diagram.
   - Copy the Devpost project URL.

## What To Send Back To Codex

Send these four URLs:

```text
GitHub remote URL:
Public repo URL:
Demo video URL:
Slack sandbox URL:
Devpost project URL:
```

The GitHub remote URL can end in `.git`; the public repo URL should be the browser URL without credentials.

## Codex Resume Commands

After Max sends the URLs, Codex can run:

```powershell
git remote add origin <github-remote-url>
git push -u origin main
npm.cmd run github:launch:strict
npm.cmd run submission:set-urls -- --repo <public-repo-url> --video <demo-video-url> --sandbox <slack-sandbox-url> --devpost <devpost-project-url>
npm.cmd run submission:live-gates
npm.cmd run submission:final:check
npm.cmd run submission:final:online
```

Before clicking Submit, Max should also run the strict Slack check locally with real environment variables set:

```powershell
$env:SLACK_BOT_TOKEN="xoxb-redacted"
$env:SLACK_APP_TOKEN="xapp-redacted"
$env:SIGNALDESK_TRIAGE_MODE="mcp"
$env:SIGNALDESK_JUDGE_ACCESS_CONFIRMED="1"
npm.cmd run sandbox:doctor -- --strict
npm.cmd run submission:live-gates
npm.cmd run submission:final:check
npm.cmd run submission:final:online
```

## Stop Conditions

Do not submit until:

- `npm.cmd run github:launch:strict` passes after the public push.
- `npm.cmd run sandbox:doctor -- --strict` passes with real Slack token environment variables.
- `npm.cmd run submission:final:check` passes.
- `npm.cmd run submission:final:online` passes.
- The public repo, video, Slack sandbox URL, and Devpost project URL open from a private browser session.

