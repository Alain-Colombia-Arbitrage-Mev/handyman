import React from 'react';
import { Check } from 'lucide-react';

interface VerifiedIconProps {
  size?: number;
  className?: string;
}

export function VerifiedIcon({ size = 16, className = '' }: VerifiedIconProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full bg-white border border-gray-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <Check 
        size={size * 0.6} 
        className="text-[#1D4ED8] stroke-[3]" 
      />
    </div>
  );
}