'use client';
import { ReactNode, useRef } from "react";
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
  const constraintsRef = useRef<HTMLElement | null>(null);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{
        top: 32,
        left: 0,
        right: typeof window !== "undefined" ? window.innerWidth - width : 800,
        bottom: typeof window !== "undefined" ? window.innerHeight - 80 : 600,
      }}
      initial={{ scale: 0.9, opacity: 0, x, y }}
      animate={{ scale: 1, opacity: 1, x, y }}
      exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
      onPointerDown={onFocus}
      style={{ zIndex, width, height }}
      className="absolute glass-surface rounded-xl overflow-hidden flex flex-col"
      // shadow via style for complex value
    >
      {/* Title bar */}
      <div className="h-10 flex items-center px-4 bg-foreground/[0.03] border-b border-foreground/[0.05] cursor-grab active:cursor-grabbing shrink-0">
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-3 h-3 rounded-full hover:brightness-110 transition" style={{ background: "var(--traffic-red)" }} />
          <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="w-3 h-3 rounded-full hover:brightness-110 transition" style={{ background: "var(--traffic-yellow)" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "var(--traffic-green)" }} />
        </div>
        <span className="ml-4 text-[13px] text-foreground/50 font-medium select-none text-balance">{title}</span>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default Window;
