'use client';
import { Project } from "@/data/projects";

export default function ProjectDetailWindow({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-5">

      {/* Images — 제목 위 */}
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

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-foreground/60">{project.company}</span>
          <span className="text-xs text-foreground/40">·</span>
          <span className="text-xs text-foreground/60 tabular-nums">{project.year}</span>
        </div>
        <h2 className="text-base font-semibold text-foreground mb-2">{project.title}</h2>
        <p className="text-[13px] text-foreground/65 leading-relaxed">{project.summary}</p>
        {project.description && (
          <p className="text-[13px] text-foreground/55 leading-relaxed mt-2">{project.description}</p>
        )}
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

      {/* 기획의도 */}
      {project.sections.기획의도 && (
        <div>
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded mb-3 bg-foreground/[0.06] text-foreground/60">
            기획 의도
          </span>
          <ul className="flex flex-col gap-1.5">
            {project.sections.기획의도.map((item, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-foreground/70 leading-relaxed">
                <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-foreground/30" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 아키텍처 */}
      {project.sections.아키텍처 && (
        <div className="flex flex-col gap-1.5">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded mb-1 bg-foreground/[0.06] text-foreground/60">
            아키텍처
          </span>
          <div className="w-full rounded-lg overflow-hidden border border-foreground/[0.06] bg-foreground/[0.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.sections.아키텍처}
              alt="아키텍처 다이어그램"
              className="w-full h-auto block"
            />
          </div>
        </div>
      )}

      {/* 기술 섹션 */}
      {project.sections.기술 && project.sections.기술.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 w-fit">
            기술 상세
          </span>
          {project.sections.기술.map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-foreground/[0.03] border border-foreground/[0.05]">
              <h3 className="text-[13px] font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-[12px] text-foreground/65 leading-relaxed">{item.description}</p>
              {item.points && item.points.length > 0 && (
                <ul className="mt-2.5 flex flex-col gap-1.5 border-t border-foreground/[0.05] pt-2.5">
                  {item.points.map((point, j) => (
                    <li key={j} className="flex gap-2 text-[12px] text-foreground/55 leading-relaxed">
                      <span className="shrink-0 text-primary/50">·</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 성과 */}
      {project.sections.성과 && project.sections.성과.length > 0 && (
        <div>
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded mb-3 bg-green-500/10 text-green-400">
            성과
          </span>
          <ul className="flex flex-col gap-2">
            {project.sections.성과.map((item, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-foreground/70 leading-relaxed">
                <span className="shrink-0 opacity-60 font-medium">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 기대효과 */}
      {project.sections.기대효과 && project.sections.기대효과.length > 0 && (
        <div>
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded mb-3 bg-cyan-500/10 text-cyan-400">
            기대효과
          </span>
          <ul className="flex flex-col gap-2">
            {project.sections.기대효과.map((item, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-foreground/70 leading-relaxed">
                <span className="shrink-0 opacity-60 font-medium">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 회고 */}
      {project.sections.회고 && project.sections.회고.length > 0 && (
        <div>
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded mb-3 bg-purple-500/10 text-purple-400">
            회고 및 개선 방향
          </span>
          <ul className="flex flex-col gap-2">
            {project.sections.회고.map((item, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-foreground/70 leading-relaxed">
                <span className="shrink-0 opacity-60 font-medium">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
