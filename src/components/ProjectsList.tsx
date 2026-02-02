

interface Project {
  name: string;
  category: string;
}

const projects: Project[] = [
  {
    name: 'WARD',
    category: 'Webflow Development'
  },
  {
    name: 'SUPERLINK',
    category: 'Framer Development'
  },
  {
    name: 'OKALPHA',
    category: 'Webflow Development'
  },
  {
    name: 'KAROO',
    category: 'Webflow Development'
  }
];

export function ProjectsList() {
  return (
    <div className="space-y-12 md:space-y-16">
      {projects.map((project, index) => (
        <a
          key={index}
          href="#"
          className="block group transition-transform hover:-translate-y-1"
        >
          <h3 className="text-4xl md:text-5xl lg:text-6xl tracking-tight text-neutral-900 mb-2 group-hover:text-neutral-600 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs md:text-sm tracking-[0.15em] uppercase text-neutral-500">
            — {project.category}
          </p>
        </a>
      ))}
    </div>
  );
}
