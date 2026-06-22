'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bootLines = [
  "System.init()",
  "Loading kernel modules...",
  "Mounting filesystem... OK",
  "Network interface: connected",
  "GPU: Hardware accelerated",
  "Portfolio v2026.1 loaded",
  "Status: Open for opportunities",
  "",
  "Boot complete. Welcome.",
];

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen = ({ onComplete }: BootScreenProps) => {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setLines((prev) => [...prev, bootLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setDone(true), 400);
        setTimeout(onComplete, 1000);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          <div className="w-full max-w-lg p-8">
            <div className="font-mono-code text-xs leading-6 text-muted-foreground">
              {lines.map((line, idx) => (
                <div key={idx}>
                  <span className="text-primary mr-2">›</span>
                  {line}
                </div>
              ))}
              <span className="inline-block w-2 h-4 bg-primary animate-blink" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;
