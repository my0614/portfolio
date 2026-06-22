'use client';
import { useState, useEffect, useRef } from "react";
import { Wifi, Battery, Volume2 } from "lucide-react";

interface TaskbarProps {
  onOpenWindow?: (id: string) => void;
}

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
}

const Taskbar = ({ onOpenWindow }: TaskbarProps) => {
  const [time, setTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const menus: Record<string, MenuItem[]> = {
    File: [
      { label: "Open Projects", shortcut: "⌘1", action: () => onOpenWindow?.("projects") },
      { label: "Open About Me", shortcut: "⌘2", action: () => onOpenWindow?.("about") },
      { label: "Open Contact", shortcut: "⌘3", action: () => onOpenWindow?.("contact") },
      { label: "Open Terminal", shortcut: "⌘4", action: () => onOpenWindow?.("terminal") },
      { separator: true, label: "" },
      {
        label: "Download Resume",
        shortcut: "⌘D",
        action: () => {
          const a = document.createElement("a");
          a.href = "/resume.pdf";
          a.download = "resume.pdf";
          a.click();
        },
      },
    ],
    View: [
      {
        label: "Reload Page",
        shortcut: "⌘R",
        action: () => window.location.reload(),
      },
      { separator: true, label: "" },
      {
        label: "Open GitHub",
        shortcut: "⌘G",
        action: () => window.open("https://github.com/my0614", "_blank"),
      },
      {
        label: "Full Screen",
        shortcut: "⌘F",
        action: () => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
        },
      },
    ],
    Help: [
      { label: "Keyboard Shortcuts", disabled: true },
      { separator: true, label: "" },
      { label: "⌘1–4  Open Windows", disabled: true },
      { label: "⌘R       Reload Page", disabled: true },
      { label: "⌘F       Full Screen", disabled: true },
      { separator: true, label: "" },
      {
        label: "About Portfolio",
        action: () => onOpenWindow?.("about"),
      },
    ],
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled || item.separator) return;
    item.action?.();
    setActiveMenu(null);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 h-8 z-40 flex items-center justify-between px-4"
      style={{ background: "var(--taskbar-bg)", backdropFilter: "blur(20px)" }}
      ref={menuRef}
    >
      <div className="flex items-center gap-1">
        <span className="text-[13px] font-semibold text-foreground px-2">Portfolio</span>

        {Object.entries(menus).map(([name, items]) => (
          <div key={name} className="relative">
            <button
              onClick={() => handleMenuClick(name)}
              className={`text-[13px] px-2 py-0.5 rounded transition-colors ${
                activeMenu === name
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              }`}
            >
              {name}
            </button>

            {activeMenu === name && (
              <div
                className="absolute top-full left-0 mt-1 min-w-[220px] rounded-lg py-1 z-50 shadow-2xl"
                style={{
                  background: "hsla(222, 47%, 8%, 0.95)",
                  border: "1px solid var(--glass-border)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {items.map((item, i) =>
                  item.separator ? (
                    <div key={i} className="my-1 border-t border-foreground/[0.07]" />
                  ) : (
                    <button
                      key={i}
                      onClick={() => handleItemClick(item)}
                      disabled={item.disabled}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-[12px] transition-colors text-left ${
                        item.disabled
                          ? "text-muted-foreground/50 cursor-default"
                          : "text-foreground/80 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="ml-6 text-[11px] opacity-50 font-mono-code">{item.shortcut}</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 text-muted-foreground">
        <Volume2 size={14} strokeWidth={1.5} />
        <Wifi size={14} strokeWidth={1.5} />
        <Battery size={14} strokeWidth={1.5} />
        <span className="text-[12px] tabular-nums text-foreground/70">{formatDate(time)}</span>
        <span className="text-[12px] tabular-nums text-foreground/70">{formatTime(time)}</span>
      </div>
    </div>
  );
};

export default Taskbar;
