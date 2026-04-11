import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
      <Hero />
      <section id="stack" className="min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-semibold">Tech Stack</h2>
      </section>
      <section id="featured-project" className="min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-semibold">Featured Project</h2>
      </section>
      <section id="projects" className="min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-semibold">Projects</h2>
      </section>
      <section id="career" className="min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-semibold">Career Timeline</h2>
      </section>
      <section id="contact" className="min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-semibold">Contact</h2>
      </section>
    </main>
    </>
  );
}
