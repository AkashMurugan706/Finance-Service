import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantStyles = {
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    text: 'rounded-md h-4',
  }[variant] || 'rounded-xl';

  return (
    <div
      style={{ width, height }}
      className={`bg-slate-800/60 shimmer-effect ${variantStyles} ${className}`}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full space-y-3">
      {/* Table Header skeleton */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>

      {/* Table Rows skeleton */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid grid-cols-4 gap-4 p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl items-center"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={`h-4 ${c === 0 ? 'w-32' : c === cols - 1 ? 'w-16' : 'w-24'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
