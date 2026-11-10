import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  direction = 'up' 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" }); // trigger slightly before it enters fully

  const yOffset = direction === 'up' ? 30 : direction === 'down' ? -30 : 0;
  const xOffset = direction === 'left' ? 30 : direction === 'right' ? -30 : 0;

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        hidden: { opacity: 0, y: yOffset, x: xOffset },
        visible: { opacity: 1, y: 0, x: 0 },
      }}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }} 
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
