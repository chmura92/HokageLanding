import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TechStack from "@/components/TechStack";
import SectionTransition from "@/components/SectionTransition";
import FeaturedProject from "@/components/FeaturedProject";
import ProjectGrid from "@/components/ProjectGrid";
import CareerTimeline from "@/components/CareerTimeline";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TechStack />
        <SectionTransition />
        <FeaturedProject />
        <ProjectGrid />
        <CareerTimeline />
        <Contact />
      </main>
    </>
  );
}
