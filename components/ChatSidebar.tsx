"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Trash2,
  X,
  Sparkles,
  PanelLeftClose,
} from "lucide-react";
import { ChatSession } from "@/lib/types";
import { GlassPanel } from "./GlassPanel";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  isOpenDesktop: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  isOpenDesktop,
  isOpenMobile,
  onCloseMobile,
  onToggleDesktop,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
}: ChatSidebarProps) {
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3.5">
      {/* Top Brand & New Chat */}
      <div>
        <div className="mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-400 to-cyan-300 text-white shadow-md">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="font-display text-base font-bold tracking-tight text-[var(--text-primary)]">
                Vitro AI
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
                Liquid Glass
              </span>
            </div>
          </div>

          {/* Close button on mobile, Collapse on desktop */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-xl p-1.5 text-[var(--text-secondary)] hover:bg-white/20 md:hidden"
            aria-label="Закрыть меню чатов"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onToggleDesktop}
            className="hidden rounded-xl p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-white/20 hover:text-[var(--text-primary)] md:inline-flex"
            aria-label="Свернуть боковую панель"
            title="Свернуть панель"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <motion.button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97, y: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-indigo-500/90 via-sky-500/90 to-cyan-400/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
          <span>Новый чат</span>
        </motion.button>
      </div>

      {/* Conversation List */}
      <div className="my-3 flex-1 overflow-y-auto pr-1">
        <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          История диалогов ({sessions.length})
        </div>

        <div className="space-y-1.5" role="list" aria-label="Список диалогов">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const msgCount = session.messages.length;

            return (
              <motion.div
                key={session.id}
                layout
                role="listitem"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectSession(session.id);
                    onCloseMobile();
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-[18px] px-3 py-2.5 text-left text-sm transition-all ${
                    isActive
                      ? "liquid-glass font-semibold text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-white/25 hover:text-[var(--text-primary)] dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? "text-[var(--text-accent)]"
                          : "text-[var(--text-muted)]"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] leading-snug">
                        {session.title}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {msgCount === 0
                          ? "Пустой чат"
                          : `${msgCount} сообщ.`}
                      </p>
                    </div>
                  </div>

                  {sessions.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => onDeleteSession(session.id, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onDeleteSession(
                            session.id,
                            e as unknown as React.MouseEvent
                          );
                        }
                      }}
                      className="rounded-lg p-1 text-[var(--text-muted)] opacity-0 transition-opacity hover:bg-rose-500/20 hover:text-rose-500 group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Удалить чат ${session.title}`}
                      title="Удалить чат"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Clear History */}
      <div className="border-t border-[var(--glass-border-subtle)] pt-3">
        {sessions.some((s) => s.messages.length > 0) && (
          <button
            type="button"
            onClick={onClearAll}
            className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-rose-500/15 hover:text-rose-500 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Очистить историю</span>
          </button>
        )}

        <div className="rounded-2xl px-3 py-2 text-[11px] leading-relaxed text-[var(--text-muted)] liquid-glass-subtle">
          <div className="flex items-center justify-between">
            <span>Хранилище</span>
            <span className="font-mono text-[10px] text-[var(--text-secondary)]">
              localStorage
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <AnimatePresence initial={false}>
        {isOpenDesktop && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0, x: -24 }}
            animate={{ width: 288, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -24 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="relative z-20 hidden h-full shrink-0 py-3 pl-3 md:block overflow-hidden"
            aria-label="Боковая панель чатов"
          >
            <GlassPanel
              variant="default"
              className="h-full w-[276px] rounded-[26px]"
            >
              {sidebarContent}
            </GlassPanel>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Slide-Over Glass Sheet */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            <motion.aside
              key="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="fixed top-2 bottom-2 left-2 z-50 w-[84vw] max-w-[300px] md:hidden"
              aria-label="Мобильное меню чатов"
            >
              <GlassPanel
                variant="strong"
                className="h-full w-full rounded-[26px]"
              >
                {sidebarContent}
              </GlassPanel>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

