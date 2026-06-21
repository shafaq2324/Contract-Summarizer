import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  disabled = false,
  icon: Icon,
  type = 'button',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-4.5 py-1.5 text-xs gap-1.5 rounded-full',
    md: 'px-6 py-2.5 text-sm gap-2 rounded-full',
    lg: 'px-8 py-3.5 text-base gap-2.5 rounded-full'
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#7C5CFF] to-[#9B7DFF] hover:from-[#9B7DFF] hover:to-[#7C5CFF] text-white border border-[#7C5CFF]/35 shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus:ring-offset-[#070814]',
    secondary: 'bg-white/4 border border-white/8 text-slate-200 hover:bg-white/8 hover:text-white focus:ring-offset-[#070814]',
    ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />}
      {children}
    </motion.button>
  );
};

export default Button;
