/**
 * Rule-based signal extraction from normalized metrics. AI narrates these; it does not replace them.
 */
import type { NormalizedDailyMetric, NormalizedPostMetric } from "@/modules/ai/metrics-reader";
import type { DeterministicSignal } from "@/modules/ai/types";

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function impressionsProxy(row: NormalizedDailyMetric): number | null {
  return row.impressions ?? row.reach ?? null;
}

function engagementProxy(row: NormalizedDailyMetric): number | null {
  return row.engagement_rate ?? (row.engaged_users != null ? row.engaged_users : null);
}

export function extractDeterministicSignals(
  daily: NormalizedDailyMetric[],
  posts: NormalizedPostMetric[]
): DeterministicSignal[] {
  const signals: DeterministicSignal[] = [];
  const sorted = [...daily].sort((a, b) => a.metric_date.localeCompare(b.metric_date));

  if (sorted.length >= 6) {
    const imp = sorted.map(impressionsProxy).filter((v): v is number => v != null && !Number.isNaN(v));
    if (imp.length >= 6) {
      const recent = imp.slice(-3);
      const prev = imp.slice(-6, -3);
      const rAvg = avg(recent);
      const pAvg = avg(prev);
      if (pAvg > 0 && rAvg < pAvg * 0.85) {
        signals.push({
          id: "impressions_trend_down",
          severity: "warning",
          title: "Impressions / reach proxy trending down",
          detail: `Recent 3-day average (${Math.round(rAvg)}) is materially below the prior 3-day average (${Math.round(pAvg)}).`,
          evidence: { recentAvg: rAvg, priorAvg: pAvg }
        });
      }
    }

    const eng = sorted.map(engagementProxy).filter((v): v is number => v != null && !Number.isNaN(v));
    if (eng.length >= 6) {
      const recent = eng.slice(-3);
      const prev = eng.slice(-6, -3);
      const rAvg = avg(recent);
      const pAvg = avg(prev);
      if (pAvg > 0 && rAvg < pAvg * 0.85) {
        signals.push({
          id: "engagement_trend_down",
          severity: "warning",
          title: "Engagement trend softening",
          detail: `Engagement metric (rate or engaged users) averaged lower in the last 3 daily points vs the previous 3.`,
          evidence: { recentAvg: rAvg, priorAvg: pAvg }
        });
      }
    }
  }

  const deltas = sorted
    .map((r) => r.follower_delta)
    .filter((v): v is number => v != null && !Number.isNaN(v));
  if (deltas.length >= 5) {
    const lastSum = deltas.slice(-7).reduce((a, b) => a + b, 0);
    if (lastSum <= 0) {
      signals.push({
        id: "follower_growth_stall",
        severity: "info",
        title: "Follower net change flat or negative (recent window)",
        detail: "Sum of follower_delta over the latest available daily points in the window is not positive.",
        evidence: { sumDelta: lastSum, days: deltas.length }
      });
    }
  }

  const now = Date.now();
  const weekMs = 7 * 86400000;
  const recentPosts = posts.filter((p) => {
    const t = new Date(p.post_created_at).getTime();
    return !Number.isNaN(t) && now - t <= weekMs;
  });
  if (recentPosts.length < 2 && posts.length > 0) {
    signals.push({
      id: "posting_frequency_low",
      severity: "warning",
      title: "Low posting frequency (last 7 days)",
      detail: `Only ${recentPosts.length} post(s) recorded in the last 7 days in stored metrics.`,
      evidence: { count7d: recentPosts.length }
    });
  }

  if (posts.length >= 2) {
    const sortedPosts = [...posts].sort(
      (a, b) => new Date(b.post_created_at).getTime() - new Date(a.post_created_at).getTime()
    );
    let maxGapDays = 0;
    for (let i = 0; i < sortedPosts.length - 1; i++) {
      const a = new Date(sortedPosts[i].post_created_at).getTime();
      const b = new Date(sortedPosts[i + 1].post_created_at).getTime();
      const gap = Math.abs(a - b) / 86400000;
      if (gap > maxGapDays) {
        maxGapDays = gap;
      }
    }
    if (maxGapDays > 12) {
      signals.push({
        id: "inactive_posting_gap",
        severity: "info",
        title: "Long gap between posts",
        detail: `Largest gap between consecutive stored posts is about ${Math.round(maxGapDays)} days.`,
        evidence: { maxGapDays }
      });
    }
  }

  const formatCounts = new Map<string, number>();
  for (const p of posts.slice(0, 20)) {
    const key = p.post_type ?? "unknown";
    formatCounts.set(key, (formatCounts.get(key) ?? 0) + 1);
  }
  if (formatCounts.size > 0) {
    const top = [...formatCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) {
      signals.push({
        id: "top_post_format_pattern",
        severity: "info",
        title: "Dominant post format in recent sample",
        detail: `Most common post_type in the latest sample is "${top[0]}" (${top[1]} posts).`,
        evidence: { topType: top[0], count: top[1] }
      });
    }
  }

  return signals;
}

export function draftRecommendationsFromSignals(signals: DeterministicSignal[]): import("@/modules/ai/types").AnalysisRecommendationDraft[] {
  const out: import("@/modules/ai/types").AnalysisRecommendationDraft[] = [];

  for (const s of signals) {
    if (s.id === "impressions_trend_down") {
      out.push({
        priority: "high",
        category: "growth",
        title: "Stabilize reach",
        description: s.detail,
        action_items: [
          "Review top-performing post themes from stored metrics and repeat angles that drove impressions.",
          "Test one additional post this week with a clear CTA to re-engage the audience."
        ],
        source: "rule"
      });
    }
    if (s.id === "engagement_trend_down") {
      out.push({
        priority: "high",
        category: "engagement",
        title: "Refresh engagement tactics",
        description: s.detail,
        action_items: [
          "Add questions or polls-style prompts in captions to invite comments.",
          "Reply to comments within 24h on new posts to boost conversation signals."
        ],
        source: "rule"
      });
    }
    if (s.id === "posting_frequency_low") {
      out.push({
        priority: "medium",
        category: "timing",
        title: "Increase posting cadence",
        description: s.detail,
        action_items: [
          "Schedule at least two posts per week while monitoring daily metrics after sync.",
          "Batch-create short-form updates so publishing stays consistent."
        ],
        source: "rule"
      });
    }
    if (s.id === "follower_growth_stall") {
      out.push({
        priority: "medium",
        category: "growth",
        title: "Investigate audience growth levers",
        description: s.detail,
        action_items: [
          "Cross-check follower_delta after the next sync to confirm trend.",
          "Pair content with a simple follower CTA in stories or pinned post."
        ],
        source: "rule"
      });
    }
    if (s.id === "inactive_posting_gap") {
      out.push({
        priority: "low",
        category: "timing",
        title: "Reduce long silent periods",
        description: s.detail,
        action_items: ["Plan a lightweight weekly slot so gaps rarely exceed 7–10 days."],
        source: "rule"
      });
    }
    if (s.id === "top_post_format_pattern") {
      out.push({
        priority: "low",
        category: "content",
        title: "Lean into what you publish most",
        description: s.detail,
        action_items: ["Experiment with variants of the dominant format while tracking engagement_rate on daily rows."],
        source: "rule"
      });
    }
  }

  if (out.length === 0) {
    out.push({
      priority: "low",
      category: "engagement",
      title: "Keep monitoring after each sync",
      description: "Limited rule-based triggers fired; continue syncing to widen the data window for trends.",
      action_items: ["Run sync regularly and review daily metrics in the dashboard."],
      source: "rule"
    });
  }

  return out.slice(0, 5);
}
