import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface Project {
  id: string;
  name: string;
  category: string;
}

const projects: Project[] = [
  {
    id: "ward",
    name: "WARD",
    category: "Webflow Development",
  },
  {
    id: "superlink",
    name: "SUPERLINK",
    category: "Framer Development",
  },
  {
    id: "okalpha",
    name: "OKALPHA",
    category: "Webflow Development",
  },
  {
    id: "karoo",
    name: "KAROO",
    category: "Webflow Development",
  },
  {
    id: "nexus",
    name: "NEXUS",
    category: "React Development",
  },
  {
    id: "velocity",
    name: "VELOCITY",
    category: "UI/UX Design",
  },
  {
    id: "horizon",
    name: "HORIZON",
    category: "Full Stack Development",
  },
];

export function WorkSection() {
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const projectsContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!sectionRef.current || !projectsContainerRef.current) return;

    const totalProjects = projects.length;
    const scrollPerProject = 600; // 600px scroll per project transition
    const totalScrollDistance = scrollPerProject * (totalProjects - 1);

    // Set initial positions for all projects
    projectRefs.current.forEach((project, index) => {
      if (!project) return;

      if (index === 0) {
        // First project is active
        gsap.set(project, {
          y: 0,
          opacity: 1,
          scale: 1,
          zIndex: totalProjects,
        });
      } else {
        // Other projects are stacked below
        gsap.set(project, {
          y: index * 140,
          opacity: Math.max(0, 1 - index * 0.4),
          scale: 1 - index * 0.02,
          zIndex: totalProjects - index,
        });
      }
    });

    // Create the pinned scroll effect
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: () => `+=${totalScrollDistance}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.3,
      markers: false, // Disable debug markers
      onUpdate: (self) => {
        const progress = self.progress;

        // Calculate which project should be "active" (on top)
        const exactPosition = progress * (totalProjects - 1);
        const currentIndex = Math.min(
          Math.round(exactPosition),
          totalProjects - 1
        );
        setActiveIndex(currentIndex);

        // Debug log
        console.log({
          progress: progress.toFixed(3),
          exactPosition: exactPosition.toFixed(2),
          currentIndex,
          activeProject: projects[currentIndex]?.name,
        });

        // Update individual project - stacking card effect
        projectRefs.current.forEach((project, index) => {
          if (!project) return;

          // How far this project is from being "current"
          const offset = exactPosition - index;

          if (offset < 0) {
            // Project is below current (not yet reached) - stack below
            const stackOffset = Math.abs(offset);
            gsap.set(project, {
              y: stackOffset * 140, // Stack below with more spacing
              opacity: Math.max(0, 1 - stackOffset * 1.2),
              scale: 1 - stackOffset * 0.6,
              zIndex: totalProjects - index,
            });
          } else if (offset >= 0 && offset < 1) {
            // Currently transitioning out (moving up)
            gsap.set(project, {
              y: -offset * 140, // Move up as we scroll
              opacity: 1 - offset * 0.8,
              scale: 1,
              zIndex: totalProjects - index,
            });
          } else {
            // Already passed - hidden above
            gsap.set(project, {
              y: -100,
              opacity: 0,
              scale: 1,
              zIndex: 0,
            });
          }
        });
      },
    });

    return () => {
      trigger.kill();
      ScrollTrigger.refresh();
    };
  }, []);

  const handleProjectClick = (index: number) => {
    const totalProjects = projects.length;


    // Get the ScrollTrigger instance for this section
    const triggers = ScrollTrigger.getAll();
    const sectionTrigger = triggers.find(
      (t) => t.trigger === sectionRef.current
    );

    if (sectionTrigger) {
      // Calculate target progress for this project
      const targetProgress = index / (totalProjects - 1);
      // Get the scroll range of the trigger
      const triggerStart = sectionTrigger.start;
      const triggerEnd = sectionTrigger.end;
      const targetScroll =
        triggerStart + targetProgress * (triggerEnd - triggerStart);

      gsap.to(window, {
        scrollTo: { y: targetScroll, autoKill: false },
        duration: 0.8,
        ease: "power2.inOut",
      });
    }
  };

  return (
    <section
      id="works"
      className="min-h-screen bg-white relative"
      ref={sectionRef}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Left Column - Fixed description */}
          <div className="space-y-6" ref={leftColumnRef}>
            <h2 className="text-sm tracking-[0.3em] uppercase text-neutral-800">
              Work
            </h2>

            <div className="space-y-4 max-w-md">
              <p className="text-neutral-700 leading-relaxed">
                This is a showcase of my best work in a variety of fields
                including Graphic and Web Design, No-Code Development, Product
                Design and Product Management.
              </p>

              <p className="text-neutral-700 leading-relaxed">
                The world of digital design and development is constantly
                evolving and so has my role throughout my career.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="pt-8">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-neutral-500">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <div className="w-24 h-px bg-neutral-200 relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-neutral-800 transition-all duration-300"
                    style={{
                      width: `${((activeIndex + 1) / projects.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-mono text-neutral-500">
                  {String(projects.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Stacking projects */}
          <div className="relative h-[400px] overflow-hidden">
            <div ref={projectsContainerRef} className="relative h-full">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  ref={(el) => {
                    projectRefs.current[index] = el;
                  }}
                  className="absolute top-0 left-0 w-full group cursor-pointer"
                  style={{ zIndex: projects.length - index }}
                  onClick={() => handleProjectClick(index)}
                >
                  <a
                    href="#"
                    className="block"
                    onClick={(e) => e.preventDefault()}
                  >
                    <h3
                      className={`text-4xl md:text-5xl lg:text-6xl tracking-tight mb-2 transition-colors duration-300 ${index === activeIndex
                        ? "text-neutral-900"
                        : "text-neutral-400 group-hover:text-neutral-600"
                        }`}
                    >
                      {project.name}
                    </h3>
                    <p
                      className={`text-xs md:text-sm tracking-[0.15em] uppercase transition-colors duration-300 ${index === activeIndex
                        ? "text-neutral-600"
                        : "text-neutral-400"
                        }`}
                    >
                      — {project.category}
                    </p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
