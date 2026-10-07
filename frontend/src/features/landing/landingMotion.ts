import type { Variants } from 'framer-motion';

// A short exit keeps the next slide responsive without a long blank interval.
export const landingSlideVariants: Variants = {
  enter: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.14, ease: 'easeIn' },
  },
};
