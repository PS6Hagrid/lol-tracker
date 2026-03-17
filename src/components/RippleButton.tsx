"use client";

import {
  type ReactNode,
  type ButtonHTMLAttributes,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface RippleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const VARIANT_STYLES = {
  primary:
    "border border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20",
  secondary:
    "border border-border-theme bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-card-hover",
} as const;

const RIPPLE_COLORS = {
  primary: "rgba(0, 212, 255, 0.25)",
  secondary: "rgba(255, 255, 255, 0.12)",
} as const;

/**
 * Button with material-design ripple effect on click.
 * Ripple color adapts to button variant.
 * Respects prefers-reduced-motion -- ripple skipped when motion is reduced.
 */
export default function RippleButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  ...rest
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!prefersReducedMotion) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;
        const id = nextId.current++;

        setRipples((prev) => [...prev, { id, x, y, size }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }

      onClick?.(e);
    },
    [onClick, prefersReducedMotion],
  );

  return (
    <button
      className={`relative overflow-hidden rounded-lg px-4 py-2 font-medium transition-colors duration-200 ${VARIANT_STYLES[variant]} ${className}`}
      onClick={handleClick}
      {...rest}
    >
      <span className="relative z-10">{children}</span>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: RIPPLE_COLORS[variant],
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}
