"use client";

import { motion } from "framer-motion";

export default function SectionTransition() {
  return (
    <div className="relative overflow-hidden h-[200px] bg-gradient-to-b from-[#111827] to-[#F8FAFC]">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(74,158,229,0.08) 0%, transparent 70%)",
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0 }}
      />
    </div>
  );
}
