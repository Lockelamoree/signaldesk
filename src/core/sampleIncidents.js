export const sampleIncidents = [
  {
    id: "nonprofit-oauth-phish",
    title: "Nonprofit OAuth Phishing",
    alertText: "Volunteer clicked a fake donor portal link at https://donor-login.example.bad/reset from 198.51.100.23, approved an MFA prompt, and pasted an access token. This may affect donor records and payroll.",
    expectedScenario: "token_exposure",
    expectedSeverity: "high",
    expectedTechniques: ["T1566", "T1528"]
  },
  {
    id: "school-script-download",
    title: "School Script Download",
    alertText: "Teacher downloaded an attachment that launched powershell -EncodedCommand and reached out to 203.0.113.44. Student records are on the same endpoint.",
    expectedScenario: "malware_execution",
    expectedSeverity: "high",
    expectedTechniques: ["T1059", "T1105"]
  },
  {
    id: "clinic-exfil-warning",
    title: "Clinic Exfiltration Warning",
    alertText: "Clinic admin reports a possible data exfil attempt: archive upload to https://files.example.invalid/drop with patient PII mentioned in the thread.",
    expectedScenario: "data_exfiltration",
    expectedSeverity: "high",
    expectedTechniques: ["T1041"]
  },
  {
    id: "community-low-signal",
    title: "Community Low-Signal Report",
    alertText: "A community moderator saw a weird message in Slack asking people to check a document, but nobody clicked and there are no links yet.",
    expectedScenario: "security_report",
    expectedSeverity: "low",
    expectedTechniques: []
  }
];
