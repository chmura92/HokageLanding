"use client";

import { useReveal } from "@/hooks/useReveal";

export default function PersonalConnection() {
  const ref = useReveal<HTMLDivElement>({ rootMargin: "-50px" });
  return (
    <section className="bg-surface-light py-24 px-6">
      <div
        ref={ref}
        className="reveal-fade-up max-w-2xl mx-auto text-center"
      >
        <p className="text-2xl md:text-3xl font-bold text-ink-heading leading-relaxed">
          I care about building things that actually work
          <span className="text-accent-blue">.</span>
        </p>
        <p className="text-ink-body mt-6 leading-relaxed text-base md:text-lg">
          Not just code that compiles, but systems that teams can maintain,
          users can rely on, and businesses can grow with. I&apos;ve learned that
          the best architecture is the one your team can understand at 2 AM
          when something breaks.
        </p>
        <p className="text-ink-muted mt-4 text-sm md:text-base">
          That&apos;s what I bring to every project &mdash; clarity under complexity.
        </p>
      </div>
    </section>
  );
}
