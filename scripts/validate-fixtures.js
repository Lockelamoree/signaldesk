import { buildIncidentBrief } from "../src/core/incidentBrief.js";
import { sampleIncidents } from "../src/core/sampleIncidents.js";

const rows = [];
const failures = [];

for (const sample of sampleIncidents) {
  const brief = buildIncidentBrief({
    alertText: sample.alertText,
    reporter: "fixture",
    channel: "fixture"
  });
  const techniqueIds = brief.candidateTechniques.map((technique) => technique.id);
  const missingTechniques = sample.expectedTechniques.filter((technique) => !techniqueIds.includes(technique));
  const passed = brief.scenario.id === sample.expectedScenario
    && brief.severity.label === sample.expectedSeverity
    && missingTechniques.length === 0
    && brief.evidenceValidation.valid
    && brief.detectionOpportunities.length > 0
    && brief.impactMetrics.readinessScore >= 80;

  rows.push({
    id: sample.id,
    scenario: brief.scenario.id,
    severity: brief.severity.label,
    score: brief.severity.score,
    techniques: techniqueIds.join(", ") || "none",
    evidence: brief.evidenceLedger.length,
    detections: brief.detectionOpportunities.length,
    readiness: brief.impactMetrics.readinessScore,
    passed
  });

  if (!passed) {
    failures.push({
      id: sample.id,
      expectedScenario: sample.expectedScenario,
      actualScenario: brief.scenario.id,
      expectedSeverity: sample.expectedSeverity,
      actualSeverity: brief.severity.label,
      missingTechniques,
      detections: brief.detectionOpportunities.length,
      readiness: brief.impactMetrics.readinessScore,
      evidenceErrors: brief.evidenceValidation.errors
    });
  }
}

console.log("| Fixture | Scenario | Severity | Score | Evidence | Detections | Readiness | Techniques | Result |");
console.log("| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |");
for (const row of rows) {
  console.log(`| ${row.id} | ${row.scenario} | ${row.severity} | ${row.score} | ${row.evidence} | ${row.detections} | ${row.readiness} | ${row.techniques} | ${row.passed ? "PASS" : "FAIL"} |`);
}

if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  process.exitCode = 1;
}
