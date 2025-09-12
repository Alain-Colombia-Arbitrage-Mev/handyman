import React from 'react';
import { Notification } from '../types';
import { 
  X, 
  Bell, 
  MessageCircle, 
  DollarSign, 
  Briefcase, 
  Settings, 
  ArrowLeft,
  Target,
  Store,
  Hammer,
  Megaphone,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  MapPin,
  Gift,
  Trophy,
  Check
} from 'lucide-react-native';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageProvider';

interface NotificationCenterProps {
  notifications: Notification[];
  onBack: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationCenter({ 
  notifications, 
  onBack, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onRemove,
  onNotificationClick 
}: NotificationCenterProps) {
  const { t } = useLanguage();

  const getNotificationIcon = (notification: Notification) => {
    const { type, urgency } = notification;
    
    switch (type) {
      case 'new_bid':
        return <TrendingUp size={16} />;
      
      case 'message':
        return <MessageCircle size={16} />;
      
      case 'job_opportunity':
        if (urgency === 'high') {
          return <AlertTriangle size={16} />;
        }
        return <Target size={16} />;
      
      case 'business_offer':
        return <Store size={16} />;
      
      case 'surplus_auction':
        if (urgency === 'high') {
          return <Zap size={16} />;
        }
        return <Hammer size={16} />;
      
      case 'internal_message':
        return <Megaphone size={16} />;
      
      case 'job_update':
        return <Briefcase size={16} />;
      
      case 'payment':
        return <CheckCircle size={16} />;
      
      case 'system':
        return <Settings size={16} />;
      
      default:
        return <Bell size={16} />;
    }
  };

  const getTypeColor = (notification: Notification) => {
    const { type, urgency } = notification;
    
    switch (type) {
      case 'new_bid':
        return 'bg-green-50 border-green-200';
      
      case 'message':
        return 'bg-blue-50 border-blue-200';
      
      case 'job_opportunity':
        if (urgency === 'high') {
          return 'bg-red-50 border-red-200';
        }
        return 'bg-orange-50 border-orange-200';
      
      case 'business_offer':
        return 'bg-purple-50 border-purple-200';
      
      case 'surplus_auction':
        if (urgency === 'high') {
          return 'bg-amber-50 border-amber-200';
        }
        return 'bg-indigo-50 border-indigo-200';
      
      case 'internal_message':
        return 'bg-sky-50 border-sky-200';
      
      case 'job_update':
        return 'bg-blue-50 border-blue-200';
      
      case 'payment':
        return 'bg-emerald-50 border-emerald-200';
      
      case 'system':
        return 'bg-gray-50 border-gray-200';
      
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyIndicator = (notification: Notification) => {
    if (notification.urgency === 'high') {
      return (
        <div className="flex items-center gap-1 mb-2">
          <AlertTriangle size={12} />
          <Badge variant="destructive" className="text-xs px-2 py-0.5 h-5">
            {t('postJob.urgent').toUpperCase()}
          </Badge>
        </div>
      );
    }
    return null;
  };

  const getDistanceInfo = (notification: Notification) => {
    if (notification.distance) {
      const distanceText = notification.distance < 1000 
        ? `${notification.distance}m` 
        : `${(notification.distance / 1000).toFixed(1)}km`;
      
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <MapPin size={12} />
          <span>{distanceText} {t('common.distance')}</span>
        </div>
      );
    }
    return null;
  };

  const handleAcceptOpportunity = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Aceptando oportunidad:', notification.id);
    
    onMarkAsRead(notification.id);
    onNotificationClick(notification);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return t('common.timeAgo', { time: `${minutes} min` });
    } else if (hours < 24) {
      return t('common.timeAgo', { time: `${hours}h` });
    } else {
      return t('common.timeAgo', { time: `${days}d` });
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold">{t('notifications.title')}</h1>
          </div>
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-sm text-primary"
            >
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>
        {unreadNotifications.length > 0 && (
          <p className="text-sm text-gray-500">
            {unreadNotifications.length} {t('notifications.unreadCount', { count: unreadNotifications.length })}
          </p>
        )}
      </div>

      <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-2">
                {t('notifications.unread')}
              </h3>
              {unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl border-l-4 shadow-sm cursor-pointer hover:shadow-md active:shadow-lg transition-all duration-200 ${getTypeColor(notification)} ${!notification.read ? 'border-l-[#21ABF6]' : ''}`}
                  onClick={() => {
                    onMarkAsRead(notification.id);
                    onNotificationClick(notification);
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <img
                            src={notification.avatar}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format";
                            }}
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border-2 border-white ${getTypeColor(notification)}`}>
                            {getNotificationIcon(notification)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {getUrgencyIndicator(notification)}
                        
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemove(notification.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded-full"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {getDistanceInfo(notification)}
                        
                        <div className="mt-3">
                          {/* Botón especial para oportunidades de empleo */}
                          {notification.type === 'job_opportunity' && (
                            <div className="flex gap-2 mb-2">
                              <Button
                                size="sm"
                                className="text-xs h-8 px-4 bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm"
                                onClick={(e) => handleAcceptOpportunity(notification, e)}
                              >
                                <Check size={14} />
                                {t('notifications.acceptOpportunity')}
                              </Button>
                            </div>
                          )}
                          
                          {/* Botón de acción regular */}
                          {notification.action && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 px-3 bg-white hover:bg-gray-50 border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNotificationClick(notification);
                              }}
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-3 h-3 bg-[#21ABF6] rounded-full flex-shrink-0 mt-1 shadow-sm"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-2">
                {t('notifications.previous')}
              </h3>
              {readNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getTypeColor(notification)} opacity-70 hover:opacity-85`}
                  onClick={() => onNotificationClick(notification)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <img
                            src={notification.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format";
                            }}
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification)}`}>
                            {getNotificationIcon(notification)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-700 text-sm">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemove(notification.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded-full"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-2">
                          {notification.message}
                        </p>
                        
                        {getDistanceInfo(notification)}
                        
                        <div className="mt-2">
                          {/* Botón especial para oportunidades de empleo (solo si está leída) */}
                          {notification.type === 'job_opportunity' && (
                            <div className="flex gap-2 mb-2">
                              <Button
                                size="sm"
                                className="text-xs h-7 px-3 bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm opacity-75"
                                onClick={(e) => handleAcceptOpportunity(notification, e)}
                              >
                                <Check size={12} />
                                {t('notifications.acceptOpportunity')}
                              </Button>
                            </div>
                          )}
                          
                          {/* Botón de acción regular */}
                          {notification.action && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNotificationClick(notification);
                              }}
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {notifications.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {t('notifications.noNotifications')}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                {t('notifications.noNotificationsDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}