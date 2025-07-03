import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import type { 
  ConversationDetail, 
  MessageDetail, 
  ConversationList 
} from '../types';

export function useConversations() {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<ConversationDetail[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/messages/conversations');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch conversations');
      }

      setConversations(data.data.conversations || []);
      setTotalUnread(data.data.totalUnread || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    totalUnread,
    loading,
    error,
    refresh: fetchConversations
  };
}

export function useMessages(conversationId: string | null) {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<MessageDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMessages = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!conversationId || !isAuthenticated) return;

    setLoading(true);
    if (reset) setError(null);

    try {
      const response = await fetch(`/api/messages/${conversationId}?page=${pageNum}&limit=50`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch messages');
      }

      if (reset || pageNum === 1) {
        setMessages(data.data || []);
      } else {
        setMessages(prev => [...(data.data || []), ...prev]);
      }

      setHasMore(data.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, isAuthenticated]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(1, true);
    }
  }, [conversationId, fetchMessages]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchMessages(page + 1);
    }
  }, [hasMore, loading, page, fetchMessages]);

  const addMessage = useCallback((message: MessageDetail) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    addMessage,
    markAsRead,
    refresh: () => fetchMessages(1, true)
  };
}