"use client";

import { motion } from "framer-motion";

export default function PersonalConnection() {
  return (
    <section className="bg-surface-light py-24 px-6">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
      </motion.div>
    </section>
  );
}
