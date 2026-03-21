import React from 'react';
import Image from 'next/image';
import { cn, getInitials, generateAvatarColor } from '@/lib/utils';

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const;

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: keyof typeof sizeStyles;
  fallback?: string;
  className?: string;
}

export default function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  className,
}: AvatarProps) {
  const initials =
    fallback || alt.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  if (src) {
    return (
      <div
        className={cn(
          'relative flex-shrink-0 overflow-hidden rounded-full',
          sizeStyles[size],
          className,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white',
        sizeStyles[size],
        className,
      )}
      style={{ backgroundColor: generateAvatarColor(initials) }}
    >
      {initials}
    </div>
  );
}
