"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, RotateCcw, Sparkles, User } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { GlassPanel } from "./GlassPanel";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessageItemProps {
  message: ChatMessage;
  isStreaming: boolean;
  isLastAssistantMessage: boolean;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
}

export function ChatMessageItem({
  message,
  isStreaming,
  isLastAssistantMessage,
  onCopy,
  onRegenerate,
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`flex w-full gap-3 sm:gap-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
      aria-label={isUser ? "Сообщение пользователя" : "Ответ ИИ"}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="mt-1 hidden shrink-0 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-400 to-cyan-300 text-white shadow-md">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
      )}

      <div
        className={`flex max-w-[92%] flex-col sm:max-w-[82%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Role & Time Header */}
        <div className="mb-1.5 flex items-center gap-2 px-1 text-[11px] font-medium text-[var(--text-muted)]">
          <span>{isUser ? "Вы" : "Vitro AI"}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(message.createdAt).toISOString()}>
            {formattedTime}
          </time>
        </div>

        {/* Message Bubble */}
        {isUser ? (
          <GlassPanel
            refract={false}
            className="rounded-[24px] rounded-br-[8px] px-4 py-3 sm:px-5 sm:py-3.5"
            style={{
              background: "var(--glass-user-bubble)",
            }}
          >
            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-white">
              {message.content}
            </p>
          </GlassPanel>
        ) : (
          <GlassPanel
            variant="default"
            className={`w-full rounded-[24px] rounded-tl-[8px] px-4 py-3.5 sm:px-6 sm:py-4 ${
              message.isError
                ? "border-rose-400/50 dark:border-rose-500/40"
                : ""
            }`}
          >
            <MarkdownRenderer
              content={message.content}
              isStreaming={isStreaming}
            />

            {/* Assistant Action Bar */}
            {message.content.length > 0 && (
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--glass-border-subtle)] pt-2.5">
                <div className="flex items-center gap-1.5">
                  <motion.button
                    type="button"
                    onClick={handleCopy}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94, y: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/25 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
                    aria-label="Скопировать ответ"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-300">
                          Скопировано
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Скопировать</span>
                      </>
                    )}
                  </motion.button>

                  {isLastAssistantMessage && !isStreaming && (
                    <motion.button
                      type="button"
                      onClick={onRegenerate}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.94, y: 1 }}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/25 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
                      aria-label="Повторить ответ"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Повторить ответ</span>
                    </motion.button>
                  )}
                </div>

                {isStreaming && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-accent)]">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-current" />
                    Потоковая печать…
                  </span>
                )}
              </div>
            )}
          </GlassPanel>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="mt-1 hidden shrink-0 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl liquid-glass text-[var(--text-primary)]">
            <User className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
      )}
    </motion.article>
  );
}

