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
  AlertCircle,
  HelpCircle,
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
      className={`glass-panel rounded-2xl p-5 border transition-all cursor-pointer relative group flex flex-col justify-between ${
        isFullyCompleted
          ? 'border-emerald-500/40 bg-emerald-950/20 shadow-emerald-950/20 shadow-lg'
          : isFocused
          ? 'border-brand-500 ring-2 ring-brand-500/30'
          : 'border-slate-800 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10'
      }`}
    >
      <div>
        {/* Card Header: Step ID, Branch Badges & Zoom Icon */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono border ${
                isFullyCompleted
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 text-brand-400 border-slate-700'
              }`}
            >
              {isFullyCompleted ? <CheckCircle2 className="w-4 h-4" /> : `#${step.id}`}
            </span>

            {/* Scope Badge */}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                step.required_for === 'production'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {step.required_for === 'production' ? 'Production Gate' : 'Core Setup'}
            </span>

            {/* Basis Badge */}
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                step.basis === 'verified'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : step.basis === 'inferred'
                  ? 'bg-blue-950/40 text-blue-400 border-blue-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {step.basis === 'verified' ? (
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-blue-400" />
              )}
              <span className="capitalize">{step.basis}</span>
            </span>
          </div>

          {/* Zoom hint icon */}
          <div className="opacity-40 group-hover:opacity-100 transition-opacity p-1 text-brand-400">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Branch / Scenario annotation tag if present */}
        {node.branchLabel && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <GitBranch className="w-3 h-3" />
              <span>{node.branchLabel}</span>
            </span>
          </div>
        )}

        {/* Step Title */}
        <h4 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 mb-2">
          {step.title}
        </h4>

        {/* Sub-steps Checklist Mini-Progress */}
        {subSteps.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Checklist Tasks</span>
              <span className="font-mono text-brand-400 font-bold">
                {completedCount}/{subSteps.length} ({progressPercent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isFullyCompleted ? 'bg-emerald-400' : 'bg-brand-500'
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
                    className="flex items-start gap-2 text-xs text-slate-300 hover:text-white p-1 rounded hover:bg-slate-900/60 transition-colors"
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-brand-400"
                    >
                      {checked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>
                    <span className={`line-clamp-1 ${checked ? 'line-through text-slate-500' : ''}`}>
                      {sub}
                    </span>
                  </div>
                );
              })}
              {subSteps.length > 2 && (
                <div className="text-[11px] text-slate-500 italic pl-5">
                  +{subSteps.length - 2} more tasks (click card to view all)
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Estimated time & Fork/Merge Indicators */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          {timeStr && (
            <span className="flex items-center gap-1 text-slate-300 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              <Clock className="w-3 h-3 text-brand-400" />
              <span>{timeStr}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {node.isFork && (
            <span
              className="flex items-center gap-1 text-[11px] text-purple-400 font-medium"
              title="Branches into multiple alternative or service steps"
            >
              <GitBranch className="w-3 h-3" />
              <span>Fork ({node.childIds.length})</span>
            </span>
          )}
          {node.isMerge && (
            <span
              className="flex items-center gap-1 text-[11px] text-blue-400 font-medium"
              title="Merges from prior branches"
            >
              <GitMerge className="w-3 h-3" />
              <span>Merge</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
