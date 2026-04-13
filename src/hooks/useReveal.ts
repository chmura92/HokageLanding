"use client";

import { useEffect, useRef } from "react";

interface UseRevealOptions {
  rootMargin?: string;
  onReveal?: () => void;
}

/**
 * Adds an `.in-view` class to the referenced element the first time it
 * intersects the viewport, then disconnects. Paired with a CSS reveal class
 * (`reveal-fade-up`, `reveal-fade-left`, etc.) the animation runs entirely on
 * the compositor — no Framer Motion WAAPI hydration window that caused the
 * iOS blink.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {}
) {
  const { rootMargin = "-50px", onReveal } = options;
  const ref = useRef<T>(null);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in-view");
      onRevealRef.current?.();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            onRevealRef.current?.();
            observer.unobserve(el);
          }
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return ref;
}
