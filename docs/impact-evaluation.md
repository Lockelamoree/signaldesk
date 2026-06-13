# SignalDesk Impact Evaluation

Evaluation date: 2026-06-01

This is a deterministic repo-local evaluation for the Slack Agent for Good story. It uses synthetic nonprofit, school, clinic, and community-team incidents to prove that SignalDesk creates a prepared first-response package. It does not claim live containment, breach confirmation, or real-world outcome improvement until responders validate logs and act in the Slack sandbox or a real environment.

## Overall Result

Overall result: **PASS**

- Target users: under-resourced Slack teams without a full SOC.
- Communities covered: nonprofit operations, education, public health, community safety.
- Scenarios covered: token_exposure, malware_execution, data_exfiltration, security_report.
- Average first-response readiness: 98.3/100.
- Minimum first-response readiness: 93/100.
- Report-ready fixtures: 3.
- Intake-only fixtures: 1.
- Evidence items prepared: 10.
- Evidence-linked detection checks prepared: 14.
- Response roles suggested: 15.
- Safety guardrails generated: 12.

## Fixture Results

| Fixture | Community | Scenario | Severity | Report decision | Readiness | Evidence | Detections | Roles | Guardrails | Claims valid |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Nonprofit OAuth Phishing | nonprofit operations | token_exposure | high 100/100 | Incident report | 100/100 | 4 | 5 | 4 | 3 | PASS |
| School Script Download | education | malware_execution | high 92/100 | Incident report | 100/100 | 2 | 4 | 4 | 3 | PASS |
| Clinic Exfiltration Warning | public health | data_exfiltration | high 86/100 | Incident report | 100/100 | 3 | 3 | 4 | 3 | PASS |
| Community Low-Signal Report | community safety | security_report | low 34/100 | Intake only | 93/100 | 1 | 2 | 3 | 3 | PASS |

## Pass Criteria

- At least four Agent for Good fixtures cover nonprofit operations, education, public health, and community safety.
- Required scenarios are covered: token exposure, malware execution, data exfiltration, and low-signal security reports.
- Low-signal security reports stay intake-only until concrete indicators, affected users/systems, confirmed action, or sensitive context exists.
- Each fixture preserves source evidence, validates claims against evidence IDs, generates detection checks, assigns response roles, includes guardrails, and suggests a Slack coordination path.
- Each fixture reaches at least 80/100 first-response readiness, and the average stays at or above 90/100.

## Evidence Boundary

This artifact supports the Potential Impact criterion by proving repeatable readiness on synthetic incidents. It should be shown alongside the live Slack sandbox demo, public repository, and `docs/judge-proof.md`; it is not a substitute for live Slack footage or public-link verification.
