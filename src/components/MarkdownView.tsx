import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, BookOpen, ExternalLink, FileSearch } from 'lucide-react';
import { PipelineResult } from '../types/research';

interface MarkdownViewProps {
  result: PipelineResult;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ result }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  // If backend provided markdown, use it. If dry run and no markdown, construct a structured discovery guide!
  const markdownContent = React.useMemo(() => {
    if (result.markdown && result.markdown.trim()) {
      return result.markdown;
    }

    if (result.status === 'dry_run') {
      const json = result.json;
      const sourceUrls = json?.source_urls || [];
      const config = json?.config;
      const discovery = json?.discovery;

      return `# ${json?.display_name || result.provider}: Documentation Discovery Preview

> **Dry Run Mode (Discovery Only):** This report details the official documentation pages discovered and selected by Tavily site-mapping. No full page extraction or LLM reasoning calls were executed.

---

## Discovery Summary

- **Provider:** \`${result.provider}\`
- **Selected Pages for Extraction:** **${discovery?.selected || sourceUrls.length}**
- **Candidate URLs Mapped:** **${discovery?.candidates || sourceUrls.length}**
- **Off-Domain Pages Blocked:** **${discovery?.rejected_offdomain || 0}**
- **Official Domains Allowed:** \`${config?.domains?.join(', ') || 'Auto-detected'}\` (Source: \`${config?.domain_source || 'registry'}\`)
- **Documentation Seeds:**
${config?.seeds?.map((s: string) => `  - \`${s}\``).join('\n') || '  - None'}

---

## Discovered Documentation URLs (${sourceUrls.length})

${sourceUrls.map((url, i) => `${i + 1}. [${url}](${url})`).join('\n')}

---

*To perform topic analysis across all 9 OAuth topics and build the interactive workflow checklist, run a full research job with dry run disabled.*
`;
    }

    return '';
  }, [result]);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  if (!markdownContent) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-black rounded-2xl p-8 border border-neutral-800 text-center">
        <BookOpen className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-neutral-300">No Markdown Guide Available</h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
          No markdown guide was generated for this run.
        </p>
      </div>
    );
  }

  let codeBlockCounter = 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Markdown Reader Body */}
      <div className="bg-black rounded-2xl p-6 sm:p-10 border border-white/10 shadow-xl relative overflow-hidden">
        <article className="prose prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:text-white prose-h2:text-xl prose-h2:text-navy-300 prose-h2:border-b prose-h2:border-neutral-800 prose-h2:pb-2.5 prose-h3:text-lg prose-h3:text-neutral-200 prose-p:text-neutral-300 prose-p:leading-relaxed prose-li:text-neutral-300 prose-code:font-mono prose-code:text-navy-300 prose-code:bg-neutral-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800 prose-table:border prose-table:border-neutral-800 prose-th:bg-neutral-900 prose-th:text-neutral-200 prose-td:border-b prose-td:border-neutral-800 prose-a:text-navy-400 hover:prose-a:text-navy-300 prose-blockquote:border-l-navy-500 prose-blockquote:bg-navy-950/40 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
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
                      <div className="flex items-center justify-between bg-black px-4 py-1.5 rounded-t-lg border-t border-x border-neutral-800 text-xs text-neutral-400 font-mono">
                        <span>{match[1]}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(codeString, currentIdx)}
                          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
                        >
                          {copiedCodeIdx === currentIdx ? (
                            <>
                              <Check className="w-3 h-3 text-navy-400" />
                              <span className="text-navy-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="!mt-0 !rounded-t-none bg-neutral-950 border border-neutral-800 p-4 overflow-x-auto text-xs font-mono text-neutral-200">
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
                    className="inline-flex items-center gap-1 text-navy-400 hover:text-navy-300 underline underline-offset-2 decoration-navy-500/40"
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
