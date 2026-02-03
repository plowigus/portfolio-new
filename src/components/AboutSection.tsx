"use client";

import { ThreadsBackground } from "./ThreadsBackground";
import {
  IconReact,
  IconNextjs,
  IconTailwind,
  IconTypescript,
  IconNodejs,
  IconFigma,
  IconThreejs,
} from "@/components/icons/TechIcons";


const SKILLS = [
  { name: "React 19", icon: IconReact },
  { name: "Next.js", icon: IconNextjs },
  { name: "TypeScript", icon: IconTypescript },
  { name: "Tailwind CSS", icon: IconTailwind },
  { name: "Node.js", icon: IconNodejs },
  { name: "Three.js", icon: IconThreejs },
  { name: "Figma", icon: IconFigma },
  // { name: "WordPress", icon: IconWordpress }, // Optional
];

export function AboutSection() {
  return (
    <section id="about" className="relative w-full min-h-[80vh] flex items-center bg-white overflow-hidden py-24 md:py-0">

      <div className="absolute inset-0 z-0">
        {/* Threads Background positioned to flow from right */}
        <ThreadsBackground />
        {/* Fade overlay to blend with white background naturally */}
        <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">

          {/* Left Column: Text Content */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-orange-600 mb-4">
                About Me
              </h2>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
                Crafting digital <br />
                experiences with <span className="text-neutral-400">soul.</span>
              </h3>
            </div>

            <div className="prose prose-neutral text-neutral-600 text-lg leading-relaxed space-y-6">
              <p>
                I am a multidisciplinary developer and designer obsessed with the intersection of logic and aesthetics.
                My work is driven by a simple philosophy: digital products should be intuitive, performant, and beautiful.
              </p>
              <p>
                With a background in both <strong className="text-neutral-900 font-medium">System Architecture</strong> and <strong className="text-neutral-900 font-medium">Creative Coding</strong>, I bridge the gap between robust engineering and delightful user interactions.
                Whether it's optimizing Core Web Vitals or crafting granular WebGL shaders, I treat every line of code as a craft.
              </p>
            </div>

            {/* Skills Cluster */}
            <div className="mt-8 pt-8 border-t border-neutral-200">
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-6">
                Technologies & Tools
              </p>
              <div className="flex flex-wrap gap-4">
                {SKILLS.map((skill) => (
                  <div key={skill.name} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full border border-neutral-200 hover:border-orange-200 hover:bg-orange-50 transition-colors duration-300">
                    <skill.icon className="w-5 h-5 text-neutral-700" />
                    <span className="text-sm font-medium text-neutral-800">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Space (Managed by ThreadsBackground but we can add a foreground element if needed) */}
          <div className="hidden md:flex flex-col justify-center items-center h-full min-h-[500px] relative">
            {/* 
                The ThreadsBackground renders particles. 
                We can add a subtle callout or stat here if desired.
                For now, we let the negative space and the animation breathe.
             */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}
