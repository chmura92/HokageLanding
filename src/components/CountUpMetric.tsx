"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpMetricProps {
  value: number | string;
  label: string;
}

export default function CountUpMetric({ value, label }: CountUpMetricProps) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      textRef.current?.classList.add("in-view");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            textRef.current?.classList.add("in-view");
            observer.unobserve(el);
          }
        }
      },
      { rootMargin: "-50px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || typeof value !== "number") return;

    const duration = 1500;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayValue(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value]);

  return (
    <div ref={ref} className="text-center">
      {typeof value === "number" ? (
        <span className="text-4xl font-extrabold text-ink-heading">
          {displayValue}
        </span>
      ) : (
        <span
          ref={textRef}
          className="reveal-fade text-lg font-bold text-ink-heading leading-tight inline-block"
        >
          {value}
        </span>
      )}
      <p className="text-sm text-ink-muted mt-1">{label}</p>
    </div>
  );
}
