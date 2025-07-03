// Message server actions
'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '../db';
import { Message, Conversation, Listing, User } from '@/models';
import { createMessageSchema, startConversationSchema } from '../validations';
import type { FormSubmissionResult } from '../types';

export async function startConversationAction(
  formData: FormData,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      listingId: formData.get('listingId') as string,
      initialMessage: formData.get('message') as string
    };

    const validatedData = startConversationSchema.parse(rawData);
    
    await connectDB();

    const listing = await Listing.findById(validatedData.listingId)
      .populate('seller', 'name avatar');

    if (!listing) {
      return {
        success: false,
        errors: [{ field: 'listingId', message: 'Listing not found' }]
      };
    }

    if (listing.seller._id.toString() === userId) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Cannot message your own listing' }]
      };
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, listing.seller._id] },
      listing: validatedData.listingId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, listing.seller._id],
        listing: validatedData.listingId,
        metadata: {
          participantNames: ['User', listing.seller.name],
          listingTitle: listing.title,
          listingImage: listing.images[0]
        }
      });
    }

    // Create initial message
    const message = await Message.create({
      conversation: conversation._id,
      sender: userId,
      content: {
        text: validatedData.initialMessage,
        type: 'text'
      }
    });

    // Update conversation with last message
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    // Update listing stats
    await Listing.findByIdAndUpdate(validatedData.listingId, {
      $inc: { 'stats.contacts': 1 }
    });

    revalidatePath('/profile/messages');

    return {
      success: true,
      redirect: `/profile/messages/${conversation._id}`
    };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }

    return {
      success: false,
      errors: [{ field: 'root', message: 'Failed to start conversation' }]
    };
  }
}

export async function sendMessageAction(
  formData: FormData,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    const attachments = formData.getAll('attachments') as string[];
    
    const rawData = {
      conversationId: formData.get('conversationId') as string,
      content: {
        text: formData.get('text') as string,
        type: formData.get('type') as 'text' | 'image',
        attachments: attachments.length > 0 ? attachments : undefined
      }
    };

    const validatedData = createMessageSchema.parse(rawData);
    
    await connectDB();

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: validatedData.conversationId,
      participants: userId
    });

    if (!conversation) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Conversation not found or access denied' }]
      };
    }

    const message = await Message.create({
      conversation: validatedData.conversationId,
      sender: userId,
      content: validatedData.content
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(validatedData.conversationId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    revalidatePath(`/profile/messages/${validatedData.conversationId}`);

    return {
      success: true,
      data: { messageId: message._id }
    };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }

    return {
      success: false,
      errors: [{ field: 'root', message: 'Failed to send message' }]
    };
  }
}

export async function markMessagesAsReadAction(
  conversationId: string,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    await connectDB();

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Conversation not found' }]
      };
    }

    // Mark all messages as read for this user
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        'status.read': false
      },
      {
        'status.read': true,
        'status.readAt': new Date()
      }
    );

    revalidatePath(`/profile/messages/${conversationId}`);

    return {
      success: true,
      data: { message: 'Messages marked as read' }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Failed to mark messages as read' }]
    };
  }
}
