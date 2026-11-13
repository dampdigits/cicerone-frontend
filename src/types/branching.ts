import { WorkflowStep } from './research';

export type ScenarioType = 'service' | 'alternative' | 'scope';

export interface WorkflowScenario {
  id: string;
  title: string;
  description: string;
  type: ScenarioType;
  badge: string;
  icon?: string;
  applicableStepIds: string[];
  isDefault?: boolean;
}

export interface BranchNode {
  step: WorkflowStep;
  level: number;
  scenarioIds: string[];
  branchLabel?: string;
  isFork: boolean;
  isMerge: boolean;
  parentIds: string[];
  childIds: string[];
}

export interface BranchGroup {
  id: string;
  title: string;
  description?: string;
  type: 'fork' | 'sequence' | 'merge';
  nodes: BranchNode[];
}

export interface ParsedWorkflowGraph {
  allSteps: WorkflowStep[];
  nodes: Map<string, BranchNode>;
  scenarios: WorkflowScenario[];
  levels: BranchNode[][];
  maxLevel: number;
}
