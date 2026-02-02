import { useState } from "react";
import {
  IconReact,
  IconTypescript,
  IconNextjs,
  IconTailwind,
  IconNodejs,
  IconFigma,
  IconWordpress,
  IconThreejs,
} from "./icons/TechIcons";

export function AboutSection() {
  const technologies = [
    { name: "React", icon: IconReact, color: "#61DAFB" },
    { name: "TypeScript", icon: IconTypescript, color: "#3178C6" },
    { name: "Next.js", icon: IconNextjs, color: "#000000" },
    { name: "Tailwind CSS", icon: IconTailwind, color: "#06B6D4" },
    { name: "Node.js", icon: IconNodejs, color: "#339933" },
    { name: "Figma", icon: IconFigma, color: "#F24E1E" },
    { name: "WordPress", icon: IconWordpress, color: "#21759B" },
    { name: "Three.js", icon: IconThreejs, color: "#000000" },
  ];

  return (
    <section
      id="about"
      className="py-20 md:py-32 bg-neutral-50 border-t border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 text-center mb-8">
          About Me
        </p>

        <h2 className="text-4xl md:text-5xl lg:text-6xl text-center text-neutral-900 mb-8 leading-tight">
          A bespoke web designer on
          <br />
          a mission to elevate value
          <br />
          driven brands.
        </h2>

        <p className="text-center text-sm text-neutral-600 max-w-2xl mx-auto mb-16 leading-relaxed">
          I create elegant visual experiences with meticulous attention to
          detail for purpose-driven brands and ambitious entrepreneurs looking
          to scale their business through powerful brand storytelling.
        </p>

        {/* Technologies Grid */}
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 text-center mb-8">
            Technologies & Tools
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {technologies.map((tech, index) => {
              const Icon = tech.icon;
              const [isHovered, setIsHovered] = useState(false);

              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center py-6 px-4 border border-neutral-300 rounded-sm hover:border-neutral-900 hover:bg-white transition-all group"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <Icon
                    className="w-8 h-8 mb-3 transition-colors"
                    style={{
                      color: isHovered ? tech.color : "#404040",
                    }}
                  />
                  <span className="text-xs text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    {tech.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
