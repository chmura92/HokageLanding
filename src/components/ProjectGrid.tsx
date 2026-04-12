"use client";

import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid() {
  return (
    <section className="bg-surface-light py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-ink-muted mb-8 text-center flex items-center justify-center gap-2.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-ember/70" aria-hidden />
          Projects
        </h2>

        <div className="flex flex-wrap justify-center gap-6">
          {projects.map((project, index) => (
            <div key={project.name} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <ProjectCard project={project} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
