import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Message, Conversation } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiPaginatedResponse, ApiResponse, MessageDetail } from '@/lib/types';

// GET /api/messages - Get user conversations
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
    const status = searchParams.get('status'); // 'unread', 'archived', etc.

    await connectDB();

    let query: any = {
      participants: session.user.id
    };

    if (status === 'unread') {
      query[`unreadCount.${session.user.id}`] = { $gt: 0 };
    } else if (status === 'archived') {
      query[`archived.${session.user.id}`] = true;
    }

    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .populate('participants', 'name avatar lastSeen')
        .populate('listing', 'title price images status')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(query)
    ]);

    // Calculate total unread count
    const totalUnread = await Conversation.aggregate([
      { $match: { participants: session.user.id } },
      { $group: { _id: null, total: { $sum: `$unreadCount.${session.user.id}` } } }
    ]);

    const response: ApiPaginatedResponse = {
      success: true,
      data: conversations.map(formatConversation),
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
        unreadCount: totalUnread[0]?.total || 0
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/messages error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch conversations'
      }
    }, { status: 500 });
  }
}

// POST /api/messages - Start new conversation or send message
export async function POST(request: NextRequest) {
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
    const { recipientId, listingId, content, conversationId } = body;

    if (!content?.text?.trim()) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CONTENT',
          message: 'Message content is required'
        }
      }, { status: 400 });
    }

    await connectDB();

    let conversation;

    if (conversationId) {
      // Send message to existing conversation
      conversation = await Conversation.findOne({
        _id: conversationId,
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
    } else {
      // Start new conversation
      if (!recipientId || !listingId) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Recipient ID and listing ID are required for new conversations'
          }
        }, { status: 400 });
      }

      // Check if conversation already exists
      conversation = await Conversation.findOne({
        participants: { $all: [session.user.id, recipientId] },
        listing: listingId
      });

      if (!conversation) {
        // Create new conversation
        conversation = await Conversation.create({
          participants: [session.user.id, recipientId],
          listing: listingId,
          createdAt: new Date()
        });
      }
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: session.user.id,
      content: {
        text: content.text.trim(),
        type: content.type || 'text',
        attachments: content.attachments || []
      },
      status: {
        sent: true,
        delivered: false,
        read: false
      },
      createdAt: new Date()
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      updatedAt: new Date(),
      $inc: {
        [`unreadCount.${conversation.participants.find(p => p.toString() !== session.user.id)}`]: 1
      }
    });

    // Populate message for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .lean();

    const response: ApiResponse<MessageDetail> = {
      success: true,
      data: formatMessage(populatedMessage),
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('POST /api/messages error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send message'
      }
    }, { status: 500 });
  }
}

function formatConversation(conversation: any) {
  return {
    id: conversation._id.toString(),
    participants: conversation.participants.map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      avatar: p.avatar,
      lastSeen: p.lastSeen
    })),
    listing: conversation.listing ? {
      id: conversation.listing._id.toString(),
      title: conversation.listing.title,
      price: conversation.listing.price,
      image: conversation.listing.images?.[0],
      status: conversation.listing.status
    } : null,
    lastMessage: conversation.lastMessage ? {
      id: conversation.lastMessage._id.toString(),
      content: conversation.lastMessage.content?.text || '',
      sender: conversation.lastMessage.sender.toString(),
      createdAt: conversation.lastMessage.createdAt
    } : null,
    status: conversation.status || 'active',
    unreadCount: conversation.unreadCount || 0,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
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