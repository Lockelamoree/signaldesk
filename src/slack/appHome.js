export const DEMO_ALERT_TEXT = "Volunteer clicked a fake donor portal link at https://donor-login.example.bad/reset from 198.51.100.23, approved an MFA prompt, and pasted an access token. This may affect donor records and payroll.";
export const DEMO_COMMAND = "/signaldesk demo";
export const DEMO_ALERT = `/signaldesk ${DEMO_ALERT_TEXT}`;
export const HOME_DEMO_GUIDE_ACTION = "signaldesk_home_demo_guide";
export const HOME_PROOF_CHECKLIST_ACTION = "signaldesk_home_proof_checklist";

function runtimeLabel(mode) {
  return mode === "mcp" ? "MCP stdio" : "local deterministic";
}

export function buildAppHomeView({ runtimeMode = "local" } = {}) {
  const runtime = runtimeLabel(runtimeMode);

  return {
    type: "home",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "SignalDesk",
          emoji: false
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*Security incident triage for teams without a SOC.*",
            "Use SignalDesk on synthetic demo data to turn a suspicious Slack message into an evidence-gated incident brief."
          ].join("\n")
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Runtime proof*\n${runtime}`
          },
          {
            type: "mrkdwn",
            text: "*Track*\nSlack Agent for Good"
          },
          {
            type: "mrkdwn",
            text: "*Primary flow*\nMessage shortcut"
          },
          {
            type: "mrkdwn",
            text: "*Fallback flow*\n`/signaldesk`"
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*Judge test path*",
            "1. Run `/signaldesk demo` or use *Triage with SignalDesk* on a suspicious synthetic message.",
            "2. Confirm the brief shows `Runtime: MCP stdio`, evidence IDs, detection checks, first-response readiness, and guardrails.",
            "3. Click *Create channel* to verify incident coordination."
          ].join("\n")
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Fast demo command*\n\`${DEMO_COMMAND}\`\n\n*Full fallback command*\n\`${DEMO_ALERT}\``
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Demo guide",
              emoji: false
            },
            action_id: HOME_DEMO_GUIDE_ACTION,
            value: "home-demo-guide"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Proof checklist",
              emoji: false
            },
            action_id: HOME_PROOF_CHECKLIST_ACTION,
            value: "home-proof-checklist"
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*Evidence boundary*",
            "This demo uses synthetic data. SignalDesk preserves evidence and suggests containment steps; responders still validate impact with logs before declaring compromise."
          ].join("\n")
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Expected proof: MCP stdio runtime, EV/CL/DET/IM IDs, detection plan, report export, and incident channel creation."
          }
        ]
      }
    ]
  };
}

export function buildSignalDeskHelp({ runtimeMode = "local" } = {}) {
  const runtime = runtimeLabel(runtimeMode);

  return {
    text: "SignalDesk demo help: run /signaldesk demo, use the message shortcut, or paste synthetic alert context.",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "SignalDesk Demo Help",
          emoji: false
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*Fastest path:* run `/signaldesk demo`.",
            "Fallback: use *Triage with SignalDesk* on a suspicious synthetic Slack message or paste the full sample command below."
          ].join("\n")
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Runtime proof*\n${runtime}`
          },
          {
            type: "mrkdwn",
            text: "*Look for*\nEV/CL/DET/IM IDs"
          },
          {
            type: "mrkdwn",
            text: "*Impact proof*\nFirst-response readiness"
          },
          {
            type: "mrkdwn",
            text: "*Safety*\nSynthetic data only"
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Sample commands*\n\`${DEMO_COMMAND}\`\n\`${DEMO_ALERT}\``
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Expected output: MCP runtime, evidence ledger, claim audit, detection plan, report export, and incident channel creation."
          }
        ]
      }
    ]
  };
}

export function buildHomeDemoGuideModal({ runtimeMode = "local" } = {}) {
  const runtime = runtimeLabel(runtimeMode);

  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "SignalDesk Demo",
      emoji: false
    },
    close: {
      type: "plain_text",
      text: "Close",
      emoji: false
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*Fastest live path*",
            `1. Run \`${DEMO_COMMAND}\` in the sandbox channel.`,
            "2. Confirm the brief shows `Runtime: MCP stdio`.",
            "3. Click *Create channel*, then check *Evidence*, *Detections*, and *Report*."
          ].join("\n")
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Runtime target*\n${runtime}`
          },
          {
            type: "mrkdwn",
            text: "*Data boundary*\nSynthetic fixture"
          },
          {
            type: "mrkdwn",
            text: "*Track*\nSlack Agent for Good"
          },
          {
            type: "mrkdwn",
            text: "*Primary proof*\nMCP-backed triage"
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Full fallback command*\n\`${DEMO_ALERT}\``
        }
      }
    ]
  };
}

export function buildHomeProofChecklistModal({ runtimeMode = "local" } = {}) {
  const runtime = runtimeLabel(runtimeMode);

  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Proof Checklist",
      emoji: false
    },
    close: {
      type: "plain_text",
      text: "Close",
      emoji: false
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*Judge proof signals*",
            `- Runtime visible as \`${runtime}\`.`,
            "- EV/CL/DET/IM IDs appear in the brief.",
            "- Detection checks cite evidence and safe hunt queries.",
            "- First-response readiness is shown without claiming live impact.",
            "- Incident channel creation posts a kickoff message."
          ].join("\n")
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*Terminal receipts to capture*",
            "- `npm.cmd run sandbox:doctor -- --strict`",
            "- `npm.cmd run smoke:slack-mcp`",
            "- `npm.cmd run smoke:mcp`",
            "- `npm.cmd run verify`"
          ].join("\n")
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Evidence boundary: live Slack delivery is proven only after the sandbox app is installed and exercised with real Slack tokens."
          }
        ]
      }
    ]
  };
}
