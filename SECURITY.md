# Security Policy

SignalDesk is a hackathon demo for Slack-native incident triage. The repository uses synthetic security scenarios and should not contain real Slack messages, private workspace data, customer data, Slack tokens, Devpost credentials, or live incident evidence.

## Supported Version

The current hackathon submission branch is the only supported version.

## Reporting Security Issues

Do not open public issues containing real secrets, real Slack workspace data, exploit details against Slack or Salesforce, or private user data.

For issues in this demo repository, contact the project maintainer privately. For suspected vulnerabilities affecting Slack, Salesforce, Devpost, or other third-party services, use the vendor's official security reporting channel. The Slack Agent Builder Challenge materials direct suspected Salesforce or Slack security issues to `security@salesforce.com`.

## Demo Data Rules

- Use only synthetic alert text and synthetic indicators in screenshots, videos, tests, and Devpost materials.
- Never commit `.env`, `xoxb-` tokens, `xapp-` tokens, browser storage state, Slack exports, real screenshots with private workspace content, or judge/sandbox credentials.
- Keep `SIGNALDESK_PERSIST_BRIEFS=0` for real Slack data. The optional private brief store is only for synthetic demo recovery and writes under `artifacts/private/`.
- Run `npm.cmd run scan:secrets` and `npm.cmd run verify` before any public push.
- Run `npm.cmd run sandbox:doctor -- --strict` before recording live Slack footage; it validates token prefixes without printing token values.

## Scope Boundaries

SignalDesk triage output is evidence-gated. Candidate ATT&CK mappings, scenario labels, and severity scores are triage aids, not proof of compromise, attribution, or data impact. Validate impact with logs before making claims in real incidents.
