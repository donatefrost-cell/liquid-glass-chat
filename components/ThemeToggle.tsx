"use client";

import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { ThemeMode } from "@/lib/types";

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94, y: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className="relative inline-flex h-10 w-[72px] items-center rounded-full p-1 liquid-glass cursor-pointer select-none"
      aria-label={
        isDark
          ? "Переключить на светлую тему"
          : "Переключить на тёмную тему"
      }
      title={
        isDark
          ? "Светлая тема (Daylight Prism)"
          : "Тёмная тема (Deep Abyssal)"
      }
    >
      {/* Background Icons */}
      <div className="flex w-full items-center justify-between px-2 text-xs">
        <Sun
          className={`h-3.5 w-3.5 transition-opacity duration-300 ${
            isDark ? "opacity-40 text-amber-200" : "opacity-0"
          }`}
          aria-hidden="true"
        />
        <Moon
          className={`h-3.5 w-3.5 transition-opacity duration-300 ${
            !isDark ? "opacity-45 text-indigo-900" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Sliding Liquid Glass Orb */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 460,
          damping: 28,
        }}
        className={`absolute top-1 bottom-1 flex w-8 items-center justify-center rounded-full shadow-md ${
          isDark
            ? "right-1 bg-gradient-to-br from-indigo-500/90 to-cyan-400/80 text-white"
            : "left-1 bg-gradient-to-br from-amber-300/95 to-orange-400/90 text-slate-950"
        }`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -65, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {isDark ? (
            <Moon className="h-4 w-4 stroke-[2.2]" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4 stroke-[2.2]" aria-hidden="true" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}

