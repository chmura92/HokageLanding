"use client";

import { motion } from "framer-motion";
import { skillGroups } from "../data/skills";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function TechStack() {
  return (
    <section id="stack" className="bg-space-lifted py-24 px-6">
      <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-12 text-center">
        Stack
      </h2>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {skillGroups.map((group) => (
          <motion.div
            key={group.label}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">
              {group.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <motion.span
                  key={skill}
                  variants={tileVariants}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 hover:border-accent-blue/30 transition-colors duration-200"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
