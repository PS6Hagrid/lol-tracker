"use client";

import { type ReactNode, type KeyboardEvent } from "react";
import { motion } from "framer-motion";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  /** Optional glow color on hover (e.g. "#00d4ff" or "rgba(200,155,60,0.5)") */
  hoverGlow?: string;
  onClick?: () => void;
}

/**
 * Reusable card wrapper with subtle hover lift, optional colored glow,
 * and press-down effect. Respects prefers-reduced-motion via framer-motion.
 */
export default function AnimatedCard({
  children,
  className = "",
  hoverGlow,
  onClick,
}: AnimatedCardProps) {
  const isInteractive = !!onClick;

  const baseBoxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)";

  const hoverBoxShadow = hoverGlow
    ? `0 8px 25px -5px ${hoverGlow}33, 0 4px 12px -2px ${hoverGlow}1a, 0 0 0 1px ${hoverGlow}22`
    : "0 8px 25px -5px rgba(0, 0, 0, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.1)";

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (isInteractive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <motion.div
      className={`rounded-xl ${className}`}
      initial={{ boxShadow: baseBoxShadow }}
      whileHover={{
        y: -4,
        boxShadow: hoverBoxShadow,
        transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      whileTap={
        isInteractive
          ? {
              scale: 0.98,
              y: -2,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      transition={{
        y: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
        boxShadow: { duration: 0.25, ease: "easeOut" },
      }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {children}
    </motion.div>
  );
}
