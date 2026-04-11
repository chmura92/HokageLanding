"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";

interface CountUpMetricProps {
  value: number | string;
  label: string;
}

export default function CountUpMetric({ value, label }: CountUpMetricProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (typeof value !== "number" || !isInView) return;

    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [isInView, value, motionValue]);

  return (
    <div ref={ref} className="text-center">
      {typeof value === "number" ? (
        <span className="text-4xl font-extrabold text-ink-heading">
          {isInView ? displayValue : 0}
        </span>
      ) : (
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="text-lg font-bold text-ink-heading leading-tight"
        >
          {value}
        </motion.span>
      )}
      <p className="text-sm text-ink-muted mt-1">{label}</p>
    </div>
  );
}
