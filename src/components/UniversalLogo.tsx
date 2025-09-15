import React from 'react';

interface UniversalLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'default' | 'minimal' | 'gradient' | 'monochrome' | 'white';
  showText?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export function UniversalLogo({
  size = 'md',
  variant = 'default',
  showText = true,
  animated = false,
  className = '',
  onClick
}: UniversalLogoProps) {
  // Convertir tamaños nombrados a números
  const getSize = () => {
    if (typeof size === 'number') return size;
    
    const sizeMap = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64
    };
    return sizeMap[size];
  };

  const logoSize = getSize();
  const textWidth = showText ? logoSize * 3 : 0;

  // Configuración de colores por variante
  const getVariantConfig = () => {
    switch (variant) {
      case 'minimal':
        return {
          primary: '#21ABF6',
          secondary: '#1a87d6',
          accent: '#FF6B35',
          text: '#2D3748',
          useGradient: false
        };
      case 'gradient':
        return {
          primary: 'url(#primaryGrad)',
          secondary: 'url(#secondaryGrad)',
          accent: '#FF6B35',
          text: 'url(#textGrad)',
          useGradient: true
        };
      case 'monochrome':
        return {
          primary: '#333333',
          secondary: '#666666',
          accent: '#999999',
          text: '#333333',
          useGradient: false
        };
      case 'white':
        return {
          primary: '#ffffff',
          secondary: '#f5f5f5',
          accent: '#e0e0e0',
          text: '#ffffff',
          useGradient: false
        };
      default:
        return {
          primary: '#21ABF6',
          secondary: '#1e9ae6',
          accent: '#FF6B35',
          text: '#2D3748',
          useGradient: false
        };
    }
  };

  const colors = getVariantConfig();

  return (
    <div 
      className={`inline-flex items-center cursor-pointer select-none ${className} ${
        animated ? 'transition-transform duration-300 hover:scale-105' : ''
      }`}
      style={{ width: logoSize + textWidth + (showText ? logoSize * 0.3 : 0), height: logoSize }}
      onClick={onClick}
    >
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 50 50"
        className="flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Definiciones de gradientes y efectos */}
        <defs>
          {colors.useGradient && (
            <>
              <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#21ABF6" />
                <stop offset="50%" stopColor="#1e9ae6" />
                <stop offset="100%" stopColor="#FF6B35" />
              </linearGradient>
              <linearGradient id="secondaryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#21ABF6" />
              </linearGradient>
              <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2D3748" />
                <stop offset="100%" stopColor="#21ABF6" />
              </linearGradient>
            </>
          )}
          
          {animated && (
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Sombra base */}
        <ellipse 
          cx="25" 
          cy="42" 
          rx="18" 
          ry="4" 
          fill="rgba(0,0,0,0.08)"
        />
        
        {/* Logo principal */}
        <g transform="translate(10, 10)">
          {/* Forma principal P */}
          <path
            d="M5 5 L5 25 L9 25 L9 17 L15 17 C20 17 23 15 23 11 C23 7 20 5 15 5 Z M9 9 L15 9 C17 9 18 10 18 11 C18 12 17 13 15 13 L9 13 Z"
            fill={colors.primary}
            filter={animated ? "url(#glow)" : "none"}
            className={animated ? "animate-pulse" : "transition-all duration-300"}
            style={animated ? {
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            } : {}}
          />
          
          {/* Punto decorativo */}
          <circle
            cx="26"
            cy="11"
            r="3"
            fill={colors.accent}
            className={animated ? "animate-bounce" : ""}
            style={animated ? {
              animation: 'bounce 1s infinite',
              animationDelay: '0.5s'
            } : {}}
          />
          
          {/* Elementos decorativos adicionales para variantes especiales */}
          {variant === 'gradient' && (
            <>
              <circle cx="28" cy="6" r="1" fill={colors.secondary} opacity="0.7" />
              <circle cx="26" cy="18" r="1.5" fill={colors.primary} opacity="0.5" />
            </>
          )}
        </g>
      </svg>

      {/* Texto del logo */}
      {showText && (
        <div 
          className="ml-3 flex flex-col justify-center"
          style={{ minWidth: logoSize * 2.5 }}
        >
          <span 
            className="font-bold leading-none tracking-tight"
            style={{ 
              color: colors.text,
              fontSize: logoSize * 0.45,
              lineHeight: 1
            }}
          >
            arkiing
          </span>
          <span 
            className="leading-none mt-1 opacity-75"
            style={{ 
              color: colors.secondary,
              fontSize: logoSize * 0.22,
              lineHeight: 1
            }}
          >
            Parkiing Services
          </span>
        </div>
      )}
    </div>
  );
}

// Exportar también como alias
export { UniversalLogo as Logo };