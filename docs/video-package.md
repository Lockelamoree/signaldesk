# Demo Video Package

Target length: 2:40-2:55.

## Title

SignalDesk: Evidence-Gated Security Triage in Slack

## Thumbnail

Text: `Slack Incident Agent`

Visual: `docs/thumbnail.png` is the upload-ready 1280x720 PNG thumbnail. `docs/thumbnail.svg` is the editable source. Both show the completed SignalDesk brief, `MCP stdio`, evidence IDs, detection checks, readiness, and the Create channel button. Regenerate the PNG on Windows with `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\export-thumbnail.ps1`. Replace the PNG with a live Slack screenshot only if the live screenshot is sharper and still shows the same proof signals.

## YouTube Description

SignalDesk is a Slack-native security incident agent for nonprofits, schools, clinics, and community teams without a full SOC.

In this demo:

- `/signaldesk` turns suspicious Slack context into an incident brief.
- SignalDesk extracts indicators, assigns severity, and maps candidate ATT&CK techniques.
- Evidence IDs and claim audits keep the response grounded.
- Detection opportunities turn the brief into concrete next log searches.
- First-response readiness shows evidence, detection, role, guardrail, and Slack coordination coverage without claiming live impact.
- The repo-local impact evaluation shows 98.3/100 average readiness across synthetic nonprofit, school, clinic, and community-team incidents.
- The app creates a dedicated incident channel and posts the kickoff message.
- The Slack runtime runs in MCP mode, calling the `triage_slack_alert` tool over stdio.
- MCP tools also expose the same triage engine for agent clients.

Built for the Slack Agent Builder Challenge, Slack Agent for Good track.

Repository: TODO_PUBLIC_REPO_URL
Devpost: TODO_DEVPOST_URL

## Captions

Upload `docs/demo-captions.vtt` after the video is cut. The captions end at 2:52 to stay under the Devpost target and include the core proof terms: Slack, MCP stdio, evidence IDs, detections, incident channel creation, and unsupported-claim guardrails. Upload the final video to YouTube, Vimeo, Facebook Video, or Youku as public or unlisted.

## Shot Order

1. 0:00-0:12: Problem and user.
   "Small teams coordinate security incidents in Slack, but they often do not have a SOC."

2. 0:12-0:28: Runtime proof.
   Show the Slack sandbox App Home with the judge test path. Click `Demo guide` or `Proof checklist`, then run `/signaldesk demo` or use the `Triage with SignalDesk` message shortcut.

3. 0:28-1:10: Triage brief.
   Show runtime `MCP stdio`, severity, scenario, indicators, ATT&CK candidates, evidence IDs, claim audit, detection checks, and first-response readiness.

4. 1:10-1:35: Slack action.
   Click `Create channel`, show `#inc-token-exposure`, and show the kickoff message.

5. 1:35-2:05: Evidence and report.
   Click `Evidence`, `Detections`, then `Report`, showing the handoff artifact. Keep `docs/slack-interaction-transcript.md` open as backup proof that all button responses are generated from reusable payload builders.

6. 2:05-2:30: MCP proof.
   Show `npm.cmd run smoke:slack-mcp`, then `npm.cmd run mcp:transcript` with `triage_slack_alert`, `build_impact_summary`, `export_evidence_ledger`, `build_detection_plan`, `generate_incident_report`, and `list_demo_incidents`. If time allows, show the `npm.cmd run impact:evaluate` summary line with 98.3/100 average readiness.

7. 2:30-2:50: Impact close.
   "SignalDesk does not replace responders. It gives under-resourced teams a safe first 15 minutes: preserve evidence, assign owners, contain obvious risk, and avoid unsupported claims."

## Recording Checklist

- Use live Slack sandbox for final footage.
- Keep terminal font large enough to read.
- Hide tokens, workspace invite screens, and private user data.
- Do not use copyrighted music, third-party footage, real customer screenshots, real Slack messages, or private workspace data.
- Run `npm.cmd run sandbox:doctor -- --strict` before recording, then keep the passing output available as proof.
- Show `npm.cmd run verify` either before or after MCP proof if time allows.
- Keep `npm.cmd run check:block-kit` output available if you need to prove the Slack payload is within Block Kit limits.
- Keep `docs/judge-proof.md` open as backup proof if terminal output is too dense for the recording.
- Keep `docs/slack-interaction-transcript.md` open if a Slack button click is slow or needs a quick repo-local receipt.
- If you need restart recovery during the synthetic demo, set `SIGNALDESK_PERSIST_BRIEFS=1` only while using synthetic data; it writes button state under `artifacts/private/`.
- Keep `docs/impact-evaluation.md` open for the Potential Impact proof if the final cut needs a quick evidence receipt.
- Run `npm.cmd run recording:check` before the final take and keep `docs/recording-readiness.md` open as the recording preflight.
- Use `docs/demo-preview.png` only as a storyboard fallback; final video still needs live Slack sandbox footage.
- Regenerate the storyboard screenshot with `npm.cmd run demo:preview:screenshot` after preview HTML changes.
- Run `npm.cmd run demo:thumbnail:check` before uploading the video thumbnail.
- Run `npm.cmd run demo:captions:check` before uploading captions.
- Upload `docs/thumbnail.png` to YouTube; keep `docs/thumbnail.svg` as the editable source.
- Upload `docs/demo-captions.vtt` after the recording timing matches the planned cut.
- Keep `docs/devpost-form.md` open after recording so the video URL and repo URL can be pasted into the final fields immediately.
- Run `npm.cmd run submission:bundle` after URL replacement so Devpost copy, YouTube metadata, evidence artifacts, and final gates are packaged in one paste-ready operator file.
- Run `npm.cmd run rules:check` before uploading and keep `docs/rules-compliance.md` open for the final manual attestations.
- Use synthetic demo data only.
- Confirm video is public or unlisted and accessible from an incognito/private browser session.
- Confirm the video host is YouTube, Vimeo, Facebook Video, or Youku.
- After uploading, run `npm.cmd run submission:set-urls -- --repo <url> --video <url> --sandbox <url> --devpost <url>` to validate and write the final public URLs, then run `npm.cmd run submission:final:check` and `npm.cmd run submission:final:online`.
