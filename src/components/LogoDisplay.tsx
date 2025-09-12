import React from 'react';
import { ParkiingLogo } from './ParkiingLogo';

interface LogoDisplayProps {
  context: 'header' | 'sidebar' | 'splash' | 'card' | 'minimal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export function LogoDisplay({ 
  context, 
  size, 
  className = '',
  onClick 
}: LogoDisplayProps) {
  // Configuración específica por contexto
  const getContextConfig = () => {
    switch (context) {
      case 'header':
        return {
          size: size || 'sm',
          variant: 'figma' as const,
          showText: false,
          animated: true,
          className: 'cursor-pointer hover:opacity-80 transition-opacity duration-200'
        };
      
      case 'sidebar':
        return {
          size: size || 'md',
          variant: 'figma' as const,
          showText: false,
          animated: true,
          className: 'cursor-pointer hover:scale-105 transition-transform duration-200'
        };
      
      case 'splash':
        return {
          size: size || 'xl',
          variant: 'figma' as const,
          showText: true,
          animated: true,
          className: 'drop-shadow-lg'
        };
      
      case 'card':
        return {
          size: size || 'sm',
          variant: 'minimal' as const,
          showText: true,
          animated: false,
          className: 'opacity-90'
        };
      
      case 'minimal':
        return {
          size: size || 'xs',
          variant: 'minimal' as const,
          showText: false,
          animated: false,
          className: 'opacity-75'
        };
      
      default:
        return {
          size: size || 'md',
          variant: 'default' as const,
          showText: true,
          animated: false,
          className: ''
        };
    }
  };

  const config = getContextConfig();

  return (
    <div 
      className={`${config.className} ${className}`}
      onClick={onClick}
    >
      <ParkiingLogo
        size={config.size}
        variant={config.variant}
        showText={config.showText}
        animated={config.animated}
      />
    </div>
  );
}

// Componentes específicos para casos comunes
export function HeaderLogo({ onClick, className }: { onClick?: () => void; className?: string }) {
  return <LogoDisplay context="header" onClick={onClick} className={className} />;
}

export function SidebarLogo({ onClick, className }: { onClick?: () => void; className?: string }) {
  return <LogoDisplay context="sidebar" onClick={onClick} className={className} />;
}

export function SplashLogo({ className }: { className?: string }) {
  return <LogoDisplay context="splash" className={className} />;
}

export function CardLogo({ className }: { className?: string }) {
  return <LogoDisplay context="card" className={className} />;
}

export function MinimalLogo({ className }: { className?: string }) {
  return <LogoDisplay context="minimal" className={className} />;
}