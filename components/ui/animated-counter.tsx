"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number; // Animation duration in ms
  decimals?: number; // Number of decimal places
}

export function AnimatedCounter({
  value,
  className,
  duration = 500,
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef(value);

  useEffect(() => {
    // Don't animate on initial mount or if value hasn't changed
    if (startValueRef.current === value || displayValue === value) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const endValue = value;
    const change = endValue - startValue;

    if (change === 0) return;

    setIsAnimating(true);
    startValueRef.current = startValue;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + change * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        startTimeRef.current = undefined;
        startValueRef.current = endValue;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration, displayValue]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString();

  return (
    <span
      className={cn(
        "tabular-nums transition-all duration-200",
        isAnimating && "animate-pulse",
        className
      )}
    >
      {formattedValue}
    </span>
  );
}

