'use client';
import { Project } from "@/data/projects";

const sectionConfig = [
  { key: "현상", label: "현상", accent: "bg-red-500/10 text-red-400" },
  { key: "원인", label: "원인", accent: "bg-orange-500/10 text-orange-400" },
  { key: "해결", label: "대응 및 해결", accent: "bg-blue-500/10 text-blue-400" },
  { key: "성과", label: "성과 및 고찰", accent: "bg-green-500/10 text-green-400" },
] as const;

export default function ProjectDetailWindow({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-muted-foreground">{project.company}</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">{project.year}</span>
        </div>
        <h2 className="text-[15px] font-semibold text-foreground/90 mb-2">{project.title}</h2>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{project.summary}</p>
        <div className="flex gap-1.5 flex-wrap mt-3">
          {project.tags.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary/80">{t}</span>
          ))}
        </div>
      </div>

      <div className="border-t border-foreground/[0.06]" />

      {/* Images */}
      {project.images && project.images.length > 0 && (
        <div className="flex flex-col gap-3">
          {project.images.map((img, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="w-full rounded-lg overflow-hidden border border-foreground/[0.06] bg-foreground/[0.02]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.caption ?? `${project.title} 이미지 ${i + 1}`}
                  className="w-full h-auto block"
                />
              </div>
              {img.caption && (
                <p className="text-[10px] text-muted-foreground text-center">{img.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      {sectionConfig.map(({ key, label, accent }) => {
        const items = project.sections[key];
        if (!items || items.length === 0) return null;
        return (
          <div key={key}>
            <span className={`inline-block text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded mb-3 ${accent}`}>
              {label}
            </span>
            <ul className="flex flex-col gap-2">
              {items.map((item, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-muted-foreground leading-relaxed">
                  <span className="shrink-0 opacity-40 font-medium">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
