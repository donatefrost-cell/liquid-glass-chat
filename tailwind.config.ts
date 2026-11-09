import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        glass: {
          border: "var(--glass-border)",
          surface: "var(--glass-surface)",
          elevated: "var(--glass-elevated)",
          highlight: "var(--glass-highlight)",
        },
      },
      borderRadius: {
        glass: "24px",
        "glass-lg": "28px",
        "glass-sm": "20px",
      },
      keyframes: {
        "blob-float-1": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
          "33%": { transform: "translate3d(6vw, -5vh, 0) scale(1.12) rotate(12deg)" },
          "66%": { transform: "translate3d(-4vw, 6vh, 0) scale(0.92) rotate(-8deg)" },
        },
        "blob-float-2": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
          "33%": { transform: "translate3d(-7vw, 5vh, 0) scale(0.94) rotate(-14deg)" },
          "66%": { transform: "translate3d(5vw, -6vh, 0) scale(1.1) rotate(10deg)" },
        },
        "blob-float-3": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(4vw, 7vh, 0) scale(1.14)" },
        },
        "pulse-halo": {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.012)" },
        },
      },
      animation: {
        "blob-1": "blob-float-1 22s ease-in-out infinite",
        "blob-2": "blob-float-2 26s ease-in-out infinite",
        "blob-3": "blob-float-3 19s ease-in-out infinite",
        "pulse-halo": "pulse-halo 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

