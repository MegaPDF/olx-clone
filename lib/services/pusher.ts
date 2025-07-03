import Pusher from 'pusher';
import PusherClient from 'pusher-js';
import { env, pusherConfig } from '../env';
import type { RealTimeEvent, MessageDetail, NotificationDetail } from '../types';

// Server-side Pusher instance
const pusherServer = pusherConfig.enabled ? new Pusher({
  appId: env.PUSHER_APP_ID!,
  key: env.PUSHER_KEY!,
  secret: env.PUSHER_SECRET!,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true
}) : null;

class PusherService {
  private server = pusherServer;

  /**
   * Trigger event to channel
   */
  async trigger(
    channel: string,
    event: string,
    data: any
  ): Promise<void> {
    if (!this.server) {
      console.warn('Pusher not configured, skipping real-time event');
      return;
    }

    try {
      await this.server.trigger(channel, event, data);
    } catch (error) {
      console.error('Pusher trigger failed:', error);
    }
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(
    recipientId: string,
    message: MessageDetail
  ): Promise<void> {
    const channel = `user-${recipientId}`;
    const event = 'new-message';
    
    await this.trigger(channel, event, {
      type: 'message',
      data: message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send notification
   */
  async sendNotification(
    recipientId: string,
    notification: NotificationDetail
  ): Promise<void> {
    const channel = `user-${recipientId}`;
    const event = 'notification';
    
    await this.trigger(channel, event, {
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send listing update
   */
  async sendListingUpdate(
    listingId: string,
    update: any
  ): Promise<void> {
    const channel = `listing-${listingId}`;
    const event = 'listing-updated';
    
    await this.trigger(channel, event, {
      type: 'listing_update',
      data: update,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const channel = `conversation-${conversationId}`;
    const event = 'typing';
    
    await this.trigger(channel, event, {
      userId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Authenticate user for private channels
   */
  authenticate(socketId: string, channel: string, userId: string): any {
    if (!this.server) {
      throw new Error('Pusher not configured');
    }

    // Only allow users to subscribe to their own channels
    if (channel === `private-user-${userId}`) {
      return this.server.authenticate(socketId, channel);
    }
    
    throw new Error('Unauthorized channel access');
  }
}

export const pusherService = new PusherService();

// Client-side Pusher instance for browser
export const pusherClient = typeof window !== 'undefined' && pusherConfig.enabled
  ? new PusherClient(env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth'
    })
  : null;