const IPV4_PATTERN = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
const URL_PATTERN = /\bhttps?:\/\/[^\s<>"')]+/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const HASH_PATTERN = /\b[a-f0-9]{32,64}\b/gi;
const DOMAIN_PATTERN = /\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi;

const ATTACK_MAPPINGS = [
  {
    id: "T1566",
    name: "Phishing",
    match: /\b(phish|credential|login page|password reset|invoice|mfa|oauth|consent)\b/i
  },
  {
    id: "T1059",
    name: "Command and Scripting Interpreter",
    match: /\b(powershell|cmd\.exe|bash|curl|wget|encodedcommand|osascript)\b/i
  },
  {
    id: "T1105",
    name: "Ingress Tool Transfer",
    match: /\b(download(?:ed|ing)?|payload|dropper|callback|beacon|c2|command and control)\b/i
  },
  {
    id: "T1041",
    name: "Exfiltration Over C2 Channel",
    match: /\b(exfil|upload|archive|rclone|mega|pastebin|transfer)\b/i
  },
  {
    id: "T1621",
    name: "Multi-Factor Authentication Request Generation",
    match: /\b(mfa fatigue|push spam|approval request|approve sign-in)\b/i
  },
  {
    id: "T1528",
    name: "Steal Application Access Token",
    match: /\b(oauth token|refresh token|access token|xoxb|xapp|api key)\b/i
  }
];

const SCENARIOS = [
  {
    id: "token_exposure",
    label: "Token or OAuth Exposure",
    match: /\b(oauth|token|api key|xoxb|xapp|refresh token|access token|consent)\b/i,
    immediateAction: "Revoke or rotate exposed tokens before broader investigation if exposure is confirmed."
  },
  {
    id: "credential_phishing",
    label: "Credential Phishing",
    match: /\b(phish|credential|password|mfa|login page|password reset|invoice)\b/i,
    immediateAction: "Reset the affected account session and require MFA re-verification if credential entry is confirmed."
  },
  {
    id: "malware_execution",
    label: "Malware or Script Execution",
    match: /\b(ransomware|malware|payload|dropper|powershell|encodedcommand|executed|installed|downloaded)\b/i,
    immediateAction: "Isolate the affected endpoint and preserve volatile evidence before cleanup."
  },
  {
    id: "data_exfiltration",
    label: "Possible Data Exfiltration",
    match: /\b(exfil|upload|archive|rclone|mega|pastebin|transfer|donor|patient|student|payroll|pii)\b/i,
    immediateAction: "Identify the affected data owner and preserve access logs before making impact claims."
  },
  {
    id: "incident_coordination",
    label: "Incident Coordination",
    match: /\b(incident|outage|breach|sev|severity|customer impact|production)\b/i,
    immediateAction: "Name an incident owner and create a single source of truth before parallel investigation branches."
  }
];

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()))];
}

function matches(pattern, text) {
  return unique(text.match(pattern) ?? []);
}

export function extractIndicators(text) {
  const normalized = String(text ?? "");
  const urls = matches(URL_PATTERN, normalized);
  const emails = matches(EMAIL_PATTERN, normalized);
  const hashes = matches(HASH_PATTERN, normalized.toLowerCase());
  const ips = matches(IPV4_PATTERN, normalized);
  const domainsFromUrls = urls
    .map((url) => {
      try {
        return new URL(url).hostname;
      } catch {
        return "";
      }
    })
    .filter(Boolean);
  const domains = unique([...matches(DOMAIN_PATTERN, normalized.toLowerCase()), ...domainsFromUrls])
    .filter((domain) => !emails.some((email) => email.toLowerCase().endsWith(`@${domain}`)));

  return { ips, domains, urls, emails, hashes };
}

export function scoreSeverity(text, indicators = extractIndicators(text)) {
  const content = String(text ?? "").toLowerCase();
  let score = 20;

  score += indicators.urls.length * 8;
  score += indicators.ips.length * 6;
  score += indicators.hashes.length * 8;

  if (/\b(ransomware|exfil|token|credential|password|oauth|mfa fatigue|privilege|admin)\b/.test(content)) {
    score += 28;
  }
  if (/\b(malware|payload|dropper|powershell|encodedcommand|executed|installed)\b/.test(content)) {
    score += 22;
  }
  if (/\b(exfil|patient|student|donor|payroll|pii|sensitive data)\b/.test(content)) {
    score += 12;
  }
  if (/\b(production|finance|donor|patient|student|customer|pii|payroll)\b/.test(content)) {
    score += 18;
  }
  if (/\b(clicked|approved|downloaded|executed|installed|forwarded)\b/.test(content)) {
    score += 14;
  }

  const bounded = Math.max(0, Math.min(score, 100));
  const label = bounded >= 75 ? "high" : bounded >= 45 ? "medium" : "low";

  return { score: bounded, label };
}

export function classifyScenario(text) {
  const content = String(text ?? "");
  const matches = SCENARIOS.filter((scenario) => scenario.match.test(content));

  if (!matches.length) {
    return {
      id: "security_report",
      label: "Security-Relevant Report",
      immediateAction: "Preserve the report and collect enough context to decide whether this is an incident."
    };
  }

  const primary = matches[0];
  return {
    id: primary.id,
    label: primary.label,
    immediateAction: primary.immediateAction,
    related: matches.slice(1).map(({ id, label }) => ({ id, label }))
  };
}

export function mapMitreTechniques(text) {
  const content = String(text ?? "");
  return ATTACK_MAPPINGS
    .filter((mapping) => mapping.match.test(content))
    .map(({ id, name }) => ({ id, name }));
}

function buildSummary(severity, indicators, scenario) {
  const bits = [];
  if (indicators.urls.length) bits.push(`${indicators.urls.length} URL(s)`);
  if (indicators.ips.length) bits.push(`${indicators.ips.length} IP address(es)`);
  if (indicators.emails.length) bits.push(`${indicators.emails.length} email address(es)`);
  if (indicators.hashes.length) bits.push(`${indicators.hashes.length} hash value(s)`);

  const signal = bits.length ? bits.join(", ") : "no obvious indicators";

  return `${severity.label.toUpperCase()} confidence triage for ${scenario.label}; extracted ${signal}.`;
}

function responseActions(severity, text, scenario) {
  const actions = [
    scenario.immediateAction,
    "Preserve the original message, thread, timestamps, user IDs, and any clicked links.",
    "Ask the reporter what action they took: ignored, clicked, entered credentials, approved MFA, or downloaded a file.",
    "Check admin/audit logs for the affected user and listed indicators over the last 24 hours."
  ];

  if (severity.label === "high") {
    actions.push("Create a dedicated incident channel and assign owner, comms lead, and evidence lead.");
  }
  if (/\b(clicked|entered|approved|mfa|password|credential)\b/i.test(text)) {
    actions.splice(1, 0, "Reset the affected account session and require MFA re-verification if credential entry is confirmed.");
  }

  return unique(actions);
}

function roleAssignments(severity) {
  const assignments = [
    {
      role: "Incident owner",
      responsibility: "Decide severity, keep the response moving, and call out assumptions."
    },
    {
      role: "Evidence lead",
      responsibility: "Collect logs, links, timestamps, and affected identities without altering evidence."
    },
    {
      role: "Comms lead",
      responsibility: "Post concise updates and prevent premature attribution or impact claims."
    }
  ];

  if (severity.label === "high") {
    assignments.push({
      role: "Containment lead",
      responsibility: "Coordinate token revocation, session resets, endpoint isolation, or access changes."
    });
  }

  return assignments;
}

function evidenceChecklist(indicators) {
  const checklist = [
    "Reporter, affected user, and business context",
    "Original Slack permalink or screenshot with timestamps",
    "Identity provider sign-in logs",
    "Endpoint/network telemetry for the affected user"
  ];

  if (indicators.urls.length || indicators.domains.length) {
    checklist.push("URL/domain reputation and redirect chain");
  }
  if (indicators.ips.length) {
    checklist.push("IP reputation, ASN, geolocation, and proxy/VPN signal");
  }
  if (indicators.hashes.length) {
    checklist.push("File hash reputation and sandbox result");
  }

  return checklist;
}

function buildSlackPlan(severity, scenario) {
  const prefix = severity.label === "high" ? "inc" : "sec";
  const slug = scenario.id.replace(/_/g, "-").slice(0, 24);

  return {
    suggestedChannelName: `${prefix}-${slug}`,
    kickoffMessage: [
      `SignalDesk opened ${severity.label.toUpperCase()} triage for ${scenario.label}.`,
      "First priority: preserve evidence, confirm affected users, and validate impact with logs.",
      "Avoid posting raw secrets or customer data in the channel."
    ].join(" "),
    updateCadence: severity.label === "high" ? "Post updates every 15 minutes until contained." : "Post updates when evidence changes."
  };
}

function buildBriefId(timestamp, reporter, channel) {
  const compact = `${timestamp}-${reporter}-${channel}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return compact || "signaldesk-brief";
}

function nextEvidenceId(index) {
  return `EV-${String(index).padStart(3, "0")}`;
}

export function buildEvidenceLedger({ alertText, reporter, channel, timestamp }, indicators = extractIndicators(alertText)) {
  const evidenceLedger = [
    {
      id: "EV-001",
      type: "source_report",
      source: "slack_input",
      fields: {
        alertText: String(alertText),
        reporter,
        channel,
        timestamp
      }
    }
  ];
  let index = 2;

  for (const [kind, values] of Object.entries(indicators)) {
    for (const value of values) {
      evidenceLedger.push({
        id: nextEvidenceId(index),
        type: `indicator_${kind}`,
        source: "deterministic_extractor",
        fields: {
          kind,
          value,
          sourceField: "alertText"
        }
      });
      index += 1;
    }
  }

  return evidenceLedger;
}

function evidenceIds(evidenceLedger, predicate) {
  return evidenceLedger.filter(predicate).map((evidence) => evidence.id);
}

function indicatorEvidenceIds(evidenceLedger, kinds) {
  const wanted = new Set(kinds.map((kind) => `indicator_${kind}`));
  return evidenceIds(evidenceLedger, (evidence) => wanted.has(evidence.type));
}

function limited(values, count = 5) {
  return values.slice(0, count);
}

function detectionQuery(field, values, fallback) {
  if (!values.length) return fallback;
  return limited(values).map((value) => `${field}="${value}"`).join(" OR ");
}

function nextDetectionId(index) {
  return `DET-${String(index).padStart(3, "0")}`;
}

export function buildDetectionOpportunities({ scenario, indicators, evidenceLedger }) {
  const detections = [];
  const addDetection = ({ name, logSource, query, evidenceIds: detectionEvidenceIds, why }) => {
    detections.push({
      id: nextDetectionId(detections.length + 1),
      name,
      logSource,
      query,
      evidenceIds: unique(["EV-001", ...detectionEvidenceIds]),
      why
    });
  };

  addDetection({
    name: "Preserve Slack source context",
    logSource: "Slack message history and audit logs",
    query: 'message.permalink="<source_permalink>" OR channel.id="<reported_channel>"',
    evidenceIds: [],
    why: "Keep the original report, reporter, timestamps, thread context, and follow-up actions tied to one evidence trail."
  });

  if (indicators.ips.length) {
    const ipEvidenceIds = indicatorEvidenceIds(evidenceLedger, ["ips"]);
    addDetection({
      name: "Review sign-ins from extracted IP addresses",
      logSource: "Identity provider sign-in logs",
      query: `${detectionQuery("source.ip", indicators.ips, 'source.ip="<ip>"')} OR user.name="<affected_user>"`,
      evidenceIds: ipEvidenceIds,
      why: "Validate whether the affected user authenticated from the reported infrastructure before or after the Slack report."
    });
    addDetection({
      name: "Search network telemetry for extracted IP addresses",
      logSource: "Firewall, proxy, and VPN logs",
      query: `${detectionQuery("source.ip", indicators.ips, 'source.ip="<ip>"')} OR ${detectionQuery("destination.ip", indicators.ips, 'destination.ip="<ip>"')}`,
      evidenceIds: ipEvidenceIds,
      why: "Check whether the IPs appear as inbound sources, outbound destinations, VPN egress, or proxy hops."
    });
  }

  if (indicators.urls.length || indicators.domains.length) {
    const urlEvidenceIds = indicatorEvidenceIds(evidenceLedger, ["urls", "domains"]);
    addDetection({
      name: "Sweep DNS and proxy logs for extracted URLs/domains",
      logSource: "DNS resolver and web proxy logs",
      query: [
        detectionQuery("url.full", indicators.urls, 'url.full="<url>"'),
        detectionQuery("url.domain", indicators.domains, 'url.domain="<domain>"')
      ].join(" OR "),
      evidenceIds: urlEvidenceIds,
      why: "Find other users who resolved, clicked, or were redirected through the same infrastructure."
    });
  }

  if (scenario.id === "token_exposure") {
    addDetection({
      name: "Audit OAuth grants and token lifecycle events",
      logSource: "SaaS OAuth, app consent, and token audit logs",
      query: 'event.action IN ("app_authorized", "token_issued", "token_used", "token_revoked") AND user.name="<affected_user>"',
      evidenceIds: indicatorEvidenceIds(evidenceLedger, ["urls", "domains", "emails"]),
      why: "Confirm whether a consent grant or token use occurred before rotating credentials and closing access."
    });
  }

  if (scenario.id === "credential_phishing") {
    addDetection({
      name: "Review password and MFA activity",
      logSource: "Identity provider authentication and MFA logs",
      query: 'event.action IN ("mfa_challenge", "mfa_approved", "password_reset", "session_revoked") AND user.name="<affected_user>"',
      evidenceIds: indicatorEvidenceIds(evidenceLedger, ["urls", "domains", "emails", "ips"]),
      why: "Separate a reported lure from confirmed credential use, MFA approval, or session takeover."
    });
  }

  if (scenario.id === "malware_execution") {
    addDetection({
      name: "Hunt for suspicious script execution",
      logSource: "EDR process and network telemetry",
      query: 'process.name IN ("powershell.exe", "cmd.exe", "bash", "osascript") OR process.command_line CONTAINS ("encodedcommand", "curl", "wget")',
      evidenceIds: indicatorEvidenceIds(evidenceLedger, ["hashes", "urls", "domains", "ips"]),
      why: "Identify execution, payload retrieval, and follow-on network activity linked to the reported behavior."
    });
  }

  if (scenario.id === "data_exfiltration") {
    addDetection({
      name: "Review unusual data access and upload activity",
      logSource: "CASB, cloud storage audit, and proxy logs",
      query: 'event.action IN ("file_download", "file_upload", "share_created", "archive_created") AND user.name="<affected_user>"',
      evidenceIds: indicatorEvidenceIds(evidenceLedger, ["urls", "domains", "ips"]),
      why: "Validate data movement with access logs before making impact or notification claims."
    });
  }

  if (detections.length === 1) {
    addDetection({
      name: "Build a 24-hour user activity timeline",
      logSource: "Identity, endpoint, network, and SaaS audit logs",
      query: 'user.name="<affected_user>" AND event.time BETWEEN "<report_time-24h>" AND "<report_time+2h>"',
      evidenceIds: [],
      why: "Give analysts a minimum timeline even when the original Slack report has weak indicators."
    });
  }

  return detections;
}

export function buildImpactMetrics({
  evidenceLedger,
  claims,
  evidenceValidation,
  detectionOpportunities,
  roleAssignments,
  evidenceChecklist,
  recommendedActions,
  guardrails,
  slackPlan
}) {
  const sourceEvidence = evidenceLedger.some((evidence) => evidence.id === "EV-001");
  const detectionEvidenceIds = unique(detectionOpportunities.flatMap((detection) => detection.evidenceIds ?? []));
  const signals = [
    {
      id: "IM-001",
      label: "Source evidence preserved",
      status: sourceEvidence ? "ready" : "missing",
      weight: 15,
      evidenceIds: sourceEvidence ? ["EV-001"] : [],
      detail: `${evidenceLedger.length} evidence item(s) available for handoff.`
    },
    {
      id: "IM-002",
      label: "Claims validated against evidence",
      status: evidenceValidation.valid && claims.length ? "ready" : "needs_review",
      weight: 20,
      evidenceIds: unique(claims.flatMap((claim) => claim.evidenceIds ?? [])),
      detail: evidenceValidation.valid
        ? `${claims.length} claim(s) cite known evidence IDs and fields.`
        : `Validation errors: ${evidenceValidation.errors.join("; ")}`
    },
    {
      id: "IM-003",
      label: "Detection plan available",
      status: detectionOpportunities.length ? "ready" : "missing",
      weight: detectionOpportunities.length >= 3 ? 25 : 18,
      evidenceIds: detectionEvidenceIds,
      detail: `${detectionOpportunities.length} evidence-linked detection check(s) generated.`
    },
    {
      id: "IM-004",
      label: "Response ownership defined",
      status: roleAssignments.length >= 3 ? "ready" : "partial",
      weight: roleAssignments.length >= 3 ? 15 : 8,
      evidenceIds: ["EV-001"].filter((id) => evidenceLedger.some((evidence) => evidence.id === id)),
      detail: `${roleAssignments.length} role assignment(s) suggested.`
    },
    {
      id: "IM-005",
      label: "Evidence checklist ready",
      status: evidenceChecklist.length >= 4 ? "ready" : "partial",
      weight: evidenceChecklist.length >= 4 ? 10 : 6,
      evidenceIds: ["EV-001"].filter((id) => evidenceLedger.some((evidence) => evidence.id === id)),
      detail: `${evidenceChecklist.length} evidence collection item(s) listed.`
    },
    {
      id: "IM-006",
      label: "Safety guardrails present",
      status: guardrails.length >= 3 ? "ready" : "partial",
      weight: guardrails.length >= 3 ? 10 : 5,
      evidenceIds: ["EV-001"].filter((id) => evidenceLedger.some((evidence) => evidence.id === id)),
      detail: `${guardrails.length} guardrail(s) prevent overclaiming and unsafe data sharing.`
    },
    {
      id: "IM-007",
      label: "Slack coordination path ready",
      status: slackPlan?.suggestedChannelName ? "ready" : "missing",
      weight: 5,
      evidenceIds: ["EV-001"].filter((id) => evidenceLedger.some((evidence) => evidence.id === id)),
      detail: slackPlan?.suggestedChannelName
        ? `Suggested channel #${slackPlan.suggestedChannelName} with update cadence prepared.`
        : "No Slack coordination channel was suggested."
    }
  ];
  const readinessScore = Math.min(100, signals.reduce((score, signal) => (
    signal.status === "ready" ? score + signal.weight : score
  ), 0));
  const readinessLabel = readinessScore >= 85 ? "strong" : readinessScore >= 60 ? "partial" : "weak";

  return {
    readinessScore,
    readinessLabel,
    targetUser: "under-resourced Slack teams handling security reports without a full SOC",
    impactClaim: "SignalDesk turns one Slack report into a prepared first-response package; live impact still requires responders to validate logs and execute containment.",
    summary: `${readinessScore}/100 first-response readiness with ${detectionOpportunities.length} detection check(s), ${roleAssignments.length} role(s), and ${guardrails.length} guardrail(s).`,
    counters: {
      evidenceItems: evidenceLedger.length,
      claims: claims.length,
      detectionChecks: detectionOpportunities.length,
      roleAssignments: roleAssignments.length,
      evidenceChecklistItems: evidenceChecklist.length,
      recommendedActions: recommendedActions.length,
      guardrails: guardrails.length
    },
    signals: signals.map(({ weight, ...signal }) => signal)
  };
}

export function buildEvidenceClaims({ scenario, severity, candidateTechniques, evidenceLedger }) {
  const indicatorIds = evidenceIds(evidenceLedger, (evidence) => evidence.type.startsWith("indicator_"));
  const baseEvidenceIds = ["EV-001", ...indicatorIds.slice(0, 4)];
  const claims = [
    {
      id: "CL-001",
      status: "candidate",
      text: `Scenario is most consistent with ${scenario.label}.`,
      evidenceIds: baseEvidenceIds,
      fieldRefs: ["EV-001.fields.alertText"]
    },
    {
      id: "CL-002",
      status: "deterministic",
      text: `Severity is ${severity.label} with score ${severity.score}/100 based on extracted indicators and risk keywords.`,
      evidenceIds: baseEvidenceIds,
      fieldRefs: ["EV-001.fields.alertText"]
    },
    {
      id: "CL-003",
      status: "guardrail",
      text: "Compromise, attribution, and data impact are not confirmed until logs validate them.",
      evidenceIds: ["EV-001"],
      fieldRefs: ["EV-001.fields.alertText"]
    }
  ];

  if (candidateTechniques.length) {
    claims.splice(2, 0, {
      id: "CL-003",
      status: "candidate",
      text: `Candidate ATT&CK mapping: ${candidateTechniques.map((technique) => `${technique.id} ${technique.name}`).join(", ")}.`,
      evidenceIds: ["EV-001"],
      fieldRefs: ["EV-001.fields.alertText"]
    });
    claims[3].id = "CL-004";
  }

  return claims;
}

export function validateEvidenceClaims({ evidenceLedger, claims }) {
  const evidenceById = new Map(evidenceLedger.map((evidence) => [evidence.id, evidence]));
  const allowedStatuses = new Set(["candidate", "deterministic", "guardrail"]);
  const errors = [];

  for (const claim of claims) {
    if (!allowedStatuses.has(claim.status)) {
      errors.push(`${claim.id}: unsupported status ${claim.status}`);
    }
    for (const evidenceId of claim.evidenceIds) {
      if (!evidenceById.has(evidenceId)) {
        errors.push(`${claim.id}: unknown evidence id ${evidenceId}`);
      }
    }
    for (const fieldRef of claim.fieldRefs) {
      const [evidenceId, container, field] = fieldRef.split(".");
      const evidence = evidenceById.get(evidenceId);
      if (!evidence || container !== "fields" || !(field in evidence.fields)) {
        errors.push(`${claim.id}: invalid field reference ${fieldRef}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function buildIncidentBrief({ alertText, reporter = "unknown", channel = "unknown", timestamp = new Date().toISOString() }) {
  if (!alertText || !String(alertText).trim()) {
    throw new Error("alertText is required");
  }

  const indicators = extractIndicators(alertText);
  const severity = scoreSeverity(alertText, indicators);
  const scenario = classifyScenario(alertText);
  const techniques = mapMitreTechniques(alertText);
  const evidenceLedger = buildEvidenceLedger({ alertText, reporter, channel, timestamp }, indicators);
  const claims = buildEvidenceClaims({ scenario, severity, candidateTechniques: techniques, evidenceLedger });
  const evidenceValidation = validateEvidenceClaims({ evidenceLedger, claims });
  const detectionOpportunities = buildDetectionOpportunities({ scenario, indicators, evidenceLedger });
  const recommendedActions = responseActions(severity, alertText, scenario);
  const roles = roleAssignments(severity);
  const checklist = evidenceChecklist(indicators);
  const slackPlan = buildSlackPlan(severity, scenario);
  const guardrails = [
    "This is triage, not attribution.",
    "Do not post secrets, raw tokens, or private customer data into shared channels.",
    "Confirm impact with logs before declaring compromise."
  ];
  const impactMetrics = buildImpactMetrics({
    evidenceLedger,
    claims,
    evidenceValidation,
    detectionOpportunities,
    roleAssignments: roles,
    evidenceChecklist: checklist,
    recommendedActions,
    guardrails,
    slackPlan
  });

  return {
    id: buildBriefId(timestamp, reporter, channel),
    generatedAt: timestamp,
    reporter,
    channel,
    summary: buildSummary(severity, indicators, scenario),
    scenario,
    severity,
    indicators,
    candidateTechniques: techniques,
    recommendedActions,
    roleAssignments: roles,
    evidenceChecklist: checklist,
    evidenceLedger,
    claims,
    evidenceValidation,
    detectionOpportunities,
    impactMetrics,
    slackPlan,
    guardrails,
    confidence: techniques.length || Object.values(indicators).some((items) => items.length) ? "medium" : "low"
  };
}

export function buildSlackBlocks(brief) {
  const techniqueText = brief.candidateTechniques.length
    ? brief.candidateTechniques.map((technique) => `${technique.id} ${technique.name}`).join("\n")
    : "No ATT&CK technique matched yet.";

  const indicatorText = [
    brief.indicators.urls.length ? `URLs: ${brief.indicators.urls.join(", ")}` : "",
    brief.indicators.ips.length ? `IPs: ${brief.indicators.ips.join(", ")}` : "",
    brief.indicators.domains.length ? `Domains: ${brief.indicators.domains.join(", ")}` : "",
    brief.indicators.emails.length ? `Emails: ${brief.indicators.emails.join(", ")}` : "",
    brief.indicators.hashes.length ? `Hashes: ${brief.indicators.hashes.join(", ")}` : ""
  ].filter(Boolean).join("\n") || "No obvious indicators extracted.";
  const evidenceText = brief.evidenceLedger
    .slice(0, 6)
    .map((evidence) => `- ${evidence.id}: ${evidence.type}`)
    .join("\n");
  const claimText = brief.claims
    .slice(0, 4)
    .map((claim) => `- ${claim.id} [${claim.status}]: ${claim.text}`)
    .join("\n");
  const detectionText = brief.detectionOpportunities
    .slice(0, 4)
    .map((detection) => `- ${detection.id}: ${detection.logSource} (${detection.evidenceIds.join(", ")})`)
    .join("\n");
  const impactText = [
    `${brief.impactMetrics.readinessScore}/100 (${brief.impactMetrics.readinessLabel})`,
    `${brief.impactMetrics.counters.evidenceItems} evidence item(s), ${brief.impactMetrics.counters.detectionChecks} detection check(s), ${brief.impactMetrics.counters.roleAssignments} role(s)`,
    "Impact still requires log validation and human containment."
  ].join("\n");

  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `SignalDesk: ${brief.severity.label.toUpperCase()} triage`,
        emoji: false
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Summary*\n${brief.summary}`
      }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Scenario*\n${brief.scenario.label}` },
        { type: "mrkdwn", text: `*Severity Score*\n${brief.severity.score}/100` },
        { type: "mrkdwn", text: `*Runtime*\n${brief.runtime?.mode === "mcp" ? "MCP stdio" : "local core"}` },
        { type: "mrkdwn", text: `*Suggested Channel*\n#${brief.slackPlan.suggestedChannelName}` }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Indicators*\n${indicatorText}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Candidate ATT&CK Techniques*\n${techniqueText}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Evidence IDs*\n${evidenceText}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Claim Audit*\n${claimText}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Detection Checks*\n${detectionText}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*First-Response Readiness*\n${impactText}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Next Actions*\n${brief.recommendedActions.map((action) => `- ${action}`).join("\n")}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Roles*\n${brief.roleAssignments.map((assignment) => `- *${assignment.role}:* ${assignment.responsibility}`).join("\n")}`
      }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          action_id: "signaldesk_create_channel",
          text: {
            type: "plain_text",
            text: "Create channel",
            emoji: false
          },
          value: brief.id,
          style: "primary"
        },
        {
          type: "button",
          action_id: "signaldesk_ack_owner",
          text: {
            type: "plain_text",
            text: "Take owner",
            emoji: false
          },
          value: brief.id
        },
        {
          type: "button",
          action_id: "signaldesk_show_checklist",
          text: {
            type: "plain_text",
            text: "Show checklist",
            emoji: false
          },
          value: brief.id
        },
        {
          type: "button",
          action_id: "signaldesk_show_evidence",
          text: {
            type: "plain_text",
            text: "Evidence",
            emoji: false
          },
          value: brief.id
        },
        {
          type: "button",
          action_id: "signaldesk_show_guardrails",
          text: {
            type: "plain_text",
            text: "Guardrails",
            emoji: false
          },
          value: brief.id
        }
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          action_id: "signaldesk_show_detections",
          text: {
            type: "plain_text",
            text: "Detections",
            emoji: false
          },
          value: brief.id
        },
        {
          type: "button",
          action_id: "signaldesk_export_report",
          text: {
            type: "plain_text",
            text: "Report",
            emoji: false
          },
          value: brief.id
        }
      ]
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Evidence-gated triage via ${brief.runtime?.tool ?? "buildIncidentBrief"}: confirm with logs before declaring compromise.`
        }
      ]
    }
  ];
}

function markdownList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function markdownTable(rows, headers) {
  const header = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${headers.map((headerName) => String(row[headerName] ?? "").replace(/\|/g, "/")).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
}

function runtimeLabel(brief) {
  if (brief.runtime?.mode === "mcp") {
    return `MCP stdio via ${brief.runtime.tool}`;
  }
  return "local core";
}

export function buildIncidentReport(brief) {
  const indicatorRows = Object.entries(brief.indicators).flatMap(([kind, values]) =>
    values.map((value) => ({ Kind: kind, Value: value }))
  );
  const evidenceRows = brief.evidenceLedger.map((evidence) => ({
    ID: evidence.id,
    Type: evidence.type,
    Source: evidence.source,
    Fields: Object.keys(evidence.fields).join(", ")
  }));
  const claimRows = brief.claims.map((claim) => ({
    ID: claim.id,
    Status: claim.status,
    Evidence: claim.evidenceIds.join(", "),
    Claim: claim.text
  }));
  const detectionRows = brief.detectionOpportunities.map((detection) => ({
    ID: detection.id,
    "Log Source": detection.logSource,
    Evidence: detection.evidenceIds.join(", "),
    Query: detection.query,
    Why: detection.why
  }));
  const impactRows = brief.impactMetrics.signals.map((signal) => ({
    ID: signal.id,
    Signal: signal.label,
    Status: signal.status,
    Evidence: signal.evidenceIds.join(", ") || "none",
    Detail: signal.detail
  }));

  return [
    `# SignalDesk Incident Report: ${brief.scenario.label}`,
    "",
    `Generated: ${brief.generatedAt}`,
    `Reporter: ${brief.reporter}`,
    `Channel: ${brief.channel}`,
    `Severity: ${brief.severity.label.toUpperCase()} (${brief.severity.score}/100)`,
    `Confidence: ${brief.confidence}`,
    `Runtime: ${runtimeLabel(brief)}`,
    "",
    "## Executive Summary",
    "",
    brief.summary,
    "",
    "## First-Response Readiness",
    "",
    `Score: ${brief.impactMetrics.readinessScore}/100 (${brief.impactMetrics.readinessLabel})`,
    "",
    brief.impactMetrics.impactClaim,
    "",
    markdownTable(impactRows, ["ID", "Signal", "Status", "Evidence", "Detail"]),
    "",
    "## Immediate Actions",
    "",
    markdownList(brief.recommendedActions),
    "",
    "## Response Roles",
    "",
    markdownList(brief.roleAssignments.map((assignment) => `${assignment.role}: ${assignment.responsibility}`)),
    "",
    "## Indicators",
    "",
    indicatorRows.length ? markdownTable(indicatorRows, ["Kind", "Value"]) : "No obvious indicators extracted.",
    "",
    "## Candidate ATT&CK Techniques",
    "",
    brief.candidateTechniques.length
      ? markdownList(brief.candidateTechniques.map((technique) => `${technique.id} ${technique.name}`))
      : "No ATT&CK technique matched yet.",
    "",
    "## Evidence Ledger",
    "",
    markdownTable(evidenceRows, ["ID", "Type", "Source", "Fields"]),
    "",
    "## Claim Audit",
    "",
    markdownTable(claimRows, ["ID", "Status", "Evidence", "Claim"]),
    "",
    "## Detection Opportunities",
    "",
    markdownTable(detectionRows, ["ID", "Log Source", "Evidence", "Query", "Why"]),
    "",
    "## Evidence Checklist",
    "",
    markdownList(brief.evidenceChecklist),
    "",
    "## Slack Coordination Plan",
    "",
    `Suggested channel: #${brief.slackPlan.suggestedChannelName}`,
    "",
    brief.slackPlan.kickoffMessage,
    "",
    `Update cadence: ${brief.slackPlan.updateCadence}`,
    "",
    "## Guardrails",
    "",
    markdownList(brief.guardrails),
    "",
    "## Validation",
    "",
    brief.evidenceValidation.valid
      ? "Evidence claim validation passed."
      : `Evidence claim validation failed: ${brief.evidenceValidation.errors.join("; ")}`,
    "",
    "This report is triage support, not attribution or final impact determination."
  ].join("\n");
}
