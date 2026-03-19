'use client';
import { ReactNode, useState } from "react";
import { motion } from "framer-motion";

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
}

const Window = ({ title, children, width = 600, height = 420, x = 100, y = 80, zIndex, onFocus, onClose, onMinimize }: WindowProps) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
  const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

  const maximizedProps = {
    x: 0,
    y: 32,
    width: screenW,
    height: screenH - 32 - 56,
  };

  const normalProps = { x, y, width, height };
  const current = isMaximized ? maximizedProps : normalProps;

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized((prev) => !prev);
  };

  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      dragConstraints={{
        top: 32,
        left: 0,
        right: screenW - width,
        bottom: screenH - 80,
      }}
      initial={{ scale: 0.9, opacity: 0, x, y, width, height }}
      animate={{
        scale: 1,
        opacity: 1,
        x: current.x,
        y: current.y,
        width: current.width,
        height: current.height,
        borderRadius: isMaximized ? 0 : 12,
      }}
      exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
      onPointerDown={onFocus}
      style={{ zIndex, position: "absolute" }}
      className="glass-surface overflow-hidden flex flex-col"
    >
      {/* Title bar */}
      <div className={`h-10 flex items-center px-4 bg-foreground/[0.03] border-b border-foreground/[0.05] shrink-0 ${isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-3 h-3 rounded-full hover:brightness-110 transition"
            style={{ background: "var(--traffic-red)" }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-3 h-3 rounded-full hover:brightness-110 transition"
            style={{ background: "var(--traffic-yellow)" }}
          />
          <button
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
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default Window;
