'use client';
import { useState, useEffect } from "react";
import { Wifi, Battery, Volume2 } from "lucide-react";

const Taskbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="fixed top-0 left-0 right-0 h-8 z-40 flex items-center justify-between px-4"
      style={{ background: "var(--taskbar-bg)", backdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center gap-4">
        <span className="text-[13px] font-semibold text-foreground">Portfolio</span>
        <span className="text-[13px] text-muted-foreground">File</span>
        <span className="text-[13px] text-muted-foreground">View</span>
        <span className="text-[13px] text-muted-foreground">Help</span>
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
