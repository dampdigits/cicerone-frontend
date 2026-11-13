import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  History,
  Trash2,
  Calendar,
  Layers,
  Star,
  ChevronRight,
} from 'lucide-react';
import { SavedResearchSession } from '../types/research';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SavedResearchSession[];
  onSelectSession: (session: SavedResearchSession) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-md bg-black border-l border-neutral-800 h-full shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-black/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-950 border border-navy-800 flex items-center justify-center text-navy-400">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Research History</h3>
                <p className="text-xs text-neutral-400">Stored in browser local storage</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-16 px-4">
                <History className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-neutral-400">No past research runs yet</p>
                <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto">
                  When you initiate OAuth research for a provider, the results will automatically be stored here.
                </p>
              </div>
            ) : (
              sessions.map((session) => {
                const json = session.result.json;
                const workflow = json?.workflow;
                const difficulty = workflow?.difficulty;
                const stepCount = workflow?.workflow?.length || 0;

                return (
                  <div
                    key={session.id}
                    className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 hover:border-navy-500/50 transition-all flex flex-col justify-between gap-3 group relative cursor-pointer"
                    onClick={() => {
                      onSelectSession(session);
                      onClose();
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-bold text-sm text-white capitalize flex items-center gap-2">
                          <span>{session.provider}</span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full uppercase font-bold border ${
                              session.result.status === 'completed'
                                ? 'bg-navy-950 text-navy-300 border-navy-800'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                            }`}
                          >
                            {session.result.status}
                          </span>
                        </h4>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-all"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          <span>{formatDate(session.timestamp)}</span>
                        </span>

                        {stepCount > 0 && (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Layers className="w-3 h-3 text-navy-400" />
                            <span>{stepCount} steps</span>
                          </span>
                        )}

                        {difficulty?.score && (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-navy-300">
                            <Star className="w-3 h-3 fill-navy-400 text-navy-400" />
                            <span>{difficulty.score}/5</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-xs text-navy-400 font-medium">
                      <span>Click to view guide & workflow</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Clear All */}
          {sessions.length > 0 && (
            <div className="p-4 border-t border-neutral-800 bg-black flex items-center justify-between">
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>

              <span className="text-xs text-neutral-500 font-mono">
                {sessions.length} saved {sessions.length === 1 ? 'run' : 'runs'}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
