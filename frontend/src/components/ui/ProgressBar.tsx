import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number;
  size?: 'sm' | 'md';
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  size = 'md',
  color,
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';

  const barColor =
    color ||
    (clampedValue >= 80
      ? 'bg-green-500'
      : clampedValue >= 50
        ? 'bg-blue-500'
        : clampedValue >= 25
          ? 'bg-yellow-500'
          : 'bg-red-500');

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Progreso</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          heightClass,
        )}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-500 ease-out',
            heightClass,
            barColor,
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
