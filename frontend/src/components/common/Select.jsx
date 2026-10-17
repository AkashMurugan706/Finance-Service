import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  children,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-300 tracking-wide">
            {label}
          </label>
          {helperText && !error && (
            <span className="text-[11px] text-slate-500">{helperText}</span>
          )}
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all duration-200">
        <select
          id={selectId}
          className={`w-full bg-slate-900/80 border appearance-none cursor-pointer ${
            error ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 hover:border-slate-700 focus:border-indigo-500'
          } pl-3.5 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 rounded-xl outline-none transition-all duration-150 backdrop-blur-sm ${className}`}
          {...props}
        >
          {children ? (
            children
          ) : (
            options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200 py-2">
                {opt.label}
              </option>
            ))
          )}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
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

export default Select;
