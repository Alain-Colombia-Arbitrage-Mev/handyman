import React from 'react';
import { ParkiingLogoImproved } from './ParkiingLogoImproved';
import { HighQualityLogo } from './HighQualityLogo';

interface ParkiingLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'white' | 'blue' | 'gradient' | 'minimal' | 'figma' | 'header' | 'sidebar';
  animated?: boolean;
}

export function ParkiingLogo({ 
  size = 'md', 
  showText = true, 
  className = '',
  variant = 'default',
  animated = false
}: ParkiingLogoProps) {
  // Si es una variante específica de Figma, usar el logo importado mejorado
  if (variant === 'figma' || variant === 'header' || variant === 'sidebar') {
    return (
      <ParkiingLogoImproved
        size={size}
        variant={variant === 'figma' ? 'full' : variant}
        showText={showText}
        className={className}
        animated={animated}
      />
    );
  }

  // Para variante minimal, usar un logo más simple
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${getSizeClasses(size)} flex-shrink-0`}>
          <svg
            viewBox="0 0 120 30"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Logo minimalista */}
            <g>
              {/* P estilizada */}
              <path
                d="M5 5 L5 20 L8 20 L8 14 L12 14 C16 14 18 12 18 9 C18 6 16 5 12 5 Z M8 8 L12 8 C13.5 8 14 8.5 14 9 C14 9.5 13.5 10 12 10 L8 10 Z"
                fill="#167DB6"
                className={animated ? "transition-all duration-300 hover:fill-[#146ca3]" : ""}
              />
              
              {/* Texto */}
              {showText && (
                <text
                  x="22"
                  y="16"
                  fontFamily="Arial, sans-serif"
                  fontSize="12"
                  fontWeight="600"
                  fill="#2D3748"
                  className="select-none"
                >
                  arkiing
                </text>
              )}
            </g>
          </svg>
        </div>
      </div>
    );
  }

  // Usar el logo de alta calidad para otras variantes
  const colorMapping = {
    default: 'default' as const,
    white: 'white' as const,
    blue: 'blue' as const,
    gradient: 'gradient' as const
  };

  return (
    <HighQualityLogo
      size={size}
      showText={showText}
      className={className}
      color={colorMapping[variant] || 'default'}
    />
  );
}

// Función helper para clases de tamaño
function getSizeClasses(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
  const sizeClasses = {
    xs: 'h-6 w-20',
    sm: 'h-8 w-28',
    md: 'h-10 w-36',
    lg: 'h-12 w-44',
    xl: 'h-16 w-56'
  };
  return sizeClasses[size];
}

// Exportar también el componente mejorado directamente
export { ParkiingLogoImproved, HighQualityLogo };