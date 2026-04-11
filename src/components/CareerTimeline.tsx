"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { career } from "@/data/career";

export default function CareerTimeline() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="career"
      ref={ref}
      className="bg-surface-light py-24 px-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section title */}
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-ink-muted mb-12 text-center">
          Career
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line — mobile: left, desktop: center */}
          <div className="absolute top-0 bottom-0 left-4 md:left-1/2 md:-translate-x-px w-0.5 bg-gray-200" />
          <motion.div
            className="absolute top-0 bottom-0 left-4 md:left-1/2 md:-translate-x-px w-0.5 bg-accent-blue origin-top"
            style={{ scaleY: lineScaleY }}
          />

          {/* Entries */}
          <div className="flex flex-col gap-12">
            {career.map((entry, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={index}
                  className="relative flex items-start md:items-center"
                >
                  {/* Dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent-blue border-2 border-surface-light z-10"
                  />

                  {/* Desktop layout: alternate left/right */}
                  {/* Mobile layout: always on the right */}

                  {/* Spacer for the side without content (desktop only) */}
                  <div
                    className={`hidden md:block md:w-1/2 ${
                      isLeft ? "md:order-2" : "md:order-1"
                    }`}
                  />

                  {/* Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`ml-10 md:ml-0 md:w-1/2 ${
                      isLeft
                        ? "md:order-1 md:pr-10 md:text-right"
                        : "md:order-2 md:pl-10"
                    }`}
                  >
                    <p className="text-lg font-bold text-ink-heading">
                      {entry.company} &middot; {entry.location}
                    </p>
                    <p className="text-sm text-ink-muted">{entry.role}</p>
                    <span className="text-xs bg-gray-100 text-ink-muted px-2 py-0.5 rounded inline-block mt-1">
                      {entry.period}
                    </span>
                    <p className="text-sm text-ink-body mt-2">
                      {entry.description}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
