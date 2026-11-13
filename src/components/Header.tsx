import React, { useEffect, useState } from 'react';
import { Compass, History, RefreshCw, PlusCircle, CheckCircle2, AlertCircle, FileJson } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
  onNewResearch: () => void;
  hasResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  historyCount,
  onNewResearch,
  hasResult,
}) => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [statusDetail, setStatusDetail] = useState<string>('');

  const pingBackend = async () => {
    setBackendStatus('checking');
    const health = await checkBackendHealth();
    if (health.ok) {
      setBackendStatus('online');
      setStatusDetail('Django API ready');
    } else {
      setBackendStatus('offline');
      setStatusDetail(health.statusText || 'Offline');
    }
  };

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-slate-950">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Cicerone
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                OAuth Research
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Evidence-backed OAuth application setup guides
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Backend Status indicator */}
          <button
            onClick={pingBackend}
            title={`Backend Status: ${statusDetail}. Click to re-check.`}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              backendStatus === 'online'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40'
                : backendStatus === 'offline'
                ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 hover:bg-amber-900/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {backendStatus === 'online' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : backendStatus === 'offline' ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
            )}
            <span>{backendStatus === 'online' ? 'Backend Online' : backendStatus === 'offline' ? 'Backend Offline (port 8000)' : 'Checking...'}</span>
          </button>

          {/* New Research Action */}
          {hasResult && (
            <button
              onClick={onNewResearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold transition-all shadow-md shadow-brand-500/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Run</span>
            </button>
          )}

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all hover:border-slate-700 relative"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
