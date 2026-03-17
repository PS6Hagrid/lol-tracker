"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface HoverRevealProps {
  children: ReactNode;
  revealContent: ReactNode;
  className?: string;
}

/**
 * Container that reveals overlay content sliding up from below on hover.
 * Good for champion cards, match cards, or any card with secondary info.
 * Respects prefers-reduced-motion via framer-motion's built-in support.
 */
export default function HoverReveal({
  children,
  revealContent,
  className = "",
}: HoverRevealProps) {
  return (
    <motion.div
      className={`group relative overflow-hidden ${className}`}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {/* Main content */}
      {children}

      {/* Reveal overlay */}
      <motion.div
        className="absolute inset-x-0 bottom-0 flex items-end"
        variants={{
          rest: {
            y: "100%",
            opacity: 0,
            transition: { duration: 0.25, ease: "easeIn" },
          },
          hover: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.25, ease: "easeOut" },
          },
        }}
      >
        {/* Gradient fade at top */}
        <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Content area */}
        <div className="relative w-full bg-black/80 px-3 py-2 backdrop-blur-sm">
          {revealContent}
        </div>
      </motion.div>
    </motion.div>
  );
}
