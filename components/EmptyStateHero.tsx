"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code2, Compass, Cpu, Sparkles, ArrowUpRight } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface EmptyStateHeroProps {
  onSelectPrompt: (prompt: string) => void;
  modelName: string;
}

const STARTER_PROMPTS = [
  {
    icon: Code2,
    category: "Архитектура и код",
    title: "Реактивный хук с отменой запросов",
    prompt:
      "Напиши типизированный React-хук useStreamingQuery на TypeScript с поддержкой AbortController, обработкой ошибок и автоматическим ретраем. Приведи пример использования.",
  },
  {
    icon: Cpu,
    category: "Системный дизайн",
    title: "Сравнение Edge и Node.js Runtime",
    prompt:
      "Сравни Edge Runtime и Node.js Runtime в Next.js App Router для стриминговых ИИ-приложений. Оформи ответ в виде таблицы с плюсами, минусами и рекомендациями.",
  },
  {
    icon: Compass,
    category: "Продуктовая стратегия",
    title: "Аудит UX и микроанимаций",
    prompt:
      "Сформулируй 5 ключевых принципов проектирования интерфейсов в стиле Liquid Glass (оптическое преломление, иерархия слоёв, контрастность WCAG AA и 60fps-анимации).",
  },
  {
    icon: Sparkles,
    category: "Алгоритмы и разбор",
    title: "Оптимизация рендера длинных списков",
    prompt:
      "Объясни, как устроена виртуализация списков в браузере без сторонних библиотек, и покажи компактную реализацию на React.",
  },
];

export function EmptyStateHero({
  onSelectPrompt,
  modelName,
}: EmptyStateHeroProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-8 sm:py-14">
      {/* Optical Liquid Prism Emblem */}
      <motion.div
        initial={{ opacity: 0, scale: 0.86, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="relative mb-6"
      >
        <div
          className="absolute -inset-4 rounded-full bg-gradient-to-tr from-indigo-500/30 via-sky-400/25 to-fuchsia-400/30 blur-2xl"
          aria-hidden="true"
        />
        <GlassPanel
          variant="strong"
          className="flex h-16 w-16 items-center justify-center rounded-[24px]"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-400 to-cyan-300 text-white shadow-inner">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
        </GlassPanel>
      </motion.div>

      {/* Editorial Headline */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.45, ease: "easeOut" }}
        className="text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium liquid-glass-subtle text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>Оптическая среда диалога · {modelName}</span>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          Чем могу помочь сегодня?
        </h1>
        <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Задайте вопрос, попросите спроектировать архитектуру, разобрать код
          или выберите один из сценариев ниже.
        </p>
      </motion.div>

      {/* Starter Prompt Grid */}
      <div className="mt-8 grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2">
        {STARTER_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.title}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.12 + idx * 0.06,
                type: "spring",
                stiffness: 360,
                damping: 26,
              }}
              whileHover={{ scale: 1.018, y: -2 }}
              whileTap={{ scale: 0.98, y: 1 }}
              className="group text-left focus:outline-none"
            >
              <GlassPanel className="h-full rounded-[24px] p-4 transition-all group-hover:border-indigo-400/50 dark:group-hover:border-sky-400/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-[var(--text-accent)] dark:bg-sky-400/10">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{item.category}</span>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--text-primary)]"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="mt-3 font-display text-[15px] font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {item.prompt}
                </p>
              </GlassPanel>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

