import React from 'react';

interface OptimizedLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  color?: string;
  animated?: boolean;
}

export function OptimizedLogo({ 
  size = 40, 
  showText = true, 
  className = '',
  color = '#21ABF6',
  animated = false
}: OptimizedLogoProps) {
  const textWidth = showText ? size * 2.5 : 0;
  const totalWidth = size + textWidth + (showText ? size * 0.2 : 0);

  return (
    <div className={`inline-flex items-center ${className}`} style={{ width: totalWidth, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        className={`flex-shrink-0 ${animated ? 'transition-transform duration-300 hover:scale-110' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Definiciones para efectos */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Sombra base */}
        <ellipse 
          cx="20" 
          cy="35" 
          rx="15" 
          ry="3" 
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Logo principal - P estilizada */}
        <g transform="translate(8, 8)">
          <path
            d="M4 4 L4 24 L8 24 L8 16 L14 16 C18 16 20 14 20 11 C20 8 18 4 14 4 Z M8 8 L14 8 C15.5 8 16 9 16 11 C16 13 15.5 14 14 14 L8 14 Z"
            fill="url(#logoGrad)"
            filter={animated ? "url(#glow)" : "none"}
            className={animated ? "animate-pulse" : ""}
          />
          
          {/* Punto decorativo */}
          <circle
            cx="22"
            cy="11"
            r="2.5"
            fill="#FF6B35"
            className={animated ? "animate-bounce" : ""}
            style={animated ? {animationDelay: '0.5s'} : {}}
          />
        </g>
      </svg>

      {/* Texto del logo */}
      {showText && (
        <div 
          className="ml-2 flex flex-col justify-center select-none"
          style={{ fontSize: size * 0.35 }}
        >
          <span 
            className="font-bold leading-none"
            style={{ color, fontSize: size * 0.4 }}
          >
            arkiing
          </span>
          <span 
            className="text-gray-500 leading-none mt-1"
            style={{ fontSize: size * 0.2 }}
          >
            Handyman
          </span>
        </div>
      )}
    </div>
  );
}