# GitHub Repo Settings

Use these settings for the public repository before Devpost submission.

## About

- Description: `MCP-backed Slack incident triage for teams without a SOC`
- Website: `TODO_DEVPOST_PROJECT_URL`
- Topics: `slack`, `mcp`, `incident-response`, `security`, `hackathon`, `agent-for-good`, `block-kit`, `soc`
- Public repo: `https://github.com/Lockelamoree/signaldesk`
- Include in the repository home page:
  - Releases: off unless a final release is created.
  - Packages: off.
  - Environments: off.

## Social Preview

Use `docs/thumbnail.png` for upload fields that require raster images. `docs/thumbnail.svg` is the editable source. A live Slack screenshot is fine too, but only if it is sharper and still shows the same proof signals:

- SignalDesk name visible.
- Runtime: `MCP stdio`.
- Evidence IDs visible.
- Detection checks visible.
- Readiness score visible.
- Create channel action visible.

## Public Push Checklist

1. Run `npm.cmd run verify`.
2. Run `npm.cmd run proof:pack`.
3. Run `npm.cmd run repo:public:check`.
4. Run `npm.cmd run github:launch:check`.
5. Confirm `git status --short` is clean.
6. Confirm `.env`, Slack tokens, private screenshots, browser state, and `artifacts/private/` are absent.
7. Confirm `origin` points at `https://github.com/Lockelamoree/signaldesk.git`.
8. Push the default branch with upstream tracking.
9. Run `npm.cmd run github:launch:strict`.
10. Re-open the public repository in a private/incognito browser.
11. Copy the public URL into `docs/devpost-form.md` when the final video, sandbox, and Devpost URLs are ready.

Command shape if the remote ever needs to be recreated:

```powershell
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
npm.cmd run github:launch:strict
```

## Branch and CI

- Default branch: `main`.
- CI workflow: `.github/workflows/ci.yml`.
- CI command: `npm ci --ignore-scripts` followed by `npm run verify`.

## Judge Landing Path

The README should let a judge quickly find:

- What SignalDesk does.
- How Slack uses MCP-backed triage.
- How to run local proof: `npm.cmd run verify`.
- How to inspect proof: `docs/judge-proof.md`.
- How to install in Slack: `docs/slack-sandbox-runbook.md`.
- What is still external: sandbox URL, judge invites, public video, final Devpost URL.
