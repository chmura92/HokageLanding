"use client";

import { techGroups, methodologies } from "../data/skills";
import { getIcon } from "../lib/iconMap";
import { useReveal } from "@/hooks/useReveal";

function TechCard({ name, index }: { name: string; index: number }) {
  const iconData = getIcon(name);
  const brandColor = iconData ? `#${iconData.icon.hex}` : undefined;
  const svgPath = iconData?.icon.path ?? null;
  const viewBox = (iconData?.kind === 'custom' && iconData.icon.viewBox) ? iconData.icon.viewBox : "0 0 24 24";
  const fillRule = (iconData?.kind === 'custom' ? iconData.icon.fillRule : undefined) ?? 'nonzero';
  const ref = useReveal<HTMLDivElement>({ rootMargin: "-30px" });

  const style: React.CSSProperties = {
    "--reveal-delay": `${0.05 + index * 0.03}s`,
  } as React.CSSProperties;
  if (brandColor) {
    (style as Record<string, string>)["--brand-color"] = brandColor;
  }

  return (
    <div
      ref={ref}
      style={style}
      className="reveal-fade-up group flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-3 w-[88px] cursor-default
        hover:border-white/20 hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] hover:scale-105 transition-all duration-300"
    >
      {svgPath ? (
        <svg
          role="img"
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 fill-white/60 group-hover:fill-[var(--brand-color)] transition-[fill] duration-300"
          aria-label={name}
        >
          <path d={svgPath} fillRule={fillRule} />
        </svg>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors duration-300">
          <span className="text-[9px] font-bold text-gray-400 group-hover:text-gray-200 transition-colors duration-300 text-center leading-tight px-1">
            {name.split(/[\s.\-_·]+/).map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 4)}
          </span>
        </div>
      )}
      <span className="text-[10px] uppercase tracking-wide text-gray-400 group-hover:text-gray-200 transition-colors duration-300 text-center leading-tight w-full break-words">
        {name}
      </span>
    </div>
  );
}

function MethodologyTag({ tag, index }: { tag: string; index: number }) {
  const ref = useReveal<HTMLSpanElement>({ rootMargin: "-40px" });
  return (
    <span
      ref={ref}
      style={{ "--reveal-delay": `${index * 0.03}s` } as React.CSSProperties}
      className="reveal-fade-up text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-2
        hover:bg-white/10 hover:border-accent-blue/30 hover:text-white
        hover:shadow-[0_0_12px_rgba(74,158,229,0.15)]
        transition-all duration-300 cursor-default"
    >
      {tag}
    </span>
  );
}

export default function TechStack() {
  return (
    <section id="stack" className="bg-space-lifted py-24 px-6">
      <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-12 text-center flex items-center justify-center gap-2.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-ember shadow-[0_0_8px_rgba(232,93,58,0.6)]" aria-hidden />
        Stack
      </h2>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {techGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-4 text-center md:text-left">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                {group.label}
              </h3>
              <div className="mt-1.5 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {group.technologies.map((tech, i) => (
                <TechCard key={tech.name} name={tech.name} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Methodology buzzword tags */}
      <div className="max-w-5xl mx-auto mt-16">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 text-center mb-6">
          Practices & Methodologies
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {methodologies.map((tag, i) => (
            <MethodologyTag key={tag} tag={tag} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
