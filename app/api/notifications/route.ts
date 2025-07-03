import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiPaginatedResponse } from '@/lib/types';

// Extend NotificationDetail to include relatedListing and relatedUser
type RelatedListing = {
  id: string;
  title: string;
  slug: string;
  image?: string;
} | null;

type RelatedUser = {
  id: string;
  name: string;
  avatar?: string;
} | null;

type NotificationDetail = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  recipient: string;
  status: {
    read: boolean;
    readAt?: Date | string | null;
    sent: boolean;
    sentAt: Date | string;
  };
  channels: string[];
  priority: string;
  relatedListing: RelatedListing;
  relatedUser: RelatedUser;
  readAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type'); // 'message', 'listing', 'system'

    await connectDB();

    let query: any = { user: session.user.id };
    if (unreadOnly) {
      query.isRead = false;
    }
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('relatedListing', 'title slug images')
        .populate('relatedUser', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: session.user.id, isRead: false })
    ]);

    const response: ApiPaginatedResponse<NotificationDetail> = {
      success: true,
      data: notifications.map(formatNotification),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0',
        unreadCount
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/notifications error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch notifications'
      }
    }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    await connectDB();

    let updateQuery: any = { user: session.user.id };

    if (markAllAsRead) {
      await Notification.updateMany(updateQuery, { 
        isRead: true,
        readAt: new Date()
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      updateQuery._id = { $in: notificationIds };
      await Notification.updateMany(updateQuery, { 
        isRead: true,
        readAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: markAllAsRead ? 'All notifications marked as read' : 'Notifications marked as read'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('PATCH /api/notifications error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update notifications'
      }
    }, { status: 500 });
  }
}

function formatNotification(notification: any): NotificationDetail {
  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    recipient: notification.user,
    status: {
      read: notification.isRead,
      readAt: notification.readAt,
      sent: true,
      sentAt: notification.createdAt
    },
    channels: notification.channels || ['web'],
    priority: notification.priority || 'medium',
    relatedListing: notification.relatedListing ? {
      id: notification.relatedListing._id.toString(),
      title: notification.relatedListing.title,
      slug: notification.relatedListing.slug,
      image: notification.relatedListing.images?.[0]
    } : null,
    relatedUser: notification.relatedUser ? {
      id: notification.relatedUser._id.toString(),
      name: notification.relatedUser.name,
      avatar: notification.relatedUser.avatar
    } : null,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt || notification.createdAt
  };
}