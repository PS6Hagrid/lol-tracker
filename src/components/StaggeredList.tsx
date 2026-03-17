"use client";

import { type ReactNode, Children } from "react";
import { motion } from "framer-motion";

interface StaggeredListProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  /** Animate when scrolled into viewport instead of on mount */
  viewport?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.05,
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
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

/**
 * Wrapper that staggers children entrance with fade-in + slide-up.
 * Each direct child is wrapped in a motion.div for the animation.
 * Set `viewport` to true to trigger on scroll-into-view.
 * Respects prefers-reduced-motion via framer-motion's built-in support.
 */
export default function StaggeredList({
  children,
  staggerDelay = 0.05,
  className = "",
  viewport = false,
}: StaggeredListProps) {
  const childArray = Children.toArray(children);

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      {...(viewport
        ? { whileInView: "visible", viewport: { once: true, margin: "-50px" } }
        : { animate: "visible" })}
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
 * Individual stagger item -- use inside a StaggeredList parent for
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
