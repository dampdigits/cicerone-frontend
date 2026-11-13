import React, { useEffect, useState, useRef } from 'react';
import { Header } from './components/Header';
import { ResearchForm } from './components/ResearchForm';
import { JobProgress } from './components/JobProgress';
import { OutputSwitcher, OutputViewMode } from './components/OutputSwitcher';
import { MarkdownView } from './components/MarkdownView';
import { WorkflowView } from './components/workflow/WorkflowView';
import { HistoryDrawer } from './components/HistoryDrawer';
import {
  startResearchJob,
  getJobStatus,
  ApiError,
} from './services/api';
import {
  getCurrentResult,
  saveCurrentResult,
  getHistory,
  saveSessionToHistory,
  deleteSessionFromHistory,
  clearAllHistory,
  getChecklistState,
  updateChecklistState,
  toggleChecklistItem,
} from './services/storage';
import { SAMPLE_GOOGLE_RESULT } from './services/sampleData';
import {
  JobStatusResponse,
  PipelineResult,
  ResearchRequest,
  SavedResearchSession,
} from './types/research';
import { Compass, Sparkles, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [activeJob, setActiveJob] = useState<JobStatusResponse | null>(null);
  const [activeView, setActiveView] = useState<OutputViewMode>('workflow');
  const [history, setHistory] = useState<SavedResearchSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize from client-side storage
  useEffect(() => {
    const saved = getCurrentResult();
    if (saved) {
      setResult(saved);
      const sessionKey = saved.provider || 'current';
      setChecklistState(getChecklistState(sessionKey));
    }
    setHistory(getHistory());
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  // Submit new research
  const handleStartResearch = async (payload: ResearchRequest) => {
    setErrorBanner(null);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

    try {
      // 1. Initiate job
      const accepted = await startResearchJob(payload);

      const initialJobStatus: JobStatusResponse = {
        job_id: accepted.job_id,
        status: (accepted.status as any) || 'queued',
        provider: payload.provider,
        stage: 'resolving',
        stage_detail: 'Connecting to provider registry...',
        finished: false,
        poll_after_seconds: accepted.poll_after_seconds || 2,
      };

      setActiveJob(initialJobStatus);

      // 2. Begin polling loop
      pollJob(accepted.job_id, payload.provider, accepted.poll_after_seconds || 2);
    } catch (err: any) {
      let msg = err.message || 'Failed to start research run.';
      if (err instanceof ApiError && err.status === 503) {
        msg = `Job queue is currently full. Please retry in ${err.retryAfter || 30} seconds.`;
      }
      setErrorBanner(msg);
      setActiveJob(null);
    }
  };

  // Polling loop
  const pollJob = async (jobId: string, provider: string, pollDelaySec: number) => {
    pollTimeoutRef.current = setTimeout(async () => {
      try {
        const statusRes = await getJobStatus(jobId);
        setActiveJob(statusRes);

        if (!statusRes.finished) {
          // Continue polling
          const nextDelay = statusRes.poll_after_seconds || 3;
          pollJob(jobId, provider, nextDelay);
        } else {
          // Finished!
          if (statusRes.result) {
            handleJobSuccess(jobId, provider, statusRes.result);
          } else if (statusRes.error) {
            setErrorBanner(`Research run failed: ${statusRes.error}`);
            setActiveJob(null);
          } else {
            setErrorBanner(`Job finished with status: ${statusRes.status}`);
            setActiveJob(null);
          }
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        // Retry a couple of times before giving up
        pollJob(jobId, provider, 3);
      }
    }, pollDelaySec * 1000);
  };

  const handleJobSuccess = (jobId: string, provider: string, newResult: PipelineResult) => {
    setResult(newResult);
    setActiveJob(null);
    saveCurrentResult(newResult);

    const initialChecklist: Record<string, boolean> = {};
    setChecklistState(initialChecklist);

    // Save to history drawer
    const session: SavedResearchSession = {
      id: `${jobId}-${Date.now()}`,
      jobId,
      provider: newResult.provider || provider,
      timestamp: Date.now(),
      result: newResult,
      completedSubSteps: initialChecklist,
    };
    saveSessionToHistory(session);
    setHistory(getHistory());
  };

  // Toggle sub-step in checklist
  const handleToggleSubStep = (itemKey: string) => {
    if (!result) return;
    const sessionKey = result.provider || 'current';
    const updated = toggleChecklistItem(sessionKey, itemKey);
    setChecklistState(updated);
  };

  // Select all or unselect all in a step
  const handleSelectAllSubSteps = (stepId: string, value: boolean) => {
    if (!result) return;
    const sessionKey = result.provider || 'current';
    const step = result.json?.workflow?.workflow?.find((s) => String(s.id) === String(stepId));
    if (!step || !step.sub_steps) return;

    const updates: Record<string, boolean> = {};
    step.sub_steps.forEach((_, idx) => {
      updates[`${stepId}-${idx}`] = value;
    });

    const updated = updateChecklistState(sessionKey, updates);
    setChecklistState(updated);
  };

  // Select session from history
  const handleSelectHistorySession = (session: SavedResearchSession) => {
    setResult(session.result);
    saveCurrentResult(session.result);
    const sessionKey = session.result.provider || 'current';
    setChecklistState(getChecklistState(sessionKey));
  };

  const handleDeleteHistorySession = (id: string) => {
    const updated = deleteSessionFromHistory(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  const handleNewResearch = () => {
    setResult(null);
    saveCurrentResult(null);
    setActiveJob(null);
    setErrorBanner(null);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
  };

  const handleLoadSample = (sample: PipelineResult) => {
    setResult(sample);
    saveCurrentResult(sample);
    const sessionKey = sample.provider || 'current';
    setChecklistState(getChecklistState(sessionKey));
    setErrorBanner(null);
  };

  // Calculate total completed sub-steps
  const allSteps = result?.json?.workflow?.workflow || [];
  let totalSubSteps = 0;
  let completedSubSteps = 0;
  allSteps.forEach((s) => {
    const subs = s.sub_steps || [];
    totalSubSteps += subs.length;
    subs.forEach((_, idx) => {
      if (checklistState[`${s.id}-${idx}`]) completedSubSteps++;
    });
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onNewResearch={handleNewResearch}
        hasResult={Boolean(result)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error notification banner */}
        {errorBanner && (
          <div className="w-full max-w-4xl mx-auto p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-xs text-red-300 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Job In-Progress View */}
        {activeJob && (
          <JobProgress
            job={activeJob}
            onCancel={() => {
              if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
              setActiveJob(null);
            }}
          />
        )}

        {/* 2. Research Input Form (Shown when no active job and no result, or on top) */}
        {!activeJob && !result && (
          <div className="space-y-6">
            <ResearchForm
              onSubmit={handleStartResearch}
              isLoading={Boolean(activeJob)}
            />

            {/* Quick Demo Preview Option */}
            <div className="w-full max-w-4xl mx-auto glass-panel rounded-2xl p-5 border border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand-400" />
                  <span>Want to explore the UI immediately?</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Load a pre-synthesized OAuth guide for Google (demonstrating Google Meet vs Drive branching, checklists, and zoom modal).
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleLoadSample(SAMPLE_GOOGLE_RESULT)}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-brand-300 border border-brand-500/30 hover:border-brand-500 transition-all shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Load Google Demo Result</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Output Sections (Switchable between Markdown Guide and Workflow UI) */}
        {!activeJob && result && (
          <div className="space-y-6 animate-fadeIn">
            <OutputSwitcher
              result={result}
              activeView={activeView}
              onViewChange={setActiveView}
              completedSubStepsCount={completedSubSteps}
              totalSubStepsCount={totalSubSteps}
            />

            {activeView === 'workflow' ? (
              <WorkflowView
                result={result}
                checklistState={checklistState}
                onToggleSubStep={handleToggleSubStep}
                onSelectAllSubSteps={handleSelectAllSubSteps}
              />
            ) : (
              <MarkdownView result={result} />
            )}
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={history}
        onSelectSession={handleSelectHistorySession}
        onDeleteSession={handleDeleteHistorySession}
        onClearAll={handleClearHistory}
      />
    </div>
  );
};

export default App;
