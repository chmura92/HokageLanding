"use client";

import Image from "next/image";
import CountUpMetric from "./CountUpMetric";
import { useReveal } from "@/hooks/useReveal";

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

function TechTag({ tag, index }: { tag: string; index: number }) {
  const ref = useReveal<HTMLSpanElement>();
  return (
    <span
      ref={ref}
      style={{ "--reveal-delay": `${index * 0.05}s` } as React.CSSProperties}
      className="reveal-fade-up bg-ink-heading/5 text-ink-body text-xs px-2.5 py-1 rounded font-medium"
    >
      {tag}
    </span>
  );
}

export default function FeaturedProject() {
  const containerRef = useReveal<HTMLDivElement>();

  return (
    <section id="projects" className="bg-surface-light py-24 px-6">
      <div ref={containerRef} className="reveal-fade-left-sm max-w-6xl mx-auto">
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
                <TechTag key={tag} tag={tag} index={i} />
              ))}
            </div>
          </div>

          {/* Right column — visual (~40%) */}
          <div className="lg:w-[40%] w-full">
            <div className="rounded-xl overflow-hidden aspect-video w-full shadow-lg relative">
              <Image
                src="/projects/nexus1.png"
                alt="Nexus logistics platform screenshot"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
