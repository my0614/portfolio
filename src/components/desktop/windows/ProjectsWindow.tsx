'use client';
import { ExternalLink } from "lucide-react";

const projects = [
  {
    title: "E-Commerce Platform",
    description: "Full-stack marketplace with real-time inventory and payment processing.",
    tags: ["React", "Node.js", "Stripe"],
    year: "2024",
  },
  {
    title: "AI Dashboard",
    description: "Analytics dashboard with ML-powered insights and data visualization.",
    tags: ["TypeScript", "Python", "D3.js"],
    year: "2024",
  },
  {
    title: "Design System",
    description: "Component library with 50+ accessible components and documentation.",
    tags: ["React", "Storybook", "Figma"],
    year: "2023",
  },
  {
    title: "Mobile Banking App",
    description: "Secure fintech application with biometric auth and real-time transactions.",
    tags: ["React Native", "Firebase"],
    year: "2023",
  },
];

const ProjectsWindow = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {projects.map((p) => (
        <div
          key={p.title}
          className="group p-4 rounded-lg bg-foreground/[0.03] border border-foreground/[0.05] hover:border-primary/20 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground/90">{p.title}</h3>
            <ExternalLink size={12} strokeWidth={1.5} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{p.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">{t}</span>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{p.year}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsWindow;
