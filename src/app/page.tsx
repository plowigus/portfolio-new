"use client";

import { HeroSection } from "@/components/HeroSection";
// import { AboutSection } from "@/components/AboutSection";
// import { ProjectsList } from "@/components/ProjectsList";
import { ContactFooter } from "@/components/ContactFooter";
import { ProjectsSection } from "@/components/ProjectsSection";
import { AboutSection } from "@/components/AboutSection";


export default function Page() {
  return (
    <main>
      <HeroSection />

      <AboutSection />
      <ProjectsSection />

      <ContactFooter />
    </main>
  );
}
