import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  GitFork,
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
  onRunFullResearch?: (provider: string) => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  result,
  checklistState,
  onToggleSubStep,
  onSelectAllSubSteps,
  onRunFullResearch,
}) => {
  const workflowData = result.json?.workflow;
  const provider = result.provider || '';

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

  const visibleSteps = useMemo(() => {
    if (!graph) return [];
    if (!activeScenario || activeScenario.id === 'scope-all') return graph.allSteps;
    return graph.allSteps.filter((s) => activeScenario.applicableStepIds.includes(String(s.id)));
  }, [graph, activeScenario]);

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

  const handleToggleSubStepWrapper = (itemKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onToggleSubStep(itemKey);

    if (scenarioStats.totalSubSteps > 0 && scenarioStats.completedSubSteps + 1 === scenarioStats.totalSubSteps) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1e40af', '#2563eb', '#60a5fa', '#ffffff', '#cbd5e1'],
      });
    }
  };

  if (!workflowData || !graph || graph.allSteps.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-black rounded-2xl p-8 sm:p-12 border border-neutral-800 text-center space-y-4">
        <GitFork className="w-12 h-12 text-neutral-600 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-neutral-200">
            {result.status === 'dry_run' ? 'Dry Run Preview: Workflow Not Generated' : 'No Structured Workflow Steps Found'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {result.status === 'dry_run'
              ? 'This was a dry-run discovery job. Tavily mapped official documentation pages, but model reasoning and step synthesis require running a full research job.'
              : 'The pipeline did not extract structured workflow steps for this provider.'}
          </p>
        </div>

        {result.status === 'dry_run' && onRunFullResearch && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onRunFullResearch(result.provider)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-navy-700 to-navy-600 hover:from-navy-600 hover:to-navy-500 text-white border border-navy-500/40 shadow-lg shadow-navy-950 transition-all"
            >
              <Sparkles className="w-4 h-4 text-navy-300" />
              <span>Run Full Research for {result.provider}</span>
            </button>
          </div>
        )}
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
      <div className="bg-black rounded-2xl p-5 border border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Track Implementation Progress</span>
            {scenarioStats.percent === 100 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-navy-950 text-navy-300 font-bold border border-navy-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-navy-400" /> All Done!
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Check off sub-steps as you set up OAuth in the provider console
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-72">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-neutral-400">
                {scenarioStats.completedSubSteps} of {scenarioStats.totalSubSteps} tasks
              </span>
              <span className="text-navy-300 font-bold">{scenarioStats.percent}%</span>
            </div>
            <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
              <div
                className={`h-full transition-all duration-500 ${
                  scenarioStats.percent === 100 ? 'bg-navy-400' : 'bg-gradient-to-r from-navy-600 via-navy-500 to-navy-400'
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
          const activeLevelNodes = levelNodes.filter((n) =>
            visibleSteps.some((s) => String(s.id) === String(n.step.id))
          );

          if (activeLevelNodes.length === 0) return null;

          const isBranchingLevel = activeLevelNodes.length > 1;

          return (
            <div key={lvlIdx} className="space-y-4 relative">
              {/* Branch indicator header */}
              <div className="flex items-center gap-3">
                <div className="h-px bg-neutral-850 flex-1" />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-400 font-mono">
                  {isBranchingLevel ? (
                    <>
                      <GitFork className="w-3.5 h-3.5 text-navy-400" />
                      <span>Stage {lvlIdx + 1}: Branched Paths ({activeLevelNodes.length} Options)</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5 text-navy-400" />
                      <span>Stage {lvlIdx + 1}: Sequential Step</span>
                    </>
                  )}
                </div>
                <div className="h-px bg-neutral-850 flex-1" />
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
                  <div className="w-7 h-7 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-500 shadow-md">
                    <ArrowDown className="w-3.5 h-3.5 text-navy-400/80" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Card Zoomed-in Modal */}
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
