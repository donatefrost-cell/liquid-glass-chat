"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { motion } from "framer-motion";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

interface ParsedBlock {
  type:
    | "code"
    | "heading"
    | "ul"
    | "ol"
    | "blockquote"
    | "table"
    | "hr"
    | "paragraph";
  content: string;
  language?: string;
  level?: number;
  items?: string[];
  rows?: string[][];
}

const CODE_TOKEN_REGEX =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|while|import|from|export|default|async|await|try|catch|class|interface|type|extends|implements|new|this|true|false|null|undefined|def|elif|None|True|False|fn|pub|struct|enum|match|use|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN)\b|\b(\d+(?:\.\d+)?)\b/g;

function highlightCodeLine(line: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(CODE_TOKEN_REGEX.source, "g");

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index));
    }

    const [full, comment, str, keyword, num] = match;
    const key = `${match.index}-${full.length}`;

    if (comment) {
      nodes.push(
        <span key={key} className="text-slate-400 italic">
          {full}
        </span>
      );
    } else if (str) {
      nodes.push(
        <span key={key} className="text-emerald-300">
          {full}
        </span>
      );
    } else if (keyword) {
      nodes.push(
        <span key={key} className="text-sky-300 font-semibold">
          {full}
        </span>
      );
    } else if (num) {
      nodes.push(
        <span key={key} className="text-amber-300">
          {full}
        </span>
      );
    } else {
      nodes.push(full);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [line];
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lines = code.replace(/\n$/, "").split("\n");
  const displayLang = (language || "code").toLowerCase();

  return (
    <div className="my-3.5 overflow-hidden rounded-[20px] border border-white/15 bg-[var(--glass-code-bg)] text-slate-100 shadow-lg">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-mono">
          <Terminal className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
          <span className="uppercase tracking-wider text-[11px] font-semibold text-slate-200">
            {displayLang}
          </span>
        </div>
        <motion.button
          type="button"
          onClick={handleCopy}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-100 transition-colors hover:bg-white/20"
          aria-label="Скопировать код"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300">Скопировано</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-300" />
              <span>Копировать</span>
            </>
          )}
        </motion.button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <code>
          {lines.map((line, idx) => (
            <div key={idx} className="table-row">
              <span className="table-cell select-none pr-4 text-right text-[11px] text-slate-500">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre">
                {highlightCodeLine(line)}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const inlineRegex =
    /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;

  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      elements.push(text.slice(lastIdx, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token.length}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      elements.push(
        <code
          key={key}
          className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[0.88em] font-medium text-[var(--text-accent)] dark:border-sky-400/25 dark:bg-sky-400/10"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      elements.push(
        <strong key={key} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      elements.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      elements.push(
        <del key={key} className="opacity-70">
          {token.slice(2, -2)}
        </del>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const safeHref =
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("mailto:")
            ? href
            : "#";
        elements.push(
          <a
            key={key}
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--text-accent)] underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current"
          >
            {label}
          </a>
        );
      } else {
        elements.push(token);
      }
    }

    lastIdx = inlineRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    elements.push(text.slice(lastIdx));
  }

  return elements;
}

function parseMarkdown(markdown: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const normalized = markdown.replace(/\r\n/g, "\n");

  // Split by fenced code blocks first (including unclosed streaming fence)
  const fenceRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)(?:```|$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const parseProseSection = (section: string) => {
    const lines = section.split("\n");
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // Horizontal Rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        blocks.push({ type: "hr", content: "" });
        i++;
        continue;
      }

      // Heading
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        blocks.push({
          type: "heading",
          level: headingMatch[1].length,
          content: headingMatch[2],
        });
        i++;
        continue;
      }

      // Table
      if (
        trimmed.includes("|") &&
        i + 1 < lines.length &&
        /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1])
      ) {
        const rows: string[][] = [];
        const parseRow = (r: string) =>
          r
            .trim()
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((c) => c.trim());

        rows.push(parseRow(line));
        i += 2; // Skip separator row
        while (i < lines.length && lines[i].trim().includes("|")) {
          rows.push(parseRow(lines[i]));
          i++;
        }
        blocks.push({ type: "table", content: "", rows });
        continue;
      }

      // Unordered List
      if (/^[-*•]\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
          i++;
        }
        blocks.push({ type: "ul", content: "", items });
        continue;
      }

      // Ordered List
      if (/^\d+\.\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
          i++;
        }
        blocks.push({ type: "ol", content: "", items });
        continue;
      }

      // Blockquote
      if (trimmed.startsWith(">")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        blocks.push({ type: "blockquote", content: quoteLines.join("\n") });
        continue;
      }

      // Paragraph
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !/^(#{1,4}\s|[-*•]\s|\d+\.\s|>|```)/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        blocks.push({ type: "paragraph", content: paraLines.join("\n") });
      } else {
        i++;
      }
    }
  };

  while ((match = fenceRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      parseProseSection(normalized.slice(lastIndex, match.index));
    }
    blocks.push({
      type: "code",
      language: match[1] || "text",
      content: match[2],
    });
    lastIndex = fenceRegex.lastIndex;
    if (match[0].length === 0) break;
  }

  if (lastIndex < normalized.length) {
    parseProseSection(normalized.slice(lastIndex));
  }

  return blocks;
}

export function MarkdownRenderer({
  content,
  isStreaming = false,
}: MarkdownRendererProps) {
  const blocks = parseMarkdown(content);

  return (
    <div
      className={`space-y-3 text-[15px] leading-[1.68] text-[var(--text-primary)] ${
        isStreaming ? "streaming-prose" : ""
      }`}
    >
      {blocks.map((block, index) => {
        switch (block.type) {
          case "code":
            return (
              <CodeBlock
                key={index}
                code={block.content}
                language={block.language}
              />
            );

          case "heading": {
            const sizeClass =
              block.level === 1
                ? "text-xl font-bold mt-4 mb-2"
                : block.level === 2
                  ? "text-lg font-bold mt-3.5 mb-1.5"
                  : "text-base font-semibold mt-3 mb-1";
            return (
              <h3
                key={index}
                className={`font-display tracking-tight text-[var(--text-primary)] ${sizeClass}`}
              >
                {renderInline(block.content)}
              </h3>
            );
          }

          case "ul":
            return (
              <ul key={index} className="my-2 list-disc space-y-1.5 pl-5">
                {block.items?.map((item, idx) => (
                  <li key={idx} className="pl-1">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol key={index} className="my-2 list-decimal space-y-1.5 pl-5">
                {block.items?.map((item, idx) => (
                  <li key={idx} className="pl-1">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );

          case "blockquote":
            return (
              <blockquote
                key={index}
                className="my-3 rounded-r-2xl border-l-4 border-indigo-400/70 bg-white/20 px-4 py-2.5 italic text-[var(--text-secondary)] dark:border-sky-400/60 dark:bg-white/[0.04]"
              >
                {renderInline(block.content)}
              </blockquote>
            );

          case "table":
            return (
              <div
                key={index}
                className="my-3 overflow-x-auto rounded-2xl border border-[var(--glass-border)] bg-white/20 dark:bg-white/[0.03]"
              >
                <table className="w-full border-collapse text-left text-sm">
                  {block.rows && block.rows.length > 0 && (
                    <>
                      <thead>
                        <tr className="border-b border-[var(--glass-border)] bg-white/30 dark:bg-white/[0.06]">
                          {block.rows[0].map((cell, cIdx) => (
                            <th
                              key={cIdx}
                              className="px-3.5 py-2.5 font-display font-semibold"
                            >
                              {renderInline(cell)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.slice(1).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="border-b border-[var(--glass-border-subtle)] last:border-0"
                          >
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2">
                                {renderInline(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            );

          case "hr":
            return (
              <hr
                key={index}
                className="my-4 border-t border-[var(--glass-border)]"
              />
            );

          default:
            return (
              <p key={index} className="whitespace-pre-wrap break-words">
                {renderInline(block.content)}
              </p>
            );
        }
      })}
    </div>
  );
}

