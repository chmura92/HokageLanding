"use client";

import { motion } from "framer-motion";
import { techGroups, methodologies } from "../data/skills";

const RING_SIZE = 72;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function TechRing({ name, level, index }: { name: string; level: number; index: number }) {
  const fillPercent = level / 5;
  const isExpert = level === 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="relative">
        <svg width={RING_SIZE} height={RING_SIZE} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={RING_STROKE}
          />
          {/* Animated fill ring */}
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={isExpert ? "#2DD4BF" : "#4A9EE5"}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
            whileInView={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - fillPercent) }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 + 0.2, duration: 0.8, ease: "easeOut" }}
            className="group-hover:drop-shadow-[0_0_6px_rgba(74,158,229,0.5)] transition-[filter] duration-300"
          />
        </svg>
        {/* Level number in center */}
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${isExpert ? "text-accent-teal" : "text-accent-blue"}`}>
          {level}
        </span>
      </div>
      <span className="text-xs text-gray-400 text-center leading-tight group-hover:text-gray-200 transition-colors duration-300">
        {name}
      </span>
    </motion.div>
  );
}

const buzzwordVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function TechStack() {
  const primaryGroups = new Set(["Backend"]);

  return (
    <section id="stack" className="bg-space-lifted py-24 px-6">
      <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-12 text-center">
        Stack
      </h2>

      {/* Technology rings by group */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {techGroups.map((group) => {
          const isPrimary = primaryGroups.has(group.label);

          return (
            <div key={group.label}>
              <div className="mb-4">
                <h3
                  className={`text-xs uppercase tracking-wider font-semibold ${
                    isPrimary ? "text-accent-teal" : "text-gray-500"
                  }`}
                >
                  {group.label}
                </h3>
                <div
                  className={`mt-1.5 h-px ${
                    isPrimary
                      ? "bg-gradient-to-r from-accent-teal/60 to-transparent"
                      : "bg-gradient-to-r from-white/10 to-transparent"
                  }`}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                {group.technologies.map((tech, i) => (
                  <TechRing key={tech.name} name={tech.name} level={tech.level} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology buzzword tags */}
      <div className="max-w-3xl mx-auto mt-16">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 text-center mb-6">
          Practices & Methodologies
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {methodologies.map((tag, i) => (
            <motion.span
              key={tag}
              custom={i}
              variants={buzzwordVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-2
                hover:bg-white/10 hover:border-accent-blue/30 hover:text-white
                hover:shadow-[0_0_12px_rgba(74,158,229,0.15)]
                transition-all duration-300 cursor-default"
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
