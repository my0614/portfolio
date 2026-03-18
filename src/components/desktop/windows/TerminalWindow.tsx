'use client';

const TerminalWindow = () => {
  return (
    <div className="font-mono-code text-xs space-y-1 text-foreground/70">
      <div><span className="text-primary">~</span> whoami</div>
      <div className="text-foreground/50">Full-Stack Developer with a passion for pixel-perfect UI</div>
      <div className="mt-3"><span className="text-primary">~</span> cat skills.json</div>
      <div className="text-foreground/50">{"{"}</div>
      <div className="text-foreground/50 pl-4">"frontend": ["React", "TypeScript", "Tailwind"],</div>
      <div className="text-foreground/50 pl-4">"backend": ["Node.js", "PostgreSQL", "Redis"],</div>
      <div className="text-foreground/50 pl-4">"tools": ["Figma", "Docker", "AWS"]</div>
      <div className="text-foreground/50">{"}"}</div>
      <div className="mt-3"><span className="text-primary">~</span> echo $STATUS</div>
      <div className="text-primary/80">Open for opportunities ✦</div>
      <div className="mt-3 flex items-center">
        <span className="text-primary">~</span>
        <span className="ml-1 w-2 h-3.5 bg-primary animate-blink inline-block" />
      </div>
    </div>
  );
};

export default TerminalWindow;
