import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Layers,
  HelpCircle,
  CheckCheck,
} from 'lucide-react';
import { Approval, PrereqDependency, Roadblock, WorkflowStep } from '../../types/research';

interface ZoomedStepModalProps {
  step: WorkflowStep | null;
  onClose: () => void;
  checklistState: Record<string, boolean>;
  onToggleSubStep: (itemKey: string) => void;
  onSelectAllSubSteps: (stepId: string, value: boolean) => void;
  allSteps: WorkflowStep[];
  onNavigateStep: (step: WorkflowStep) => void;
  approvals: Approval[];
  roadblocks: Roadblock[];
  dependencies: PrereqDependency[];
}

export const ZoomedStepModal: React.FC<ZoomedStepModalProps> = ({
  step,
  onClose,
  checklistState,
  onToggleSubStep,
  onSelectAllSubSteps,
  allSteps,
  onNavigateStep,
  approvals,
  roadblocks,
  dependencies,
}) => {
  // Listen for Escape and Left/Right arrow keys
  useEffect(() => {
    if (!step) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        const currentIdx = allSteps.findIndex((s) => String(s.id) === String(step.id));
        if (currentIdx > 0) onNavigateStep(allSteps[currentIdx - 1]);
      } else if (e.key === 'ArrowRight') {
        const currentIdx = allSteps.findIndex((s) => String(s.id) === String(step.id));
        if (currentIdx < allSteps.length - 1) onNavigateStep(allSteps[currentIdx + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, allSteps, onClose, onNavigateStep]);

  if (!step) return null;

  const currentIdx = allSteps.findIndex((s) => String(s.id) === String(step.id));
  const prevStep = currentIdx > 0 ? allSteps[currentIdx - 1] : null;
  const nextStep = currentIdx < allSteps.length - 1 ? allSteps[currentIdx + 1] : null;

  // Filter approvals, roadblocks, dependencies for this step
  const stepApprovals = approvals.filter((a) => String(a.step_id) === String(step.id));
  const stepRoadblocks = roadblocks.filter((r) => String(r.step_id) === String(step.id));
  const stepDependencies = dependencies.filter(
    (d) => String(d.needed_before_step) === String(step.id)
  );

  const subSteps = step.sub_steps || [];
  const completedCount = subSteps.filter((_, idx) => checklistState[`${step.id}-${idx}`]).length;
  const isFullyCompleted = subSteps.length > 0 && completedCount === subSteps.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Zoomed Card Container */}
        <motion.div
          layoutId={`step-card-${step.id}`}
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-mono font-bold text-sm">
                    #{step.id}
                  </span>

                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      step.required_for === 'production'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {step.required_for === 'production' ? 'Production Gate' : 'Core Setup'}
                  </span>

                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                      step.basis === 'verified'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                        : 'bg-blue-950/40 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {step.basis === 'verified' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span className="capitalize">{step.basis} from Docs</span>
                  </span>

                  {step.depends_on && step.depends_on.length > 0 && (
                    <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Depends on: #{step.depends_on.join(', #')}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {step.title}
                </h3>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Checklist Section */}
            <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-5 h-5 text-brand-400" />
                  <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
                    Interactive Checklist ({completedCount}/{subSteps.length})
                  </h4>
                </div>
                {subSteps.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectAllSubSteps(step.id, !isFullyCompleted)}
                      className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                    >
                      {isFullyCompleted ? 'Uncheck all' : 'Mark all done'}
                    </button>
                  </div>
                )}
              </div>

              {subSteps.length > 0 ? (
                <div className="space-y-2.5">
                  {subSteps.map((sub, idx) => {
                    const itemKey = `${step.id}-${idx}`;
                    const checked = Boolean(checklistState[itemKey]);

                    return (
                      <div
                        key={idx}
                        onClick={() => onToggleSubStep(itemKey)}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          checked
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 shrink-0 transition-transform active:scale-90"
                        >
                          {checked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                        <span className={`text-sm leading-relaxed ${checked ? 'line-through' : ''}`}>
                          {sub}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No specific sub-steps enumerated for this step.</p>
              )}
            </div>

            {/* Time & Reasoning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Time Estimate</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {step.estimated_minutes
                    ? `${step.estimated_minutes.min === step.estimated_minutes.max ? step.estimated_minutes.min : `${step.estimated_minutes.min} – ${step.estimated_minutes.max}`} minutes`
                    : 'Not specified'}
                </div>
                <div className="text-xs text-slate-400 mt-1 capitalize">
                  Basis: <span className="font-medium text-slate-300">{step.time_basis}</span>
                </div>
                {step.time_reasoning && (
                  <p className="text-xs text-slate-400 mt-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    {step.time_reasoning}
                  </p>
                )}
              </div>

              {/* Dependencies needed before this step */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Pre-requisites</span>
                </div>
                {stepDependencies.length > 0 ? (
                  <div className="space-y-2">
                    {stepDependencies.map((dep, idx) => (
                      <div key={idx} className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        {dep.type && <span className="font-bold text-purple-400 mr-1">[{dep.type}]</span>}
                        {dep.description}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No external pre-requisites flagged before this step.</p>
                )}
              </div>
            </div>

            {/* Approvals if any */}
            {stepApprovals.length > 0 && (
              <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Associated Approvals & Review Gates</span>
                </div>
                <div className="space-y-3">
                  {stepApprovals.map((appr, idx) => (
                    <div key={idx} className="bg-slate-900/90 p-3 rounded-lg border border-purple-500/20 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{appr.name}</span>
                        <span className="text-purple-400 font-mono">
                          Wait: {appr.wait_days ? `${appr.wait_days.min}–${appr.wait_days.max} days` : 'Immediate'}
                        </span>
                      </div>
                      {appr.approver && (
                        <div className="text-slate-400">
                          Approver: <strong className="text-slate-200">{appr.approver}</strong> ({appr.required})
                        </div>
                      )}
                      {appr.condition && <div className="text-slate-400 italic">Condition: {appr.condition}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roadblocks if any */}
            {stepRoadblocks.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Known Roadblocks & Mitigations</span>
                </div>
                <div className="space-y-3">
                  {stepRoadblocks.map((rb, idx) => (
                    <div key={idx} className="bg-slate-900/90 p-3 rounded-lg border border-amber-500/20 text-xs space-y-2">
                      <div className="text-amber-200 font-medium">{rb.description}</div>
                      {rb.mitigation && (
                        <div className="bg-slate-950/60 p-2.5 rounded text-slate-300 border border-slate-800">
                          <strong className="text-emerald-400 block mb-1">Mitigation:</strong>
                          {rb.mitigation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Sources & Verbatim Quotes */}
            {step.sources && step.sources.length > 0 && (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  <FileCheck className="w-4 h-4 text-brand-400" />
                  <span>Verified Evidence from Official Documentation</span>
                </div>
                <div className="space-y-3">
                  {step.sources.map((src, idx) => (
                    <div key={idx} className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-400 hover:text-brand-300 font-mono text-[11px] flex items-center gap-1.5 break-all"
                      >
                        <span>{src.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      {src.quote && (
                        <blockquote className="border-l-2 border-brand-500 pl-3 py-1 text-slate-300 italic bg-slate-950/50 rounded-r">
                          "{src.quote}"
                        </blockquote>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
            <button
              onClick={() => prevStep && onNavigateStep(prevStep)}
              disabled={!prevStep}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                prevStep
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <span className="text-xs text-slate-500 font-mono">
              Step {currentIdx + 1} of {allSteps.length}
            </span>

            <button
              onClick={() => nextStep && onNavigateStep(nextStep)}
              disabled={!nextStep}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                nextStep
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
              }`}
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
