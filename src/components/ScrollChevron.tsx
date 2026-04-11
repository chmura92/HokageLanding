"use client";

import { motion } from "framer-motion";

export default function ScrollChevron() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: [0, 8, 0] }}
      transition={{
        opacity: { delay: 1.5, duration: 0.5 },
        y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
      }}
      onClick={() =>
        document.getElementById("stack")?.scrollIntoView({ behavior: "smooth" })
      }
      className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white opacity-50"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </motion.div>
  );
}
