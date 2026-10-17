import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  footer,
  hoverable = false,
  glow = false,
  glowColor = 'indigo',
  className = '',
  bodyClassName = 'p-5 sm:p-6',
  headerClassName = 'p-5 sm:p-6 border-b border-slate-800/80',
}) => {
  const glowClasses = {
    indigo: 'hover:shadow-glow-indigo/20',
    emerald: 'hover:shadow-glow-emerald/20',
    gold: 'hover:shadow-glow-gold/20',
  }[glowColor] || 'hover:shadow-glow-indigo/20';

  return (
    <div
      className={`relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 ${
        hoverable ? `hover:border-slate-700/90 hover:bg-slate-900/80 ${glow ? glowClasses : ''}` : ''
      } ${className}`}
    >
      {(title || subtitle || Icon || actions) && (
        <div className={`flex items-center justify-between ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/50 flex items-center justify-center text-indigo-400 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={bodyClassName}>
        {children}
      </div>

      {footer && (
        <div className="p-4 sm:px-6 bg-slate-950/40 border-t border-slate-800/80 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
