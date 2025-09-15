import Stripe from 'stripe';
import { config } from '@/utils/config';
import { createLogger } from '@/utils/logger';
import {
  PaymentError,
  StripeError,
  ValidationError,
  NotFoundError,
  BusinessLogicError
} from '@/utils/errors';
import { convexService } from './convex.service';
import { emailService } from './email.service';
import { notificationService } from './notification.service';
import {
  PaymentIntent,
  PaymentWebhookEvent,
  RefundRequest,
  PaymentStatus,
  JobStatus
} from '@/types';

const logger = createLogger('PaymentService');

export class PaymentService {
  private stripe: Stripe;
  private readonly platformFeePercentage = 10; // 10% platform fee
  private readonly minAmount = 500; // Minimum $5.00 USD in cents
  private readonly maxAmount = 100000000; // Maximum $1M USD in cents

  constructor() {
    if (!config.stripe.secretKey) {
      throw new Error('Stripe secret key is required');
    }

    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    logger.info('Payment service initialized');
  }

  // Create payment intent
  async createPaymentIntent(data: {
    jobId: string;
    amount: number;
    currency: string;
    paymentMethodId: string;
    customerId: string;
    metadata: {
      handymanId: string;
      clientId: string;
      jobTitle: string;
    };
  }): Promise<PaymentIntent> {
    logger.info('Creating payment intent', { jobId: data.jobId, amount: data.amount });

    try {
      // Validate amount
      if (data.amount < this.minAmount || data.amount > this.maxAmount) {
        throw new ValidationError(`Amount must be between $${this.minAmount/100} and $${this.maxAmount/100}`);
      }

      // Validate job exists and is in correct state
      const job = await convexService.getJob(data.jobId);
      if (!job) {
        throw new NotFoundError('Job not found');
      }

      if (job.status !== 'assigned' && job.status !== 'in_progress') {
        throw new BusinessLogicError('Job must be assigned or in progress to create payment');
      }

      // Check if payment already exists for this job
      const existingPayment = await convexService.getPaymentByJobId(data.jobId);
      if (existingPayment && existingPayment.status !== 'failed') {
        throw new BusinessLogicError('Payment already exists for this job');
      }

      // Calculate platform fee
      const platformFee = Math.floor(data.amount * (this.platformFeePercentage / 100));
      const handymanAmount = data.amount - platformFee;

      // Create Stripe payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency.toLowerCase(),
        payment_method: data.paymentMethodId,
        customer: data.customerId,
        application_fee_amount: platformFee,
        transfer_data: {
          destination: await this.getOrCreateConnectedAccount(data.metadata.handymanId),
          amount: handymanAmount,
        },
        metadata: {
          jobId: data.jobId,
          handymanId: data.metadata.handymanId,
          clientId: data.metadata.clientId,
          jobTitle: data.metadata.jobTitle,
          platformFee: platformFee.toString(),
          handymanAmount: handymanAmount.toString(),
        },
        confirmation_method: 'manual',
        confirm: true,
        return_url: `https://yourapp.com/payment-success?job_id=${data.jobId}`,
      });

      // Store payment record in Convex
      const paymentRecord = await convexService.createPayment({
        jobId: data.jobId,
        stripePaymentIntentId: paymentIntent.id,
        amount: data.amount,
        currency: data.currency,
        platformFee,
        handymanAmount,
        status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
        payerId: data.metadata.clientId,
        receiverId: data.metadata.handymanId,
        paymentMethodId: data.paymentMethodId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      logger.info('Payment intent created successfully', {
        paymentIntentId: paymentIntent.id,
        jobId: data.jobId,
        amount: data.amount,
      });

      return {
        id: paymentRecord,
        jobId: data.jobId,
        amount: data.amount,
        currency: data.currency,
        paymentMethodId: data.paymentMethodId,
        clientSecret: paymentIntent.client_secret!,
        status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
        metadata: data.metadata,
      };

    } catch (error: any) {
      logger.error('Failed to create payment intent', error, { jobId: data.jobId });

      if (error.type === 'StripeError') {
        throw new StripeError(`Payment creation failed: ${error.message}`, error);
      }

      throw error;
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId: string): Promise<{ status: PaymentStatus; requiresAction: boolean }> {
    logger.info('Confirming payment intent', { paymentIntentId });

    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);

      const status = this.mapStripeStatusToPaymentStatus(paymentIntent.status);
      const requiresAction = paymentIntent.status === 'requires_action';

      // Update payment record
      await convexService.updatePaymentStatus(paymentIntentId, status);

      if (paymentIntent.status === 'succeeded') {
        await this.handleSuccessfulPayment(paymentIntentId, paymentIntent);
      }

      logger.info('Payment intent confirmed', {
        paymentIntentId,
        status: paymentIntent.status,
        requiresAction,
      });

      return { status, requiresAction };

    } catch (error: any) {
      logger.error('Failed to confirm payment intent', error, { paymentIntentId });
      throw new StripeError(`Payment confirmation failed: ${error.message}`, error);
    }
  }

  // Handle webhook events
  async handleWebhook(payload: string, signature: string): Promise<void> {
    logger.info('Processing webhook event');

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );

      logger.info('Webhook event received', { type: event.type, id: event.id });

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.requires_action':
          await this.handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
          break;

        case 'transfer.created':
          await this.handleTransferCreated(event.data.object as Stripe.Transfer);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;

        default:
          logger.info('Unhandled webhook event type', { type: event.type });
      }

    } catch (error: any) {
      logger.error('Webhook processing failed', error);
      throw new StripeError(`Webhook processing failed: ${error.message}`, error);
    }
  }

  // Process refund
  async processRefund(refundRequest: RefundRequest): Promise<{ refundId: string; status: string }> {
    logger.info('Processing refund', { paymentIntentId: refundRequest.paymentIntentId });

    try {
      // Get payment record
      const payment = await convexService.getPaymentByStripeId(refundRequest.paymentIntentId);
      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      // Validate refund eligibility
      if (payment.status !== 'completed') {
        throw new BusinessLogicError('Can only refund completed payments');
      }

      // Check refund time limit (e.g., 30 days)
      const refundDeadline = payment.createdAt + (30 * 24 * 60 * 60 * 1000); // 30 days
      if (Date.now() > refundDeadline) {
        throw new BusinessLogicError('Refund period has expired');
      }

      // Create Stripe refund
      const refund = await this.stripe.refunds.create({
        payment_intent: refundRequest.paymentIntentId,
        amount: refundRequest.amount, // Partial refund if amount specified
        reason: this.mapRefundReason(refundRequest.reason),
        metadata: refundRequest.metadata || {},
      });

      // Update payment status
      await convexService.updatePaymentStatus(refundRequest.paymentIntentId, 'refunded');

      // Update job status
      await convexService.updateJobStatus(payment.jobId, 'cancelled');

      // Send notifications
      await this.sendRefundNotifications(payment, refund);

      logger.info('Refund processed successfully', {
        refundId: refund.id,
        paymentIntentId: refundRequest.paymentIntentId,
        amount: refund.amount,
      });

      return {
        refundId: refund.id,
        status: refund.status,
      };

    } catch (error: any) {
      logger.error('Refund processing failed', error, { paymentIntentId: refundRequest.paymentIntentId });

      if (error.type === 'StripeError') {
        throw new StripeError(`Refund failed: ${error.message}`, error);
      }

      throw error;
    }
  }

  // Process payout to handyman
  async processPayout(handymanId: string, amount: number, currency: string): Promise<{ transferId: string }> {
    logger.info('Processing payout', { handymanId, amount });

    try {
      // Get handyman's connected account
      const connectedAccountId = await this.getOrCreateConnectedAccount(handymanId);

      // Create transfer
      const transfer = await this.stripe.transfers.create({
        amount,
        currency: currency.toLowerCase(),
        destination: connectedAccountId,
        metadata: {
          handymanId,
          type: 'payout',
        },
      });

      // Record payout in database
      await convexService.createPayout({
        handymanId,
        amount,
        currency,
        stripeTransferId: transfer.id,
        status: 'completed',
        createdAt: Date.now(),
      });

      // Send notification
      await notificationService.sendPayoutNotification(handymanId, amount, currency);

      logger.info('Payout processed successfully', {
        transferId: transfer.id,
        handymanId,
        amount,
      });

      return { transferId: transfer.id };

    } catch (error: any) {
      logger.error('Payout processing failed', error, { handymanId, amount });
      throw new StripeError(`Payout failed: ${error.message}`, error);
    }
  }

  // Get payment history for user
  async getPaymentHistory(userId: string, role: 'client' | 'handyman'): Promise<any[]> {
    logger.info('Getting payment history', { userId, role });

    try {
      let payments;

      if (role === 'client') {
        payments = await convexService.getPaymentsByPayer(userId);
      } else {
        payments = await convexService.getPaymentsByReceiver(userId);
      }

      return payments.map(payment => ({
        id: payment._id,
        jobId: payment.jobId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
      }));

    } catch (error: any) {
      logger.error('Failed to get payment history', error, { userId, role });
      throw error;
    }
  }

  // Private helper methods
  private async handleSuccessfulPayment(paymentIntentId: string, paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      // Update job status to completed
      const jobId = paymentIntent.metadata.jobId;
      await convexService.updateJobStatus(jobId, 'completed');

      // Send success notifications
      const clientId = paymentIntent.metadata.clientId;
      const handymanId = paymentIntent.metadata.handymanId;

      await Promise.all([
        notificationService.sendPaymentSuccessNotification(clientId, paymentIntent.amount, paymentIntent.currency),
        notificationService.sendPaymentReceivedNotification(handymanId, paymentIntent.amount, paymentIntent.currency),
        emailService.sendPaymentConfirmationEmail(clientId, paymentIntent),
      ]);

    } catch (error: any) {
      logger.error('Failed to handle successful payment', error, { paymentIntentId });
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await convexService.updatePaymentStatus(paymentIntent.id, 'completed');
    await this.handleSuccessfulPayment(paymentIntent.id, paymentIntent);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await convexService.updatePaymentStatus(paymentIntent.id, 'failed');

    // Send failure notification
    const clientId = paymentIntent.metadata.clientId;
    await notificationService.sendPaymentFailedNotification(clientId, paymentIntent.last_payment_error?.message);
  }

  private async handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await convexService.updatePaymentStatus(paymentIntent.id, 'pending');
  }

  private async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
    logger.info('Transfer created', { transferId: transfer.id, amount: transfer.amount });
  }

  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    logger.info('Account updated', { accountId: account.id });
  }

  private async getOrCreateConnectedAccount(handymanId: string): Promise<string> {
    // Check if handyman already has a connected account
    const existingAccount = await convexService.getHandymanStripeAccount(handymanId);

    if (existingAccount?.stripeAccountId) {
      return existingAccount.stripeAccountId;
    }

    // Create new connected account
    const handyman = await convexService.getUser(handymanId);
    if (!handyman) {
      throw new NotFoundError('Handyman not found');
    }

    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'US', // You'll need to handle different countries
      email: handyman.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Store account ID
    await convexService.createHandymanStripeAccount(handymanId, account.id);

    return account.id;
  }

  private mapStripeStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'processing': 'processing',
      'succeeded': 'completed',
      'canceled': 'failed',
    };

    return statusMap[stripeStatus] || 'pending';
  }

  private mapRefundReason(reason: string): Stripe.RefundCreateParams.Reason {
    const reasonMap: Record<string, Stripe.RefundCreateParams.Reason> = {
      'duplicate': 'duplicate',
      'fraudulent': 'fraudulent',
      'requested_by_customer': 'requested_by_customer',
    };

    return reasonMap[reason] || 'requested_by_customer';
  }

  private async sendRefundNotifications(payment: any, refund: Stripe.Refund): Promise<void> {
    try {
      await Promise.all([
        notificationService.sendRefundNotification(payment.payerId, refund.amount, payment.currency),
        notificationService.sendRefundProcessedNotification(payment.receiverId, refund.amount, payment.currency),
        emailService.sendRefundConfirmationEmail(payment.payerId, payment, refund),
      ]);
    } catch (error: any) {
      logger.error('Failed to send refund notifications', error);
    }
  }
}

export const paymentService = new PaymentService();