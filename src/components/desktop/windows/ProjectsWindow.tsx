'use client';
import { projects } from "@/data/projects";

interface Props {
  onOpenDetail: (idx: number) => void;
}

export default function ProjectsWindow({ onOpenDetail }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {projects.map((p, idx) => (
        <div
          key={p.id}
          onPointerDown={(e) => { e.stopPropagation(); onOpenDetail(idx); }}
          className="p-4 rounded-lg bg-foreground/[0.03] border border-foreground/[0.05] hover:border-primary/30 hover:bg-foreground/[0.06] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-medium text-foreground/90">{p.title}</h3>
            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 ml-2">{p.year}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{p.summary}</p>
          <div className="flex gap-1.5 flex-wrap">
            {p.tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
