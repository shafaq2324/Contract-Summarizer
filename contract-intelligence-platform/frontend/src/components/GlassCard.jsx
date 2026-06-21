import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  className = '',
  hoverable = true,
  delay = 0,
  glowColor = '', // 'indigo', 'purple', 'fuchsia', or empty
  ...props
}) => {
  const glowClass = glowColor === 'indigo' ? 'glow-indigo' : 
                    glowColor === 'purple' ? 'glow-purple' : 
                    glowColor === 'fuchsia' ? 'shadow-[0_0_40px_-5px_rgba(217,70,239,0.15)]' : '';

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1],
        delay: delay
      }
    }
  };

  const hasPadding = className.split(' ').some(c => 
    c.startsWith('p-') || 
    c.startsWith('px-') || 
    c.startsWith('py-') || 
    c.startsWith('pt-') || 
    c.startsWith('pb-') || 
    c.startsWith('pl-') || 
    c.startsWith('pr-')
  );
  const paddingClass = hasPadding ? '' : 'p-6';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hoverable ? { 
        y: -4, 
        scale: 1.01,
        transition: { duration: 0.2 } 
      } : undefined}
      className={`glass-card rounded-2xl ${paddingClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
