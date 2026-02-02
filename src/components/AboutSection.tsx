import { useState } from "react";
import { motion } from "framer-motion";

const skills = [
  { name: "React", level: 95, color: "#61DAFB" },
  { name: "TypeScript", level: 90, color: "#3178C6" },
  { name: "Next.js", level: 92, color: "#000000" },
  { name: "Tailwind", level: 98, color: "#06B6D4" },
  { name: "Node.js", level: 85, color: "#339933" },
  { name: "Three.js", level: 75, color: "#000000" },
  { name: "Figma", level: 80, color: "#F24E1E" },
  { name: "Design", level: 88, color: "#FF69B4" },
  { name: "GSAP", level: 70, color: "#88CE02" },
  { name: "WebGL", level: 65, color: "#990000" },
];

function SkillBar({ skill }: { skill: typeof skills[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center justify-end h-full gap-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 bg-neutral-900 text-white text-xs font-mono py-1 px-3 rounded-md whitespace-nowrap z-10"
        >
          {skill.name}
        </motion.div>
      )}

      {/* Bar Track */}
      <div className="w-3 md:w-4 bg-neutral-200 rounded-full h-32 md:h-48 relative overflow-hidden">
        {/* Animated Fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ backgroundColor: skill.color }}
          initial={{ height: "0%" }}
          whileInView={{ height: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Ongoing visualizer bounce effect */}
          <motion.div
            className="w-full h-full bg-white/20"
            animate={{
              y: [0, -4, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Text Content */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-6">
              About Me
            </p>
            <h2 className="text-4xl md:text-5xl font-medium text-neutral-900 mb-8 leading-tight">
              Designing with <br />
              <span className="text-neutral-400">rhythm & soul.</span>
            </h2>
            <p className="text-sm md:text-base text-neutral-600 leading-relaxed mb-8">
              Just like a good EQ balances frequencies to create a perfect sound,
              I balance design, performance, and user experience to build digital
              products that resonate. From pixel-perfect UIs to complex 3D
              interactions, my stack is tuned for impact.
            </p>
          </div>

          {/* Audio EQ Visualizer */}
          <div className="h-64 md:h-80 flex items-end justify-between md:justify-start md:gap-4 px-4 py-8 bg-neutral-50 rounded-xl border border-neutral-100">
            {skills.map((skill) => (
              <SkillBar key={skill.name} skill={skill} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
