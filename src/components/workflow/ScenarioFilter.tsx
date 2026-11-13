import React from 'react';
import { Filter } from 'lucide-react';
import { WorkflowScenario } from '../../types/branching';

interface ScenarioFilterProps {
  scenarios: WorkflowScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  activeScenario: WorkflowScenario | undefined;
}

export const ScenarioFilter: React.FC<ScenarioFilterProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  activeScenario,
}) => {
  if (scenarios.length <= 1) return null;

  return (
    <div className="bg-neutral-950 rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-lg space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-navy-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Workflow Scenarios & Branch Tracks
          </span>
        </div>
        <span className="text-xs text-neutral-500">
          Select a scenario to isolate its specific path, services, or protocols
        </span>
      </div>

      {/* Scenario Pill Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        {scenarios.map((sc) => {
          const isActive = sc.id === activeScenarioId;

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-navy-600 text-white border-navy-500 shadow-md shadow-navy-950 font-bold'
                  : 'bg-black text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive
                    ? 'bg-navy-950 text-navy-200'
                    : 'bg-neutral-900 text-neutral-400'
                }`}
              >
                {sc.badge}
              </span>
              <span>{sc.title}</span>
              <span className="text-[10px] opacity-70 font-mono">
                ({sc.applicableStepIds.length} steps)
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Explanatory Banner */}
      {activeScenario && (
        <div className="mt-2 p-3 rounded-xl bg-navy-950/60 border border-navy-800/80 text-xs flex items-center justify-between gap-4">
          <div className="text-neutral-300">
            <strong className="text-navy-300 mr-1.5">{activeScenario.title}:</strong>
            <span>{activeScenario.description}</span>
          </div>
          <span className="shrink-0 text-[11px] font-mono text-neutral-500">
            {activeScenario.applicableStepIds.length} steps in this track
          </span>
        </div>
      )}
    </div>
  );
};
