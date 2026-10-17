import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import Skeleton from './Skeleton';

const THEME_STYLES = {
  emerald: {
    bgGlow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    trend: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  indigo: {
    bgGlow: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
    trend: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  gold: {
    bgGlow: 'from-amber-500/10 via-amber-500/5 to-transparent',
    iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    trend: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  cyan: {
    bgGlow: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
    iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    trend: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  rose: {
    bgGlow: 'from-rose-500/10 via-rose-500/5 to-transparent',
    iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    trend: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  theme = 'indigo',
  trend,
  trendDirection = 'up',
  loading = false,
  onClick,
  className = '',
}) => {
  const styles = THEME_STYLES[theme] || THEME_STYLES.indigo;

  if (loading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative group bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition-all duration-300 overflow-hidden shadow-fintech ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Background ambient gradient glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.bgGlow} opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          {Icon && (
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${styles.iconBg}`}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Primary metric value */}
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono tabular-nums">
            {value}
          </div>

          {/* Trend / Subtext row */}
          <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${styles.trend}`}
              >
                {trendDirection === 'up' ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : trendDirection === 'down' ? (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )}
                {trend}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-400 truncate text-[11px]">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
