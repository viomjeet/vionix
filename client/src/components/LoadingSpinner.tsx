import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 text-slate-500">
      <div
        className={`${sizeClasses[size]} border-slate-300 border-t-sky-600 rounded-full animate-spin`}
      />
      {label && <p className="mt-2 text-xs text-slate-500">{label}</p>}
    </div>
  );
};
