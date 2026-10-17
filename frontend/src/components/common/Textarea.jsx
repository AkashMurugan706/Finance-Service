import React from 'react';

export const Textarea = ({
  label,
  error,
  helperText,
  rows = 3,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-300 tracking-wide">
            {label}
          </label>
          {helperText && !error && (
            <span className="text-[11px] text-slate-500">{helperText}</span>
          )}
        </div>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full bg-slate-900/80 border ${
          error ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 hover:border-slate-700 focus:border-indigo-500'
        } p-3 text-sm text-slate-100 placeholder-slate-500 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-150 backdrop-blur-sm resize-none ${className}`}
        {...props}
      />

      {error && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
