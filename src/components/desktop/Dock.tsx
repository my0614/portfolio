'use client';
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface DockItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const DockItem = ({ icon: Icon, label, onClick, isActive }: DockItemProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.3, y: -8 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 group"
      title={label}
    >
      <div className="w-11 h-11 rounded-xl glass-surface flex items-center justify-center group-hover:border-primary/30 transition-colors">
        <Icon size={20} strokeWidth={1} className="text-foreground/80" />
      </div>
      {isActive && (
        <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary" />
      )}
    </motion.button>
  );
};

interface DockProps {
  items: {
    id: string;
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
  }[];
  onItemClick: (id: string) => void;
}

const Dock = ({ items, onItemClick }: DockProps) => {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
      <div
        className="flex items-end gap-2 px-3 py-2 rounded-2xl"
        style={{
          background: "var(--dock-bg)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(20px)",
        }}
      >
        {items.map((item) => (
          <DockItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            onClick={() => onItemClick(item.id)}
            isActive={item.isActive}
          />
        ))}
      </div>
    </div>
  );
};

export default Dock;
