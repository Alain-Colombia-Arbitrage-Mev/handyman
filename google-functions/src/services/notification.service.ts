import admin from 'firebase-admin';
import { config } from '@/utils/config';
import { createLogger } from '@/utils/logger';
import {
  ExternalServiceError,
  ValidationError,
  NotFoundError
} from '@/utils/errors';
import { convexService } from './convex.service';
import {
  PushNotification,
  NotificationType,
  User
} from '@/types';

const logger = createLogger('NotificationService');

export class NotificationService {
  private messaging: admin.messaging.Messaging;

  constructor() {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp();
    }

    this.messaging = admin.messaging();
    logger.info('Notification service initialized');
  }

  /**
   * Send push notification to a single user
   */
  async sendPushNotification(notification: PushNotification): Promise<void> {
    logger.info('Sending push notification', {
      userId: notification.userId,
      type: notification.type,
      title: notification.title
    });

    try {
      // Get user's FCM tokens
      const tokens = await this.getUserFCMTokens(notification.userId);

      if (tokens.length === 0) {
        logger.warn('No FCM tokens found for user', { userId: notification.userId });
        return;
      }

      // Build notification payload
      const payload = this.buildNotificationPayload(notification);

      // Send to all user devices
      const results = await Promise.allSettled(
        tokens.map(token => this.sendToToken(payload, token))
      );

      // Process results and clean up invalid tokens
      await this.processNotificationResults(notification.userId, tokens, results);

      // Store notification in database
      await convexService.createNotification({
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.body,
        data: notification.data,
        isRead: false,
        createdAt: Date.now(),
      });

      logger.info('Push notification sent successfully', {
        userId: notification.userId,
        tokensCount: tokens.length,
        type: notification.type
      });

    } catch (error: any) {
      logger.error('Failed to send push notification', error, {
        userId: notification.userId,
        type: notification.type
      });
      throw new ExternalServiceError('FCM', `Failed to send push notification: ${error.message}`, error);
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendBulkPushNotifications(
    userIds: string[],
    notification: Omit<PushNotification, 'userId'>
  ): Promise<{ successful: number; failed: number }> {
    logger.info('Sending bulk push notifications', {
      userCount: userIds.length,
      type: notification.type
    });

    const results = await Promise.allSettled(
      userIds.map(userId =>
        this.sendPushNotification({
          ...notification,
          userId,
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    logger.info('Bulk push notifications completed', {
      total: userIds.length,
      successful,
      failed
    });

    return { successful, failed };
  }

  /**
   * Send notification to topic (for broadcast messages)
   */
  async sendToTopic(
    topic: string,
    notification: Omit<PushNotification, 'userId'>
  ): Promise<void> {
    logger.info('Sending notification to topic', { topic, type: notification.type });

    try {
      const payload = this.buildNotificationPayload({
        ...notification,
        userId: '', // Not needed for topic notifications
      });

      const message: admin.messaging.Message = {
        ...payload,
        topic,
      };

      const response = await this.messaging.send(message);

      logger.info('Topic notification sent successfully', {
        topic,
        messageId: response,
        type: notification.type
      });

    } catch (error: any) {
      logger.error('Failed to send topic notification', error, { topic });
      throw new ExternalServiceError('FCM', `Failed to send topic notification: ${error.message}`, error);
    }
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(userId: string, topic: string): Promise<void> {
    logger.info('Subscribing user to topic', { userId, topic });

    try {
      const tokens = await this.getUserFCMTokens(userId);

      if (tokens.length === 0) {
        logger.warn('No FCM tokens found for subscription', { userId, topic });
        return;
      }

      const response = await this.messaging.subscribeToTopic(tokens, topic);

      logger.info('User subscribed to topic successfully', {
        userId,
        topic,
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      // Store subscription in database
      await convexService.createTopicSubscription(userId, topic);

    } catch (error: any) {
      logger.error('Failed to subscribe to topic', error, { userId, topic });
      throw new ExternalServiceError('FCM', `Failed to subscribe to topic: ${error.message}`, error);
    }
  }

  /**
   * Unsubscribe user from topic
   */
  async unsubscribeFromTopic(userId: string, topic: string): Promise<void> {
    logger.info('Unsubscribing user from topic', { userId, topic });

    try {
      const tokens = await this.getUserFCMTokens(userId);

      if (tokens.length > 0) {
        const response = await this.messaging.unsubscribeFromTopic(tokens, topic);

        logger.info('User unsubscribed from topic successfully', {
          userId,
          topic,
          successCount: response.successCount,
          failureCount: response.failureCount
        });
      }

      // Remove subscription from database
      await convexService.removeTopicSubscription(userId, topic);

    } catch (error: any) {
      logger.error('Failed to unsubscribe from topic', error, { userId, topic });
      throw new ExternalServiceError('FCM', `Failed to unsubscribe from topic: ${error.message}`, error);
    }
  }

  /**
   * Register/update FCM token for user
   */
  async registerFCMToken(userId: string, token: string, deviceInfo?: {
    platform: string;
    deviceId: string;
    appVersion: string;
  }): Promise<void> {
    logger.info('Registering FCM token', { userId });

    try {
      // Validate token
      await this.validateFCMToken(token);

      // Store/update token in database
      await convexService.upsertFCMToken(userId, token, {
        platform: deviceInfo?.platform || 'unknown',
        deviceId: deviceInfo?.deviceId || 'unknown',
        appVersion: deviceInfo?.appVersion || 'unknown',
        registeredAt: Date.now(),
        lastUsed: Date.now(),
      });

      logger.info('FCM token registered successfully', { userId });

    } catch (error: any) {
      logger.error('Failed to register FCM token', error, { userId });
      throw error;
    }
  }

  /**
   * Remove FCM token
   */
  async removeFCMToken(userId: string, token: string): Promise<void> {
    logger.info('Removing FCM token', { userId });

    try {
      await convexService.removeFCMToken(userId, token);
      logger.info('FCM token removed successfully', { userId });

    } catch (error: any) {
      logger.error('Failed to remove FCM token', error, { userId });
      throw error;
    }
  }

  /**
   * Business-specific notification methods
   */

  // Job-related notifications
  async sendJobMatchNotification(handymanId: string, job: any): Promise<void> {
    await this.sendPushNotification({
      userId: handymanId,
      type: 'job_match',
      title: '¡Nueva oportunidad!',
      body: `${job.title} - ${job.location.address}`,
      data: {
        jobId: job.id,
        category: job.category,
        budget: job.budget,
        isUrgent: job.isUrgent,
      },
      actionUrl: `/jobs/${job.id}`,
    });
  }

  async sendProposalReceivedNotification(clientId: string, proposal: any): Promise<void> {
    await this.sendPushNotification({
      userId: clientId,
      type: 'proposal_received',
      title: 'Nueva propuesta recibida',
      body: `${proposal.handymanName} envió una propuesta de $${proposal.proposedPrice}`,
      data: {
        jobId: proposal.jobId,
        proposalId: proposal.id,
        handymanId: proposal.handymanId,
        proposedPrice: proposal.proposedPrice,
      },
      actionUrl: `/jobs/${proposal.jobId}/proposals`,
    });
  }

  async sendJobAssignedNotification(handymanId: string, job: any): Promise<void> {
    await this.sendPushNotification({
      userId: handymanId,
      type: 'job_assigned',
      title: '¡Trabajo asignado!',
      body: `Has sido seleccionado para: ${job.title}`,
      data: {
        jobId: job.id,
        clientId: job.clientId,
        finalPrice: job.finalPrice,
      },
      actionUrl: `/jobs/${job.id}`,
    });
  }

  // Message notifications
  async sendMessageNotification(receiverId: string, sender: User, message: string): Promise<void> {
    await this.sendPushNotification({
      userId: receiverId,
      type: 'message',
      title: `Mensaje de ${sender.name}`,
      body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      data: {
        senderId: sender.id,
        senderName: sender.name,
        conversationId: `${sender.id}_${receiverId}`,
      },
      imageUrl: sender.avatar,
      actionUrl: `/messages/${sender.id}`,
    });
  }

  // Payment notifications
  async sendPaymentSuccessNotification(userId: string, amount: number, currency: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      type: 'payment',
      title: 'Pago exitoso',
      body: `Tu pago de ${currency} ${amount / 100} fue procesado correctamente`,
      data: {
        amount,
        currency,
        type: 'payment_success',
      },
      actionUrl: '/payments/history',
    });
  }

  async sendPaymentReceivedNotification(handymanId: string, amount: number, currency: string): Promise<void> {
    await this.sendPushNotification({
      userId: handymanId,
      type: 'payment',
      title: 'Pago recibido',
      body: `Has recibido un pago de ${currency} ${amount / 100}`,
      data: {
        amount,
        currency,
        type: 'payment_received',
      },
      actionUrl: '/earnings',
    });
  }

  async sendPaymentFailedNotification(userId: string, errorMessage?: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      type: 'payment',
      title: 'Error en el pago',
      body: errorMessage || 'Hubo un problema procesando tu pago. Por favor intenta nuevamente.',
      data: {
        type: 'payment_failed',
        errorMessage,
      },
      actionUrl: '/payments/retry',
    });
  }

  async sendRefundNotification(userId: string, amount: number, currency: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      type: 'payment',
      title: 'Reembolso procesado',
      body: `Tu reembolso de ${currency} ${amount / 100} ha sido procesado`,
      data: {
        amount,
        currency,
        type: 'refund_processed',
      },
      actionUrl: '/payments/history',
    });
  }

  async sendRefundProcessedNotification(handymanId: string, amount: number, currency: string): Promise<void> {
    await this.sendPushNotification({
      userId: handymanId,
      type: 'payment',
      title: 'Reembolso realizado',
      body: `Se procesó un reembolso de ${currency} ${amount / 100} de tus ganancias`,
      data: {
        amount,
        currency,
        type: 'refund_deducted',
      },
      actionUrl: '/earnings',
    });
  }

  async sendPayoutNotification(handymanId: string, amount: number, currency: string): Promise<void> {
    await this.sendPushNotification({
      userId: handymanId,
      type: 'payment',
      title: 'Pago enviado',
      body: `Tu pago de ${currency} ${amount / 100} está en camino`,
      data: {
        amount,
        currency,
        type: 'payout_sent',
      },
      actionUrl: '/earnings',
    });
  }

  // System notifications
  async sendWelcomeNotification(userId: string, userName: string, userRole: string): Promise<void> {
    const message = userRole === 'handyman'
      ? 'Completa tu perfil y sube tus documentos para empezar a recibir trabajos'
      : 'Encuentra los mejores profesionales para tus necesidades';

    await this.sendPushNotification({
      userId,
      type: 'system',
      title: `¡Bienvenido ${userName}!`,
      body: message,
      data: {
        type: 'welcome',
        userRole,
      },
      actionUrl: userRole === 'handyman' ? '/profile/complete' : '/search',
    });
  }

  async sendVerificationApprovedNotification(userId: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      type: 'system',
      title: '¡Verificación aprobada!',
      body: 'Tu cuenta ha sido verificada. Ya puedes recibir trabajos.',
      data: {
        type: 'verification_approved',
      },
      actionUrl: '/jobs/browse',
    });
  }

  async sendVerificationRejectedNotification(userId: string, reason?: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      type: 'system',
      title: 'Verificación rechazada',
      body: reason || 'Tu verificación fue rechazada. Por favor revisa tus documentos.',
      data: {
        type: 'verification_rejected',
        reason,
      },
      actionUrl: '/profile/verification',
    });
  }

  /**
   * Private helper methods
   */

  private async getUserFCMTokens(userId: string): Promise<string[]> {
    try {
      const tokens = await convexService.getUserFCMTokens(userId);
      return tokens.map(t => t.token).filter(Boolean);
    } catch (error: any) {
      logger.error('Failed to get user FCM tokens', error, { userId });
      return [];
    }
  }

  private buildNotificationPayload(notification: PushNotification): admin.messaging.Message {
    const payload: admin.messaging.Message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        type: notification.type,
        ...(notification.data || {}),
        actionUrl: notification.actionUrl || '',
        timestamp: Date.now().toString(),
      },
      android: {
        priority: 'high',
        notification: {
          icon: 'ic_notification',
          color: '#21ABF6',
          sound: 'default',
          clickAction: notification.actionUrl,
          channelId: this.getNotificationChannel(notification.type),
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'content-available': 1,
            category: notification.type,
          },
        },
        fcmOptions: {
          imageUrl: notification.imageUrl,
        },
      },
      webpush: {
        headers: {
          Urgency: this.getWebPushUrgency(notification.type),
        },
        notification: {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          requireInteraction: notification.type === 'job_match',
        },
        fcmOptions: {
          link: notification.actionUrl,
        },
      },
    };

    return payload;
  }

  private async sendToToken(payload: admin.messaging.Message, token: string): Promise<string> {
    const message: admin.messaging.Message = {
      ...payload,
      token,
    };

    return await this.messaging.send(message);
  }

  private async processNotificationResults(
    userId: string,
    tokens: string[],
    results: PromiseSettledResult<string>[]
  ): Promise<void> {
    const invalidTokens: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const error = result.reason;
        const token = tokens[index];

        if (this.isInvalidTokenError(error)) {
          invalidTokens.push(token);
        }

        logger.warn('Failed to send notification to token', {
          error: error.message,
          tokenIndex: index,
          userId
        });
      }
    });

    // Clean up invalid tokens
    if (invalidTokens.length > 0) {
      await Promise.all(
        invalidTokens.map(token => convexService.removeFCMToken(userId, token))
      );

      logger.info('Cleaned up invalid FCM tokens', {
        userId,
        count: invalidTokens.length
      });
    }
  }

  private async validateFCMToken(token: string): Promise<boolean> {
    try {
      // Send a test message to validate the token
      await this.messaging.send({
        token,
        data: { test: 'true' },
      }, true); // dryRun = true

      return true;
    } catch (error: any) {
      if (this.isInvalidTokenError(error)) {
        throw new ValidationError('Invalid FCM token');
      }
      throw error;
    }
  }

  private isInvalidTokenError(error: any): boolean {
    return error.code === 'messaging/invalid-registration-token' ||
           error.code === 'messaging/registration-token-not-registered';
  }

  private getNotificationChannel(type: NotificationType): string {
    const channels = {
      'job_match': 'job_notifications',
      'proposal_received': 'job_notifications',
      'job_assigned': 'job_notifications',
      'message': 'message_notifications',
      'payment': 'payment_notifications',
      'system': 'general_notifications',
    };

    return channels[type] || 'general_notifications';
  }

  private getWebPushUrgency(type: NotificationType): string {
    const urgencyMap = {
      'job_match': 'high',
      'proposal_received': 'normal',
      'job_assigned': 'high',
      'message': 'normal',
      'payment': 'high',
      'system': 'low',
    };

    return urgencyMap[type] || 'normal';
  }
}

export const notificationService = new NotificationService();