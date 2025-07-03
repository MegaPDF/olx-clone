import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Message, Conversation } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiPaginatedResponse, MessageDetail } from '@/lib/types';

// GET /api/messages/[conversationId] - Get messages in conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    await connectDB();

    // Verify user has access to conversation
    const conversation = await Conversation.findOne({
      _id: params.conversationId,
      participants: session.user.id
    });

    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversation not found'
        }
      }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: params.conversationId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ conversation: params.conversationId })
    ]);

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: params.conversationId,
        sender: { $ne: session.user.id },
        'status.read': false
      },
      {
        'status.read': true,
        'status.readAt': new Date()
      }
    );

    // Update conversation unread count
    await Conversation.findByIdAndUpdate(params.conversationId, {
      [`unreadCount.${session.user.id}`]: 0
    });

    const response: ApiPaginatedResponse<MessageDetail> = {
      success: true,
      data: messages.reverse().map(formatMessage),
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
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/messages/[conversationId] error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch messages'
      }
    }, { status: 500 });
  }
}

function formatMessage(message: any) {
  return {
    id: message._id.toString(),
    conversation: message.conversation.toString(),
    sender: {
      id: message.sender._id.toString(),
      name: message.sender.name,
      avatar: message.sender.avatar
    },
    content: message.content,
    status: message.status,
    metadata: message.metadata,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
  };
}