"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import MeshGradient from "./MeshGradient";
import ScrollChevron from "./ScrollChevron";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* Simple pill-style tech labels */
const techLabels = [".NET", "Angular", "React", "Azure", "Docker"];

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen relative flex items-center justify-center"
    >
      {/* Three.js mesh gradient background */}
      <MeshGradient />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="shrink-0"
          >
            <Image
              src="/photo.png"
              alt="Roman Duzynski"
              width={160}
              height={160}
              priority
              className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover object-[center_15%] ring-2 ring-accent-blue/30"
            />
          </motion.div>

          {/* Text content */}
          <div>
            {/* Tagline */}
            <motion.h1
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white"
            >
              {["Single", "Man", "Army"].map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  className="inline-block mr-4"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-lg md:text-xl text-gray-400 mt-4"
            >
              Senior Full-Stack .NET Architect &middot; 10+ Years &middot;
              Teams, Products &amp; Code &mdash; End to End
            </motion.p>

            {/* Location */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-sm text-gray-500 mt-2"
            >
              Opole, Poland &middot; Remote
            </motion.p>

            {/* Tech labels */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex flex-wrap gap-3 mt-6"
            >
              {techLabels.map((label) => (
                <span
                  key={label}
                  className="text-xs font-medium text-white border border-white/20 rounded-full px-3 py-1"
                >
                  {label}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex gap-4 mt-8"
            >
              <button
                onClick={() =>
                  document
                    .getElementById("projects")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-accent-blue hover:bg-accent-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                View Projects
              </button>
              <a
                href="#"
                className="border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/5 transition-colors"
              >
                Download CV
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll chevron */}
      <ScrollChevron />
    </section>
  );
}
