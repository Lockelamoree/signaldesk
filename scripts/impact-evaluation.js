import { mkdirSync, writeFileSync } from "node:fs";
import { buildIncidentBrief } from "../src/core/incidentBrief.js";
import { sampleIncidents } from "../src/core/sampleIncidents.js";

const evaluationDate = "2026-06-01";
const outDir = "artifacts/submission";

const communityByFixture = {
  "nonprofit-oauth-phish": "nonprofit operations",
  "school-script-download": "education",
  "clinic-exfil-warning": "public health",
  "community-low-signal": "community safety"
};

const requiredScenarios = new Set([
  "token_exposure",
  "malware_execution",
  "data_exfiltration",
  "security_report"
]);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function average(values) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function tableEscape(value) {
  return String(value).replace(/\|/g, "/");
}

function buildEvaluation() {
  const rows = sampleIncidents.map((sample, index) => {
    const brief = buildIncidentBrief({
      alertText: sample.alertText,
      reporter: "impact-eval",
      channel: "impact-eval",
      timestamp: `2026-06-01T12:0${index}:00.000Z`
    });
    const techniqueIds = brief.candidateTechniques.map((technique) => technique.id);
    const missingTechniques = sample.expectedTechniques.filter((technique) => !techniqueIds.includes(technique));

    return {
      fixture: sample.id,
      title: sample.title,
      community: communityByFixture[sample.id] ?? "under-resourced Slack team",
      expectedScenario: sample.expectedScenario,
      actualScenario: brief.scenario.id,
      expectedSeverity: sample.expectedSeverity,
      actualSeverity: brief.severity.label,
      severityScore: brief.severity.score,
      missingTechniques,
      readinessScore: brief.impactMetrics.readinessScore,
      readinessLabel: brief.impactMetrics.readinessLabel,
      reportDecision: brief.reportDecision.label,
      reportNeeded: brief.reportDecision.needed,
      evidenceItems: brief.evidenceLedger.length,
      claims: brief.claims.length,
      detectionChecks: brief.detectionOpportunities.length,
      roleAssignments: brief.roleAssignments.length,
      guardrails: brief.guardrails.length,
      evidenceChecklistItems: brief.evidenceChecklist.length,
      slackChannelSuggested: Boolean(brief.slackPlan?.suggestedChannelName),
      evidenceValidation: brief.evidenceValidation
    };
  });

  const scenarioCoverage = unique(rows.map((row) => row.actualScenario));
  const readinessScores = rows.map((row) => row.readinessScore);
  const aggregate = {
    fixtureCount: rows.length,
    targetCommunities: unique(rows.map((row) => row.community)),
    scenarioCoverage,
    highSeverityFixtures: rows.filter((row) => row.actualSeverity === "high").length,
    averageReadinessScore: average(readinessScores),
    minimumReadinessScore: Math.min(...readinessScores),
    maximumReadinessScore: Math.max(...readinessScores),
    reportReadyFixtures: rows.filter((row) => row.reportNeeded).length,
    intakeOnlyFixtures: rows.filter((row) => !row.reportNeeded).length,
    evidenceItems: sum(rows.map((row) => row.evidenceItems)),
    claims: sum(rows.map((row) => row.claims)),
    detectionChecks: sum(rows.map((row) => row.detectionChecks)),
    roleAssignments: sum(rows.map((row) => row.roleAssignments)),
    guardrails: sum(rows.map((row) => row.guardrails)),
    evidenceChecklistItems: sum(rows.map((row) => row.evidenceChecklistItems))
  };

  const failures = [];
  if (rows.length < 4) failures.push("Expected at least four Agent for Good fixtures.");
  for (const scenario of requiredScenarios) {
    if (!scenarioCoverage.includes(scenario)) {
      failures.push(`Missing required scenario coverage: ${scenario}.`);
    }
  }
  for (const row of rows) {
    if (row.actualScenario !== row.expectedScenario) {
      failures.push(`${row.fixture}: expected scenario ${row.expectedScenario}, got ${row.actualScenario}.`);
    }
    if (row.actualSeverity !== row.expectedSeverity) {
      failures.push(`${row.fixture}: expected severity ${row.expectedSeverity}, got ${row.actualSeverity}.`);
    }
    if (row.missingTechniques.length) {
      failures.push(`${row.fixture}: missing expected ATT&CK technique(s) ${row.missingTechniques.join(", ")}.`);
    }
    if (!row.evidenceValidation.valid) {
      failures.push(`${row.fixture}: evidence validation failed: ${row.evidenceValidation.errors.join("; ")}.`);
    }
    if (row.fixture === "community-low-signal" && row.reportNeeded) {
      failures.push(`${row.fixture}: low-signal report should remain intake-only until concrete evidence is provided.`);
    }
    if (row.readinessScore < 80) {
      failures.push(`${row.fixture}: readiness score ${row.readinessScore} is below the 80/100 floor.`);
    }
    if (row.detectionChecks < 1) failures.push(`${row.fixture}: no detection checks generated.`);
    if (row.roleAssignments < 3) failures.push(`${row.fixture}: fewer than three response roles generated.`);
    if (row.guardrails < 3) failures.push(`${row.fixture}: fewer than three safety guardrails generated.`);
    if (!row.slackChannelSuggested) failures.push(`${row.fixture}: no Slack coordination channel suggested.`);
  }
  if (aggregate.averageReadinessScore < 90) {
    failures.push(`Average readiness ${aggregate.averageReadinessScore}/100 is below the 90/100 target.`);
  }

  return {
    evaluationDate,
    scope: "Synthetic repo-local evaluation of Agent for Good security-response fixtures. This does not prove live incident outcomes.",
    aggregate,
    rows,
    passed: failures.length === 0,
    failures
  };
}

function formatMarkdown(evaluation) {
  const rows = evaluation.rows.map((row) => (
    `| ${tableEscape(row.title)} | ${tableEscape(row.community)} | ${row.actualScenario} | ${row.actualSeverity} ${row.severityScore}/100 | ${tableEscape(row.reportDecision)} | ${row.readinessScore}/100 | ${row.evidenceItems} | ${row.detectionChecks} | ${row.roleAssignments} | ${row.guardrails} | ${row.evidenceValidation.valid ? "PASS" : "FAIL"} |`
  ));

  return [
    "# SignalDesk Impact Evaluation",
    "",
    `Evaluation date: ${evaluation.evaluationDate}`,
    "",
    "This is a deterministic repo-local evaluation for the Slack Agent for Good story. It uses synthetic nonprofit, school, clinic, and community-team incidents to prove that SignalDesk creates a prepared first-response package. It does not claim live containment, breach confirmation, or real-world outcome improvement until responders validate logs and act in the Slack sandbox or a real environment.",
    "",
    "## Overall Result",
    "",
    `Overall result: **${evaluation.passed ? "PASS" : "FAIL"}**`,
    "",
    "- Target users: under-resourced Slack teams without a full SOC.",
    `- Communities covered: ${evaluation.aggregate.targetCommunities.join(", ")}.`,
    `- Scenarios covered: ${evaluation.aggregate.scenarioCoverage.join(", ")}.`,
    `- Average first-response readiness: ${evaluation.aggregate.averageReadinessScore}/100.`,
    `- Minimum first-response readiness: ${evaluation.aggregate.minimumReadinessScore}/100.`,
    `- Report-ready fixtures: ${evaluation.aggregate.reportReadyFixtures}.`,
    `- Intake-only fixtures: ${evaluation.aggregate.intakeOnlyFixtures}.`,
    `- Evidence items prepared: ${evaluation.aggregate.evidenceItems}.`,
    `- Evidence-linked detection checks prepared: ${evaluation.aggregate.detectionChecks}.`,
    `- Response roles suggested: ${evaluation.aggregate.roleAssignments}.`,
    `- Safety guardrails generated: ${evaluation.aggregate.guardrails}.`,
    "",
    "## Fixture Results",
    "",
    "| Fixture | Community | Scenario | Severity | Report decision | Readiness | Evidence | Detections | Roles | Guardrails | Claims valid |",
    "| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...rows,
    "",
    "## Pass Criteria",
    "",
    "- At least four Agent for Good fixtures cover nonprofit operations, education, public health, and community safety.",
    "- Required scenarios are covered: token exposure, malware execution, data exfiltration, and low-signal security reports.",
    "- Low-signal security reports stay intake-only until concrete indicators, affected users/systems, confirmed action, or sensitive context exists.",
    "- Each fixture preserves source evidence, validates claims against evidence IDs, generates detection checks, assigns response roles, includes guardrails, and suggests a Slack coordination path.",
    "- Each fixture reaches at least 80/100 first-response readiness, and the average stays at or above 90/100.",
    "",
    "## Evidence Boundary",
    "",
    "This artifact supports the Potential Impact criterion by proving repeatable readiness on synthetic incidents. It should be shown alongside the live Slack sandbox demo, public repository, and `docs/judge-proof.md`; it is not a substitute for live Slack footage or public-link verification."
  ].join("\n");
}

mkdirSync(outDir, { recursive: true });

const evaluation = buildEvaluation();
writeFileSync(`${outDir}/impact-evaluation.json`, `${JSON.stringify(evaluation, null, 2)}\n`);
writeFileSync("docs/impact-evaluation.md", `${formatMarkdown(evaluation)}\n`);

console.log("| Metric | Value |");
console.log("| --- | ---: |");
console.log(`| Fixtures evaluated | ${evaluation.aggregate.fixtureCount} |`);
console.log(`| Communities covered | ${evaluation.aggregate.targetCommunities.length} |`);
console.log(`| Scenarios covered | ${evaluation.aggregate.scenarioCoverage.length} |`);
console.log(`| Average readiness | ${evaluation.aggregate.averageReadinessScore}/100 |`);
console.log(`| Minimum readiness | ${evaluation.aggregate.minimumReadinessScore}/100 |`);
console.log(`| Evidence items | ${evaluation.aggregate.evidenceItems} |`);
console.log(`| Detection checks | ${evaluation.aggregate.detectionChecks} |`);
console.log(`| Response roles | ${evaluation.aggregate.roleAssignments} |`);
console.log(`| Guardrails | ${evaluation.aggregate.guardrails} |`);

if (!evaluation.passed) {
  console.error(`Impact evaluation failed:\n- ${evaluation.failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("\nImpact evaluation passed. Wrote docs/impact-evaluation.md and artifacts/submission/impact-evaluation.json.");
}
