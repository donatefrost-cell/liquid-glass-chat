"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { ToastMessage } from "@/lib/types";
import { GlassPanel } from "./GlassPanel";

interface GlassToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function GlassToastContainer({
  toasts,
  onDismiss,
}: GlassToastContainerProps) {
  return (
    <div
      className="pointer-events-none fixed top-20 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 sm:right-6"
      aria-live="assertive"
      aria-relevant="additions removals"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const icon =
            toast.type === "error" ? (
              <XCircle className="h-5 w-5 shrink-0 text-rose-500 dark:text-rose-400" />
            ) : toast.type === "warning" ? (
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
            ) : toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <Info className="h-5 w-5 shrink-0 text-sky-500 dark:text-sky-400" />
            );

          const accentRing =
            toast.type === "error"
              ? "border-rose-400/45 dark:border-rose-500/40"
              : toast.type === "warning"
                ? "border-amber-400/45 dark:border-amber-500/40"
                : toast.type === "success"
                  ? "border-emerald-400/45 dark:border-emerald-500/40"
                  : "border-sky-400/45 dark:border-sky-500/40";

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="pointer-events-auto"
              role="alert"
            >
              <GlassPanel
                variant="strong"
                className={`rounded-[22px] p-4 ${accentRing}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-[var(--text-primary)]">
                      {toast.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {toast.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-white/20 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
                    aria-label="Закрыть уведомление"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

