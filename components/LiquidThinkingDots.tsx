"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface LiquidThinkingDotsProps {
  label?: string;
}

export function LiquidThinkingDots({
  label = "ИИ думает",
}: LiquidThinkingDotsProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-xs font-medium tracking-wide"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="relative flex items-center gap-1.5 h-4 px-1"
        style={{ filter: "url(#liquid-droplet-goo)" }}
        aria-hidden="true"
      >
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="block h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-400 to-cyan-300 shadow-sm"
            animate={
              prefersReducedMotion
                ? { opacity: [0.5, 1, 0.5] }
                : {
                    y: [0, -4, 0, 2, 0],
                    scaleX: [1, 0.86, 1.16, 0.94, 1],
                    scaleY: [1, 1.22, 0.82, 1.06, 1],
                    x: index === 0 ? [0, 3, 0] : index === 2 ? [0, -3, 0] : [0, 0, 0],
                  }
            }
            transition={{
              duration: 1.45,
              repeat: Infinity,
              delay: index * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}

