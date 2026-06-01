# Three-Minute Demo Script

## 0:00-0:20 - Hook

"Small nonprofits and community teams live in Slack, but when someone reports a phishing link or leaked token, they usually do not have a SOC. SignalDesk gives them a safe first 15 minutes."

Show the Slack channel and a suspicious message. Right-click the message and select `Triage with SignalDesk`.
If the judge opens SignalDesk first, show the App Home tab with the test path, click `Demo guide` or `Proof checklist`, then run `/signaldesk demo` before running the shortcut.
If the live sandbox is not yet open during rehearsal, use `docs/demo-preview.html` only as a storyboard preview, not as final proof.

## 0:20-1:05 - Slack Flow

Use the message shortcut as the primary flow. Keep this slash command as the low-typing fallback:

```text
/signaldesk demo
```

Show the generated incident brief:

- Runtime: MCP stdio.
- Severity.
- Extracted indicators.
- Candidate ATT&CK techniques.
- Evidence IDs and claim audit.
- Detection checks with evidence-linked hunt queries.
- First-response readiness score and why it is not a live compromise claim.
- Response actions.
- Evidence checklist/guardrail.
- Report export.

Click `Create channel` and show SignalDesk creating the incident channel and posting the kickoff message.

## 1:05-1:45 - MCP Proof

Show `npm.cmd run smoke:slack-mcp`, proving the Slack triage runtime calls the MCP `triage_slack_alert` tool.
Then show `build_impact_summary`, `build_detection_plan`, and `generate_incident_report` or `npm.cmd run report:sample` producing the readiness summary, detection plan, and Markdown handoff report.

Narration:

"The Slack UX is only the surface. The security reasoning lives in MCP-backed tools, which makes the workflow testable, auditable, and reusable by agent clients."

## 1:45-2:25 - Impact

Show the before/after:

- Before: scattered Slack thread, unclear owner, evidence lost.
- After: named actions, evidence-linked detection checks, readiness score, no premature attribution, faster containment path.

Tie it to Agent for Good:

"This is built for teams that protect donors, students, patients, and volunteers without a dedicated security staff."

## 2:25-2:50 - Architecture

Show architecture diagram:

- Slack command or mention.
- Bolt app.
- Shared triage core.
- MCP server.
- Slack-to-MCP triage runtime.
- Slack Block Kit incident brief.

## 2:50-3:00 - Close

"SignalDesk does not pretend to replace responders. It gives humans a reliable first response inside the place they already coordinate: Slack."
