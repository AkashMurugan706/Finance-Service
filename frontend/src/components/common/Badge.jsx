import React from 'react';

const BADGE_STYLES = {
  // Loan Statuses
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  PENDING_APPROVAL: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  DEFAULTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',

  // Collateral Statuses
  PLEDGED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  VERIFIED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  RETURNED: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  PENDING_VERIFICATION: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  LIQUIDATED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',

  // Payment Types
  UPI: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  CASH: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  BANK_TRANSFER: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  CHEQUE: 'bg-violet-500/10 text-violet-400 border-violet-500/30',

  // Generic / Default
  default: 'bg-slate-700/20 text-slate-300 border-slate-700/40',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

export const Badge = ({
  children,
  variant,
  status,
  size = 'sm',
  dot = true,
  className = '',
}) => {
  const key = status || variant || 'default';
  const badgeClass = BADGE_STYLES[key] || BADGE_STYLES.default;
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide uppercase font-mono ${sizeClasses} ${badgeClass} ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      )}
      {children || status || variant}
    </span>
  );
};

export default Badge;
