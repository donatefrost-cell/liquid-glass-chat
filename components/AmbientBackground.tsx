"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function AmbientBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Hidden SVG Optical Filters: Chromium feTurbulence + feDisplacementMap & Liquid Droplet Goo */}
      <svg className="hidden" width="0" height="0" aria-hidden="true">
        <defs>
          <filter
            id="liquid-refraction"
            x="-15%"
            y="-15%"
            width="130%"
            height="130%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014 0.018"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="2.5" result="softNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="softNoise"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feSpecularLighting
              in="softNoise"
              surfaceScale="3"
              specularConstant="0.65"
              specularExponent="22"
              lightingColor="#ffffff"
              result="specular"
            >
              <fePointLight x="-150" y="-200" z="260" />
            </feSpecularLighting>
            <feComposite
              in="specular"
              in2="SourceAlpha"
              operator="in"
              result="specularMasked"
            />
            <feMerge>
              <feMergeNode in="displaced" />
              <feMergeNode in="specularMasked" />
            </feMerge>
          </filter>

          <filter id="liquid-droplet-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Blob 1 — Top Left Primary Orb */}
      <motion.div
        className="absolute -top-[14%] -left-[10%] h-[52vw] max-h-[680px] min-h-[340px] w-[52vw] max-w-[680px] min-w-[340px] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, var(--blob-1), transparent 72%)",
          opacity: "var(--blob-opacity)",
          willChange: "transform",
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
                x: ["0%", "8%", "-4%", "0%"],
                y: ["0%", "6%", "11%", "0%"],
                scale: [1, 1.12, 0.94, 1],
                rotate: [0, 25, -15, 0],
              }
        }
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 2 — Top Right Secondary Orb */}
      <motion.div
        className="absolute -top-[8%] -right-[12%] h-[48vw] max-h-[620px] min-h-[320px] w-[48vw] max-w-[620px] min-w-[320px] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, var(--blob-2), transparent 72%)",
          opacity: "var(--blob-opacity)",
          willChange: "transform",
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
                x: ["0%", "-9%", "5%", "0%"],
                y: ["0%", "10%", "-6%", "0%"],
                scale: [1, 0.92, 1.14, 1],
                rotate: [0, -30, 18, 0],
              }
        }
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 3 — Bottom Center-Left Bioluminescent / Peach Orb */}
      <motion.div
        className="absolute -bottom-[16%] left-[12%] h-[50vw] max-h-[650px] min-h-[320px] w-[50vw] max-w-[650px] min-w-[320px] rounded-full blur-[115px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--blob-3), transparent 70%)",
          opacity: "var(--blob-opacity)",
          willChange: "transform",
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
                x: ["0%", "10%", "-7%", "0%"],
                y: ["0%", "-9%", "4%", "0%"],
                scale: [1, 1.1, 0.95, 1],
              }
        }
        transition={{
          duration: 21,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 4 — Center Right Accent Caustic Orb */}
      <motion.div
        className="absolute bottom-[8%] right-[8%] h-[38vw] max-h-[500px] min-h-[260px] w-[38vw] max-w-[500px] min-w-[260px] rounded-full blur-[105px]"
        style={{
          background:
            "radial-gradient(circle at 45% 45%, var(--blob-4), transparent 70%)",
          opacity: "calc(var(--blob-opacity) * 0.85)",
          willChange: "transform",
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
                x: ["0%", "-8%", "6%", "0%"],
                y: ["0%", "-7%", "8%", "0%"],
                scale: [1, 1.16, 0.9, 1],
              }
        }
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle Ambient Vignette & Caustic Mesh */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)",
        }}
      />
    </div>
  );
}

