import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileSearch,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { PipelineResult } from '../types/research';

interface DiscoveryViewProps {
  result: PipelineResult;
  onRunFullResearch: (provider: string) => void;
  isLoadingFullResearch?: boolean;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  result,
  onRunFullResearch,
  isLoadingFullResearch = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedUrlIdx, setCopiedUrlIdx] = useState<number | null>(null);

  const json = result.json;
  const sourceUrls = useMemo(() => json?.source_urls || [], [json]);
  const discovery = json?.discovery || { candidates: sourceUrls.length, rejected_offdomain: 0, selected: sourceUrls.length };
  const config = json?.config || { domains: [], seeds: [], select_paths: [], exclude_paths: [] };

  // Filter URLs based on search query
  const filteredUrls = useMemo(() => {
    if (!searchQuery.trim()) return sourceUrls;
    const q = searchQuery.toLowerCase();
    return sourceUrls.filter((url) => url.toLowerCase().includes(q));
  }, [sourceUrls, searchQuery]);

  const handleCopyAll = () => {
    if (sourceUrls.length === 0) return;
    navigator.clipboard.writeText(sourceUrls.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (url: string, idx: number) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlIdx(idx);
    setTimeout(() => setCopiedUrlIdx(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Hero Banner: Discovery Summary & Call to Action */}
      <div className="bg-black rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-navy-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-navy-950 text-navy-300 border border-navy-800 flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-navy-400" />
                Discovery Preview
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-neutral-900 text-neutral-300 border border-neutral-800">
                0 Tokens Consumed
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Site Mapping Complete for {json?.display_name || result.provider}
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Cicerone discovered and filtered official documentation pages without extracting full text or calling the LLM. You can inspect the target URLs below or launch the full research pipeline.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onRunFullResearch(result.provider)}
            disabled={isLoadingFullResearch}
            className={`shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 shadow-lg border ${
              isLoadingFullResearch
                ? 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-navy-700 via-navy-600 to-navy-800 hover:from-navy-600 hover:to-navy-700 text-white border-navy-500/40 shadow-navy-950 hover:shadow-navy-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-navy-300" />
            <span>Run Full Research on These Pages</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Discovery Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Selected URLs to Extract
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {discovery.selected || sourceUrls.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Capped by max_urls limit</p>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Candidate Pages Mapped
          </div>
          <div className="text-2xl font-extrabold text-neutral-200 font-mono">
            {discovery.candidates || sourceUrls.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Discovered via Tavily map & search</p>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Off-Domain Rejected
          </div>
          <div className="text-2xl font-extrabold text-neutral-200 font-mono">
            {discovery.rejected_offdomain || 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Blocked by official domain allowlist</p>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Official Domains Allowed
          </div>
          <div className="text-sm font-bold text-navy-300 font-mono truncate" title={config.domains?.join(', ')}>
            {config.domains?.[0] || 'Auto-detected'}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Source: {config.domain_source || 'registry'}</p>
        </div>
      </div>

      {/* Configuration Details Accordion / Summary */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-navy-400" />
            <span>Site Mapping Configuration & Filters</span>
          </h3>
          <span className="text-xs text-neutral-500 font-mono">
            {config.seeds?.length || 0} seeds • {config.select_paths?.length || 0} select filters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
          <div className="space-y-1.5 bg-black/60 p-3 rounded-xl border border-neutral-850">
            <div className="font-semibold text-neutral-400">Allowlisted Official Domains:</div>
            <div className="flex flex-wrap gap-1.5">
              {config.domains?.map((d: string, idx: number) => (
                <span key={idx} className="font-mono text-navy-300 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 bg-black/60 p-3 rounded-xl border border-neutral-850">
            <div className="font-semibold text-neutral-400">Documentation Seed URLs:</div>
            <div className="space-y-1">
              {config.seeds?.map((s: string, idx: number) => (
                <div key={idx} className="font-mono text-neutral-300 truncate" title={s}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Discovered URLs Explorer Table */}
      <div className="bg-black border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-navy-400" />
            <div>
              <h3 className="font-bold text-base text-white">
                Discovered Documentation Pages ({sourceUrls.length})
              </h3>
              <p className="text-xs text-neutral-400">
                Pages ranked and selected for OAuth evidence extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search URLs or paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
              />
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
            </div>

            {/* Copy All Button */}
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-950 hover:bg-neutral-900 text-neutral-300 border border-neutral-800 flex items-center gap-1.5 transition-colors shrink-0"
              title="Copy all URLs as a newline-separated list"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-navy-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{copiedAll ? 'Copied All' : 'Copy List'}</span>
            </button>
          </div>
        </div>

        {/* URL List */}
        <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
          {filteredUrls.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-500">
              No discovered URLs match your search query "{searchQuery}".
            </div>
          ) : (
            filteredUrls.map((url, idx) => {
              let displayPath = url;
              try {
                const parsed = new URL(url);
                displayPath = parsed.pathname;
              } catch {
                // keep url
              }

              return (
                <div
                  key={idx}
                  className="bg-neutral-950/80 hover:bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-lg bg-black text-neutral-400 border border-neutral-800 flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
                      {idx + 1}
                    </span>

                    <div className="overflow-hidden">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-neutral-300 hover:text-navy-300 transition-colors truncate block group-hover:underline underline-offset-2"
                        title={url}
                      >
                        {url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopySingle(url, idx)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-black transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrlIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-navy-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-navy-300 hover:bg-black transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
