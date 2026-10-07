import React from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgressIndicator: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotion();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 w-full origin-left h-[2.5px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 z-[100] pointer-events-none shadow-[0_0_12px_rgba(249,115,22,0.8)]"
      style={{ scaleX: reducedMotion ? scrollYProgress : progress }}
    />
  );
};
