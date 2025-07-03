import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';

// PATCH /api/notifications/[id] - Mark notification as read/unread
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { isRead } = body;

    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { _id: params.id, user: session.user.id },
      { 
        isRead: isRead !== false,
        readAt: isRead !== false ? new Date() : null
      },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Notification marked as ${isRead !== false ? 'read' : 'unread'}`
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update notification'
      }
    }, { status: 500 });
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await connectDB();

    const notification = await Notification.findOneAndDelete({
      _id: params.id,
      user: session.user.id
    });

    if (!notification) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Notification deleted successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete notification'
      }
    }, { status: 500 });
  }
}