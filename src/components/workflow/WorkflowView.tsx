import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  GitFork,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { parseWorkflowGraph } from '../../services/workflowParser';
import { PipelineResult, WorkflowStep } from '../../types/research';
import { ScenarioFilter } from './ScenarioFilter';
import { StepCard } from './StepCard';
import { ZoomedStepModal } from './ZoomedStepModal';

interface WorkflowViewProps {
  result: PipelineResult;
  checklistState: Record<string, boolean>;
  onToggleSubStep: (itemKey: string) => void;
  onSelectAllSubSteps: (stepId: string, value: boolean) => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  result,
  checklistState,
  onToggleSubStep,
  onSelectAllSubSteps,
}) => {
  const workflowData = result.json?.workflow;
  const provider = result.provider || '';

  // Parse workflow graph with branching detection
  const graph = useMemo(() => {
    if (!workflowData) return null;
    return parseWorkflowGraph(workflowData, provider);
  }, [workflowData, provider]);

  const [activeScenarioId, setActiveScenarioId] = useState<string>('scope-all');
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  const activeScenario = useMemo(() => {
    if (!graph) return undefined;
    return graph.scenarios.find((s) => s.id === activeScenarioId) || graph.scenarios[0];
  }, [graph, activeScenarioId]);

  // Steps filtered by active scenario
  const visibleSteps = useMemo(() => {
    if (!graph) return [];
    if (!activeScenario || activeScenario.id === 'scope-all') return graph.allSteps;
    return graph.allSteps.filter((s) => activeScenario.applicableStepIds.includes(String(s.id)));
  }, [graph, activeScenario]);

  // Calculate completion percentage for the current scenario
  const scenarioStats = useMemo(() => {
    let totalSubSteps = 0;
    let completedSubSteps = 0;

    visibleSteps.forEach((s) => {
      const subs = s.sub_steps || [];
      totalSubSteps += subs.length;
      subs.forEach((_, idx) => {
        if (checklistState[`${s.id}-${idx}`]) {
          completedSubSteps++;
        }
      });
    });

    const percent = totalSubSteps > 0 ? Math.round((completedSubSteps / totalSubSteps) * 100) : 0;
    return { totalSubSteps, completedSubSteps, percent };
  }, [visibleSteps, checklistState]);

  // Trigger celebration confetti when 100% is reached
  const handleToggleSubStepWrapper = (itemKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onToggleSubStep(itemKey);

    // If this toggle completes the workflow, launch confetti
    if (scenarioStats.totalSubSteps > 0 && scenarioStats.completedSubSteps + 1 === scenarioStats.totalSubSteps) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  if (!workflowData || !graph || graph.allSteps.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto glass-panel rounded-2xl p-8 border border-slate-800 text-center">
        <GitFork className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-300">No Structured Workflow Steps Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          {result.status === 'dry_run'
            ? 'This was a dry-run discovery job. Model synthesis of workflow steps is performed during full runs.'
            : 'The pipeline did not extract structured workflow steps for this provider.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Scenario & Branch Selector */}
      <ScenarioFilter
        scenarios={graph.scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={setActiveScenarioId}
        activeScenario={activeScenario}
      />

      {/* Progress & Checklist Overview Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Track Implementation Progress</span>
            {scenarioStats.percent === 100 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> All Done!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Check off sub-steps as you set up OAuth in the provider console
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-72">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">
                {scenarioStats.completedSubSteps} of {scenarioStats.totalSubSteps} tasks
              </span>
              <span className="text-brand-400 font-bold">{scenarioStats.percent}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  scenarioStats.percent === 100 ? 'bg-emerald-400' : 'bg-brand-500'
                }`}
                style={{ width: `${scenarioStats.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Workflow DAG Levels & Branching Pipeline Canvas */}
      <div className="space-y-8 relative">
        {graph.levels.map((levelNodes, lvlIdx) => {
          // Filter nodes to those in visibleSteps
          const activeLevelNodes = levelNodes.filter((n) =>
            visibleSteps.some((s) => String(s.id) === String(n.step.id))
          );

          if (activeLevelNodes.length === 0) return null;

          const isBranchingLevel = activeLevelNodes.length > 1;

          return (
            <div key={lvlIdx} className="space-y-4 relative">
              {/* Branch indicator header if level branches into multiple options */}
              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-800 flex-1" />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 font-mono">
                  {isBranchingLevel ? (
                    <>
                      <GitFork className="w-3.5 h-3.5 text-purple-400" />
                      <span>Stage {lvlIdx + 1}: Branched Paths ({activeLevelNodes.length} Options)</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5 text-brand-400" />
                      <span>Stage {lvlIdx + 1}: Sequential Step</span>
                    </>
                  )}
                </div>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              {/* Cards Grid for this level */}
              <div
                className={`grid gap-4 ${
                  activeLevelNodes.length === 1
                    ? 'grid-cols-1 max-w-2xl mx-auto'
                    : activeLevelNodes.length === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {activeLevelNodes.map((node) => (
                  <StepCard
                    key={node.step.id}
                    node={node}
                    step={node.step}
                    checklistState={checklistState}
                    onToggleSubStep={(itemKey, e) => handleToggleSubStepWrapper(itemKey, e)}
                    onSelectStep={setSelectedStep}
                    isFocused={selectedStep?.id === node.step.id}
                  />
                ))}
              </div>

              {/* Downward Connector Arrow to next level */}
              {lvlIdx < graph.levels.length - 1 && (
                <div className="flex justify-center pt-2">
                  <div className="w-7 h-7 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-500 shadow-md">
                    <ArrowDown className="w-3.5 h-3.5 text-brand-400/70" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Card Zoomed-in Modal (Overlay with Framer Motion layoutId) */}
      <ZoomedStepModal
        step={selectedStep}
        onClose={() => setSelectedStep(null)}
        checklistState={checklistState}
        onToggleSubStep={(itemKey) => handleToggleSubStepWrapper(itemKey)}
        onSelectAllSubSteps={onSelectAllSubSteps}
        allSteps={visibleSteps}
        onNavigateStep={setSelectedStep}
        approvals={workflowData.approvals || []}
        roadblocks={workflowData.roadblocks || []}
        dependencies={workflowData.dependencies || []}
      />
    </div>
  );
};
