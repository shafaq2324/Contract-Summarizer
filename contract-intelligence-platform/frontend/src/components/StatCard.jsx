import React from 'react';
import GlassCard from './GlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  description,
  delay = 0,
  glowColor = ''
}) => {
  const getTrendIcon = () => {
    switch (trendType) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-rose-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendClass = () => {
    switch (trendType) {
      case 'up':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'down':
        return 'text-rose-400 bg-rose-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  return (
    <GlassCard delay={delay} glowColor={glowColor} className="relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm font-medium tracking-wide uppercase">{title}</span>
          {Icon && (
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-indigo-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-white tracking-tight text-glow">{value}</span>
          {trend && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getTrendClass()}`}>
              {getTrendIcon()}
              {trend}
            </span>
          )}
        </div>
      </div>

      {description && (
        <p className="text-xs text-slate-400 font-normal mt-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Decorative gradient blur in card background */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
    </GlassCard>
  );
};

export default StatCard;
