# Rules Compliance Map

Current event state checked on June 1, 2026.

This artifact maps the Slack Agent Builder Challenge rules to SignalDesk evidence. It is a repo-local compliance receipt, not legal advice and not a substitute for Max confirming personal eligibility, employer policy, and final Devpost account details before submitting.

## Official Rules Surface

- Submission period ends July 13, 2026 at 5:00 PM Pacific Time.
- Stage One is pass/fail viability against the submission requirements before judged scoring.
- Stage Two uses equally weighted criteria: Technological Implementation, Design, Potential Impact, and Quality of the Idea.
- Project must use at least one required technology: Slack AI capabilities, MCP server integration, or Real-Time Search API.
- Agent for Good submissions must describe project impact.
- Demo video must be less than three minutes, show the working project, be publicly visible on YouTube, Vimeo, Facebook Video, or Youku, avoid unauthorized third-party material, and avoid confidential, proprietary, or sensitive information.
- Submission must include project track, text description, architecture diagram, Slack developer sandbox URL, and test access for `slackhack@salesforce.com` plus `testing@devpost.com`.
- Submission materials must be original, owned or properly licensed, English-language, and must not include malware, spyware, viruses, real sensitive information, or non-public SDK/API/source materials.

## Repo-Local Evidence

| Requirement | Evidence | Current status |
| --- | --- | --- |
| Required Slack technology | MCP server integration, Slack Bolt app, Slack-to-MCP bridge, full MCP transcript. | Confirmed repo-local. |
| Agent for Good impact | Nonprofit/school/clinic/community-team story plus deterministic first-response readiness evaluation. | Confirmed repo-local; live impact not claimed. |
| Text description | `docs/devpost-form.md` and `docs/devpost-copy.md`. | Confirmed, with URL placeholders pending. |
| Architecture diagram | `docs/architecture.svg`, `ARCHITECTURE.md`, and `docs/architecture.md`. | Confirmed. |
| Working demo video under three minutes | `docs/video-package.md`, `docs/demo-script.md`, `docs/demo-transcript.md`, `docs/demo-captions.vtt`, `docs/thumbnail.png`. | Planned and locally packaged; live recording/upload pending. |
| Public video host | Final URL must use YouTube, Vimeo, Facebook Video, or Youku. | Pending external video URL. |
| Slack developer sandbox URL | `docs/slack-sandbox-runbook.md`, `manifest.json`, and `npm.cmd run sandbox:doctor -- --strict`. | Pending external sandbox URL and real Slack tokens. |
| Judge test access | Runbook and Devpost form name `slackhack@salesforce.com` and `testing@devpost.com`. | Pending external invites. |
| No confidential or sensitive data | `SECURITY.md`, `.gitignore`, synthetic fixtures, secret scan, and recording checklist. | Repo-local controls confirmed; final video must be reviewed manually. |
| Optional demo state recovery | `SIGNALDESK_PERSIST_BRIEFS=1` writes synthetic demo brief state only under `artifacts/private/`. | Confirmed private path; keep disabled for real Slack data. |
| No real malware or harmful code | Synthetic indicators use reserved/example domains and documentation-only security scenarios. | Confirmed repo-local; final content still needs manual review. |
| Publicly discoverable dependencies | `package.json`, `package-lock.json`, MIT license, supply-chain notes, CI install with `--ignore-scripts`. | Confirmed repo-local. |
| Original/licensed work | MIT license, generated local assets, repository source, and no bundled third-party media. | Repo-local evidence exists; Max must confirm final ownership and employer policy. |
| English-language submission | README, Devpost copy, captions, diagrams, and docs are English. | Confirmed repo-local. |

## Manual Final Attestations

Max must confirm these before clicking Devpost Submit:

- Max is eligible under the official rules and any employer or organization policies.
- SignalDesk was built during the hackathon period or otherwise fits the official new-project requirements.
- No prohibited sponsor financial/preferential support or conflict applies.
- The demo video contains no unauthorized music, third-party marks beyond necessary nominative references, private Slack data, real secrets, customer data, donor data, patient data, student data, or live incident evidence.
- The public repo, video, Devpost project, and Slack sandbox URLs open from a private/incognito browser session.
- `slackhack@salesforce.com` and `testing@devpost.com` have sandbox access before final submission.

## Commands

```powershell
npm.cmd run rules:check
npm.cmd run scan:secrets
npm.cmd run recording:check
npm.cmd run submission:final:check
npm.cmd run submission:final:online
```

`submission:final:check` is expected to fail until the public URLs and real Slack tokens exist.
