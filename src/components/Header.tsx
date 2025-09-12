import React from 'react';
import { ArrowLeft, Menu, Search, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ParkiingLogo } from './ParkiingLogo';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showSearchButton?: boolean;
  showNotificationsButton?: boolean;
  showLogo?: boolean;
  onBack?: () => void;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  unreadCount?: number;
  variant?: 'default' | 'minimal' | 'centered';
  className?: string;
}

export function Header({
  title,
  showBackButton = false,
  showMenuButton = false,
  showSearchButton = false,
  showNotificationsButton = false,
  showLogo = true,
  onBack,
  onMenuClick,
  onSearchClick,
  onNotificationsClick,
  unreadCount = 0,
  variant = 'default',
  className = ''
}: HeaderProps) {
  const renderLeftSection = () => {
    if (showBackButton) {
      return (
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 touch-manipulation flex-shrink-0" 
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </Button>
      );
    }
    
    if (showMenuButton) {
      return (
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 -ml-2 touch-manipulation flex-shrink-0" 
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </Button>
      );
    }
    
    return <div className="w-10 h-10"></div>; // Spacer
  };

  const renderCenterSection = () => {
    if (variant === 'centered' && title) {
      return (
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      );
    }
    
    if (showLogo) {
      return (
        <div className="flex justify-center flex-1">
          <ParkiingLogo size="sm" showText={false} variant="header" animated={true} />
        </div>
      );
    }
    
    if (title) {
      return (
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      );
    }
    
    return <div className="flex-1"></div>; // Spacer
  };

  const renderRightSection = () => {
    const buttons = [];
    
    if (showSearchButton) {
      buttons.push(
        <Button 
          key="search"
          variant="ghost" 
          size="sm" 
          className="p-2 touch-manipulation flex-shrink-0" 
          onClick={onSearchClick}
        >
          <Search size={20} />
        </Button>
      );
    }
    
    if (showNotificationsButton) {
      buttons.push(
        <Button 
          key="notifications"
          variant="ghost" 
          size="sm" 
          className="p-2 relative touch-manipulation flex-shrink-0" 
          onClick={onNotificationsClick}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      );
    }
    
    if (buttons.length === 0) {
      return <div className="w-10 h-10"></div>; // Spacer
    }
    
    return (
      <div className="flex items-center gap-1">
        {buttons}
      </div>
    );
  };

  return (
    <div className={`sticky top-0 z-10 bg-white border-b border-gray-200 ${className}`}>
      {/* Main Header Content */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 safe-area-inset-top bg-gradient-to-b from-white to-gray-50/50">
        {renderLeftSection()}
        {renderCenterSection()}
        {renderRightSection()}
      </div>
      
      {/* Title Section for non-centered variants */}
      {variant !== 'centered' && title && (
        <div className="px-4 py-3 border-t border-gray-100">
          <h1 className="text-lg font-semibold text-center">{title}</h1>
        </div>
      )}
    </div>
  );
}

// Componentes específicos para casos comunes
export function HomeHeader({ 
  onMenuClick, 
  onSearchClick, 
  unreadCount 
}: { 
  onMenuClick?: () => void; 
  onSearchClick?: () => void; 
  unreadCount?: number; 
}) {
  return (
    <Header
      showMenuButton={true}
      showSearchButton={true}
      showLogo={true}
      onMenuClick={onMenuClick}
      onSearchClick={onSearchClick}
      unreadCount={unreadCount}
    />
  );
}

export function BackHeader({ 
  title, 
  onBack 
}: { 
  title?: string; 
  onBack: () => void; 
}) {
  return (
    <Header
      title={title}
      showBackButton={true}
      showLogo={!title}
      onBack={onBack}
      variant={title ? "centered" : "default"}
    />
  );
}

export function DashboardHeader({ 
  title,
  onMenuClick, 
  onSearchClick,
  onNotificationsClick,
  unreadCount 
}: { 
  title?: string;
  onMenuClick?: () => void; 
  onSearchClick?: () => void; 
  onNotificationsClick?: () => void;
  unreadCount?: number; 
}) {
  return (
    <Header
      title={title}
      showMenuButton={true}
      showSearchButton={true}
      showNotificationsButton={true}
      showLogo={true}
      onMenuClick={onMenuClick}
      onSearchClick={onSearchClick}
      onNotificationsClick={onNotificationsClick}
      unreadCount={unreadCount}
    />
  );
}