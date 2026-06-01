# Judge Review

Current event state checked on June 1, 2026:

- Slack Agent Builder Challenge deadline: July 13, 2026 at 5:00 PM PDT.
- Public Devpost participant count is volatile and inconsistent across public tabs; do not use the exact count as a submission claim.
- Required technologies: Slack AI capabilities, MCP server integration, or Real-Time Search API.
- Required submission artifacts: project track, text description, working demo video around 3 minutes, architecture diagram, Slack developer sandbox URL, and judge access for `slackhack@salesforce.com` plus `testing@devpost.com`.

Sources:

- https://slackhack.devpost.com/
- https://slackhack.devpost.com/rules
- https://slackhack.devpost.com/resources
- https://slackhack.devpost.com/details/faq-slackagent-builder

## Judge Sentiment

Explicit scoring criteria:

- Technological Implementation: quality software development and required Slack technology usage.
- Design: thoughtful UX and frontend/backend balance.
- Potential Impact: impact on the Slack community and beyond.
- Quality of the Idea: originality and improvement over existing concepts.

Inferred sponsor preference:

- Slack should be the place where work happens, not just a notification endpoint.
- MCP, RTS, or Slack AI should be central enough to see in the demo.
- A narrow workflow with proof beats a generic agent pitch.
- The first minute of the video must show the working product and the user it helps.
- Side-prize positioning should be explicit but evidence-gated: Best UX through the Slack onboarding path, Most Innovative Slack Agent through the evidence-gated first-response workflow, and Best Technological Implementation through the full MCP transcript and Slack-to-MCP bridge.

## Project Fit

Current strengths:

- Clear Agent for Good user: nonprofits, schools, clinics, and community teams without full SOC staffing.
- Concrete Slack-native workflow: `/signaldesk` turns messy security context into a structured incident brief.
- App Home gives judges a clear test path before they trigger the workflow.
- App Home includes clickable Demo guide and Proof checklist modals, reducing judge setup ambiguity inside Slack.
- Reusable Slack action payload builders and `docs/slack-interaction-transcript.md` prove the button-driven handoff path without requiring live tokens.
- `docs/slack-interaction-preview.html` gives judges a visual contact sheet for the synthetic button-response states before live screenshots exist.
- Message shortcut supports triaging a suspicious Slack message in place, reducing copy/paste friction.
- Required technology proof: Slack can run with `SIGNALDESK_TRIAGE_MODE=mcp` and delegate triage to the MCP `triage_slack_alert` tool.
- Evidence-gated security posture: SignalDesk says "candidate technique" and "confirm with logs" instead of inventing compromise.
- Claim-to-evidence mapping: each brief includes evidence IDs and validation status.
- Evidence-linked detection opportunities give analysts concrete next queries across Slack, identity, OAuth, DNS/proxy, network, endpoint, and cloud logs.
- First-response readiness metrics make the Agent for Good impact visible without claiming live containment or compromise proof.
- Incident report export provides a handoff artifact, not just a chat response.
- Slack channel creation turns the brief into an actual coordination surface.
- Block Kit payload constraints are validated before recording, reducing the risk of Slack rejecting the demo brief.
- Slack workflow helpers are unit-tested with fake clients for shortcut extraction and channel creation edge cases.
- Local proof exists: unit tests, MCP smoke test, Slack-to-MCP bridge smoke test, fixture validation, demo payload, and architecture SVG.
- `docs/mcp-tool-transcript.md` records validated structured output from every registered SignalDesk MCP tool.
- `docs/judge-proof.md` packages local command evidence into one judge-facing receipt.
- `docs/judge-evidence-matrix.md` maps the official rubric and required artifacts to concrete proof paths.
- `docs/bonus-prize-map.md` maps Best UX, Most Innovative Slack Agent, and Best Technological Implementation to concrete proof without claiming those prizes are owed.
- `docs/rules-compliance.md` maps official rules, video restrictions, sandbox access, sensitive-data controls, and manual final attestations.
- README includes a direct "How Judges Can Test" path.
- Slack sandbox runbook exists for live proof capture.
- Static demo preview exists for recording rehearsal, separate from live Slack proof.
- Static demo screenshot exists at `docs/demo-preview.png` for README and judge preview use, clearly separate from live Slack proof.
- Video package includes title, description, upload-ready `docs/thumbnail.png`, editable `docs/thumbnail.svg`, uploadable `docs/demo-captions.vtt`, and shot order.
- `docs/devpost-form.md` provides paste-ready fields with a short pitch, track, proof references, and external URL placeholders.
- `npm.cmd run sandbox:doctor` checks Slack manifest, scopes, Socket Mode, interactivity, MCP mode, and token-prefix readiness before recording.
- `SECURITY.md` and `docs/github-repo-settings.md` make the public repo safer and easier for judges to inspect.
- `npm.cmd run verify` passes the repo-local proof suite, including secret scan and submission readiness checks.

Current risks:

- Slack sandbox execution is not yet proven because app credentials and sandbox install are still external.
- No demo video yet.
- RTS is not implemented; MCP is the primary required technology proof.
- Slack buttons keep recent incident state in memory during the local app run, but they do not persist incident state across restarts.
- No public GitHub URL or Devpost submission URL exists yet.

## Rubric Score Estimate

Assuming the Slack sandbox flow is demonstrated:

- Technological Implementation: 4.5/5 now, 5/5 if live Slack in MCP mode plus MCP transcript are recorded cleanly.
- Design: 4/5 now with App Home, proof command, interaction transcript, and visual contact sheet; 4.5/5 with polished live Slack screenshots and button interactions.
- Potential Impact: 4/5 now, 5/5 if the demo opens with the nonprofit/school/clinic first-response problem.
- Quality of Idea: 4/5 now, 4.5/5 if the submission contrasts clearly against generic Slack chatbots.

Without Slack sandbox proof, the project should be treated as incomplete for submission.

## Highest-Impact Next Moves

1. Install SignalDesk into a Slack developer sandbox and capture `/signaldesk` working end to end.
2. Record a 2:30-2:50 demo using the nonprofit OAuth phishing fixture.
3. Capture screenshots of the Slack brief, the "Take owner" button, the checklist button, the detection plan, and MCP smoke output.
4. Add the public GitHub URL and demo video URL to `docs/devpost-copy.md`.
5. Invite `slackhack@salesforce.com` and `testing@devpost.com` to the sandbox as members before submitting.

## Evidence Status

Confirmed:

- Local deterministic triage works.
- MCP stdio server can be spawned and called.
- Slack-to-MCP bridge smoke test proves the Slack runtime can call `triage_slack_alert` in MCP mode.
- MCP `build_detection_plan` returns evidence-linked detection opportunities.
- MCP `build_impact_summary` returns deterministic first-response readiness metrics.
- Fixture scenarios validate expected severity, scenario, and ATT&CK candidates.
- Claim-to-evidence validation rejects bad evidence references.
- Secret scan finds no high-confidence token/key patterns in repo-local files.
- Block Kit constraints check passes for local fixtures and MCP demo payload.
- Repo-local submission readiness check passes.
- Judge proof pack generation passes.
- Demo thumbnail check passes for the SVG source and upload-ready 1280x720 PNG.
- Demo captions check passes for ordered WebVTT captions under 3 minutes.
- Devpost form check passes.
- Slack sandbox doctor passes in repo-safe mode; strict mode requires real Slack tokens.
- Public repo readiness check passes.
- Judge evidence matrix check passes.
- Strict final submission check exists and is expected to fail until public URLs and real Slack token env vars are present.
- Architecture artifact exists at `docs/architecture.svg`.

Unproven:

- Slack sandbox install.
- Live Slack command response.
- Judge sandbox access.
- Public video availability.
- Public repository visibility.
