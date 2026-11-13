import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  GitBranch,
  GitMerge,
  Maximize2,
} from 'lucide-react';
import { BranchNode } from '../../types/branching';
import { WorkflowStep } from '../../types/research';

interface StepCardProps {
  node: BranchNode;
  step: WorkflowStep;
  checklistState: Record<string, boolean>;
  onToggleSubStep: (itemKey: string, e: React.MouseEvent) => void;
  onSelectStep: (step: WorkflowStep) => void;
  isFocused?: boolean;
}

export const StepCard: React.FC<StepCardProps> = ({
  node,
  step,
  checklistState,
  onToggleSubStep,
  onSelectStep,
  isFocused = false,
}) => {
  const subSteps = step.sub_steps || [];
  const completedCount = subSteps.filter((_, idx) => checklistState[`${step.id}-${idx}`]).length;
  const isFullyCompleted = subSteps.length > 0 && completedCount === subSteps.length;
  const progressPercent = subSteps.length > 0 ? Math.round((completedCount / subSteps.length) * 100) : 0;

  // Format time
  const timeStr = step.estimated_minutes
    ? `${step.estimated_minutes.min === step.estimated_minutes.max ? step.estimated_minutes.min : `${step.estimated_minutes.min}-${step.estimated_minutes.max}`}m`
    : null;

  return (
    <motion.div
      layoutId={`step-card-${step.id}`}
      onClick={() => onSelectStep(step)}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl p-5 border transition-all cursor-pointer relative group flex flex-col justify-between ${
        isFullyCompleted
          ? 'border-navy-600/60 bg-navy-950/40 shadow-navy-950/50 shadow-lg'
          : isFocused
          ? 'border-navy-500 ring-2 ring-navy-500/30 bg-neutral-950'
          : 'bg-neutral-950 border-neutral-800 hover:border-navy-500/50 hover:shadow-xl hover:shadow-navy-950/50'
      }`}
    >
      <div>
        {/* Card Header: Step ID, Branch Badges & Zoom Icon */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono border ${
                isFullyCompleted
                  ? 'bg-navy-600 text-white border-navy-500'
                  : 'bg-black text-navy-300 border-neutral-800'
              }`}
            >
              {isFullyCompleted ? <CheckCircle2 className="w-4 h-4" /> : `#${step.id}`}
            </span>

            {/* Scope Badge */}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                step.required_for === 'production'
                  ? 'bg-neutral-900 text-neutral-300 border-neutral-700'
                  : 'bg-navy-950 text-navy-300 border-navy-800'
              }`}
            >
              {step.required_for === 'production' ? 'Production Gate' : 'Core Setup'}
            </span>

            {/* Basis Badge */}
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                step.basis === 'verified'
                  ? 'bg-navy-950 text-navy-300 border-navy-800'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
              }`}
            >
              {step.basis === 'verified' ? (
                <ShieldCheck className="w-3 h-3 text-navy-400" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-neutral-400" />
              )}
              <span className="capitalize">{step.basis}</span>
            </span>
          </div>

          {/* Zoom hint icon */}
          <div className="opacity-40 group-hover:opacity-100 transition-opacity p-1 text-navy-400">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Branch / Scenario annotation tag if present */}
        {node.branchLabel && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-navy-900/80 text-navy-200 border border-navy-700">
              <GitBranch className="w-3 h-3 text-navy-400" />
              <span>{node.branchLabel}</span>
            </span>
          </div>
        )}

        {/* Step Title */}
        <h4 className="text-base font-bold text-white group-hover:text-navy-300 transition-colors line-clamp-2 mb-2">
          {step.title}
        </h4>

        {/* Sub-steps Checklist Mini-Progress */}
        {subSteps.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-medium">Checklist Tasks</span>
              <span className="font-mono text-navy-300 font-bold">
                {completedCount}/{subSteps.length} ({progressPercent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isFullyCompleted ? 'bg-navy-400' : 'bg-navy-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick interactive preview of up to 2 sub-steps */}
            <div className="space-y-1.5 pt-1">
              {subSteps.slice(0, 2).map((sub, idx) => {
                const itemKey = `${step.id}-${idx}`;
                const checked = Boolean(checklistState[itemKey]);

                return (
                  <div
                    key={idx}
                    onClick={(e) => onToggleSubStep(itemKey, e)}
                    className="flex items-start gap-2 text-xs text-neutral-300 hover:text-white p-1 rounded hover:bg-neutral-900/60 transition-colors"
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-neutral-400 hover:text-navy-400"
                    >
                      {checked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-navy-400" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-neutral-600" />
                      )}
                    </button>
                    <span className={`line-clamp-1 ${checked ? 'line-through text-neutral-500' : ''}`}>
                      {sub}
                    </span>
                  </div>
                );
              })}
              {subSteps.length > 2 && (
                <div className="text-[11px] text-neutral-500 italic pl-5">
                  +{subSteps.length - 2} more tasks (click card to view all)
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Estimated time & Fork/Merge Indicators */}
      <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          {timeStr && (
            <span className="flex items-center gap-1 text-neutral-300 font-mono bg-black px-2 py-0.5 rounded border border-neutral-800">
              <Clock className="w-3 h-3 text-navy-400" />
              <span>{timeStr}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {node.isFork && (
            <span
              className="flex items-center gap-1 text-[11px] text-navy-300 font-medium"
              title="Branches into multiple alternative or service steps"
            >
              <GitBranch className="w-3 h-3 text-navy-400" />
              <span>Fork ({node.childIds.length})</span>
            </span>
          )}
          {node.isMerge && (
            <span
              className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium"
              title="Merges from prior branches"
            >
              <GitMerge className="w-3 h-3 text-neutral-400" />
              <span>Merge</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
