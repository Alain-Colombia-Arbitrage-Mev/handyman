import React from 'react';
import { X, User, Bell, Settings, HelpCircle, FileText, Shield, MessageCircle, LogOut, Edit3, Zap, Plus, Briefcase, ShoppingBag, Clock, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { VerifiedIcon } from './VerifiedIcon';
import { LanguageSelector } from './LanguageSelector';
import { ParkiingLogo } from './ParkiingLogo';
import { useLanguage } from './LanguageProvider';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  unreadCount: number;
}

export function HamburgerMenu({ isOpen, onClose, onNavigate, unreadCount }: HamburgerMenuProps) {
  const { t } = useLanguage();
  
  const handleNavigation = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-0 top-0 h-full w-[85vw] max-w-sm bg-white z-50 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header Section */}
              <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex justify-center flex-1">
                    <ParkiingLogo size="sm" showText={false} variant="sidebar" animated={true} />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 p-2 rounded-full transition-all duration-200 touch-manipulation"
                  >
                    <X size={18} />
                  </Button>
                </div>

                {/* User Profile Section */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#21ABF6] to-blue-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <User size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">Juan Pérez</span>
                        <VerifiedIcon />
                      </div>
                      <p className="text-white/80 text-xs truncate">juan@email.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <LanguageSelector />
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-4 border-b border-gray-100">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  {t('menu.quickActions')}
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigation('flash-offers')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation active:scale-[0.98]"
                  >
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Zap size={14} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm">{t('menu.flashOffer')}</p>
                      <p className="text-xs opacity-90 truncate">{t('menu.flashOfferDesc')}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigation('flash-job')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation active:scale-[0.98]"
                  >
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Wrench size={14} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm">{t('menu.quickJobs')}</p>
                      <p className="text-xs opacity-90 truncate">{t('menu.quickJobsDesc')}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigation('post-job')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#21ABF6] text-white hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation active:scale-[0.98]"
                  >
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Plus size={14} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm">{t('menu.publishJob')}</p>
                      <p className="text-xs opacity-90 truncate">{t('menu.publishJobDesc')}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigation('all-offers')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation active:scale-[0.98]"
                  >
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <ShoppingBag size={14} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm">{t('menu.allOffers')}</p>
                      <p className="text-xs opacity-90 truncate">{t('menu.allOffersDesc')}</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <nav className="space-y-1">
                  <MenuItem
                    icon={<User size={16} className="text-blue-600" />}
                    label={t('menu.myProfile')}
                    onClick={() => handleNavigation('profile')}
                    bgColor="bg-blue-100"
                  />

                  <MenuItem
                    icon={<Briefcase size={16} className="text-green-600" />}
                    label={t('menu.myJobs')}
                    onClick={() => handleNavigation('my-jobs')}
                    bgColor="bg-green-100"
                  />

                  <MenuItem
                    icon={<Clock size={16} className="text-orange-600" />}
                    label={t('menu.dailyOffers')}
                    onClick={() => handleNavigation('all-offers')}
                    bgColor="bg-orange-100"
                  />

                  <MenuItem
                    icon={<Bell size={16} className="text-orange-600" />}
                    label={t('menu.notifications')}
                    onClick={() => handleNavigation('notifications')}
                    bgColor="bg-orange-100"
                    badge={unreadCount > 0 ? unreadCount : undefined}
                  />

                  <MenuItem
                    icon={<Edit3 size={16} className="text-purple-600" />}
                    label={t('menu.professionalProfile')}
                    onClick={() => handleNavigation('create-profile')}
                    bgColor="bg-purple-100"
                  />

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3" />

                  <MenuItem
                    icon={<Settings size={16} className="text-gray-600" />}
                    label={t('menu.settings')}
                    onClick={() => handleNavigation('settings')}
                    bgColor="bg-gray-100"
                  />

                  <MenuItem
                    icon={<HelpCircle size={16} className="text-gray-600" />}
                    label={t('menu.helpSupport')}
                    onClick={() => handleNavigation('help')}
                    bgColor="bg-gray-100"
                  />

                  <MenuItem
                    icon={<MessageCircle size={16} className="text-gray-600" />}
                    label={t('menu.contact')}
                    onClick={() => handleNavigation('contact')}
                    bgColor="bg-gray-100"
                  />

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3" />

                  <MenuItem
                    icon={<FileText size={16} className="text-gray-600" />}
                    label={t('menu.terms')}
                    onClick={() => handleNavigation('terms')}
                    bgColor="bg-gray-100"
                  />

                  <MenuItem
                    icon={<Shield size={16} className="text-gray-600" />}
                    label={t('menu.privacy')}
                    onClick={() => handleNavigation('privacy')}
                    bgColor="bg-gray-100"
                  />
                </nav>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 active:bg-red-100 transition-all duration-200 text-red-600 touch-manipulation active:scale-[0.98]">
                  <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                    <LogOut size={14} className="text-red-600" />
                  </div>
                  <span className="font-medium text-sm">{t('menu.logout')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper component for menu items
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  bgColor: string;
  badge?: number;
}

function MenuItem({ icon, label, onClick, bgColor, badge }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation active:scale-[0.98]"
    >
      <div className={`w-7 h-7 ${bgColor} rounded-lg flex items-center justify-center relative`}>
        {icon}
        {badge && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            {badge > 9 ? '9+' : badge}
          </Badge>
        )}
      </div>
      <div className="flex justify-between items-center flex-1">
        <span className="text-gray-700 font-medium text-sm">{label}</span>
        {badge && (
          <Badge variant="destructive" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
    </button>
  );
}