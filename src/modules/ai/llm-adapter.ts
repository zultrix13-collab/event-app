/**
 * Layer: merge deterministic baseline with optional LLM JSON output (orchestration only).
 * Prompt construction → llm-input-construction. HTTP → llm-execution.
 */
import { executeOpenAiJsonCompletion } from "@/modules/ai/llm-execution";
import type { AnalysisRecommendationDraft, DeterministicSignal, LlmAnalysisResult } from "@/modules/ai/types";
import { draftRecommendationsFromSignals } from "@/modules/ai/signals";

function getOpenAiKey(): string | null {
  const key = process.env.OPENAI_API_KEY;
  return key && key.length > 0 ? key : null;
}

function getModel(): string {
  return process.env.AI_MODEL || "gpt-4o-mini";
}

export function buildDeterministicAnalysisResult(signals: DeterministicSignal[]): LlmAnalysisResult {
  const lines = signals.map((s) => `- **${s.title}**: ${s.detail}`);
  return {
    summary: [
      "This summary is generated from rule-based signals derived from your synced metrics.",
      "An optional LLM narrative is disabled until OPENAI_API_KEY is configured.",
      lines.length ? `Key signals:\n${lines.join("\n")}` : "Continue syncing to improve signal quality."
    ].join("\n\n"),
    extra_findings: [],
    recommendations: draftRecommendationsFromSignals(signals).map((r) => ({
      ...r,
      source: "rule" as const
    }))
  };
}

function parseLlmJson(text: string): LlmAnalysisResult | null {
  try {
    const raw = JSON.parse(text) as Record<string, unknown>;
    const summary = typeof raw.summary === "string" ? raw.summary : "";
    const extra_findings = Array.isArray(raw.extra_findings) ? raw.extra_findings : [];
    const recommendations = Array.isArray(raw.recommendations) ? raw.recommendations : [];

    const parsedFindings = extra_findings
      .map((f) => {
        const o = f as Record<string, unknown>;
        if (typeof o.title !== "string" || typeof o.detail !== "string") return null;
        const sev = o.severity === "warning" || o.severity === "concerning" || o.severity === "info" ? o.severity : "info";
        return { title: o.title, detail: o.detail, severity: sev };
      })
      .filter(Boolean) as LlmAnalysisResult["extra_findings"];

    const parsedRecs: AnalysisRecommendationDraft[] = [];
    for (const r of recommendations.slice(0, 5)) {
      const o = r as Record<string, unknown>;
      if (typeof o.title !== "string" || typeof o.description !== "string") continue;
      const pr = o.priority === "high" || o.priority === "medium" || o.priority === "low" ? o.priority : "medium";
      const cat =
        o.category === "content" ||
        o.category === "timing" ||
        o.category === "engagement" ||
        o.category === "growth"
          ? o.category
          : "engagement";
      const actions = Array.isArray(o.action_items) ? o.action_items.filter((x): x is string => typeof x === "string") : [];
      parsedRecs.push({
        priority: pr,
        category: cat,
        title: o.title,
        description: o.description,
        action_items: actions.length ? actions : ["Review metrics after the next sync."],
        source: "model" as const
      });
    }

    return {
      summary: summary || "Analysis complete.",
      extra_findings: parsedFindings,
      recommendations: parsedRecs
    };
  } catch {
    return null;
  }
}

export async function runAnalysisLlmLayer(params: {
  systemPrompt: string;
  userPrompt: string;
  signals: DeterministicSignal[];
}): Promise<{ result: LlmAnalysisResult; modelName: string | null }> {
  const key = getOpenAiKey();
  if (!key) {
    const det = buildDeterministicAnalysisResult(params.signals);
    return { result: det, modelName: null };
  }

  const model = getModel();
  const content = await executeOpenAiJsonCompletion({
    apiKey: key,
    model,
    systemPrompt: params.systemPrompt,
    userPrompt: params.userPrompt
  });

  const parsed = parseLlmJson(content);
  if (!parsed) {
    return { result: buildDeterministicAnalysisResult(params.signals), modelName: model };
  }

  const ruleRecs = draftRecommendationsFromSignals(params.signals);
  const modelRecs = parsed.recommendations.map((r) => ({ ...r, source: "model" as const }));
  const mergedRecs =
    modelRecs.length > 0
      ? [...modelRecs, ...ruleRecs.filter((r) => !modelRecs.some((m) => m.title === r.title))].slice(0, 5)
      : ruleRecs;

  return {
    result: {
      summary: parsed.summary,
      extra_findings: parsed.extra_findings,
      recommendations: mergedRecs
    },
    modelName: model
  };
}
