import React from "react";
import { Card } from "@/components/ui/card";
import { X, Lightbulb } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "framer-motion";

type PotholeProps = {
  title: string;
  question: React.ReactNode;
  hint?: string;
  onHeightChange?: (height: number) => void;
};

export function Pothole({ title, question, hint, onHeightChange }: PotholeProps) {
  const [showHint, setShowHint] = useState(false);
  const potholeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (potholeRef.current && onHeightChange) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeightChange(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(potholeRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, [onHeightChange]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:px-24 md:px-32 lg:px-48 xl:px-64">
      <div className="mx-auto p-4" ref={potholeRef}>
        <Card className="p-6 min-h-[120px] rounded-lg relative bg-[#221D1D]">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h1 className="text-2xl font-bold">{title}</h1>
            {hint && (
              <div className="flex items-center gap-2">
                {!showHint ? (
                  <motion.button
                    className="rounded-lg bg-[#3C3535] hover:bg-[#4C4444] p-2 aspect-square"
                    onClick={() => setShowHint(true)}
                    whileTap={{ y: 1 }}
                  >
                    <Lightbulb className="text-white" size={16} />
                  </motion.button>                  
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key="hint"
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="flex items-center gap-2 rounded-lg text-sm bg-[#3C3535] p-2"
                    >
                      <div className="text-right">
                        {hint}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHint(false)}
                        aria-label="Hide hint"
                        className="p-1 h-auto"
                      >
                        <X size={16} />
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>
          <div className="mb-4 bg-[#3C3535] rounded-lg p-4">
            {question}
          </div>
        </Card>
      </div>
    </div>
  );
}