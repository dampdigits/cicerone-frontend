import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings2,
  Globe,
  Sliders,
  FileCode,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { ResearchRequest } from '../types/research';

const POPULAR_PROVIDERS = [
  { name: 'GitHub', docUrl: 'https://docs.github.com/en/apps/oauth-apps' },
  { name: 'Google', docUrl: 'https://developers.google.com/identity/protocols/oauth2' },
  { name: 'Slack', docUrl: 'https://api.slack.com/authentication/oauth-v2' },
  { name: 'Microsoft', docUrl: 'https://learn.microsoft.com/en-us/entra/identity-platform/' },
  { name: 'Discord', docUrl: 'https://discord.com/developers/docs/topics/oauth2' },
  { name: 'Spotify', docUrl: 'https://developer.spotify.com/documentation/web-api/concepts/authorization' },
  { name: 'GitLab', docUrl: 'https://docs.gitlab.com/ee/integration/oauth_provider.html' },
  { name: 'Atlassian', docUrl: 'https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/' },
];

interface ResearchFormProps {
  onSubmit: (payload: ResearchRequest) => void;
  isLoading: boolean;
}

export const ResearchForm: React.FC<ResearchFormProps> = ({ onSubmit, isLoading }) => {
  const [provider, setProvider] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [domains, setDomains] = useState('');
  const [seeds, setSeeds] = useState('');
  const [selectPaths, setSelectPaths] = useState('');
  const [excludePaths, setExcludePaths] = useState('');
  const [maxUrls, setMaxUrls] = useState<number>(30);
  const [dryRun, setDryRun] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickSelect = (p: { name: string; docUrl: string }) => {
    setProvider(p.name);
    setDocUrl(p.docUrl);
    setErrorMsg('');
  };

  const handleReset = () => {
    setProvider('');
    setDocUrl('');
    setDomains('');
    setSeeds('');
    setSelectPaths('');
    setExcludePaths('');
    setMaxUrls(30);
    setDryRun(false);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanProvider = provider.trim();
    if (!cleanProvider) {
      setErrorMsg('Please enter an OAuth provider name.');
      return;
    }

    if (cleanProvider.length > 80) {
      setErrorMsg('Provider name cannot exceed 80 characters.');
      return;
    }

    if (docUrl.trim() && !docUrl.trim().startsWith('https://')) {
      setErrorMsg('Documentation URL must start with https://');
      return;
    }

    setErrorMsg('');

    const parseList = (str: string) =>
      str
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10);

    const payload: ResearchRequest = {
      provider: cleanProvider,
      doc_url: docUrl.trim() || undefined,
      domains: domains.trim() ? parseList(domains) : undefined,
      seeds: seeds.trim() ? parseList(seeds) : undefined,
      select_paths: selectPaths.trim() ? parseList(selectPaths) : undefined,
      exclude_paths: excludePaths.trim() ? parseList(excludePaths) : undefined,
      max_urls: maxUrls,
      dry_run: dryRun,
    };

    onSubmit(payload);
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            Research OAuth Provider Setup
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Cicerone reads official documentation, extracts evidence, and synthesizes a verified setup workflow and guide.
          </p>
        </div>

        {/* Quick select pills */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Popular Providers
          </label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_PROVIDERS.map((p) => {
              const active = provider.toLowerCase() === p.name.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleQuickSelect(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                      : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider Input */}
            <div>
              <label htmlFor="provider" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Provider Name <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="provider"
                  type="text"
                  placeholder="e.g. GitHub, Google, Slack, Discord..."
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
                  required
                />
                <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Doc URL Input */}
            <div>
              <label htmlFor="docUrl" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Documentation URL</span>
                <span className="text-[10px] text-slate-500 font-normal lowercase">optional seed</span>
              </label>
              <div className="relative">
                <input
                  id="docUrl"
                  type="url"
                  placeholder="https://docs.provider.com/oauth..."
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
                />
                <Globe className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Advanced toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-brand-400 transition-colors py-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Domains, Seeds, Filters, Dry Run)'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Allowed Domains */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                      <span>Allowed Domains</span>
                      <span className="text-[10px] text-slate-500">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="docs.acme.com, developer.acme.com"
                      value={domains}
                      onChange={(e) => setDomains(e.target.value)}
                      className="w-full bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Used for custom providers not in built-in registry.</p>
                  </div>

                  {/* Extra Seeds */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                      <span>Additional Seed URLs</span>
                      <span className="text-[10px] text-slate-500">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://docs.acme.com/oauth/apps"
                      value={seeds}
                      onChange={(e) => setSeeds(e.target.value)}
                      className="w-full bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Starting pages for Tavily site mapping.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Path Select Regex */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Select Path Regex Filters
                    </label>
                    <input
                      type="text"
                      placeholder="/oauth/.*, /apps/.*"
                      value={selectPaths}
                      onChange={(e) => setSelectPaths(e.target.value)}
                      className="w-full bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-brand-500 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Path Exclude Regex */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Exclude Path Regex Filters
                    </label>
                    <input
                      type="text"
                      placeholder=".*pricing.*, .*blog.*"
                      value={excludePaths}
                      onChange={(e) => setExcludePaths(e.target.value)}
                      className="w-full bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-brand-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Max URLs Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-brand-400" />
                        Max Extracted Pages:
                      </span>
                      <span className="font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                        {maxUrls} pages
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={maxUrls}
                      onChange={(e) => setMaxUrls(parseInt(e.target.value, 10))}
                      className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>5 (Fast)</span>
                      <span>30 (Recommended)</span>
                      <span>60 (Deep)</span>
                    </div>
                  </div>

                  {/* Dry Run Checkbox */}
                  <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                    <input
                      id="dryRun"
                      type="checkbox"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-brand-500 bg-slate-800 border-slate-700 focus:ring-brand-500 cursor-pointer"
                    />
                    <label htmlFor="dryRun" className="text-xs cursor-pointer">
                      <span className="font-semibold text-slate-200 block">Dry Run Mode</span>
                      <span className="text-slate-400 block text-[11px] mt-0.5">
                        Discovery only. Returns mapped documentation URLs without model calls or token costs.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold text-slate-950 transition-all flex items-center gap-2 shadow-lg ${
                isLoading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-300 hover:to-brand-400 shadow-brand-500/25 hover:shadow-brand-500/40'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Start OAuth Research</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
