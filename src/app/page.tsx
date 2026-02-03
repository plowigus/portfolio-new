"use client";

import { HeroSection } from "@/components/HeroSection";
// import { AboutSection } from "@/components/AboutSection";
// import { ProjectsList } from "@/components/ProjectsList";
import { ContactFooter } from "@/components/ContactFooter";
import DrumMachine from "@/components/tr-707/DrumMachine";


export default function Page() {
  return (
    <main>
      <HeroSection />

      <section className="py-20 bg-zinc-950 flex justify-center items-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
        <div className="w-full max-w-7xl px-4 z-10">
          <h2 className="text-3xl font-bold text-center mb-12 text-zinc-400">TR-707 <span className="text-orange-600">EMULATOR</span></h2>
          <DrumMachine />
        </div>
      </section>

      {/* <AboutSection /> */}
      {/* <ProjectsList /> */}
      <ContactFooter />
    </main>
  );
}
