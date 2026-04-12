"use client";

import { motion } from "framer-motion";
import CountUpMetric from "./CountUpMetric";

const metrics = [
  { value: 4, label: "Modules" },
  { value: 5, label: "Engineers Led" },
  { value: 3, label: "Years" },
  { value: "On Time & On Budget", label: "Delivery" },
] as const;

const techTags = [
  ".NET Core 3.1",
  "EF Core",
  "SQL Server",
  "Angular",
  "RxJS",
  "SignalR",
  "Redis",
  "Xamarin Forms",
  "SQLite",
  "Docker",
  "Azure CI/CD",
];

const tagVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

export default function FeaturedProject() {
  return (
    <section id="projects" className="bg-surface-light py-24 px-6">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left column — text (~60%) */}
          <div className="lg:w-[60%] w-full">
            {/* Badge */}
            <span className="inline-block bg-transparent text-accent-ember border border-accent-ember/40 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Featured Project &middot; 3 Years
            </span>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink-heading">
              Nexus: Logistics Platform
            </h2>

            {/* Client */}
            <p className="text-sm text-ink-muted mt-1">
              Ecoson / Darling Ingredients
            </p>

            {/* Description */}
            <p className="text-ink-body mt-4 leading-relaxed">
              Modular monolith handling truck fleet management, route
              optimization, GPS geofencing, real-time driver tracking, ERP
              integration, automated reporting, and trip cost optimization.
              Xamarin Forms mobile app with offline mode and live sync. SSO
              across web and mobile.
            </p>

            {/* Metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {metrics.map((metric, i) => (
                <div
                  key={i}
                  className={
                    i < metrics.length - 1
                      ? "border-r border-gray-200"
                      : undefined
                  }
                >
                  <CountUpMetric value={metric.value} label={metric.label} />
                </div>
              ))}
            </div>

            {/* Role */}
            <p className="text-sm text-ink-muted mt-6">
              Solution architect &amp; team lead. Defined scope, acted as
              product owner, facilitated direct stakeholder communication.
              Delivered on schedule within budget.
            </p>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {techTags.map((tag, i) => (
                <motion.span
                  key={tag}
                  custom={i}
                  variants={tagVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-ink-heading/5 text-ink-body text-xs px-2.5 py-1 rounded font-medium"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Right column — visual (~40%) */}
          <div className="lg:w-[40%] w-full">
            <div className="rounded-xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 aspect-video w-full shadow-lg flex items-center justify-center">
              <span className="text-gray-400 text-lg font-medium select-none">
                Screenshot
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
