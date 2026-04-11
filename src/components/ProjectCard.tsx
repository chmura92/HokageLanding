"use client";

import { motion } from "framer-motion";
import type { Project } from "@/data/projects";

const gradients = [
  "bg-gradient-to-br from-space-deep/80 to-accent-blue/20",
  "bg-gradient-to-tr from-space-deep/70 to-accent-teal/20",
  "bg-gradient-to-bl from-accent-blue/30 to-space-deep/80",
  "bg-gradient-to-tl from-accent-teal/20 to-space-deep/70",
  "bg-gradient-to-r from-space-deep/80 to-accent-blue/30",
];

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const gradient = gradients[index % gradients.length];

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200"
    >
      {/* Placeholder image area */}
      <div
        className={`aspect-video ${gradient} flex items-center justify-center`}
      >
        <span className="text-white text-xl font-bold">{project.name}</span>
      </div>

      {/* Body */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-ink-heading">{project.name}</h3>
        <p className="text-sm text-ink-body mt-2 line-clamp-2">
          {project.description}
        </p>

        {/* Role badge */}
        <div className="mt-3">
          {project.roleType === "professional" ? (
            <span className="bg-ink-heading/10 text-ink-heading text-xs font-medium px-2 py-0.5 rounded inline-block">
              {project.role}
            </span>
          ) : (
            <span className="bg-accent-teal/10 text-accent-teal text-xs font-medium px-2 py-0.5 rounded inline-block">
              Side Project
            </span>
          )}
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-xs text-ink-muted bg-gray-100 px-2 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (project.url) {
    return (
      <a href={project.url} target="_blank" rel="noopener noreferrer">
        {card}
      </a>
    );
  }

  return card;
}
