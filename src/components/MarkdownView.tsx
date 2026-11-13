import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, BookOpen, ExternalLink, ListFilter } from 'lucide-react';
import { PipelineResult } from '../types/research';

interface MarkdownViewProps {
  result: PipelineResult;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ result }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const markdownContent = result.markdown || '';

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  if (!markdownContent) {
    return (
      <div className="w-full max-w-7xl mx-auto glass-panel rounded-2xl p-8 border border-slate-800 text-center">
        <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-300">No Markdown Guide Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          {result.status === 'dry_run'
            ? 'This was a dry-run discovery job. Check the raw JSON or discovery summary for mapped URLs.'
            : 'No markdown guide was generated for this run.'}
        </p>
      </div>
    );
  }

  let codeBlockCounter = 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Markdown Reader Body */}
      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
        <article className="prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:text-white prose-h2:text-xl prose-h2:text-brand-300 prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2.5 prose-h3:text-lg prose-h3:text-slate-200 prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-code:font-mono prose-code:text-brand-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900/90 prose-pre:border prose-pre:border-slate-800 prose-table:border prose-table:border-slate-800 prose-th:bg-slate-900 prose-th:text-slate-200 prose-td:border-b prose-td:border-slate-800 prose-a:text-brand-400 hover:prose-a:text-brand-300 prose-blockquote:border-l-brand-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styled code block with Copy button
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                const currentIdx = ++codeBlockCounter;

                if (!inline && match) {
                  return (
                    <div className="relative group not-prose my-4">
                      <div className="flex items-center justify-between bg-slate-950 px-4 py-1.5 rounded-t-lg border-t border-x border-slate-800 text-xs text-slate-400 font-mono">
                        <span>{match[1]}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(codeString, currentIdx)}
                          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
                        >
                          {copiedCodeIdx === currentIdx ? (
                            <>
                              <Check className="w-3 h-3 text-brand-400" />
                              <span className="text-brand-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="!mt-0 !rounded-t-none bg-slate-900/95 border border-slate-800 p-4 overflow-x-auto text-xs font-mono text-slate-200">
                        <code>{children}</code>
                      </pre>
                    </div>
                  );
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              // External links open in new tab
              a({ node, href, children, ...props }: any) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 underline underline-offset-2 decoration-brand-500/40"
                    {...props}
                  >
                    <span>{children}</span>
                    <ExternalLink className="w-3 h-3 opacity-60 shrink-0 inline" />
                  </a>
                );
              },
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
};
