'use client';
import { ReactNode, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  noPadding?: boolean;
}

const Window = ({ title, children, width = 600, height = 420, x = 100, y = 80, zIndex, onFocus, onClose, onMinimize, noPadding = false }: WindowProps) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
  const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

  const motionX = useMotionValue(x);
  const motionY = useMotionValue(y);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handleTitlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    onFocus();
    if (isMaximized) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: motionX.get(), origY: motionY.get() };
  }, [isMaximized, motionX, motionY, onFocus]);

  const handleTitlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    motionX.set(Math.max(0, Math.min(dragState.current.origX + e.clientX - dragState.current.startX, screenW - width)));
    motionY.set(Math.max(32, Math.min(dragState.current.origY + e.clientY - dragState.current.startY, screenH - 80)));
  }, [motionX, motionY, screenW, screenH, width]);

  const handleTitlePointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  const toggleMaximize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMaximized) {
      animate(motionX, 0, { type: "spring", duration: 0.3, bounce: 0.1 });
      animate(motionY, 32, { type: "spring", duration: 0.3, bounce: 0.1 });
    } else {
      animate(motionX, x, { type: "spring", duration: 0.3, bounce: 0.1 });
      animate(motionY, y, { type: "spring", duration: 0.3, bounce: 0.1 });
    }
    setIsMaximized(prev => !prev);
  }, [isMaximized, motionX, motionY, x, y]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
      style={{
        position: "absolute",
        zIndex,
        x: isMaximized ? 0 : motionX,
        y: isMaximized ? 32 : motionY,
        width: isMaximized ? screenW : width,
        height: isMaximized ? screenH - 32 - 56 : height,
        borderRadius: isMaximized ? 0 : 12,
      }}
      className="glass-surface overflow-hidden flex flex-col"
    >
      {/* Title bar: drag + focus only here */}
      <div
        className={`h-10 flex items-center px-4 bg-foreground/[0.03] border-b border-foreground/[0.05] shrink-0 ${isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
      >
        <div className="flex gap-2">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-3 h-3 rounded-full hover:brightness-110 transition"
            style={{ background: "var(--traffic-red)" }}
          />
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-3 h-3 rounded-full hover:brightness-110 transition"
            style={{ background: "var(--traffic-yellow)" }}
          />
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={toggleMaximize}
            className="w-3 h-3 rounded-full hover:brightness-110 transition"
            style={{ background: "var(--traffic-green)" }}
            title={isMaximized ? "Restore" : "Maximize"}
          />
        </div>
        <span
          className="ml-4 text-[13px] text-foreground/50 font-medium select-none text-balance"
          onDoubleClick={toggleMaximize}
        >
          {title}
        </span>
      </div>
      {/* Content: no drag, clicks work freely */}
      <div className={`flex-1 overflow-hidden ${noPadding ? "" : "overflow-y-auto p-6"}`} onPointerDown={onFocus}>
        {children}
      </div>
    </motion.div>
  );
};

export default Window;
