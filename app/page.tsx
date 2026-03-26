'use client';
import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { FolderOpen, User, Mail, Terminal, FileText } from "lucide-react";
import BootScreen from "@/components/desktop/BootScreen";
import Taskbar from "@/components/desktop/Taskbar";
import Dock from "@/components/desktop/Dock";
import DesktopIcon from "@/components/desktop/DesktopIcon";
import Window from "@/components/desktop/Window";
import ProjectsWindow from "@/components/desktop/windows/ProjectsWindow";
import ProjectDetailWindow from "@/components/desktop/windows/ProjectDetailWindow";
import AboutWindow from "@/components/desktop/windows/AboutWindow";
import ContactWindow from "@/components/desktop/windows/ContactWindow";
import TerminalWindow from "@/components/desktop/windows/TerminalWindow";
import ResumeWindow from "@/components/desktop/windows/ResumeWindow";
import { projects } from "@/data/projects";

type WinConfig = { title: string; width: number; height: number; x: number; y: number };

const staticConfigs: Record<string, WinConfig> = {
  projects: { title: "Projects.dmg", width: 660, height: 520, x: 150, y: 70 },
  about:    { title: "System Preferences", width: 500, height: 560, x: 250, y: 100 },
  contact:  { title: "Mail.app", width: 450, height: 520, x: 350, y: 60 },
  terminal: { title: "Terminal", width: 520, height: 360, x: 200, y: 120 },
  resume:   { title: "Resume.pdf", width: 720, height: 600, x: 160, y: 60 },
};

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [zOrder, setZOrder] = useState<string[]>([]);
  const [minimized, setMinimized] = useState<Set<string>>(new Set());

  const openWindow = useCallback((id: string) => {
    setMinimized(prev => { const n = new Set(prev); n.delete(id); return n; });
    setOpenWindows(prev => prev.includes(id) ? prev : [...prev, id]);
    setZOrder(prev => [...prev.filter(w => w !== id), id]);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setOpenWindows(prev => prev.filter(w => w !== id));
    setZOrder(prev => prev.filter(w => w !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setMinimized(prev => new Set(prev).add(id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setZOrder(prev => [...prev.filter(w => w !== id), id]);
  }, []);

  const openProjectDetail = useCallback((idx: number) => {
    openWindow(`project-${idx}`);
  }, [openWindow]);

  const getConfig = (id: string): WinConfig | null => {
    if (staticConfigs[id]) return staticConfigs[id];
    if (id.startsWith("project-")) {
      const idx = parseInt(id.split("-")[1]);
      const p = projects[idx];
      if (!p) return null;
      return { title: p.title, width: 680, height: 640, x: 180 + idx * 28, y: 80 + idx * 20 };
    }
    return null;
  };

  const renderContent = (id: string) => {
    if (id === "projects") return <ProjectsWindow onOpenDetail={openProjectDetail} />;
    if (id === "about")    return <AboutWindow />;
    if (id === "contact")  return <ContactWindow />;
    if (id === "terminal") return <TerminalWindow />;
    if (id === "resume")   return <ResumeWindow />;
    if (id.startsWith("project-")) {
      const idx = parseInt(id.split("-")[1]);
      return projects[idx] ? <ProjectDetailWindow project={projects[idx]} /> : null;
    }
    return null;
  };

  const dockItems = [
    { id: "projects", icon: FolderOpen, label: "Projects" },
    { id: "about",    icon: User,       label: "About" },
    { id: "contact",  icon: Mail,       label: "Contact" },
    { id: "terminal", icon: Terminal,   label: "Terminal" },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.02]" />

      <AnimatePresence>
        {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      {booted && (
        <>
          <Taskbar onOpenWindow={openWindow} />

          <div className="absolute top-12 right-6 flex flex-col gap-1">
            <DesktopIcon icon={FolderOpen} label="Projects"   onDoubleClick={() => openWindow("projects")} />
            <DesktopIcon icon={User}       label="About Me"   onDoubleClick={() => openWindow("about")} />
            <DesktopIcon icon={Mail}       label="Contact"    onDoubleClick={() => openWindow("contact")} />
            <DesktopIcon icon={Terminal}   label="Terminal"   onDoubleClick={() => openWindow("terminal")} />
            <DesktopIcon icon={FileText}   label="Resume.pdf" onDoubleClick={() => openWindow("resume")} />
          </div>

          <div className="absolute top-1/2 left-12 -translate-y-1/2 max-w-md">
            <p className="font-mono-code text-xs text-muted-foreground mb-2">System.version: 2026.1</p>
            <h1 className="text-3xl font-medium text-foreground/90 tracking-tight mb-3 text-balance">
              김민영 ML / MLOps Engineer
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              데이터 수집부터 모델 개발, 배포·운영까지 End-to-End ML 파이프라인 구축에 강점을 가진 5년차 개발자. Double-click to explore.
            </p>
          </div>

          <AnimatePresence>
            {openWindows.map((id) => {
              const config = getConfig(id);
              if (!config || minimized.has(id)) return null;
              const content = renderContent(id);
              if (!content) return null;
              return (
                <Window
                  key={id}
                  id={id}
                  title={config.title}
                  width={config.width}
                  height={config.height}
                  x={config.x}
                  y={config.y}
                  zIndex={10 + zOrder.indexOf(id)}
                  onFocus={() => focusWindow(id)}
                  onClose={() => closeWindow(id)}
                  onMinimize={() => minimizeWindow(id)}
                  noPadding={id === "resume"}
                >
                  {content}
                </Window>
              );
            })}
          </AnimatePresence>

          <Dock
            items={dockItems.map(item => ({
              ...item,
              isActive: openWindows.includes(item.id) && !minimized.has(item.id),
            }))}
            onItemClick={openWindow}
          />
        </>
      )}
    </div>
  );
}
