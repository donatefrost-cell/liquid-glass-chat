"use client";

import React from "react";
import { motion } from "framer-motion";
import { Menu, PanelLeftOpen, Plus, Sparkles, Eye } from "lucide-react";
import { ThemeMode } from "@/lib/types";
import { GlassPanel } from "./GlassPanel";
import { ThemeToggle } from "./ThemeToggle";

interface ChatHeaderProps {
  title: string;
  modelName: string;
  theme: ThemeMode;
  refractionEnabled: boolean;
  isSidebarOpenDesktop: boolean;
  onToggleTheme: () => void;
  onToggleRefraction: () => void;
  onOpenMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  onNewChat: () => void;
}

export function ChatHeader({
  title,
  modelName,
  theme,
  refractionEnabled,
  isSidebarOpenDesktop,
  onToggleTheme,
  onToggleRefraction,
  onOpenMobileSidebar,
  onToggleDesktopSidebar,
  onNewChat,
}: ChatHeaderProps) {
  return (
    <header className="relative z-20 px-3 pt-3 sm:px-6">
      <GlassPanel
        variant="default"
        className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-[24px] px-3.5 py-2.5 sm:px-5"
      >
        {/* Left: Sidebar Trigger & Active Conversation Title */}
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Mobile Drawer Trigger */}
          <motion.button
            type="button"
            onClick={onOpenMobileSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl liquid-glass-subtle text-[var(--text-primary)] md:hidden"
            aria-label="Открыть список чатов"
          >
            <Menu className="h-4 w-4" />
          </motion.button>

          {/* Desktop Expand Trigger (when collapsed) */}
          {!isSidebarOpenDesktop && (
            <motion.button
              type="button"
              onClick={onToggleDesktopSidebar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className="hidden h-9 w-9 items-center justify-center rounded-xl liquid-glass-subtle text-[var(--text-primary)] md:inline-flex"
              aria-label="Развернуть боковую панель"
              title="Развернуть боковую панель"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </motion.button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-display text-sm font-bold text-[var(--text-primary)] sm:text-base">
                {title}
              </h2>
              <span className="hidden items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-[var(--text-accent)] sm:inline-flex dark:border-sky-400/25 dark:bg-sky-400/10">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {modelName}
              </span>
            </div>
            <p className="truncate font-mono text-[10px] text-[var(--text-muted)] sm:hidden">
              {modelName}
            </p>
          </div>
        </div>

        {/* Right: Optical Refraction Toggle, New Chat Quick Action, Theme Switcher */}
        <div className="flex shrink-0 items-center gap-2">
          <motion.button
            type="button"
            onClick={onToggleRefraction}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors lg:inline-flex ${
              refractionEnabled
                ? "liquid-glass text-[var(--text-accent)]"
                : "liquid-glass-subtle text-[var(--text-muted)]"
            }`}
            aria-pressed={refractionEnabled}
            title="Переключить SVG-преломление краёв (Chromium feDisplacementMap)"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Преломление</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={onNewChat}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold liquid-glass text-[var(--text-primary)]"
            aria-label="Новый чат"
            title="Начать новый чат"
          >
            <Plus className="h-4 w-4 text-[var(--text-accent)]" />
            <span className="hidden sm:inline">Новый чат</span>
          </motion.button>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </GlassPanel>
    </header>
  );
}
