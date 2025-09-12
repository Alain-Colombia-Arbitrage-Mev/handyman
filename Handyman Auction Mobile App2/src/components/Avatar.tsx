import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackSrc?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

const fallbackImages = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format'
];

export function Avatar({ src, alt, size = 'md', className = '', fallbackSrc }: AvatarProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [showIcon, setShowIcon] = useState(false);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    if (fallbackIndex < fallbackImages.length - 1) {
      setFallbackIndex(prev => prev + 1);
      setCurrentSrc(fallbackImages[fallbackIndex + 1]);
    } else {
      setShowIcon(true);
    }
  };

  if (showIcon) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full bg-gray-200 flex items-center justify-center`}>
        <User size={size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 20 : 24} className="text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
      onError={handleError}
      loading="lazy"
    />
  );
}