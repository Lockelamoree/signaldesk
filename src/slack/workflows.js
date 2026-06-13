export function shortcutMessageText(shortcut) {
  const message = shortcut.message ?? {};
  const parts = [
    message.text,
    ...(message.attachments ?? []).map((attachment) => attachment.text || attachment.fallback || ""),
    ...(message.blocks ?? [])
      .flatMap((block) => [block.text?.text, ...(block.fields ?? []).map((field) => field.text)])
      .filter(Boolean)
  ];
  return parts.filter(Boolean).join("\n").trim();
}

export function channelNameCandidate(brief, suffix = "") {
  const base = brief.slackPlan.suggestedChannelName
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
  return suffix ? `${base}-${suffix}`.slice(0, 80) : base;
}

export function incidentKickoffBlocks(brief) {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `SignalDesk: ${brief.reportDecision?.needed === false ? "Intake" : brief.scenario.label}`,
        emoji: false
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          `*Severity:* ${brief.severity.label.toUpperCase()} (${brief.severity.score}/100)`,
          `*Report decision:* ${brief.reportDecision?.label ?? "Triage report"} - ${brief.reportDecision?.reason ?? "Report decision was not recorded on this brief."}`,
          `*Summary:* ${brief.summary}`,
          "",
          "*Immediate actions*",
          ...brief.recommendedActions.slice(0, 5).map((action) => `- ${action}`)
        ].join("\n")
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Created by SignalDesk. Validate impact with logs before declaring compromise."
        }
      ]
    }
  ];
}

export async function createIncidentChannel({ brief, client, suffix = Date.now().toString(36).slice(-6) }) {
  const attempts = [channelNameCandidate(brief), channelNameCandidate(brief, suffix)];
  let lastError = "unknown_error";

  for (const name of attempts) {
    try {
      const created = await client.conversations.create({ name });
      const channelId = created.channel?.id;
      const channelName = created.channel?.name || name;

      if (!channelId) {
        lastError = "missing_channel_id";
        continue;
      }

      await client.chat.postMessage({
        channel: channelId,
        text: brief.slackPlan.kickoffMessage,
        blocks: incidentKickoffBlocks(brief)
      });

      return { ok: true, channelId, channelName };
    } catch (error) {
      lastError = error?.data?.error || error?.message || "unknown_error";
      if (lastError !== "name_taken") break;
    }
  }

  return { ok: false, error: lastError };
}
