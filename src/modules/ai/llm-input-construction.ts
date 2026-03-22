/**
 * Layer: LLM user-message construction ONLY from structured signals + normalized metric slices.
 * Must not receive raw Meta/Graph payloads or `raw_metrics` columns.
 */
import type { NormalizedDailyMetric, NormalizedPostMetric } from "@/modules/ai/metrics-reader";
import type { DeterministicSignal } from "@/modules/ai/types";

function compactDaily(rows: NormalizedDailyMetric[]): Record<string, unknown>[] {
  return rows.slice(-14).map((r) => ({
    date: r.metric_date,
    followers: r.followers_count,
    follower_delta: r.follower_delta,
    impressions: r.impressions,
    reach: r.reach,
    engaged_users: r.engaged_users,
    engagement_rate: r.engagement_rate
  }));
}

function compactPosts(rows: NormalizedPostMetric[]): Record<string, unknown>[] {
  return rows.slice(0, 15).map((p) => ({
    meta_post_id: p.meta_post_id,
    created_at: p.post_created_at,
    impressions: p.impressions,
    engagements: p.engagements,
    post_type: p.post_type
  }));
}

export function buildAnalysisLlmUserPrompt(params: {
  pageName: string;
  signals: DeterministicSignal[];
  daily: NormalizedDailyMetric[];
  posts: NormalizedPostMetric[];
}): string {
  return [
    "You are given deterministic analytics signals computed from normalized Facebook Page metrics (aggregated columns only).",
    "Raw provider payloads are not included and must not be inferred.",
    "Do not contradict the signals; interpret them for a non-technical page owner.",
    "Return ONLY valid JSON matching this schema:",
    JSON.stringify(
      {
        summary: "string, 2-4 sentences",
        extra_findings: [{ title: "string", detail: "string", severity: "info|warning|concerning" }],
        recommendations: [
          {
            priority: "high|medium|low",
            category: "content|timing|engagement|growth",
            title: "string",
            description: "string",
            action_items: ["string"]
          }
        ]
      },
      null,
      2
    ),
    "Use at most 3 extra_findings and at most 5 recommendations. Recommendations must be actionable.",
    "",
    `Page name: ${params.pageName}`,
    "",
    "Deterministic signals (JSON):",
    JSON.stringify(params.signals, null, 2),
    "",
    "Recent normalized daily metrics (JSON):",
    JSON.stringify(compactDaily(params.daily), null, 2),
    "",
    "Recent normalized post metrics sample (JSON):",
    JSON.stringify(compactPosts(params.posts), null, 2)
  ].join("\n");
}
