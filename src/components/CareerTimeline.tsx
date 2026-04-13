"use client";

import { useRef, useState, useCallback } from "react";
import { career, CareerEntry } from "@/data/career";
import { useReveal } from "@/hooks/useReveal";

interface TimelineEntryProps {
  entry: CareerEntry;
  isCurrent: boolean;
  isLeft: boolean;
  isEducation: boolean;
  onReveal: (dotEl: HTMLDivElement) => void;
}

function TimelineEntry({ entry, isCurrent, isLeft, isEducation, onReveal }: TimelineEntryProps) {
  const dotWrapperRef = useRef<HTMLDivElement>(null);

  const handleReveal = useCallback(() => {
    if (dotWrapperRef.current) onReveal(dotWrapperRef.current);
  }, [onReveal]);

  const rowRef = useReveal<HTMLDivElement>({
    rootMargin: "-80px 0px",
    onReveal: handleReveal,
  });
  const dotRef = useReveal<HTMLDivElement>({ rootMargin: "-80px 0px" });
  const cardRef = useReveal<HTMLDivElement>({ rootMargin: "-50px" });

  const cardClass = isLeft ? "reveal-fade-left" : "reveal-fade-right";

  return (
    <div ref={rowRef} className="relative flex items-start md:items-center">
      {/* Dot */}
      <div ref={dotWrapperRef} className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
        {isCurrent && (
          <span
            className="absolute inset-0 -m-1.5 rounded-full bg-accent-ember/30 animate-career-pulse"
          />
        )}
        <div
          ref={dotRef}
          className={`reveal-scale-dot relative w-4 h-4 rounded-full border-[3px] border-white shadow-sm ${
            isCurrent ? "bg-accent-ember" : isEducation ? "bg-accent-teal" : "bg-accent-blue"
          }`}
        />
      </div>

      {/* Horizontal connector (desktop) */}
      <div
        className={`hidden md:block absolute top-1/2 -translate-y-px h-px bg-gray-200 ${
          isLeft ? "right-1/2 mr-2 w-8" : "left-1/2 ml-2 w-8"
        }`}
      />

      {/* Spacer (desktop) */}
      <div className={`hidden md:block md:w-1/2 ${isLeft ? "md:order-2" : "md:order-1"}`} />

      {/* Card */}
      <div
        ref={cardRef}
        className={`${cardClass} ml-10 md:ml-0 md:w-1/2 ${
          isLeft ? "md:order-1 md:pr-14" : "md:order-2 md:pl-14"
        }`}
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300">
          <p className="text-lg font-bold text-ink-heading">
            {entry.company}{" "}
            <span className="font-normal text-ink-muted">&middot; {entry.location}</span>
          </p>
          <p className={`text-sm font-medium mt-0.5 ${isEducation ? "text-accent-teal" : "text-accent-blue"}`}>{entry.role}</p>
          <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium mt-1.5 ${isEducation ? "bg-accent-teal/10 text-accent-teal" : "bg-accent-blue/10 text-accent-blue"}`}>
            {entry.period}
          </span>
          <p className="text-sm text-ink-body mt-2 font-medium">{entry.description}</p>
          {entry.highlights.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {entry.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${isEducation ? "bg-accent-teal" : "bg-accent-blue"}`} />
                  <span className="text-xs text-ink-muted">{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CareerTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  const handleReveal = useCallback((dotEl: HTMLDivElement) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.getBoundingClientRect().top;
    const dotRect = dotEl.getBoundingClientRect();
    const newHeight = dotRect.top - containerTop + dotRect.height / 2;
    setLineHeight((prev) => Math.max(prev, newHeight));
  }, []);

  return (
    <section id="career" className="bg-surface-light py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-ink-muted mb-16 text-center flex items-center justify-center gap-2.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-ember/70" aria-hidden />
          Career
        </h2>

        <div className="relative" ref={containerRef}>
          {/* Background vertical line */}
          <div className="absolute top-0 bottom-0 left-4 md:left-1/2 md:-translate-x-px w-0.5 bg-gray-200" />

          {/* Animated overlay line — only ever grows, never retracts */}
          <div
            className="absolute top-0 left-4 md:left-1/2 md:-translate-x-px w-0.5 origin-top"
            style={{
              height: lineHeight,
              transition: "height 0.6s ease-out",
              background:
                "linear-gradient(to bottom, #E85D3A 0%, #4A9EE5 35%, #4A9EE5 100%)",
            }}
          />

          <div className="flex flex-col gap-16">
            {career.map((entry, index) => (
              <TimelineEntry
                key={index}
                entry={entry}
                isCurrent={index === 0}
                isLeft={index % 2 === 0}
                isEducation={!!entry.isEducation}
                onReveal={handleReveal}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
