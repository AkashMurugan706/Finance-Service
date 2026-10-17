import React from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

const VARIANTS = {
  success: {
    bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: Info,
  },
  error: {
    bg: 'bg-rose-950/40 border-rose-500/40 text-rose-300',
    iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: AlertCircle,
  },
};

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`relative border rounded-2xl p-4 backdrop-blur-xl flex items-start gap-3.5 ${config.bg} ${className}`}
    >
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${config.iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 text-xs leading-relaxed">
        {title && (
          <h5 className="font-bold text-white mb-0.5 tracking-tight text-sm">
            {title}
          </h5>
        )}
        <div className="opacity-90">{children}</div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
