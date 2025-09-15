import { StateCreator } from 'zustand';
import { Notification, NotificationsActions } from '../types';
import storageUtils, { STORAGE_KEYS } from '../storage';

export interface NotificationsSlice extends NotificationsActions {
  notifications: Notification[];
  unreadCount: number;
}

export const createNotificationsSlice: StateCreator<
  NotificationsSlice,
  [],
  [],
  NotificationsSlice
> = (set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,

  // Actions
  fetchNotifications: async () => {
    try {
      console.log('🔔 Fetching notifications');

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 600));

      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: 'notif-1',
          userId: 'user-123',
          type: 'proposal_received',
          title: 'Nueva propuesta recibida',
          message: 'Juan Carlos te envió una propuesta de $250 USD para tu trabajo de plomería',
          data: {
            jobId: 'job-1',
            proposalId: 'proposal-1',
            handymanId: 'handyman-1',
            amount: 250,
            currency: 'USD'
          },
          isRead: false,
          createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        },
        {
          id: 'notif-2',
          userId: 'user-123',
          type: 'message',
          title: 'Nuevo mensaje',
          message: 'María González: "¿Podrías enviarme más detalles sobre el trabajo?"',
          data: {
            conversationId: 'conv-1',
            senderId: 'handyman-2',
            messageId: 'msg-1'
          },
          isRead: false,
          createdAt: Date.now() - 45 * 60 * 1000, // 45 minutes ago
        },
        {
          id: 'notif-3',
          userId: 'user-123',
          type: 'job_match',
          title: 'Nuevo trabajo cerca de ti',
          message: 'Hay un trabajo de instalación eléctrica a 2.3 km de tu ubicación',
          data: {
            jobId: 'job-2',
            distance: 2.3,
            category: 'electricidad'
          },
          isRead: true,
          createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        },
        {
          id: 'notif-4',
          userId: 'user-123',
          type: 'job_assigned',
          title: 'Trabajo asignado',
          message: 'Te han asignado el trabajo de pintura en Zona Rosa. ¡Felicidades!',
          data: {
            jobId: 'job-3',
            clientId: 'client-3'
          },
          isRead: true,
          createdAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
        },
        {
          id: 'notif-5',
          userId: 'user-123',
          type: 'system',
          title: 'Verificación completada',
          message: 'Tu documento de identidad ha sido verificado exitosamente',
          data: {
            documentType: 'id',
            verificationStatus: 'approved'
          },
          isRead: true,
          createdAt: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
        },
        {
          id: 'notif-6',
          userId: 'user-123',
          type: 'proposal_received',
          title: 'Nueva propuesta recibida',
          message: 'Ana Rodríguez te envió una propuesta de $180 USD para tu trabajo de carpintería',
          data: {
            jobId: 'job-5',
            proposalId: 'proposal-2',
            handymanId: 'handyman-3',
            amount: 180,
            currency: 'USD'
          },
          isRead: false,
          createdAt: Date.now() - 90 * 60 * 1000, // 1.5 hours ago
        },
      ];

      // Sort by creation date (newest first)
      mockNotifications.sort((a, b) => b.createdAt - a.createdAt);

      // Cache notifications
      await storageUtils.setJSON(STORAGE_KEYS.NOTIFICATIONS, {
        data: mockNotifications,
        timestamp: Date.now()
      });

      const unreadCount = mockNotifications.filter(n => !n.isRead).length;

      set({
        notifications: mockNotifications,
        unreadCount
      });

      console.log(`✅ Fetched ${mockNotifications.length} notifications (${unreadCount} unread)`);
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);

      // Try to load from cache
      const cached = await storageUtils.getJSON<{
        data: Notification[];
        timestamp: number;
      }>(STORAGE_KEYS.NOTIFICATIONS);

      if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) { // 1 hour
        const unreadCount = cached.data.filter(n => !n.isRead).length;
        set({
          notifications: cached.data,
          unreadCount
        });
        console.log('📦 Loaded notifications from cache');
      }

      throw error;
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      console.log('👀 Marking notification as read:', notificationId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 200));

      const { notifications } = get();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );

      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;

      set({
        notifications: updatedNotifications,
        unreadCount
      });

      // Update cache
      await storageUtils.setJSON(STORAGE_KEYS.NOTIFICATIONS, {
        data: updatedNotifications,
        timestamp: Date.now()
      });

      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      console.log('👀 Marking all notifications as read');

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 400));

      const { notifications } = get();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true
      }));

      set({
        notifications: updatedNotifications,
        unreadCount: 0
      });

      // Update cache
      await storageUtils.setJSON(STORAGE_KEYS.NOTIFICATIONS, {
        data: updatedNotifications,
        timestamp: Date.now()
      });

      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const { notifications } = get();
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;

      set({
        notifications: updatedNotifications,
        unreadCount
      });

      // Update cache
      await storageUtils.setJSON(STORAGE_KEYS.NOTIFICATIONS, {
        data: updatedNotifications,
        timestamp: Date.now()
      });

      console.log('✅ Notification deleted');
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      throw error;
    }
  },

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    console.log('➕ Adding new notification:', notification.title);

    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: Date.now()
    };

    const { notifications, unreadCount } = get();
    const updatedNotifications = [newNotification, ...notifications];
    const newUnreadCount = newNotification.isRead ? unreadCount : unreadCount + 1;

    set({
      notifications: updatedNotifications,
      unreadCount: newUnreadCount
    });

    // Update cache (fire and forget)
    storageUtils.setJSON(STORAGE_KEYS.NOTIFICATIONS, {
      data: updatedNotifications,
      timestamp: Date.now()
    }).catch(console.error);

    console.log('✅ Notification added');
  },

  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  updateUnreadCount: () => {
    const { notifications } = get();
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ unreadCount });
  },
});