"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface StaggeredListProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

const containerVariants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: {
      staggerChildren: staggerDelay,
    },
  }),
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

/**
 * Wrapper that staggers children entrance with fade-in + slide-up.
 * Each direct child is wrapped in a motion.div for the animation.
 * Respects prefers-reduced-motion via framer-motion's built-in support.
 */
export default function StaggeredList({
  children,
  staggerDelay = 0.05,
  className = "",
}: StaggeredListProps) {
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={staggerDelay}
    >
      {childArray.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Individual stagger item — use inside a StaggeredList parent for
 * cases where you need more control over the wrapper element.
 */
export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
