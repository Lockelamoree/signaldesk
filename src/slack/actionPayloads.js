import { buildIncidentReport } from "../core/incidentBrief.js";

const DEFAULT_CHECKLIST = [
  "Original Slack permalink or screenshot with timestamps",
  "Reporter, affected user, and business context",
  "Identity provider sign-in logs",
  "Endpoint/network telemetry for affected users",
  "URL, IP, domain, and file reputation lookups where applicable"
];

const DEFAULT_GUARDRAILS = [
  "Triage is not attribution.",
  "Do not post raw secrets or private customer data in shared channels.",
  "Confirm impact with logs before declaring compromise."
];

function button(actionId, text, value, style) {
  return {
    type: "button",
    action_id: actionId,
    text: {
      type: "plain_text",
      text,
      emoji: false
    },
    value,
    ...(style ? { style } : {})
  };
}

export function buildFollowupActionBlocks(brief) {
  if (!brief?.id) return [];

  const createStyle = brief.reportDecision?.needed === false ? undefined : "primary";
  const reportLabel = brief.reportDecision?.needed === false ? "Intake note" : "Report";

  return [
    {
      type: "actions",
      elements: [
        button("signaldesk_create_channel", "Create channel", brief.id, createStyle),
        button("signaldesk_ack_owner", "Take owner", brief.id),
        button("signaldesk_show_checklist", "Show checklist", brief.id),
        button("signaldesk_show_evidence", "Evidence", brief.id),
        button("signaldesk_show_guardrails", "Guardrails", brief.id)
      ]
    },
    {
      type: "actions",
      elements: [
        button("signaldesk_show_detections", "Detections", brief.id),
        button("signaldesk_export_report", reportLabel, brief.id)
      ]
    }
  ];
}

function withFollowupActions(payload, brief) {
  const blocks = buildFollowupActionBlocks(brief);
  return blocks.length ? { ...payload, blocks } : payload;
}

export function buildOwnerAckPayload({ brief, user = "A responder" } = {}) {
  const context = brief ? ` for ${brief.scenario.label} (${brief.severity.label}, ${brief.severity.score}/100)` : "";

  return withFollowupActions({
    response_type: "in_channel",
    text: `${user} took incident ownership${context}. Next: confirm affected users, preserve evidence, and post the first update.`
  }, brief);
}

export function buildCreateChannelPayload(result, brief) {
  if (result?.ok) {
    return withFollowupActions({
      response_type: "in_channel",
      text: `SignalDesk created #${result.channelName} and posted the incident kickoff.`
    }, brief);
  }

  return withFollowupActions({
    response_type: "ephemeral",
    text: `SignalDesk could not create the incident channel (${result?.error ?? "unknown_error"}). Check that the app has channels:manage and workspace channel creation is allowed.`
  }, brief);
}

export function buildMissingBriefPayload(subject = "Incident details") {
  return {
    response_type: "ephemeral",
    text: `${subject} are no longer in memory for this local demo run.`
  };
}

export function buildChecklistPayload(brief) {
  const checklist = brief?.evidenceChecklist ?? DEFAULT_CHECKLIST;

  return withFollowupActions({
    response_type: "ephemeral",
    text: [
      "*SignalDesk evidence checklist*",
      ...checklist.map((item) => `- ${item}`)
    ].join("\n")
  }, brief);
}

export function buildEvidencePayload(brief) {
  if (!brief) {
    return buildMissingBriefPayload("Evidence details");
  }

  return withFollowupActions({
    response_type: "ephemeral",
    text: [
      "*SignalDesk evidence ledger*",
      ...brief.evidenceLedger.slice(0, 8).map((evidence) => {
        const value = evidence.fields.value ?? evidence.fields.sourceField ?? evidence.fields.channel;
        return `- ${evidence.id}: ${evidence.type}${value ? ` (${value})` : ""}`;
      }),
      "",
      "*Claim audit*",
      ...brief.claims.map((claim) => `- ${claim.id} [${claim.status}]: ${claim.text}`)
    ].join("\n")
  }, brief);
}

export function buildGuardrailsPayload(brief) {
  const guardrails = brief?.guardrails ?? DEFAULT_GUARDRAILS;

  return withFollowupActions({
    response_type: "ephemeral",
    text: [
      "*SignalDesk guardrails*",
      ...guardrails.map((item) => `- ${item}`),
      "- Prefer reversible containment before destructive cleanup."
    ].join("\n")
  }, brief);
}

export function buildDetectionsPayload(brief) {
  if (!brief) {
    return buildMissingBriefPayload("Detection details");
  }

  return withFollowupActions({
    response_type: "ephemeral",
    text: [
      "*SignalDesk detection plan*",
      ...brief.detectionOpportunities.map((detection) => [
        `- ${detection.id}: *${detection.name}*`,
        `  Source: ${detection.logSource}`,
        `  Evidence: ${detection.evidenceIds.join(", ")}`,
        `  Query: \`${detection.query}\``
      ].join("\n"))
    ].join("\n")
  }, brief);
}

export function buildReportPayload(brief) {
  if (!brief) {
    return buildMissingBriefPayload("Report details");
  }

  const report = buildIncidentReport(brief);
  const excerpt = report.length > 2900 ? `${report.slice(0, 2800)}\n\n[Report truncated for Slack preview.]` : report;

  return withFollowupActions({
    response_type: "ephemeral",
    text: `\`\`\`${excerpt}\`\`\``
  }, brief);
}
