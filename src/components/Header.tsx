import React, { useEffect, useState } from 'react';
import { Compass, History, RefreshCw, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { checkBackendHealth } from '../services/api';
import { ENV } from '../config/env';

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

  const getBackendHost = () => {
    try {
      return new URL(ENV.backendDomainUrl).host;
    } catch {
      return ENV.backendDomainUrl || 'backend';
    }
  };

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 border border-navy-700/80 flex items-center justify-center shadow-lg shadow-navy-950 text-navy-300">
            <Compass className="w-6 h-6 stroke-[2.2] text-navy-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Cicerone
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-navy-950 text-navy-300 border border-navy-800">
                OAuth Research
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
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
                ? 'bg-navy-950/80 text-navy-300 border-navy-800 hover:bg-navy-900/60'
                : backendStatus === 'offline'
                ? 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-850'
                : 'bg-black text-neutral-500 border-neutral-900'
            }`}
          >
            {backendStatus === 'online' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-navy-400" />
            ) : backendStatus === 'offline' ? (
              <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-500" />
            )}
            <span>{backendStatus === 'online' ? 'Backend Online' : backendStatus === 'offline' ? `Backend Offline (${getBackendHost()})` : 'Checking...'}</span>
          </button>

          {/* New Research Action */}
          {hasResult && (
            <button
              onClick={onNewResearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-all shadow-md shadow-white/5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Run</span>
            </button>
          )}

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-950 hover:bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-700 transition-all relative"
          >
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-navy-900 text-navy-300 border border-navy-700 text-[10px] flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
