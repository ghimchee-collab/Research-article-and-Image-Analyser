
export interface QualityMetrics {
  clarity_of_research_question: number;
  rigor_of_methodology: number;
  evidence_strength: number;
  interpretation: string;
}

export interface StructuredSummary {
  title: string;
  authors: string[];
  year: number;
  objective: string;
  method: string;
  key_findings: string[];
  implications: string;
  limitations: string;
  quality_check_metrics: QualityMetrics;
}

export enum Relevance {
    High = 'High',
    Medium = 'Medium',
    Low = 'Low',
}

export interface EvaluationFinding {
  research_question: string;
  related_findings_or_evidence: string;
  relevance: Relevance;
  brief_evaluation: string;
}

export interface Keyword {
    keyword: string;
    importance: number;
}

export interface AnalysisResult {
  structured_summary: StructuredSummary;
  evaluation_of_findings: EvaluationFinding[];
  overall_relevance_summary: string;
  extracted_keywords: Keyword[];
}
