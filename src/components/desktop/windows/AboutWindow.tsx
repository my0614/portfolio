'use client';

const AboutWindow = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="text-2xl">👨‍💻</span>
        </div>
        <div>
          <h2 className="text-lg font-medium text-foreground">Developer Name</h2>
          <p className="text-sm text-muted-foreground">Full-Stack Developer & Designer</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">System Info</h3>
        <div className="space-y-2 font-mono-code text-xs">
          {[
            ["Location", "Seoul, South Korea"],
            ["Experience", "5+ years"],
            ["Specialization", "React, TypeScript, UI/UX"],
            ["Status", "Open for opportunities"],
            ["OS Version", "Portfolio.v2024.1"],
          ].map(([key, value]) => (
            <div key={key} className="flex justify-between py-1.5 border-b border-foreground/[0.05]">
              <span className="text-muted-foreground">{key}</span>
              <span className="text-foreground/80">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS", "Figma", "PostgreSQL", "AWS", "Docker", "GraphQL"].map((s) => (
            <span key={s} className="text-[11px] px-2 py-1 rounded-md bg-foreground/[0.05] text-foreground/70">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutWindow;
