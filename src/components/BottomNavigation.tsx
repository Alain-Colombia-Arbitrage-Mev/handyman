import React from 'react';
import { Home, Search, Radar, Plus, MessageCircle, User } from 'lucide-react-native';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageProvider';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { t } = useLanguage();

  const tabs = [
    {
      id: 'home',
      label: t('nav.home'),
      icon: Home,
    },
    {
      id: 'post',
      label: t('nav.post'),
      icon: Plus,
    },
    {
      id: 'radar',
      label: t('nav.radar'),
      icon: Radar,
    },
    {
      id: 'messages',
      label: t('nav.messages'),
      icon: MessageCircle,
    },
    {
      id: 'profile',
      label: t('nav.profile'),
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors touch-manipulation ${
                isActive 
                  ? 'text-[#21ABF6] bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
              }`}
            >
              <div className="relative">
                <Icon 
                  size={20} 
                />
                {tab.id === 'messages' && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    2
                  </Badge>
                )}
              </div>
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}