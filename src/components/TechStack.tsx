"use client";

import { motion } from "framer-motion";
import { skillGroups, type Skill } from "../data/skills";

const groupVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/** Primary groups get a slightly more prominent label treatment. */
const primaryGroups = new Set(["Backend", "Architecture"]);

function ProficiencyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1 mt-1.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < level
              ? level === 5
                ? "bg-accent-teal"
                : "bg-accent-blue"
              : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function SkillTile({ skill }: { skill: Skill }) {
  return (
    <motion.div
      variants={tileVariants}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3
        hover:border-accent-blue/40 hover:shadow-[0_0_15px_rgba(74,158,229,0.15)]
        transition-all duration-300 cursor-default"
    >
      <span className="text-sm text-gray-300 leading-tight">{skill.name}</span>
      <ProficiencyDots level={skill.level} />
    </motion.div>
  );
}

export default function TechStack() {
  return (
    <section id="stack" className="bg-space-lifted py-24 px-6">
      <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-12 text-center">
        Stack
      </h2>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {skillGroups.map((group) => {
          const isPrimary = primaryGroups.has(group.label);

          return (
            <motion.div
              key={group.label}
              variants={groupVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {/* Group label with underline accent */}
              <div className="mb-4">
                <h3
                  className={`text-xs uppercase tracking-wider font-semibold ${
                    isPrimary ? "text-accent-blue" : "text-gray-500"
                  }`}
                >
                  {group.label}
                </h3>
                <div
                  className={`mt-1.5 h-px ${
                    isPrimary
                      ? "bg-gradient-to-r from-accent-blue/60 to-transparent"
                      : "bg-gradient-to-r from-white/10 to-transparent"
                  }`}
                />
              </div>

              {/* Skill tiles */}
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <SkillTile key={skill.name} skill={skill} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
