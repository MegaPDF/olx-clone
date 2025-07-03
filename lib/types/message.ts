import { ConversationStatus, ListingStatus, Price } from "./global";

// Message types
export interface CreateMessage {
  conversationId: string;
  content: {
    text?: string;
    type: 'text' | 'image' | 'system';
    attachments?: string[];
  };
}

export interface MessageDetail {
  id: string;
  conversation: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: {
    text?: string;
    type: 'text' | 'image' | 'system';
    attachments?: string[];
  };
  status: {
    sent: boolean;
    delivered: boolean;
    read: boolean;
    readAt?: Date;
  };
  metadata?: {
    systemType?: 'listing_sold' | 'listing_updated' | 'user_joined';
    editedAt?: Date;
    originalContent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDetail {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    lastSeen?: Date;
  }>;
  listing: {
    id: string;
    title: string;
    price: Price;
    image?: string;
    status: ListingStatus;
  };
  lastMessage?: {
    id: string;
    content: string;
    sender: string;
    createdAt: Date;
  };
  status: ConversationStatus;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationList {
  conversations: ConversationDetail[];
  totalUnread: number;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface MessageNotification {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  listingTitle: string;
}
