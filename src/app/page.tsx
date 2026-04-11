import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
      <section id="hero" className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold">Hero</h1>
      </section>
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
