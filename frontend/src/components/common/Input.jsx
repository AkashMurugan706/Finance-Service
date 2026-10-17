import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  prefix,
  suffix,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300 tracking-wide">
            {label}
          </label>
          {helperText && !error && (
            <span className="text-[11px] text-slate-500">{helperText}</span>
          )}
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all duration-200">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
            {prefix}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          className={`w-full bg-slate-900/80 border ${
            error ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 hover:border-slate-700 focus:border-indigo-500'
          } ${prefix ? 'pl-9' : 'pl-3.5'} ${suffix ? 'pr-9' : 'pr-3.5'} py-2.5 text-sm text-slate-100 placeholder-slate-500 rounded-xl outline-none transition-all duration-150 backdrop-blur-sm ${className}`}
          {...props}
        />

        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
