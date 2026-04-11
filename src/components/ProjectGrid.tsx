"use client";

import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid() {
  return (
    <section className="bg-surface-light py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-ink-muted mb-8 text-center">
          Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
