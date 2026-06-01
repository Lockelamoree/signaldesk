# Demo Transcript

This transcript uses synthetic data. It is designed for the hackathon video and local proof, not as evidence of a real incident.

## Slack Command

Primary live flow:

```text
Open SignalDesk App Home, click Demo guide or Proof checklist, then:
Use message shortcut: Triage with SignalDesk
```

Fast fallback command:

```text
/signaldesk demo
```

## Expected Slack Brief

- Runtime: MCP stdio through `triage_slack_alert` when `SIGNALDESK_TRIAGE_MODE=mcp`.
- Scenario: Token or OAuth Exposure.
- Severity: High, 100/100 in the deterministic demo fixture.
- Indicators: `https://donor-login.example.bad/reset`, `198.51.100.23`, `donor-login.example.bad`.
- Candidate ATT&CK techniques: `T1566 Phishing`, `T1528 Steal Application Access Token`.
- Detection checks: Slack source preservation, identity sign-in review, proxy/DNS sweep, network telemetry search, and OAuth token lifecycle audit.
- First-response readiness: strong readiness based on evidence, validated claims, detections, roles, guardrails, and Slack coordination.
- First actions: rotate exposed tokens, reset affected session, preserve the Slack message and timestamps, collect identity-provider logs, and create an incident channel.
- Roles: incident owner, evidence lead, comms lead, containment lead.
- Buttons: Create channel, Take owner, Show checklist, Evidence, Detections, Report, Guardrails.

## Incident Channel Creation

Click `Create channel`.

Expected result:

- SignalDesk creates a public incident channel such as `#inc-token-exposure`.
- SignalDesk posts a kickoff message with the severity, summary, and immediate actions.
- If the name is already taken, SignalDesk retries with a short suffix.

## Evidence Audit

```text
EV-001 source_report: original alert text, reporter, channel, timestamp
EV-002 indicator_ips: 198.51.100.23
EV-003 indicator_domains: donor-login.example.bad
EV-004 indicator_urls: https://donor-login.example.bad/reset
```

```text
CL-001 candidate: Scenario is most consistent with Token or OAuth Exposure.
CL-002 deterministic: Severity is high based on extracted indicators and risk keywords.
CL-003 candidate: Candidate ATT&CK mapping includes phishing and token theft.
CL-004 guardrail: Compromise, attribution, and data impact are not confirmed until logs validate them.
```

## Detection Plan

```text
DET-001 Slack message history and audit logs: preserve source report context.
DET-002 Identity provider sign-in logs: search source.ip="198.51.100.23" and the affected user.
DET-003 Firewall, proxy, and VPN logs: search source/destination activity for 198.51.100.23.
DET-004 DNS resolver and web proxy logs: search donor-login.example.bad and the full URL.
DET-005 SaaS OAuth, app consent, and token audit logs: review app authorization and token lifecycle events.
```

## MCP Proof

```powershell
npm.cmd run smoke:mcp
npm.cmd run smoke:slack-mcp
```

Expected tools:

- `triage_slack_alert`
- `build_response_checklist`
- `build_impact_summary`
- `export_evidence_ledger`
- `build_detection_plan`
- `generate_incident_report`
- `list_demo_incidents`

Expected bridge proof:

```text
runtime.mode: mcp
runtime.transport: stdio
runtime.tool: triage_slack_alert
```

## Report Export

Click `Report` in Slack or run:

```powershell
npm.cmd run report:sample
```

Expected result: a Markdown incident report with executive summary, first-response readiness, immediate actions, response roles, indicators, evidence ledger, claim audit, detection opportunities, guardrails, and validation status.

## Fixture Proof

```powershell
npm.cmd run validate:fixtures
```

Expected result: all four synthetic fixtures pass scenario, severity, technique, detection, and evidence-validation checks.
