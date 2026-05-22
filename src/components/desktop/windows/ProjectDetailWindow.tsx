'use client';
import { Project } from "@/data/projects";

const sectionConfig = [
  { key: "현상", label: "현상", accent: "bg-red-500/10 text-red-400" },
  { key: "원인", label: "원인", accent: "bg-orange-500/10 text-orange-400" },
  { key: "해결", label: "대응 및 해결", accent: "bg-blue-500/10 text-blue-400" },
  { key: "성과", label: "성과 및 고찰", accent: "bg-green-500/10 text-green-400" },
  { key: "회고", label: "회고 및 개선 방향", accent: "bg-purple-500/10 text-purple-400" },
] as const;

export default function ProjectDetailWindow({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-foreground/60">{project.company}</span>
          <span className="text-xs text-foreground/40">·</span>
          <span className="text-xs text-foreground/60 tabular-nums">{project.year}</span>
        </div>
        <h2 className="text-base font-semibold text-foreground mb-2">{project.title}</h2>
        <p className="text-[13px] text-foreground/65 leading-relaxed">{project.summary}</p>
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {project.tags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-primary/15 text-primary/90">{t}</span>
          ))}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] px-2 py-0.5 rounded bg-foreground/[0.05] text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
            >
              🔗 {project.link.replace("https://", "")}
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-foreground/[0.06]" />

      {/* Video */}
      {project.video && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Demo</p>
          <div className="w-full rounded-lg overflow-hidden border border-foreground/[0.06] bg-foreground/[0.02]">
            <video
              src={project.video}
              controls
              playsInline
              className="w-full h-auto block"
            />
          </div>
        </div>
      )}

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
                <p className="text-xs text-foreground/55 text-center">{img.caption}</p>
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
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded mb-3 ${accent}`}>
              {label}
            </span>
            <ul className="flex flex-col gap-2">
              {items.map((item, i) => (
                <li key={i} className="flex gap-2 text-[13px] text-foreground/70 leading-relaxed">
                  <span className="shrink-0 opacity-60 font-medium">{i + 1}.</span>
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
