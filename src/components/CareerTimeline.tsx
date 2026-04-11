"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { career } from "@/data/career";

export default function CareerTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* Smooth the scroll progress with a spring so there is no jumping or stuttering */
  const smoothProgress = useSpring(
    useTransform(scrollYProgress, [0.1, 0.8], [0, 100]),
    { stiffness: 50, damping: 20, restDelta: 0.5 },
  );

  /* Convert the spring number back to a percentage string for the height style */
  const [lineHeight, setLineHeight] = useState("0%");
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (v) => {
      setLineHeight(`${Math.min(Math.max(v, 0), 100)}%`);
    });
    return unsubscribe;
  }, [smoothProgress]);

  return (
    <section
      id="career"
      ref={sectionRef}
      className="bg-surface-light py-24 px-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section title */}
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-ink-muted mb-16 text-center">
          Career
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Background vertical line */}
          <div className="absolute top-0 bottom-0 left-4 md:left-1/2 md:-translate-x-px w-0.5 bg-gray-200" />

          {/* Animated overlay line — uses height instead of scaleY for smoothness */}
          <div
            className="absolute top-0 left-4 md:left-1/2 md:-translate-x-px w-0.5 bg-accent-blue"
            style={{ height: lineHeight, transition: "height 0.15s ease-out" }}
          />

          {/* Entries */}
          <div className="flex flex-col gap-16">
            {career.map((entry, index) => {
              const isLeft = index % 2 === 0;
              const isCurrent = index === 0;

              return (
                <div
                  key={index}
                  className="relative flex items-start md:items-center"
                >
                  {/* ---------- Dot ---------- */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                    {/* Pulse ring for current role */}
                    {isCurrent && (
                      <motion.span
                        className="absolute inset-0 -m-1.5 rounded-full bg-accent-blue/30"
                        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                        transition={{
                          duration: 2,
                          ease: "easeOut",
                          repeat: Infinity,
                        }}
                      />
                    )}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      className="relative w-4 h-4 rounded-full bg-accent-blue border-[3px] border-white shadow-sm"
                    />
                  </div>

                  {/* ---------- Horizontal connector (desktop) ---------- */}
                  <div
                    className={`hidden md:block absolute top-1/2 -translate-y-px h-px bg-gray-200 ${
                      isLeft
                        ? "right-1/2 mr-2 w-8"
                        : "left-1/2 ml-2 w-8"
                    }`}
                  />

                  {/* ---------- Spacer (desktop only) ---------- */}
                  <div
                    className={`hidden md:block md:w-1/2 ${
                      isLeft ? "md:order-2" : "md:order-1"
                    }`}
                  />

                  {/* ---------- Card ---------- */}
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`ml-10 md:ml-0 md:w-1/2 ${
                      isLeft
                        ? "md:order-1 md:pr-14"
                        : "md:order-2 md:pl-14"
                    }`}
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                      {/* Company */}
                      <p className="text-lg font-bold text-ink-heading">
                        {entry.company}{" "}
                        <span className="font-normal text-ink-muted">
                          &middot; {entry.location}
                        </span>
                      </p>

                      {/* Role */}
                      <p className="text-sm font-medium text-accent-blue mt-0.5">
                        {entry.role}
                      </p>

                      {/* Period badge */}
                      <span className="inline-block text-xs bg-accent-blue/10 text-accent-blue px-2.5 py-0.5 rounded-full font-medium mt-1.5">
                        {entry.period}
                      </span>

                      {/* Description */}
                      <p className="text-sm text-ink-body mt-2 font-medium">
                        {entry.description}
                      </p>

                      {/* Highlights */}
                      {entry.highlights.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {entry.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-accent-blue mt-1.5 shrink-0" />
                              <span className="text-xs text-ink-muted">
                                {h}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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
