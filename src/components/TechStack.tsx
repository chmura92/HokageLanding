"use client";

import { motion } from "framer-motion";
import { techGroups, methodologies } from "../data/skills";
import { getIcon } from "../lib/iconMap";

function TechCard({ name, index }: { name: string; index: number }) {
  const icon = getIcon(name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-3 w-[88px] cursor-default
        hover:border-accent-teal/30 hover:shadow-[0_0_16px_rgba(45,212,191,0.15)] hover:scale-105 transition-all duration-300"
      style={icon ? ({ '--brand-color': `#${icon.hex}` } as React.CSSProperties) : {}}
    >
      {icon ? (
        <svg
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 fill-white/70 group-hover:fill-[var(--brand-color)] transition-[fill] duration-300"
          aria-label={name}
        >
          <path d={icon.path} />
        </svg>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors duration-300 text-center leading-tight px-1">
          {name.split(/[\s.\-_]+/).map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 4)}
        </div>
      )}
      <span className="text-[10px] uppercase tracking-wide text-gray-400 group-hover:text-gray-200 transition-colors duration-300 text-center leading-tight w-full break-words">
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

const primaryGroups = new Set(["Backend"]);

export default function TechStack() {

  return (
    <section id="stack" className="bg-space-lifted py-24 px-6">
      <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-12 text-center flex items-center justify-center gap-2.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-ember shadow-[0_0_8px_rgba(232,93,58,0.6)]" aria-hidden />
        Stack
      </h2>

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
              <div className="flex flex-wrap gap-3">
                {group.technologies.map((tech, i) => (
                  <TechCard key={tech.name} name={tech.name} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology buzzword tags */}
      <div className="max-w-5xl mx-auto mt-16">
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
