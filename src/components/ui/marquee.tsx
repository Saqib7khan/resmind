'use client';

import { motion } from 'framer-motion';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export const Marquee = ({
  children,
  speed = 50,
  direction = 'left',
  className = '',
}: MarqueeProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="flex gap-4 whitespace-nowrap"
        animate={{
          x: direction === 'left' ? [0, -1000] : [-1000, 0],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
};
