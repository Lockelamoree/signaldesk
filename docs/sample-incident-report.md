# SignalDesk Incident Report: Token or OAuth Exposure

Generated: 2026-06-01T12:00:00.000Z
Reporter: demo-user
Channel: security-help
Severity: HIGH (100/100)
Confidence: medium
Report Decision: Incident report
Runtime: MCP stdio via triage_slack_alert

## Executive Summary

HIGH confidence triage for Token or OAuth Exposure; extracted 1 URL(s), 1 IP address(es).

## Report Decision

Enough signal for an incident report: 3 extracted indicator(s); Token or OAuth Exposure scenario language; 2 ATT&CK candidate(s); severity score 100/100; confirmed user action; sensitive or production context.

Decision signals: 3 extracted indicator(s); Token or OAuth Exposure scenario language; 2 ATT&CK candidate(s); severity score 100/100; confirmed user action; sensitive or production context.

## First-Response Readiness

Score: 100/100 (strong)

SignalDesk turns one Slack report into a prepared first-response package; live impact still requires responders to validate logs and execute containment.

| ID | Signal | Status | Evidence | Detail |
| --- | --- | --- | --- | --- |
| IM-001 | Source evidence preserved | ready | EV-001 | 4 evidence item(s) available for handoff. |
| IM-002 | Claims validated against evidence | ready | EV-001, EV-002, EV-003, EV-004 | 4 claim(s) cite known evidence IDs and fields. |
| IM-003 | Detection plan available | ready | EV-001, EV-002, EV-003, EV-004 | 5 evidence-linked detection check(s) generated. |
| IM-004 | Response ownership defined | ready | EV-001 | 4 role assignment(s) suggested. |
| IM-005 | Evidence checklist ready | ready | EV-001 | 6 evidence collection item(s) listed. |
| IM-006 | Safety guardrails present | ready | EV-001 | 3 guardrail(s) prevent overclaiming and unsafe data sharing. |
| IM-007 | Slack coordination path ready | ready | EV-001 | Suggested channel #inc-token-exposure with update cadence prepared. |

## Immediate Actions

- Revoke or rotate exposed tokens before broader investigation if exposure is confirmed.
- Reset the affected account session and require MFA re-verification if credential entry is confirmed.
- Preserve the original message, thread, timestamps, user IDs, and any clicked links.
- Ask the reporter what action they took: ignored, clicked, entered credentials, approved MFA, or downloaded a file.
- Check admin/audit logs for the affected user and listed indicators over the last 24 hours.
- Create a dedicated incident channel and assign owner, comms lead, and evidence lead.

## Response Roles

- Incident owner: Decide severity, keep the response moving, and call out assumptions.
- Evidence lead: Collect logs, links, timestamps, and affected identities without altering evidence.
- Comms lead: Post concise updates and prevent premature attribution or impact claims.
- Containment lead: Coordinate token revocation, session resets, endpoint isolation, or access changes.

## Indicators

| Kind | Value |
| --- | --- |
| ips | 198.51.100.23 |
| domains | donor-login.example.bad |
| urls | https://donor-login.example.bad/reset |

## Candidate ATT&CK Techniques

- T1566 Phishing
- T1528 Steal Application Access Token

## Evidence Ledger

| ID | Type | Source | Fields |
| --- | --- | --- | --- |
| EV-001 | source_report | slack_input | alertText, reporter, channel, timestamp |
| EV-002 | indicator_ips | deterministic_extractor | kind, value, sourceField |
| EV-003 | indicator_domains | deterministic_extractor | kind, value, sourceField |
| EV-004 | indicator_urls | deterministic_extractor | kind, value, sourceField |

## Claim Audit

| ID | Status | Evidence | Claim |
| --- | --- | --- | --- |
| CL-001 | candidate | EV-001, EV-002, EV-003, EV-004 | Scenario is most consistent with Token or OAuth Exposure. |
| CL-002 | deterministic | EV-001, EV-002, EV-003, EV-004 | Severity is high with score 100/100 based on extracted indicators and risk keywords. |
| CL-003 | candidate | EV-001 | Candidate ATT&CK mapping: T1566 Phishing, T1528 Steal Application Access Token. |
| CL-004 | guardrail | EV-001 | Compromise, attribution, and data impact are not confirmed until logs validate them. |

## Detection Opportunities

| ID | Log Source | Evidence | Query | Why |
| --- | --- | --- | --- | --- |
| DET-001 | Slack message history and audit logs | EV-001 | message.permalink="<source_permalink>" OR channel.id="<reported_channel>" | Keep the original report, reporter, timestamps, thread context, and follow-up actions tied to one evidence trail. |
| DET-002 | Identity provider sign-in logs | EV-001, EV-002 | source.ip="198.51.100.23" OR user.name="<affected_user>" | Validate whether the affected user authenticated from the reported infrastructure before or after the Slack report. |
| DET-003 | Firewall, proxy, and VPN logs | EV-001, EV-002 | source.ip="198.51.100.23" OR destination.ip="198.51.100.23" | Check whether the IPs appear as inbound sources, outbound destinations, VPN egress, or proxy hops. |
| DET-004 | DNS resolver and web proxy logs | EV-001, EV-003, EV-004 | url.full="https://donor-login.example.bad/reset" OR url.domain="donor-login.example.bad" | Find other users who resolved, clicked, or were redirected through the same infrastructure. |
| DET-005 | SaaS OAuth, app consent, and token audit logs | EV-001, EV-003, EV-004 | event.action IN ("app_authorized", "token_issued", "token_used", "token_revoked") AND user.name="<affected_user>" | Confirm whether a consent grant or token use occurred before rotating credentials and closing access. |

## Evidence Checklist

- Reporter, affected user, and business context
- Original Slack permalink or screenshot with timestamps
- Identity provider sign-in logs
- Endpoint/network telemetry for the affected user
- URL/domain reputation and redirect chain
- IP reputation, ASN, geolocation, and proxy/VPN signal

## Slack Coordination Plan

Suggested channel: #inc-token-exposure

SignalDesk opened HIGH triage for Token or OAuth Exposure. First priority: preserve evidence, confirm affected users, and validate impact with logs. Avoid posting raw secrets or customer data in the channel.

Update cadence: Post updates every 15 minutes until contained.

## Guardrails

- This is triage, not attribution.
- Do not post secrets, raw tokens, or private customer data into shared channels.
- Confirm impact with logs before declaring compromise.

## Validation

Evidence claim validation passed.

This report is triage support, not attribution or final impact determination.
