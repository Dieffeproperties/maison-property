'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'fade';
  amount?: number;
}

export default function ScrollReveal({
  children,
  delay = 0,
  className,
  direction = 'up',
  amount = 0.1,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? { opacity: 0 } : direction === 'up' ? { opacity: 0, y: 30 } : { opacity: 0 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduced ? 0.15 : 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
