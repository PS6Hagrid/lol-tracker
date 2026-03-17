"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverGlow?: string;
  onClick?: () => void;
}

/**
 * Reusable card wrapper with subtle hover lift, optional glow, and press effect.
 * Respects prefers-reduced-motion via framer-motion's built-in support.
 */
export default function AnimatedCard({
  children,
  className = "",
  hoverGlow,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`rounded-xl ${className}`}
      style={
        hoverGlow
          ? { ["--hover-glow" as string]: hoverGlow }
          : undefined
      }
      whileHover={{
        y: -4,
        boxShadow: hoverGlow
          ? `0 8px 25px -5px ${hoverGlow}33, 0 0 0 1px ${hoverGlow}22`
          : "0 8px 25px -5px rgba(0, 0, 0, 0.3)",
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={
        onClick
          ? {
              scale: 0.98,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </motion.div>
  );
}
