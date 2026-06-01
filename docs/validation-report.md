# Validation Report

Generated from `npm.cmd test`, `npm.cmd run demo:assets`, `npm.cmd run demo:preview:screenshot`, `npm.cmd run demo:preview:check`, `npm.cmd run demo:thumbnail:check`, `npm.cmd run demo:captions:check`, `npm.cmd run devpost:form:check`, `npm.cmd run impact:evaluate`, `npm.cmd run recording:check`, `npm.cmd run judge:quickstart:check`, `npm.cmd run judge:matrix:check`, `npm.cmd run slack:ux:proof`, `npm.cmd run sandbox:doctor`, `npm.cmd run repo:public:check`, `npm.cmd run scan:secrets`, `npm.cmd run check:syntax`, `npm.cmd run check:block-kit`, `npm.cmd run smoke:mcp`, `npm.cmd run mcp:transcript`, `npm.cmd run smoke:slack-mcp`, `npm.cmd run validate:fixtures`, `npm.cmd run submission:check`, `npm.cmd run proof:pack`, `npm.cmd run verify`, and the intentionally external `npm.cmd run submission:final:online` during local development.

## Coverage

- Core indicator extraction.
- Scenario classification fallback.
- Candidate MITRE ATT&CK mapping.
- Severity scoring.
- Slack Block Kit payload generation.
- Slack App Home onboarding view generation.
- Slack App Home Demo guide and Proof checklist modal generation.
- Slack interaction transcript generation for ownership, channel creation, evidence, detections, report, and guardrail button responses.
- Rules compliance map and checker for official rules, video restrictions, sensitive-data controls, sandbox access, and manual final attestations.
- Public Slack UX proof at `docs/slack-ux-proof.md`, covering App Home, help, modals, and safe error guidance.
- `/signaldesk demo` and app mention demo alias resolution.
- No-input `/signaldesk` and app mention demo help generation.
- Safe Slack triage-error guidance that redacts token-shaped strings and points responders to `sandbox:doctor` and `smoke:slack-mcp`.
- Slack Block Kit payload includes a create-channel action; live channel creation still requires sandbox credentials.
- Slack Block Kit constraints check for message block count, section text length, action element count, and button limits.
- Slack message-shortcut text extraction.
- Slack incident channel creation helper with fake-client coverage for success, name collision retry, and missing-scope failure.
- Optional Slack triage runtime mode `SIGNALDESK_TRIAGE_MODE=mcp`.
- Slack-to-MCP bridge smoke test proving Slack triage can call `triage_slack_alert` over stdio.
- MCP stdio server spawn, tool discovery, and `triage_slack_alert` invocation.
- Full MCP tool transcript at `docs/mcp-tool-transcript.md`, validating every registered SignalDesk MCP tool.
- MCP evidence ledger export.
- MCP detection plan generation through `build_detection_plan`.
- MCP impact summary generation through `build_impact_summary`.
- MCP incident report generation.
- Claim-to-evidence validation, including rejection of bad IDs and field references.
- Evidence-linked detection opportunities for every synthetic fixture.
- First-response readiness metrics for every synthetic fixture.
- Agent for Good impact evaluation at `docs/impact-evaluation.md`, including average/minimum readiness, evidence count, detection count, roles, guardrails, scenario coverage, and explicit live-impact boundaries.
- Recording readiness preflight at `docs/recording-readiness.md`, including first-30-second Slack proof, MCP runtime proof, thumbnail/caption dimensions, sandbox access reminders, and evidence boundaries.
- Judge quickstart at `docs/judge-quickstart.md`, including clone-to-proof commands, MCP smoke proof, live Slack sandbox proof, final submission gates, and evidence boundaries.
- Synthetic fixture validation across multiple incident classes.
- High-confidence secret pattern scan.
- JavaScript syntax check across repo-local source files.
- Reproducible demo asset export under `artifacts/demo/`.
- Judge proof pack export to `docs/judge-proof.md` and `artifacts/submission/proof-pack.json`.
- Static demo preview for recording rehearsal at `docs/demo-preview.html`.
- Static demo preview screenshot at `docs/demo-preview.png`.
- 1280x720 demo thumbnail source at `docs/thumbnail.svg` and upload-ready PNG at `docs/thumbnail.png`.
- WebVTT demo captions at `docs/demo-captions.vtt`.
- Judge evidence matrix at `docs/judge-evidence-matrix.md`.
- Paste-ready Devpost fields at `docs/devpost-form.md`.
- Demo preview text gate to ensure storyboard/proof labels stay present, static HTML smoke checks pass, and `docs/demo-preview.png` is a valid 1440x1000 PNG screenshot.
- Demo thumbnail gate to ensure the SVG source shows project, MCP runtime, evidence IDs, detection checks, and the completed action state, and that the PNG is a valid 1280x720 upload file under 2 MB.
- Demo captions gate to ensure the WebVTT file is ordered, under 3 minutes, and includes core proof terms.
- Judge evidence matrix gate to ensure the official rubric, required artifacts, winner benchmark, live gates, and proof commands are mapped.
- Slack interaction transcript gate to prove the repo-local button handoff path before live sandbox recording.
- Rules compliance gate to reduce final submission and disqualification risk.
- Devpost form gate to ensure project name, track, pitch length, MCP runtime proof, judge-proof references, and external URL placeholders are present.
- Slack sandbox doctor to validate manifest, scopes, token prefix readiness, Socket Mode, interactivity, and MCP demo mode.
- Public repo readiness check for README, license, security policy, CI, proof pack, GitHub settings, and secret-hygiene ignores.
- Repo-local submission readiness checks.

## Latest Local Result

`npm.cmd run verify` passed locally after adding evidence-linked detection opportunities and the MCP detection-plan tool. The command sequence is:

```powershell
npm.cmd run scan:secrets
npm.cmd run check:syntax
npm.cmd run check:block-kit
npm.cmd run demo:preview:check
npm.cmd run demo:preview:screenshot
npm.cmd run demo:thumbnail:check
npm.cmd run demo:captions:check
npm.cmd run devpost:form:check
npm.cmd run impact:evaluate
npm.cmd run recording:check
npm.cmd run judge:quickstart:check
npm.cmd run judge:matrix:check
npm.cmd run sandbox:doctor
npm.cmd test
npm.cmd run smoke:mcp
npm.cmd run smoke:slack-mcp
npm.cmd run validate:fixtures
npm.cmd run repo:public:check
npm.cmd run submission:check
```

The repo-local readiness gate still reports the external gates honestly: Slack sandbox install, judge invites, public repo URL, and demo video URL require live evidence.

`npm.cmd run proof:pack` also passed locally and wrote the latest judge-facing receipt to `docs/judge-proof.md`.

## Current Fixture Expectations

| Fixture | Expected Scenario | Expected Severity | Expected Techniques | Expected Readiness |
| --- | --- | --- | --- | --- |
| `nonprofit-oauth-phish` | `token_exposure` | `high` | `T1566`, `T1528` | >=80 |
| `school-script-download` | `malware_execution` | `high` | `T1059`, `T1105` | >=80 |
| `clinic-exfil-warning` | `data_exfiltration` | `high` | `T1041` | >=80 |
| `community-low-signal` | `security_report` | `low` | none | >=80 |

## Evidence-Gated Output Contract

- Evidence IDs use the `EV-000` format.
- Claim IDs use the `CL-000` format.
- Detection opportunity IDs use the `DET-000` format.
- Impact metric IDs use the `IM-000` format.
- Allowed claim statuses are `candidate`, `deterministic`, and `guardrail`.
- Claims must cite known evidence IDs.
- Detection opportunities must cite source evidence and any indicator evidence they depend on.
- Field references must point to existing evidence fields.

## Slack Block Kit Contract

- Message payloads must stay at or below 50 blocks.
- Section text must stay at or below 3000 characters.
- Section fields must stay at or below 10 items, with each field at or below 2000 characters.
- Action blocks must stay at or below 25 interactive elements.
- Button text, action IDs, and values are checked before live sandbox recording.

## Evidence Boundary

These checks prove deterministic local behavior. They do not prove Slack sandbox delivery until the app is installed in a developer sandbox and `/signaldesk` is exercised with real Slack tokens.

Before recording the live sandbox, run `npm.cmd run sandbox:doctor -- --strict` after setting real `SLACK_BOT_TOKEN` and `SLACK_APP_TOKEN`. The strict doctor validates token prefixes without printing token values.

Before clicking Devpost Submit, run `npm.cmd run submission:final:check` and `npm.cmd run submission:final:online`. Those commands are intentionally excluded from normal `verify` because they should fail until live public URLs and real Slack token environment variables exist.
