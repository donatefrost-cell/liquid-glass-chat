"use client";

import React, { useCallback, useRef } from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
  refract?: boolean;
  interactiveGlare?: boolean;
  children: React.ReactNode;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    {
      variant = "default",
      refract = true,
      interactiveGlare = true,
      className = "",
      children,
      onPointerMove,
      ...rest
    },
    externalRef
  ) {
    const internalRef = useRef<HTMLDivElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        internalRef.current = node;
        if (typeof externalRef === "function") {
          externalRef(node);
        } else if (externalRef) {
          (externalRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
        }
      },
      [externalRef]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (interactiveGlare && e.pointerType !== "touch" && internalRef.current) {
          const rect = internalRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          internalRef.current.style.setProperty("--mx", `${x}px`);
          internalRef.current.style.setProperty("--my", `${y}px`);
        }
        onPointerMove?.(e);
      },
      [interactiveGlare, onPointerMove]
    );

    const variantClass =
      variant === "strong"
        ? "liquid-glass-strong"
        : variant === "subtle"
          ? "liquid-glass-subtle"
          : "liquid-glass";

    return (
      <div
        ref={setRefs}
        onPointerMove={handlePointerMove}
        className={`${variantClass} liquid-highlight ${
          refract ? "liquid-refract-edge" : ""
        } ${interactiveGlare ? "liquid-cursor-glare" : ""} ${className}`}
        {...rest}
      >
        {interactiveGlare && <span className="cursor-glare-layer" aria-hidden="true" />}
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    );
  }
);

