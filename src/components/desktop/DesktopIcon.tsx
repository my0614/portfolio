'use client';
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface DesktopIconProps {
  icon: LucideIcon;
  label: string;
  onDoubleClick: () => void;
}

const DesktopIcon = ({ icon: Icon, label, onDoubleClick }: DesktopIconProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onDoubleClick={onDoubleClick}
      className="flex flex-col items-center gap-1.5 w-[100px] h-[100px] justify-center rounded-lg hover:bg-foreground/5 transition-colors focus:outline-none focus:bg-primary/10 group select-none"
    >
      <div className="w-12 h-12 rounded-xl glass-surface flex items-center justify-center group-hover:border-primary/30 transition-colors">
        <Icon size={22} strokeWidth={1} className="text-foreground/80" />
      </div>
      <span className="text-[11px] text-foreground/80 text-center leading-tight">{label}</span>
    </motion.button>
  );
};

export default DesktopIcon;
