import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { notifications as initialNotifications } from '../data/mockData';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Función para verificar si las notificaciones están disponibles
  const isNotificationSupported = () => {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           typeof window.Notification !== 'undefined';
  };

  // Simular notificaciones push que llegan en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular nueva notificación cada 2-5 minutos aleatoriamente
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'new_bid' : 'message',
          title: Math.random() > 0.5 ? 'Nueva oferta recibida' : 'Nuevo mensaje',
          message: Math.random() > 0.5 
            ? `Tienes una nueva oferta de $${Math.floor(Math.random() * 3000 + 1000)} para tu trabajo`
            : 'Tienes un nuevo mensaje de un profesional',
          timestamp: new Date(),
          read: false,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          action: {
            label: Math.random() > 0.5 ? 'Ver oferta' : 'Ver mensaje',
            type: 'navigate',
            target: 'home'
          }
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Mostrar notificación del navegador si está disponible y permitido
        if (isNotificationSupported()) {
          try {
            if (window.Notification.permission === 'granted') {
              new window.Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png'
              });
            }
          } catch (error) {
            console.log('Las notificaciones del navegador no están disponibles');
          }
        }
      }
    }, 120000); // Cada 2 minutos

    return () => clearInterval(interval);
  }, []);

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    if (isNotificationSupported()) {
      try {
        if (window.Notification.permission === 'default') {
          window.Notification.requestPermission().catch(() => {
            console.log('No se pudieron solicitar permisos de notificación');
          });
        }
      } catch (error) {
        console.log('Las notificaciones del navegador no están disponibles');
      }
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Mostrar notificación del navegador si está disponible
    if (isNotificationSupported()) {
      try {
        if (window.Notification.permission === 'granted') {
          new window.Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png'
          });
        }
      } catch (error) {
        console.log('Las notificaciones del navegador no están disponibles');
      }
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification
  };
}