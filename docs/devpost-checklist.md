# Devpost Submission Checklist

## Required

- Join the hackathon on Devpost.
- Join the Slack Developer Program and create a developer sandbox.
- Install SignalDesk in the sandbox.
- Include a text description explaining features and functionality.
- Include a public demo video under 3 minutes.
- Include an architecture diagram.
- Provide the Slack developer sandbox URL.
- Invite `slackhack@salesforce.com` and `testing@devpost.com` as full members of the sandbox.
- Confirm the app is installed and authorized in that sandbox.

## Strongly Recommended

- Public GitHub repository with README, setup steps, architecture, and screenshots.
- Public GitHub repo settings from `docs/github-repo-settings.md`.
- Live account-gate handoff for Max from `docs/live-gate-handoff.md`.
- GitHub launch check from `npm.cmd run github:launch:check`, then strict post-push check from `npm.cmd run github:launch:strict`.
- A short "How judges can test" section.
- Judge one-pager (`docs/judge-one-pager.md`).
- Judge quickstart (`docs/judge-quickstart.md`).
- Root architecture entry point (`ARCHITECTURE.md`) plus uploadable diagram (`docs/architecture.svg`).
- Paste-ready Devpost form pack (`docs/devpost-form.md`).
- Generated Devpost paste bundle from `npm.cmd run submission:bundle`.
- Rules compliance map (`docs/rules-compliance.md`).
- Slack sandbox runbook (`docs/slack-sandbox-runbook.md`).
- Test transcript from `npm.cmd test`.
- Block Kit constraints transcript from `npm.cmd run check:block-kit`.
- MCP transcript showing tool output.
- Full MCP tool transcript from `docs/mcp-tool-transcript.md`.
- MCP impact transcript from `build_impact_summary`.
- Slack-to-MCP bridge transcript from `npm.cmd run smoke:slack-mcp`.
- Detection plan transcript from `build_detection_plan`.
- Fixture validation transcript from `npm.cmd run validate:fixtures`.
- Agent for Good impact evaluation from `npm.cmd run impact:evaluate` and `docs/impact-evaluation.md`.
- Sample report output from `npm.cmd run report:sample` or `docs/sample-incident-report.md`.
- Full proof transcript from `npm.cmd run verify`.
- Judge proof pack from `npm.cmd run proof:pack` and `docs/judge-proof.md`.
- Judge evidence matrix from `docs/judge-evidence-matrix.md`.
- Bonus prize map from `docs/bonus-prize-map.md`.
- Bonus prize check from `npm.cmd run prize:check`.
- Slack UX proof from `docs/slack-ux-proof.md`.
- Slack interaction transcript from `docs/slack-interaction-transcript.md`.
- Slack interaction proof from `npm.cmd run slack:interactions:proof`.
- Public repo readiness transcript from `npm.cmd run repo:public:check`.
- Safe URL replacement from `npm.cmd run submission:set-urls -- --repo <url> --video <url> --sandbox <url> --devpost <url>`.
- Final strict external-gate transcript from `npm.cmd run submission:final:check`.
- Online public-link transcript from `npm.cmd run submission:final:online`.
- Video title/description/shot order from `docs/video-package.md`.
- Recording readiness preflight from `npm.cmd run recording:check` and `docs/recording-readiness.md`.
- Recording take card from `docs/recording-take-card.md`.
- Upload-ready demo thumbnail from `docs/thumbnail.png`; editable source at `docs/thumbnail.svg`.
- Uploadable captions from `docs/demo-captions.vtt`.
- Devpost form validation transcript from `npm.cmd run devpost:form:check`.
- Devpost paste bundle from `artifacts/submission/devpost-paste-bundle.md` and `artifacts/submission/devpost-paste-bundle.json`.
- Rules compliance transcript from `npm.cmd run rules:check`.
- Strict Slack sandbox doctor transcript from `npm.cmd run sandbox:doctor -- --strict`.
- Screenshots of Slack command, posted brief, readiness score, evidence checklist, and detection plan.
- Screenshot or video segment showing the created incident channel and kickoff message.
- Optional local storyboard screenshot from `docs/demo-preview.png`, clearly labeled as a repo-local preview if used.
- Clear statement that demo data is synthetic.
- Confirm final video is hosted on YouTube, Vimeo, Facebook Video, or Youku.
- License file if the repository is public.

## Do Not Submit

- Slack bot/app tokens.
- Real private Slack messages.
- Customer, donor, patient, student, or employee personal data.
- Copyrighted music, third-party footage, or private screenshots without rights.
- Unverified claims of compromise.
- Security bug details affecting Salesforce or Slack; report suspected real issues to `security@salesforce.com`.
