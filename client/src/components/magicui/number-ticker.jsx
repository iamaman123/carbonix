"use client";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  formatValue,
  prefix = "",
  suffix = "",
  ...props
}) {
  const ref = useRef(null);
  const formatterRef = useRef(formatValue);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    isInView &&
      setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(() => {
    formatterRef.current = formatValue;
  }, [formatValue]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (!ref.current) {
          return;
        }
        const baseValue = Number(latest.toFixed(decimalPlaces));
        const formatted = formatterRef.current
          ? formatterRef.current(baseValue)
          : Intl.NumberFormat("en-US", {
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces,
            }).format(baseValue);
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }),
    [springValue, decimalPlaces, prefix, suffix]
  );

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tabular-nums tracking-wider text-black dark:text-white",
        className
      )}
      {...props}
    />
  );
}
