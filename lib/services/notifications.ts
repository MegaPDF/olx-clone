import { connectDB } from '../db';
import { Notification, User } from '@/models';
import { emailService } from './email';
import { pusherService } from './pusher';
import type { 
  CreateNotification, 
  NotificationDetail, 
  UserProfile 
} from '../types';

class NotificationService {
  /**
   * Create and send notification
   */
  async createNotification(
    notification: CreateNotification
  ): Promise<NotificationDetail> {
    await connectDB();

    // Create notification in database
    const newNotification = await Notification.create({
      ...notification,
      channels: {
        push: true,
        email: false,
        sms: false,
        ...notification.channels
      },
      priority: notification.priority || 'normal'
    });

    const createdNotification = await Notification.findById(newNotification._id)
      .populate('recipient', 'name email preferences')
      .lean();

    if (!createdNotification) {
      throw new Error('Failed to create notification');
    }

    const formattedNotification = this.formatNotification(createdNotification);

    // Send notification through configured channels
    await this.sendNotification(formattedNotification);

    return formattedNotification;
  }

  /**
   * Send notification through all configured channels
   */
  private async sendNotification(notification: NotificationDetail): Promise<void> {
    const user = await User.findById(notification.recipient);
    if (!user) return;

    const locale = user.preferences?.language || 'en';

    // Send push notification
    if (notification.channels.push) {
      await this.sendPushNotification(notification);
    }

    // Send email notification
    if (notification.channels.email && user.preferences?.notifications?.email) {
      await this.sendEmailNotification(notification, user, locale);
    }

    // Send SMS notification
    if (notification.channels.sms && user.preferences?.notifications?.sms) {
      await this.sendSmsNotification(notification, user);
    }

    // Mark as sent
    await Notification.findByIdAndUpdate(notification.id, {
      'status.sent': true,
      'status.sentAt': new Date()
    });
  }

  /**
   * Send push notification via Pusher
   */
  private async sendPushNotification(notification: NotificationDetail): Promise<void> {
    try {
      await pusherService.sendNotification(notification.recipient, notification);
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notification: NotificationDetail,
    user: UserProfile,
    locale: 'en' | 'id'
  ): Promise<void> {
    try {
      const subject = notification.title[locale] || notification.title.en;
      const message = notification.message[locale] || notification.message.en;

      await emailService.sendEmail({
        to: user.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <p>${message}</p>
            ${notification.data?.actionUrl ? `
              <a href="${notification.data.actionUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Details
              </a>
            ` : ''}
          </div>
        `
      });
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  }

  /**
   * Send SMS notification (placeholder - integrate with SMS provider)
   */
  private async sendSmsNotification(
    notification: NotificationDetail,
    user: UserProfile
  ): Promise<void> {
    // TODO: Integrate with SMS provider (Twilio, etc.)
    console.log('SMS notification:', {
      to: user.phone,
      message: notification.message.en
    });
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(
    recipientId: string,
    senderId: string,
    conversationId: string,
    messageContent: string
  ): Promise<void> {
    const sender = await User.findById(senderId);
    if (!sender) return;

    await this.createNotification({
      recipient: recipientId,
      type: 'message',
      title: {
        en: 'New message',
        id: 'Pesan baru'
      },
      message: {
        en: `${sender.name} sent you a message: "${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}"`,
        id: `${sender.name} mengirim pesan: "${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}"`
      },
      data: {
        messageId: conversationId,
        userId: senderId,
        actionUrl: `/profile/messages/${conversationId}`
      },
      channels: {
        push: true,
        email: true
      },
      priority: 'high'
    });
  }

  /**
   * Send listing notification
   */
  async sendListingNotification(
    userId: string,
    listingId: string,
    type: 'approved' | 'sold' | 'expired'
  ): Promise<void> {
    const titles = {
      approved: {
        en: 'Listing approved',
        id: 'Listing disetujui'
      },
      sold: {
        en: 'Listing sold',
        id: 'Listing terjual'
      },
      expired: {
        en: 'Listing expired',
        id: 'Listing kedaluwarsa'
      }
    };

    const messages = {
      approved: {
        en: 'Your listing has been approved and is now live',
        id: 'Listing Anda telah disetujui dan sekarang aktif'
      },
      sold: {
        en: 'Congratulations! Your listing has been marked as sold',
        id: 'Selamat! Listing Anda telah ditandai sebagai terjual'
      },
      expired: {
        en: 'Your listing has expired. Renew it to keep it active',
        id: 'Listing Anda telah kedaluwarsa. Perpanjang untuk tetap aktif'
      }
    };

    await this.createNotification({
      recipient: userId,
      type: 'listing_update',
      title: titles[type],
      message: messages[type],
      data: {
        listingId,
        actionUrl: `/listings/${listingId}`
      },
      channels: {
        push: true,
        email: type === 'expired'
      }
    });
  }

  /**
   * Format notification for response
   */
  private formatNotification(notification: any): NotificationDetail {
    return {
      id: notification._id.toString(),
      recipient: notification.recipient._id?.toString() || notification.recipient,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      status: notification.status,
      channels: notification.channels,
      priority: notification.priority,
      expiresAt: notification.expiresAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await connectDB();

    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      {
        'status.read': true,
        'status.readAt': new Date()
      }
    );
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: NotificationDetail[]; total: number }> {
    await connectDB();

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: userId })
    ]);

    return {
      notifications: notifications.map(this.formatNotification),
      total
    };
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    await connectDB();

    return Notification.countDocuments({
      recipient: userId,
      'status.read': false
    });
  }
}

export const notificationService = new NotificationService();