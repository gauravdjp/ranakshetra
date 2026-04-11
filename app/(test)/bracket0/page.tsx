"use client"
import React, { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';

// --- Shared High-End Variants ---
const braceVariants: Variants = {
  closed: (isLeft: boolean) => ({
    x: isLeft ? 4 : -4, 
    color: "#ffffff",
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }),
  open: (isLeft: boolean) => ({
    x: isLeft ? -12 : 12,
    color: "#60a5fa",
    textShadow: "0px 0px 8px rgba(59, 130, 246, 0.6)",
    transition: { type: "spring", stiffness: 400, damping: 25 }
  })
};

const rectVariants: Variants = {
  closed: { 
    width: "100px", 
    borderColor: "rgba(255, 255, 255, 0.1)", 
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    scaleX: 0.95 
  },
  open: { 
    width: "200px", 
    borderColor: "rgba(96, 165, 250, 0.5)", 
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    scaleX: 1,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
  }
};

// --- Updated Team Node for Mobile Compatibility ---
const TeamNode: React.FC<{ name: string }> = ({ name }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      // Handle Desktop Hover
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      // Handle Mobile Tap
      onClick={() => setIsOpen(!isOpen)}
      
      animate={isOpen ? "open" : "closed"}
      initial="closed" 
      className="relative flex items-center justify-center my-2 cursor-pointer touch-none"
    >
      <motion.span custom={true} variants={braceVariants} className="text-4xl font-extralight select-none z-10 mt-[-4px]">{"{"}</motion.span>

      <motion.div variants={rectVariants} className="h-12 border rounded-md flex items-center justify-center overflow-hidden backdrop-blur-md bg-black relative shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <motion.div className="flex flex-col items-center px-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">{name}</span>
          <AnimatePresence>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-[8px] text-blue-400 font-mono mt-0.5"
              >
                VIEW STATS
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.span custom={false} variants={braceVariants} className="text-4xl font-extralight select-none z-10 mt-[-4px]">{"}"}</motion.span>
    </motion.div>
  );
};

// --- Main System ---
export const MobileFriendlyBracket: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 p-10 md:p-20 bg-[#050505] min-h-screen text-white font-mono overflow-x-auto">
      {/* 4-2-1 Structure remains the same */}
      <div className="flex flex-col gap-8 md:gap-12">
         <div className="flex flex-col"><TeamNode name="Astralis" /><TeamNode name="NaVi" /></div>
         <div className="flex flex-col"><TeamNode name="G2" /><TeamNode name="FaZe" /></div>
      </div>
      <div className="flex flex-col gap-16 md:gap-24">
         <TeamNode name="Winner A" /><TeamNode name="Winner B" />
      </div>
      <div className="flex flex-col justify-center">
         <TeamNode name="CHAMPION" />
      </div>
    </div>
  );
};

export default MobileFriendlyBracket;