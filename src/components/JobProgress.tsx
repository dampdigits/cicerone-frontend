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
    <div className="w-full max-w-4xl mx-auto bg-black rounded-2xl p-6 sm:p-8 shadow-2xl border border-navy-800/80 relative overflow-hidden animate-fadeIn">
      {/* Ambient background pulsing navy glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/40 via-navy-900/30 to-black animate-pulse pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-950 border border-navy-700 flex items-center justify-center text-navy-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">
                  Researching {job.provider || 'Provider'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-navy-950 text-navy-300 border border-navy-800">
                  {job.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Job ID: <code className="font-mono text-neutral-300">{job.job_id}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-mono bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
              <Clock className="w-3.5 h-3.5 text-navy-400" />
              <span>Elapsed: {formatTime(elapsedSeconds)}</span>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                title="Stop tracking this job"
                className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Current Activity detail banner */}
        <div className="bg-neutral-950/90 rounded-xl p-4 border border-neutral-800 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Current Activity
            </div>
            <div className="text-sm font-medium text-neutral-200 mt-0.5 capitalize flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-navy-400 animate-ping inline-block" />
              <span>{job.stage || 'Preparing pipeline...'}</span>
            </div>
          </div>
          {job.stage_detail && (
            <div className="text-xs font-mono bg-black px-3 py-1.5 rounded-lg text-navy-300 border border-navy-800">
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
                    ? 'bg-navy-950/90 border-navy-500/80 shadow-md shadow-navy-950'
                    : isCompleted
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
                    : 'bg-black/60 border-neutral-900 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isCurrent
                        ? 'bg-navy-600 text-white font-bold'
                        : isCompleted
                        ? 'bg-navy-950 text-navy-300 border border-navy-800'
                        : 'bg-neutral-900 text-neutral-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-navy-300" /> : idx + 1}
                  </div>
                  <Icon
                    className={`w-4 h-4 ${
                      isCurrent ? 'text-navy-300' : isCompleted ? 'text-neutral-400' : 'text-neutral-600'
                    }`}
                  />
                </div>
                <div className="font-semibold text-xs truncate text-white">{stage.label}</div>
                <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{stage.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Error warning if any */}
        {job.error && (
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{job.error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
