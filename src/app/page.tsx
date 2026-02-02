"use client";

import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import "../index.css";

export default function Page() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
    </main>
  );
}
