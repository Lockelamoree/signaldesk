# Live Gate Handoff

This is the short handoff for the account-bound work that still needs Max's logged-in Slack, video host, and Devpost sessions.

Current status: repo-local proof is ready and the public GitHub repo has been pushed. Slack sandbox access, demo video, final Devpost URL, and final URL replacement are still pending. The shortest blocker checklist is `docs/live-submission-blockers.md`.

## Max-Owned Actions

1. Confirm the public GitHub repository.
   - Browser URL: `https://github.com/Lockelamoree/signaldesk`.
   - GitHub remote URL: `https://github.com/Lockelamoree/signaldesk.git`.
   - Visibility should be public.
   - Suggested description: `MCP-backed Slack incident triage for teams without a SOC`.
   - Suggested topics: `slack`, `mcp`, `incident-response`, `security`, `hackathon`, `agent-for-good`, `block-kit`, `soc`.
   - Open it in a private browser once so we know judges can see it. Public GitHub settings love being "almost public" at the worst possible time.

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

Send the remaining URLs once they exist:

```text
GitHub remote URL: https://github.com/Lockelamoree/signaldesk.git
Public repo URL: https://github.com/Lockelamoree/signaldesk
Demo video URL:
Slack sandbox URL:
Devpost project URL:
```

The GitHub remote URL can end in `.git`; the public repo URL should be the browser URL without credentials.

## Codex Resume Commands

After Max sends the final URLs, Codex can run:

```powershell
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
