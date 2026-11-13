import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Clock, AlertTriangle, ShieldCheck, FileSearch, Layers, Sparkles, XCircle } from 'lucide-react';
import { JobStatusResponse } from '../types/research';

const PIPELINE_STAGES = [
  { key: 'resolving', label: 'Resolving Config', icon: ShieldCheck, desc: 'Verifying official domains & seeds' },
  { key: 'discovering', label: 'Discovering URLs', icon: FileSearch, desc: 'Tavily search & domain site mapping' },
  { key: 'extracting', label: 'Extracting Docs', icon: Layers, desc: 'Fetching full documentation page text' },
  { key: 'analyzing topics', label: 'Analyzing Topics', icon: Sparkles, desc: 'Evidence verification across 9 OAuth topics' },
  { key: 'building workflow', label: 'Building Workflow', icon: CheckCircle2, desc: 'Synthesizing steps, branching & totals' },
];

interface JobProgressProps {
  job: JobStatusResponse;
  onCancel?: () => void;
}

export const JobProgress: React.FC<JobProgressProps> = ({ job, onCancel }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentStageKey = (job.stage || '').toLowerCase();
  const currentStageIndex = PIPELINE_STAGES.findIndex(
    (s) => s.key.toLowerCase() === currentStageKey
  );

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-brand-500/30 relative overflow-hidden animate-fadeIn">
      {/* Ambient background pulsing glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-blue-500/5 to-purple-500/5 animate-pulse pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">
                  Researching {job.provider || 'Provider'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {job.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Job ID: <code className="font-mono text-slate-300">{job.job_id}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Elapsed: {formatTime(elapsedSeconds)}</span>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                title="Stop tracking this job"
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Current Stage detail banner */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Activity
            </div>
            <div className="text-sm font-medium text-slate-200 mt-0.5 capitalize flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping inline-block" />
              <span>{job.stage || 'Preparing pipeline...'}</span>
            </div>
          </div>
          {job.stage_detail && (
            <div className="text-xs font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg text-brand-300 border border-brand-500/20">
              {job.stage_detail}
            </div>
          )}
        </div>

        {/* Stage Progress Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx || (currentStageIndex === -1 && idx === 0);
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-brand-950/40 border-brand-500/50 shadow-md shadow-brand-500/10'
                    : isCompleted
                    ? 'bg-slate-900/60 border-slate-700/80 text-slate-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isCurrent
                        ? 'bg-brand-500 text-slate-950 font-bold'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <Icon
                    className={`w-4 h-4 ${
                      isCurrent ? 'text-brand-400' : isCompleted ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  />
                </div>
                <div className="font-semibold text-xs truncate text-slate-200">{stage.label}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{stage.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Error warning if any */}
        {job.error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{job.error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
