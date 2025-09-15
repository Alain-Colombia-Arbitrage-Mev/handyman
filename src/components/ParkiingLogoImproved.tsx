import React from 'react';
import svgPaths from '../imports/svg-jeuxh3s158';

interface ParkiingLogoImprovedProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'header' | 'sidebar' | 'full' | 'minimal';
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

export function ParkiingLogoImproved({ 
  size = 'md', 
  variant = 'full',
  showText = true, 
  className = '',
  animated = false
}: ParkiingLogoImprovedProps) {
  // Configuración de tamaños optimizada
  const getSizeConfig = () => {
    const configs = {
      xs: { width: 80, height: 24, scale: 0.6, fontSize: 10 },
      sm: { width: 120, height: 36, scale: 0.8, fontSize: 12 },
      md: { width: 160, height: 48, scale: 1, fontSize: 14 },
      lg: { width: 200, height: 60, scale: 1.2, fontSize: 16 },
      xl: { width: 240, height: 72, scale: 1.4, fontSize: 18 }
    };
    return configs[size];
  };

  const config = getSizeConfig();

  // Colores optimizados
  const colors = {
    primary: '#167DB6',
    accent: '#EE7A19',
    primaryHover: '#146ca3',
    accentHover: '#d66815'
  };

  // Configuración específica por variante
  const getVariantConfig = () => {
    switch (variant) {
      case 'header':
        return {
          showFullLogo: true,
          optimize: 'horizontal',
          padding: '0 8px'
        };
      case 'sidebar':
        return {
          showFullLogo: true,
          optimize: 'compact',
          padding: '8px'
        };
      case 'minimal':
        return {
          showFullLogo: false,
          optimize: 'icon',
          padding: '4px'
        };
      default:
        return {
          showFullLogo: true,
          optimize: 'standard',
          padding: '0'
        };
    }
  };

  const variantConfig = getVariantConfig();

  return (
    <div 
      className={`inline-flex items-center justify-center select-none ${className} ${
        animated ? 'transition-all duration-300 hover:scale-105' : ''
      }`}
      style={{ 
        width: config.width, 
        height: config.height,
        padding: variantConfig.padding
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1082 383"
        className={`${animated ? 'transition-colors duration-300' : ''}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradientes para efectos mejorados */}
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.primaryHover} />
          </linearGradient>
          
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.accentHover} />
          </linearGradient>

          {/* Filtro de sombra para mayor calidad */}
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)"/>
          </filter>

          {/* Filtro de brillo para hover */}
          {animated && (
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>

        <g 
          clipPath="url(#clip0_15_724)"
          filter={variant === 'header' ? 'url(#logoShadow)' : 'none'}
          className={animated ? 'group-hover:brightness-110' : ''}
        >
          {/* Letras principales en azul */}
          <path d={svgPaths.p3189e700} fill="url(#primaryGradient)" />
          <path d={svgPaths.p37e9580} fill="url(#primaryGradient)" />
          <path d={svgPaths.p118cbe70} fill="url(#primaryGradient)" />
          <path d={svgPaths.p6fc2500} fill="url(#primaryGradient)" />
          <path d={svgPaths.p130f0900} fill="url(#primaryGradient)" />
          <path d={svgPaths.p32558080} fill="url(#primaryGradient)" />
          <path d={svgPaths.p3392ee00} fill="url(#primaryGradient)" />
          <path d={svgPaths.p18d19800} fill="url(#primaryGradient)" />

          {/* Elementos de acento en naranja */}
          <path d={svgPaths.p2f1562f0} fill="url(#accentGradient)" />
          <path d={svgPaths.p3a043e70} fill="url(#accentGradient)" />
          
          {/* Grupo de elementos decorativos */}
          <g>
            <path d={svgPaths.p370e2200} fill="url(#accentGradient)" />
            <path d={svgPaths.p3acddf00} fill="url(#accentGradient)" />
            <path d={svgPaths.p19632d80} fill="url(#accentGradient)" />
          </g>
        </g>

        <defs>
          <clipPath id="clip0_15_724">
            <rect fill="white" height="382.313" width="1081.4" />
          </clipPath>
        </defs>
      </svg>

      {/* Subtítulo opcional para versiones grandes */}
      {showText && variant !== 'minimal' && size !== 'xs' && (
        <div className="ml-2 flex flex-col justify-center">
          <span 
            className="leading-none opacity-75"
            style={{ 
              color: colors.primary,
              fontSize: config.fontSize * 0.6,
              fontWeight: 500
            }}
          >
            Parkiing
          </span>
        </div>
      )}
    </div>
  );
}