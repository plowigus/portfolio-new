"use client";

import React from "react";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import Github from "lucide-react/dist/esm/icons/github";
import {
    IconReact,
    IconNextjs,
    IconTailwind,
    IconTypescript,
    IconNodejs,
    IconThreejs,
} from "@/components/icons/TechIcons";
import { cn } from "@/lib/utils";

interface Project {
    id: string;
    title: string;
    description: string;
    tech: React.ComponentType<{ className?: string }>[];
    link?: string;
    repo?: string;
    className?: string;
}

const PROJECTS: Project[] = [
    {
        id: "p1",
        title: "E-Commerce Dashboard",
        description:
            "A high-performance analytics dashboard for online retailers. Real-time data visualization using Recharts and server-side signal processing.",
        tech: [IconNextjs, IconTypescript, IconTailwind],
        className: "md:col-span-2 md:row-span-2",
        repo: "#",
        link: "#",
    },
    {
        id: "p2",
        title: "Audio Synth WebApp",
        description:
            "Browser-based granular synthesizer with local-first architecture. 60fps audio processing and WebGL visualizations.",
        tech: [IconReact, IconThreejs, IconTypescript],
        className: "md:col-span-1 md:row-span-2",
        repo: "#",
        link: "#",
    },
    {
        id: "p3",
        title: "Portfolio 2024",
        description:
            "Minimalist developer portfolio focusing on typography, micro-interactions, and accessibility. Dark mode first design.",
        tech: [IconNextjs, IconTailwind],
        className: "md:col-span-1 md:row-span-1",
        repo: "#",
        link: "#",
    },
    {
        id: "p4",
        title: "Task Orchestrator",
        description:
            "Distributed task queue management system with visual workflow builder. Built for enterprise scalability.",
        tech: [IconNodejs, IconTypescript],
        className: "md:col-span-2 md:row-span-1",
        repo: "#",
        link: "#",
    },
];

function ProjectCard({ project }: { project: Project }) {
    return (
        <div
            className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-neutral-900/50",
                project.className
            )}
        >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 -z-10 translate-y-full bg-linear-to-t from-neutral-800/20 to-transparent transition-transform duration-500 group-hover:translate-y-0" />

            {/* Content Top */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                        {project.tech.map((Icon, idx) => (
                            <div key={idx} className="p-1.5 rounded-full bg-black/20 text-neutral-400 group-hover:text-white transition-colors">
                                <Icon className="w-4 h-4" />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        {project.repo && (
                            <a href={project.repo} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                                <Github className="w-5 h-5" />
                            </a>
                        )}
                        {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                                <ArrowUpRight className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-neutral-200 group-hover:text-white transition-colors">
                        {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-400 leading-relaxed max-w-[90%] group-hover:text-neutral-300 transition-colors">
                        {project.description}
                    </p>
                </div>
            </div>

            {/* Decorative bottom line */}
            <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-linear-to-r from-orange-400 to-red-600 transition-transform duration-500 group-hover:scale-x-100" />
        </div>
    );
}

export function ProjectsSection() {
    return (
        <section id="works" className="py-24 md:py-32 bg-zinc-950 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-900/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-sm font-mono uppercase tracking-widest text-orange-600 mb-2">
                            Selected Works
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            Featured Projects
                        </h3>
                    </div>

                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px]">
                    {PROJECTS.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </section>
    );
}
