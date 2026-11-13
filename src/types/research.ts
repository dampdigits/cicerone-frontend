export interface SourceQuote {
  url: string;
  quote: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  required_for: 'all' | 'production';
  sub_steps: string[];
  depends_on: string[];
  estimated_minutes: { min: number; max: number } | null;
  time_basis: 'verified' | 'estimated';
  time_reasoning: string | null;
  basis: 'verified' | 'inferred' | 'unverified';
  sources: SourceQuote[];
}

export interface Approval {
  name: string;
  approver: string | null;
  required: 'always' | 'conditional';
  condition: string | null;
  step_id: string | null;
  wait_days: { min: number; max: number } | null;
  wait_basis: 'verified' | 'estimated';
  wait_reasoning: string | null;
  basis: string;
  sources: SourceQuote[];
}

export interface Roadblock {
  description: string;
  step_id: string | null;
  mitigation: string | null;
  basis: string;
  sources: SourceQuote[];
}

export interface PrereqDependency {
  type: string | null;
  description: string;
  needed_before_step: string | null;
  basis: string;
  sources: SourceQuote[];
}

export interface DifficultyRating {
  score: number | null;
  label: string | null;
  reasoning: string | null;
  factors: string[];
  basis: string;
}

export interface WorkflowTotals {
  approvals_required: {
    always: number;
    conditional: number;
    total: number;
  };
  active_time_minutes: {
    minimum_setup: { min: number; max: number; steps_with_estimate: number; steps_total: number };
    full_production: { min: number; max: number; steps_with_estimate: number; steps_total: number };
  };
  approval_wait_days: {
    always_required: { min: number; max: number; approvals_with_estimate: number; approvals_total: number };
    if_all_conditional_apply: { min: number; max: number; approvals_with_estimate: number; approvals_total: number };
  };
  note?: string;
}

export interface WorkflowData {
  workflow: WorkflowStep[];
  approvals: Approval[];
  difficulty: DifficultyRating;
  roadblocks: Roadblock[];
  dependencies: PrereqDependency[];
  gaps: string[];
  totals?: WorkflowTotals;
}

export interface ExtractedPage {
  url: string;
  title?: string;
  chars?: number;
  sha256?: string;
  last_updated_hint?: string;
}

export interface PipelineJson {
  provider: string;
  slug?: string;
  display_name?: string;
  status: string;
  model?: string;
  retrieved_at?: string;
  auto_detected?: boolean;
  config?: {
    domains: string[];
    seeds: string[];
    select_paths: string[];
    exclude_paths: string[];
    domain_source?: string;
  };
  source_urls?: string[];
  discovery?: {
    candidates: number;
    rejected_offdomain: number;
    selected: number;
  };
  pages?: ExtractedPage[];
  workflow?: WorkflowData;
  totals?: WorkflowTotals;
  facts?: {
    topics?: Record<string, any>;
    gaps?: string[];
  };
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  errors?: string[];
  warnings?: string[];
  markdown?: string;
}

export interface PipelineResult {
  status: 'completed' | 'partial' | 'failed' | 'dry_run';
  provider: string;
  json?: PipelineJson;
  markdown?: string;
  errors?: string[];
  warnings?: string[];
}

export interface ResearchRequest {
  provider: string;
  doc_url?: string;
  domains?: string[];
  seeds?: string[];
  select_paths?: string[];
  exclude_paths?: string[];
  max_urls?: number;
  dry_run?: boolean;
}

export interface JobAcceptedResponse {
  job_id: string;
  status: string;
  poll_after_seconds: number;
  message: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'partial' | 'failed' | 'dry_run';
  provider?: string;
  stage?: string;
  stage_detail?: string;
  finished: boolean;
  poll_after_seconds?: number;
  error?: string;
  result?: PipelineResult;
}

export interface SavedResearchSession {
  id: string;
  jobId: string;
  provider: string;
  timestamp: number;
  result: PipelineResult;
  completedSubSteps: Record<string, boolean>; // key: `${stepId}-${subStepIdx}`
  selectedScenarioId?: string;
}
