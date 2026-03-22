/**
 * Shared shapes for deterministic signals and LLM output (not DB row types).
 */
export type SignalSeverity = "info" | "warning" | "concerning";

export type DeterministicSignal = {
  id: string;
  severity: SignalSeverity;
  title: string;
  detail: string;
  evidence: Record<string, unknown>;
};

export type AnalysisRecommendationDraft = {
  priority: "high" | "medium" | "low";
  category: "content" | "timing" | "engagement" | "growth";
  title: string;
  description: string;
  action_items: string[];
  source: "rule" | "model";
};

export type LlmAnalysisResult = {
  summary: string;
  extra_findings: Array<{ title: string; detail: string; severity?: SignalSeverity }>;
  recommendations: AnalysisRecommendationDraft[];
};
