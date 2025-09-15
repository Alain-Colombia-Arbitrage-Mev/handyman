import React from 'react';

interface HighQualityLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  color?: 'default' | 'white' | 'blue' | 'gradient';
}

export function HighQualityLogo({ 
  size = 'md', 
  showText = true, 
  className = '',
  color = 'default'
}: HighQualityLogoProps) {
  // Dimensiones optimizadas para logo horizontal
  const sizeClasses = {
    xs: 'h-6 w-20',    // 24x80px
    sm: 'h-8 w-28',    // 32x112px
    md: 'h-10 w-36',   // 40x144px
    lg: 'h-12 w-44',   // 48x176px
    xl: 'h-16 w-56'    // 64x224px
  };

  // Colores del logo según el tipo
  const getColors = () => {
    switch (color) {
      case 'white':
        return {
          primary: '#ffffff',
          secondary: '#f0f0f0',
          accent: '#e0e0e0',
          text: '#ffffff'
        };
      case 'blue':
        return {
          primary: '#21ABF6',
          secondary: '#1e9ae6',
          accent: '#1a87d6',
          text: '#21ABF6'
        };
      case 'gradient':
        return {
          primary: 'url(#logoGradient)',
          secondary: 'url(#logoGradient2)',
          accent: '#21ABF6',
          text: 'url(#textGradient)'
        };
      default:
        return {
          primary: '#21ABF6',
          secondary: '#1e9ae6',
          accent: '#FF6B35',
          text: '#2D3748'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg
          viewBox="0 0 200 50"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definiciones de gradientes */}
          {color === 'gradient' && (
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#21ABF6" />
                <stop offset="50%" stopColor="#1e9ae6" />
                <stop offset="100%" stopColor="#FF6B35" />
              </linearGradient>
              <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#21ABF6" />
              </linearGradient>
              <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2D3748" />
                <stop offset="100%" stopColor="#21ABF6" />
              </linearGradient>
            </defs>
          )}

          {/* Elemento principal del logo - P estilizada */}
          <g transform="translate(5, 5)">
            {/* Sombra/profundidad */}
            <ellipse 
              cx="20" 
              cy="35" 
              rx="18" 
              ry="4" 
              fill="rgba(0,0,0,0.1)" 
              className="drop-shadow-sm"
            />
            
            {/* Forma principal P */}
            <path
              d="M8 8 L8 32 L12 32 L12 22 L18 22 C24 22 28 18 28 14 C28 10 24 8 18 8 Z M12 12 L18 12 C21 12 22 13 22 14 C22 15 21 16 18 16 L12 16 Z"
              fill={colors.primary}
              className="drop-shadow-md transition-all duration-300 hover:scale-105"
            />
            
            {/* Elemento decorativo - punto */}
            <circle
              cx="30"
              cy="14"
              r="3"
              fill={colors.accent}
              className="animate-pulse"
            />
            
            {/* Elementos decorativos adicionales */}
            <path
              d="M32 8 Q36 8 36 12 Q36 16 32 16"
              stroke={colors.secondary}
              strokeWidth="2"
              fill="none"
              className="opacity-70"
            />
          </g>

          {/* Texto del logo */}
          {showText && (
            <g transform="translate(45, 15)">
              <text
                x="0"
                y="0"
                fontFamily="Arial, sans-serif"
                fontSize="16"
                fontWeight="700"
                fill={colors.text}
                className="select-none"
              >
                arkiing
              </text>
              <text
                x="0"
                y="18"
                fontFamily="Arial, sans-serif"
                fontSize="8"
                fontWeight="400"
                fill={colors.secondary}
                className="select-none opacity-80"
              >
                Parkiing Services
              </text>
            </g>
          )}

          {/* Elementos decorativos flotantes */}
          <g opacity="0.6">
            <circle cx="170" cy="15" r="1.5" fill={colors.accent} className="animate-bounce" style={{animationDelay: '0.5s'}} />
            <circle cx="175" cy="25" r="1" fill={colors.secondary} className="animate-bounce" style={{animationDelay: '1s'}} />
            <circle cx="180" cy="35" r="1.2" fill={colors.primary} className="animate-bounce" style={{animationDelay: '1.5s'}} />
          </g>
        </svg>
      </div>
    </div>
  );
}