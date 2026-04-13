"use client";

import MeshGradient from "./MeshGradient";
import ScrollChevron from "./ScrollChevron";

/* Simple pill-style tech labels */
const techLabels = [".NET", "Angular", "React", "Azure"];

/* Listed explicitly so Tailwind JIT picks them up */
const wordClasses = [
  "animate-hero-word-1",
  "animate-hero-word-2",
  "animate-hero-word-3",
] as const;

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen relative flex items-center justify-center"
    >
      {/* CSS mesh gradient background */}
      <MeshGradient />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Photo */}
          <div className="shrink-0 self-center animate-hero-photo">
            <div
              className="relative rounded-full w-32 h-32 md:w-40 md:h-40 ring-2 ring-accent-blue/40 shadow-[0_0_0_5px_rgba(232,93,58,0.15)] overflow-hidden"
              style={{
                backgroundImage: "url(/me.jpg)",
                backgroundSize: "230%",
                backgroundPosition: "50% 12%",
                backgroundRepeat: "no-repeat",
                backgroundColor: "#0B1221",
              }}
            >
              {/* Vignette: fades white photo background into site dark navy */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 38%, transparent 28%, rgba(11,18,33,0.55) 58%, rgba(11,18,33,0.96) 78%)",
                }}
              />
            </div>
          </div>

          {/* Text content */}
          <div className="text-center md:text-left">
            {/* Tagline */}
            <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white before:absolute before:-inset-x-12 before:-inset-y-6 before:-z-10 before:rounded-full before:bg-accent-ember/30 before:blur-[80px] before:pointer-events-none">
              {["Single", "Man", "Army"].map((word, i) => (
                <span key={i} className={`inline-block mr-4 ${wordClasses[i]}`}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-400 mt-4 animate-hero-subtitle">
              Senior Full-Stack .NET Architect &middot; 10+ Years &middot;
              Teams, Products &amp; Code &mdash; End to End
            </p>

            {/* Location */}
            <p className="text-sm text-gray-500 mt-2 animate-hero-location">
              Opole, Poland &middot; Remote
            </p>

            {/* Tech labels */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6 animate-hero-labels">
              {techLabels.map((label) => (
                <span
                  key={label}
                  className="text-xs font-medium text-white border border-white/20 rounded-full px-3 py-1"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8 animate-hero-ctas">
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
                href="/resume.pdf"
                download
                className="bg-accent-ember/15 border border-accent-ember/50 text-accent-ember-soft px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-accent-ember hover:border-accent-ember hover:text-white"
              >
                Download CV
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll chevron */}
      <ScrollChevron />
    </section>
  );
}
