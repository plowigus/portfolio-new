"use client";

import {
  IconReact,
  IconNextjs,
  IconTailwind,
  IconTypescript,
  IconNodejs,
  IconFigma,
  IconThreejs,
} from "@/components/icons/TechIcons";
import Code from "lucide-react/dist/esm/icons/code";
import Cpu from "lucide-react/dist/esm/icons/cpu";
import Zap from "lucide-react/dist/esm/icons/zap";
import Layers from "lucide-react/dist/esm/icons/layers";


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
  const focusAreas = [
    {
      title: "SYSTEM ARCH.",
      description: "SCALABLE BACKEND & API FOUNDATIONS",
      icon: Cpu,
    },
    {
      title: "CREATIVE DEV",
      description: "WEBGL & COMPLEX ANIMATIONS",
      icon: Code,
    },
    {
      title: "PERFORMANCE",
      description: "CORE WEB VITALS & OPTIMIZATION",
      icon: Zap,
    },
    {
      title: "UI ENGINEERING",
      description: "PIXEL-PERFECT INTERFACES",
      icon: Layers,
    },
  ];

  return (
    <section id="about" className="relative w-full bg-white text-neutral-900 border-t-2 border-neutral-900">

      <div className="max-w-7xl mx-auto px-6 md:px-12 bg-white">
        <div className="border-l-2 border-r-2 border-neutral-900 grid grid-cols-1 lg:grid-cols-12 min-h-[80vh] border-b-2 lg:border-b-0">

          <div className="lg:col-span-7 flex flex-col justify-between border-b-2 lg:border-b-0 lg:border-r-2 border-neutral-900 p-8 md:p-12 lg:p-16">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest mb-2">
                01 — ABOUT
              </h2>
              <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-12">
                Digital <br />
                Craftsmanship <br />
                With <span className="text-orange-600">Soul</span>.
              </h3>

              <div className="space-y-6 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                <p>
                  I DON'T JUST WRITE CODE. I ENGINEER EXPERIENCES.
                  MY WORK EXISTS AT THE INTERSECTION OF RAW LOGIC AND AESTHETIC PRECISION.
                </p>
                <p className="text-neutral-500">
                  NO BLOAT. NO NONSENSE. JUST PURE, PERFORMANT, AND SCALABLE SOLUTIONS.
                </p>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t-2 border-neutral-900">
              <p className="text-xs font-mono font-bold uppercase tracking-widest mb-6">
                TECH STACK
              </p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <div
                    key={skill.name}
                    className="group flex items-center gap-2 px-3 py-1.5 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors duration-0 cursor-pointer"
                  >
                    <skill.icon className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-tight">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            {focusAreas.map((area) => (
              <div
                key={area.title}
                className={`
                  flex-1 flex flex-col justify-center p-8 border-b-2 border-neutral-900 last:border-b-0 
                  hover:bg-orange-600 hover:text-white transition-colors duration-0 cursor-pointer group
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                    {area.title}
                  </h4>
                  <area.icon className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-0" />
                </div>
                <p className="font-mono text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100">
                  {area.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
