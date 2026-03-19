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
import AboutWindow from "@/components/desktop/windows/AboutWindow";
import ContactWindow from "@/components/desktop/windows/ContactWindow";
import TerminalWindow from "@/components/desktop/windows/TerminalWindow";

interface WindowState {
  id: string;
  title: string;
  component: React.ReactNode;
  width: number;
  height: number;
  x: number;
  y: number;
}

const windowConfigs: Record<string, Omit<WindowState, "id">> = {
  projects: { title: "Projects.dmg", component: <ProjectsWindow />, width: 640, height: 450, x: 150, y: 80 },
  about: { title: "System Preferences", component: <AboutWindow />, width: 500, height: 560, x: 250, y: 100 },
  contact: { title: "Mail.app", component: <ContactWindow />, width: 450, height: 520, x: 350, y: 60 },
  terminal: { title: "Terminal", component: <TerminalWindow />, width: 520, height: 360, x: 200, y: 120 },
};

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [zOrder, setZOrder] = useState<string[]>([]);
  const [minimized, setMinimized] = useState<Set<string>>(new Set());

  const openWindow = useCallback((id: string) => {
    setMinimized((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setOpenWindows((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setZOrder((prev) => [...prev.filter((w) => w !== id), id]);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w !== id));
    setZOrder((prev) => prev.filter((w) => w !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setMinimized((prev) => new Set(prev).add(id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setZOrder((prev) => [...prev.filter((w) => w !== id), id]);
  }, []);

  const dockItems = [
    { id: "projects", icon: FolderOpen, label: "Projects" },
    { id: "about", icon: User, label: "About" },
    { id: "contact", icon: Mail, label: "Contact" },
    { id: "terminal", icon: Terminal, label: "Terminal" },
  ];

  const handleBootComplete = useCallback(() => setBooted(true), []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.02]" />

      <AnimatePresence>
        {!booted && <BootScreen onComplete={handleBootComplete} />}
      </AnimatePresence>

      {booted && (
        <>
          <Taskbar onOpenWindow={openWindow} />

          <div className="absolute top-12 right-6 flex flex-col gap-1">
            <DesktopIcon icon={FolderOpen} label="Projects" onDoubleClick={() => openWindow("projects")} />
            <DesktopIcon icon={User} label="About Me" onDoubleClick={() => openWindow("about")} />
            <DesktopIcon icon={Mail} label="Contact" onDoubleClick={() => openWindow("contact")} />
            <DesktopIcon icon={Terminal} label="Terminal" onDoubleClick={() => openWindow("terminal")} />
            <DesktopIcon icon={FileText} label="Resume.pdf" onDoubleClick={() => openWindow("about")} />
          </div>

          <div className="absolute top-1/2 left-12 -translate-y-1/2 max-w-md">
            <p className="font-mono-code text-xs text-muted-foreground mb-2">System.version: 2024.1</p>
            <h1 className="text-3xl font-medium text-foreground/90 tracking-tight mb-3 text-balance">
              Creative Developer
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Building digital experiences with precision and care. Double-click to explore.
            </p>
          </div>

          <AnimatePresence>
            {openWindows.map((id) => {
              const config = windowConfigs[id];
              if (!config || minimized.has(id)) return null;
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
                >
                  {config.component}
                </Window>
              );
            })}
          </AnimatePresence>

          <Dock
            items={dockItems.map((item) => ({
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
