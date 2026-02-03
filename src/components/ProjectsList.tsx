
"use client";

import { motion } from "framer-motion";

interface Project {
  name: string;
  category: string;
  color: string;
}

const projects: Project[] = [
  {
    name: 'WARD',
    category: 'Webflow Development',
    color: 'bg-gradient-to-br from-orange-400 to-red-500'
  },
  {
    name: 'SUPERLINK',
    category: 'Framer Development',
    color: 'bg-gradient-to-br from-blue-400 to-purple-500'
  },
  {
    name: 'OKALPHA',
    category: 'Webflow Development',
    color: 'bg-gradient-to-br from-green-400 to-emerald-600'
  },
  {
    name: 'KAROO',
    category: 'Webflow Development',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500'
  }
];

export function ProjectsList() {
  return (
    <section id="works" className="py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-6">
          Selected Works
        </p>
        <h2 className="text-4xl md:text-5xl font-medium text-neutral-900">
          Digging through <br />
          <span className="text-neutral-400">the archives.</span>
        </h2>
      </div>

      {/* Horizontal Scroll Container (Crate) */}
      <div className="flex overflow-x-auto snap-x snap-mandatory py-10 px-6 md:px-12 gap-8 md:gap-12 pb-20 scrollbar-hide">
        {projects.map((project, index) => (
          <div
            key={index}
            className="relative group shrink-0 w-[85vw] md:w-96 aspect-square snap-center perspective-1000"
          >
            {/* The "Record Sleeve" (Card Front) */}
            <div className={`relative z-20 w-full h-full ${project.color} rounded-md shadow-2xl flex items-center justify-center`}>
              <div className="w-full h-full bg-black/10 absolute inset-0 rounded-md" /> {/* Texture overlay */}
              <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mix-blend-overlay">
                {project.name}
              </h3>
            </div>

            {/* The "Inner Sleeve" (Details) - Slides out */}
            <motion.div
              className="absolute top-2 bottom-2 left-2 right-2 bg-white rounded-sm z-10 flex flex-col justify-end p-6 border border-neutral-200 shadow-lg"
              initial={{ x: 0, scale: 0.95 }}
              whileHover={{
                x: 60,
                y: -20,
                scale: 1,
                rotate: 2
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="text-right">
                <h4 className="text-2xl font-bold text-neutral-900">{project.name}</h4>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mt-1">
                  {project.category}
                </p>
                <button className="mt-4 text-xs font-mono uppercase bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-700 transition-colors">
                  View Case
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
