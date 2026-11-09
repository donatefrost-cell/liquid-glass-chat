"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Square, CornerDownLeft } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "@/lib/rate-limit";
import { GlassPanel } from "./GlassPanel";
import { LiquidThinkingDots } from "./LiquidThinkingDots";

interface ChatComposerProps {
  input: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
}

export function ChatComposer({
  input,
  onChange,
  onSend,
  onStop,
  isGenerating,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${Math.max(48, nextHeight)}px`;
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && input.trim().length > 0) {
        onSend();
      }
    }
  };

  const canSend =
    !isGenerating &&
    input.trim().length > 0 &&
    input.length <= MAX_MESSAGE_LENGTH;

  const isNearLimit = input.length > MAX_MESSAGE_LENGTH * 0.85;

  return (
    <div className="relative z-20 mx-auto w-full max-w-3xl px-3 pb-3 pt-1 sm:px-6 sm:pb-5">
      {/* Floating "ИИ думает" 3-Droplet Indicator */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="mb-2.5 flex items-center justify-between px-1"
          >
            <LiquidThinkingDots label="ИИ думает…" />

            <motion.button
              type="button"
              onClick={onStop}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95, y: 1 }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium liquid-glass text-rose-600 dark:text-rose-300"
              aria-label="Остановить генерацию"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>Остановить</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Composer Glass Dock with Pulsing Glow when Generating */}
      <div className="relative">
        {isGenerating && (
          <div
            className="pointer-events-none absolute -inset-1 rounded-[30px] bg-gradient-to-r from-indigo-500/35 via-sky-400/35 to-fuchsia-500/35 blur-xl animate-pulse-halo"
            aria-hidden="true"
          />
        )}

        <GlassPanel
          variant="strong"
          className={`rounded-[26px] p-2.5 sm:p-3 transition-shadow duration-500 ${
            isGenerating ? "composer-generating-glow" : ""
          }`}
        >
          <div className="flex items-end gap-2 sm:gap-3">
            <label htmlFor="chat-composer-input" className="sr-only">
              Введите сообщение для ИИ
            </label>
            <textarea
              id="chat-composer-input"
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение… (Enter — отправить, Shift+Enter — перенос)"
              maxLength={MAX_MESSAGE_LENGTH + 200}
              className="max-h-[180px] min-h-[44px] w-full resize-none bg-transparent px-2.5 py-2 text-[15px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />

            <div className="flex shrink-0 items-center gap-2 pb-0.5 pr-0.5">
              {isGenerating ? (
                <motion.button
                  type="button"
                  onClick={onStop}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92, y: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 22 }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md"
                  aria-label="Остановить генерацию ответа"
                  title="Остановить генерацию"
                >
                  <Square className="h-4 w-4 fill-current" />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={onSend}
                  disabled={!canSend}
                  whileHover={canSend ? { scale: 1.06 } : {}}
                  whileTap={canSend ? { scale: 0.92, y: 1 } : {}}
                  transition={{ type: "spring", stiffness: 450, damping: 22 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${
                    canSend
                      ? "bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
                      : "bg-slate-400/20 text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                  }`}
                  aria-label="Отправить сообщение"
                  title="Отправить (Enter)"
                >
                  <ArrowUp className="h-5 w-5 stroke-[2.4]" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Subtle Footer Meta inside Composer */}
          <div className="mt-1.5 flex items-center justify-between border-t border-[var(--glass-border-subtle)] px-2.5 pt-1.5 text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5 truncate">
              <CornerDownLeft className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">
                Enter — отправка · Shift + Enter — новая строка
              </span>
              <span className="sm:hidden">Enter — отправить</span>
            </span>

            <span
              className={`shrink-0 font-mono ${
                input.length > MAX_MESSAGE_LENGTH
                  ? "font-semibold text-rose-500"
                  : isNearLimit
                    ? "text-amber-500"
                    : ""
              }`}
            >
              {input.length} / {MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
