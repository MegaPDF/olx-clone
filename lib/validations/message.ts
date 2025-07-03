// Message schemas
import { z } from 'zod';

// Create message validation
export const createMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  content: z.object({
    text: z.string().max(1000, 'Message too long').optional(),
    type: z.enum(['text', 'image', 'system']),
    attachments: z.array(z.string().url()).max(5).optional()
  }).refine(data => {
    if (data.type === 'text') {
      return data.text && data.text.trim().length > 0;
    }
    if (data.type === 'image') {
      return data.attachments && data.attachments.length > 0;
    }
    return true;
  }, {
    message: 'Message content is required'
  })
});

// Start conversation validation
export const startConversationSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  initialMessage: z.string()
    .min(1, 'Initial message is required')
    .max(1000, 'Message too long')
});